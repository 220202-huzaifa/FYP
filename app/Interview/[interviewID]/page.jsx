'use client'
import { Button } from '../../../components/ui/button'
import { db } from '../../../utils/Database_Connection'
import { MockInterview } from '../../../utils/Schema'
import { eq } from 'drizzle-orm'
import { Lightbulb, WebcamIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import Webcam from 'react-webcam'

const INTERVIEW = ({ params }) => {
  const Router = useRouter()
  const [webcamEnabled, SetWebcam] = useState(false)
  const [InterviewDetails, SetInterviewDetails] = useState()
  const GetInterviewDetails = useCallback(async () => {
    console.log(params.interviewID)
    const Result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.MockId, params.interviewID))

    // console.log(Result)

    SetInterviewDetails(Result[0])
  }, [params.interviewID])

  useEffect(() => {
    GetInterviewDetails()
  }, [GetInterviewDetails])
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            <h1 className="text-5xl font-bold mb-4">Let's Start Your Interview</h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Review the interview details and enable your camera to begin the AI-powered mock interview
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Interview Details */}
          <div className="space-y-6">
            {/* Job Details Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Interview Details</h2>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold text-purple-400">Job Position</span>
                  </div>
                  <p className="text-xl text-white">{InterviewDetails?.JobPosition}</p>
                </div>

                <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span className="font-semibold text-blue-400">Tech Stack</span>
                  </div>
                  <p className="text-lg text-gray-300">{InterviewDetails?.JobDescription}</p>
                </div>

                <div className="bg-gradient-to-r from-green-800/30 to-emerald-800/30 rounded-xl p-4 border border-green-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-green-400">Experience Level</span>
                  </div>
                  <p className="text-lg text-white">{InterviewDetails?.JobExperience} {InterviewDetails?.JobExperience == 1 ? 'Year' : 'Years'}</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-yellow-800/30 to-orange-800/30 rounded-xl p-4 border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-yellow-400">Important Information</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Enable WebCam and Microphone to begin your AI-generated interview. The interview will consist 
                of 5 questions, and at the end, you'll receive a detailed report showing your performance 
                metrics and personalized feedback.
              </p>
            </div>
          </div>

          {/* Right Column - Webcam */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Camera Setup</h2>
              
              <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden mb-6">
                {webcamEnabled ? (
                  <Webcam
                    className="w-full h-full object-cover"
                    onUserMedia={() => SetWebcam(true)}
                    onUserMediaError={() => SetWebcam(false)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors" onClick={() => SetWebcam(true)}>
                    <WebcamIcon className="w-24 h-24 text-gray-600 mb-4" />
                    <p className="text-gray-400 text-center">Click to enable camera</p>
                  </div>
                )}
              </div>

              {!webcamEnabled && (
                <Button
                  onClick={() => SetWebcam(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-xl font-semibold"
                >
                  Enable WebCam and Microphone
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Start Interview Button */}
        <div className="text-center mt-12">
          <Button
            onClick={() => Router.push(`/Interview/${params.interviewID}/StartInterview`)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-12 py-4 rounded-xl font-semibold text-lg shadow-xl transform transition-all duration-200 hover:scale-105"
          >
            Start Interview
          </Button>
        </div>
      </div>
    </div>
  )
}

export default INTERVIEW
