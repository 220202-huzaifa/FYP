'use client'
import { CirclePlus } from 'lucide-react'
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import PrevInterview from './PrevInterview'
import { Button } from './ui/button'
import { sendMessageWithRetry } from '../utils/GemniAiModel'
import { db } from '../utils/Database_Connection'
import { MockInterview } from '../utils/Schema'
import { useUser } from '@clerk/nextjs'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'
import { useRouter } from 'next/navigation'

const AddInterview = () => {
  const [loading, setloading] = useState(false)
  const { user, isSignedIn } = useUser()
  const fallbackQuestions = JSON.stringify([
    {
      question: 'Describe a complex feature you built end-to-end.',
      answer:
        'Outline the problem, your design decisions, trade-offs, testing, and impact.',
    },
    {
      question: 'How do you improve performance in a React/Next.js app?',
      answer:
        'Discuss memoization, code-splitting, caching, avoiding unnecessary renders, and monitoring.',
    },
    {
      question: 'Explain how you secure an API and handle authentication.',
      answer:
        'Cover auth flows, tokens, rate limiting, validation, logging, and least-privilege.',
    },
    {
      question: 'How do you debug production issues?',
      answer:
        'Talk about logs, metrics, tracing, reproduction, feature flags, and rollback plans.',
    },
    {
      question: 'How do you collaborate in a team to deliver features?',
      answer:
        'Mention specs, breaking work down, code reviews, communication, and documentation.',
    },
  ])

  const Router = useRouter()

  const [InputValues, SetInputValues] = useState({
    Job_Position: '',
    Job_Description: '',
    Year_Of_Experience: undefined,
  })

  const GenerateAiText = async () => {
    // Check if user is signed in
    if (!isSignedIn || !user) {
      alert('Please sign in first to create an interview.')
      Router.push('/sign-in')
      return
    }

    setloading(true)
    try {
      // Optimized shorter prompt for faster response
      const InputPrompt = `Job: ${InputValues.Job_Position}, Description: ${InputValues.Job_Description}, Experience: ${InputValues.Year_Of_Experience} years. Generate 5 interview questions with answers in JSON format only.`

      let MockResponse = ''
      try {
        // Set a timeout for faster fallback
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 8000)
        )
        
        const apiPromise = sendMessageWithRetry(InputPrompt)
        const Result = await Promise.race([apiPromise, timeoutPromise])
        
        MockResponse = Result.response
          .text()
          .replace('```json', '')
          .replace('```', '')
      } catch (err) {
        console.warn('AI generation failed or timed out, using fallback questions', err)
        // Immediately use fallback questions
        MockResponse = fallbackQuestions
      }

      if (!MockResponse) {
        MockResponse = fallbackQuestions
      }

      const Response_Of_DB = await db
        .insert(MockInterview)
        .values({
          MockId: uuidv4(),
          jsonMockResp: MockResponse,
          JobPosition: InputValues.Job_Position,
          JobDescription: InputValues.Job_Description,
          JobExperience: InputValues.Year_Of_Experience,
          CreatedBy: user?.primaryEmailAddress?.emailAddress,
          CreatedAt: moment().format('DD-MM-yyyy'),
        })
        .returning({ MockId: MockInterview.MockId })

      Router.push(`/Interview/${Response_Of_DB[0]?.MockId}`)
    } catch (error) {
      console.error('Failed to generate mock interview', error)
      alert('Unable to create interview. Please try again.')
    } finally {
      setloading(false)
    }
  }

  const UpdateInput = (name, Value) => {
    SetInputValues((Input) => ({
      ...Input,
      [name]: Value,
    }))
  }

  return (
    <div className="space-y-8">
      {/* Add New Interview Card */}
      <Dialog>
        <DialogTrigger className="w-full">
          <div 
            className={`group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 transition-all duration-300 cursor-pointer transform shadow-2xl ${
              isSignedIn 
                ? 'hover:bg-white/15 hover:scale-[1.02]' 
                : 'opacity-60 cursor-not-allowed'
            }`}
            onClick={() => {
              if (!isSignedIn) {
                alert('Please sign in first to create an interview.')
                Router.push('/sign-in')
              }
            }}
          >
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 ${
                isSignedIn 
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500 group-hover:scale-110' 
                  : 'bg-gray-600'
              }`}>
                <CirclePlus size={40} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {isSignedIn ? 'Create New Interview' : 'Sign In Required'}
              </h3>
              <p className="text-gray-400">
                {isSignedIn 
                  ? 'Start a fresh AI-powered mock interview' 
                  : 'Please sign in to create interviews'
                }
              </p>
            </div>
          </div>
        </DialogTrigger>
        
        {isSignedIn && (
          <DialogContent className="bg-slate-800 border border-white/20 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Create New Interview
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Provide details about the job position to generate personalized interview questions
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Job Position</label>
                <input
                  name="Job_Position"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                  type="text"
                  placeholder="e.g. Senior React Developer"
                  value={InputValues.Job_Position}
                  onChange={(e) => UpdateInput(e.target.name, e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Job Description</label>
                <textarea
                  name="Job_Description"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all resize-none"
                  rows={3}
                  placeholder="e.g. Build scalable web applications using React and Node.js"
                  value={InputValues.Job_Description}
                  onChange={(e) => UpdateInput(e.target.name, e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Years of Experience</label>
                <input
                  name="Year_Of_Experience"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                  type="number"
                  placeholder="e.g. 5"
                  value={InputValues.Year_Of_Experience}
                  onChange={(e) => UpdateInput(e.target.name, e.target.value)}
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <DialogTrigger asChild>
                  <Button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white border-0 font-medium py-3">
                    Cancel
                  </Button>
                </DialogTrigger>
                <Button
                  onClick={() => GenerateAiText()}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 font-medium py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    'Start Interview'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Previous Interviews Section */}
      <PrevInterview />
    </div>
  )
}

export default AddInterview
