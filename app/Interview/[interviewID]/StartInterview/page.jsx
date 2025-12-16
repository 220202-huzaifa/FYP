'use client'
import { Button } from '../../../../components/ui/button'
import { db } from '../../../../utils/Database_Connection'
import { MockInterview, UserAnswer } from '../../../../utils/Schema'
import { eq } from 'drizzle-orm'
import { CircleStop, Lightbulb, Mic, Volume2, WebcamIcon } from 'lucide-react'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text'
import { sendMessageWithRetry } from '../../../../utils/GemniAiModel'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
const INTERVIEW = ({ params }) => {
  const [loading, setloading] = useState(true)
  const Router = useRouter()
  const { user } = useUser()
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  })
  const [useranswer, setuseranswer] = useState('')
  const [answers, setAnswers] = useState([])
  const [currentIndex, SetIndex] = useState(0)
  const processedResultsCount = useRef(0)
  const [webcamEnabled, SetWebcam] = useState(false)
  const [InterviewDetails, SetInterviewDetails] = useState([])
  const [seeusertext, setusertext] = useState(false)
  const GetInterviewDetails = useCallback(async () => {
    console.log(params.interviewID)

    const Result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.MockId, params.interviewID))

    try {
      // Clean the JSON string - remove markdown code blocks and extra whitespace
      let jsonString = Result[0].jsonMockResp

      console.log('Raw JSON from DB:', jsonString)
      
      // Remove markdown code blocks if present
      jsonString = jsonString.replace(/```json/gi, '').replace(/```/g, '').trim()

      // Try to extract the first valid JSON object if there are multiple
      // Find the first complete JSON object
      const firstBrace = jsonString.indexOf('[')
      const lastBrace = jsonString.lastIndexOf(']')

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1)
      }

      console.log('Cleaned JSON string:', jsonString)
      
      const parsedData = JSON.parse(jsonString)
      
      // Validate structure
      if (!Array.isArray(parsedData) || parsedData.length !== 5) {
        throw new Error(`Expected 5 questions, got ${parsedData?.length || 0}`)
      }
      
      parsedData.forEach((item, index) => {
        if (!item.question || !item.answer) {
          throw new Error(`Question ${index + 1} missing required fields`)
        }
      })
      
      console.log('Validated interview details:', parsedData)
      SetInterviewDetails(parsedData)
      setloading(false)
    } catch (error) {
      console.error('Error parsing JSON:', error)
      console.error('Raw JSON string:', Result[0].jsonMockResp)
      console.error('Interview ID:', params.interviewID)
      toast.error('Error loading interview details. Please try creating a new interview.')
      setloading(false)
    }
  }, [params.interviewID])

  const TexttoSpeech = (text) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(speech)
    } else {
      toast.error('YOUR BROWSER DOES NOT SUPPORT SPEECH TO TEXT')
    }
  }

  useEffect(() => {
    GetInterviewDetails()
  }, [GetInterviewDetails])

  const SendAnswerForFeedBack = async () => {
    const currentAnswer = answers[currentIndex] || useranswer
    if (currentAnswer.length < 10) {
      alert('RECORD AGAIN. ERROR IN SAVING ANSWER')
      return
    }

    const fallbackFeedback = {
      rating: 6,
      feedback:
        'Could not reach AI; consider clarifying your approach, trade-offs, and examples.',
    }

    try {
      const FeedBackPrompt = `Question: ${InterviewDetails[currentIndex]?.question}. User Answer: ${currentAnswer}. Provide a rating from 1 to 10 and a concise 3-4 line constructive feedback. Respond ONLY in JSON with keys "rating" (number) and "feedback" (string).`

      let JSONFEEDBACK = fallbackFeedback
      try {
        const Gemni_Response = await sendMessageWithRetry(FeedBackPrompt)
        const MockJsonResponse = Gemni_Response.response
          .text()
          .replace('```json', '')
          .replace('```', '')
        try {
          JSONFEEDBACK = JSON.parse(MockJsonResponse)
        } catch (parseErr) {
          console.warn('AI feedback parse failed, using fallback feedback', parseErr)
          JSONFEEDBACK = fallbackFeedback
        }
      } catch (err) {
        console.warn('AI feedback failed, using fallback feedback', err)
      }

      const ratingNumber = Number(JSONFEEDBACK?.rating)

      const Response = await db.insert(UserAnswer).values({
        MockIdREF: params.interviewID,
        Question: InterviewDetails[currentIndex]?.question,
        CorrectAns: InterviewDetails[currentIndex]?.answer,
        UserAns: currentAnswer,
        feedback: JSONFEEDBACK?.feedback,
        rating: Number.isFinite(ratingNumber) ? ratingNumber : fallbackFeedback.rating,
        UserEmail: user?.primaryEmailAddress?.emailAddress,
        CreatedAt: moment().format('DD-MM-yyyy'),
      })

      if (Response) {
        toast.success('USER ANSWER HAS BEEN RECORED')
        setusertext(false)
      }
    } catch (error) {
      console.error('Feedback generation failed', error)
      const status = error?.response?.status
      const retryable = status === 429 || status === 503
      const message = retryable
        ? 'AI service is busy. Please try again.'
        : 'Unable to get feedback right now. Please try again.'
      toast.error(message)
    }
  }

  const Save_User_Answer = async () => {
    if (isRecording) {
      stopSpeechToText()
      setAnswers((prev) => {
        const newAnswers = [...prev]
        newAnswers[currentIndex] = useranswer
        return newAnswers
      })
    } else {
      setuseranswer('')
      if (!isRecording) {
        startSpeechToText()
        toast.success('Recording Has Started')
      }
    }
  }

  console.log(InterviewDetails)

  useEffect(() => {
    const newResults = results.slice(processedResultsCount.current)
    newResults.forEach((result) => {
      setuseranswer((prevResponse) => prevResponse + result?.transcript)
    })
    processedResultsCount.current = results.length
  }, [results])

  useEffect(() => {
    if (answers[currentIndex]) {
      setuseranswer(answers[currentIndex])
    } else {
      setuseranswer('')
    }
  }, [currentIndex, answers])
  console.log(useranswer)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-blue-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
      ) : (
        <>
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                <h1 className="text-4xl font-bold mb-2">Mock Interview in Progress</h1>
              </div>
              <p className="text-gray-300">Answer the questions to the best of your ability</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Left Column - Questions */}
              <div className="space-y-6">
                {/* Question Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Question {currentIndex + 1}</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => TexttoSpeech(InterviewDetails[currentIndex]?.question)}
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                    >
                      <Volume2 className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 rounded-xl p-4 border border-purple-500/30">
                    <p className="text-lg text-gray-300 leading-relaxed">
                      {InterviewDetails[currentIndex]?.question}
                    </p>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-6">
                    {currentIndex >= 1 && currentIndex <= 4 && (
                      <Button
                        onClick={() => {
                          setAnswers((prev) => {
                            const newAnswers = [...prev]
                            newAnswers[currentIndex] = useranswer
                            return newAnswers
                          })
                          SetIndex((prev) => prev - 1)
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white"
                      >
                        Previous Question
                      </Button>
                    )}

                    {currentIndex <= 3 && (
                      <Button
                        onClick={() => {
                          setAnswers((prev) => {
                            const newAnswers = [...prev]
                            newAnswers[currentIndex] = useranswer
                            return newAnswers
                          })
                          SetIndex((prev) => prev + 1)
                        }}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white ml-auto"
                      >
                        Next Question
                      </Button>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-blue-400">Important Instructions</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Click on the record button to answer each question. At the end of this mock interview, 
                    you will be given the correct answers along with detailed feedback on your responses.
                  </p>
                </div>
              </div>

              {/* Right Column - Webcam & Recording */}
              <div className="space-y-6">
                {/* Webcam */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-xl">
                  <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    {webcamEnabled ? (
                      <Webcam
                        className="w-full h-full object-cover"
                        onUserMedia={() => SetWebcam(true)}
                        onUserMediaError={() => SetWebcam(false)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors" onClick={() => SetWebcam(true)}>
                        <svg className="w-24 h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recording Controls */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-xl">
                  <Button
                    onClick={Save_User_Answer}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                    } text-white`}
                  >
                    {isRecording ? (
                      <div className="flex items-center justify-center gap-2">
                        <CircleStop className="w-5 h-5" />
                        <span>Stop Recording</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Mic className="w-5 h-5" />
                        <span>Start Recording</span>
                      </div>
                    )}
                  </Button>

                  {useranswer.length > 10 && !isRecording && (
                    <Button
                      onClick={() => {
                        setAnswers((prev) => {
                          const newAnswers = [...prev]
                          newAnswers[currentIndex] = useranswer
                          return newAnswers
                        })
                        setusertext(true)
                        SendAnswerForFeedBack()
                      }}
                      className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-4 rounded-xl font-semibold"
                    >
                      Save Answer
                    </Button>
                  )}
                </div>

                {/* User Answer Preview */}
                {useranswer && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 shadow-xl">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Your Answer:</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {useranswer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* End Interview Button */}
          {currentIndex >= 4 && currentIndex < 5 && (
            <div className="container mx-auto px-6 py-8">
              <div className="text-center">
                <Button
                  onClick={() => Router.push(`/Interview/${params.interviewID}/EndInterview`)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl"
                >
                  End Interview
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default INTERVIEW
