'use client'
import { useRouter } from 'next/navigation'
import { CirclePlus, Mic, Brain, TrendingUp, Users, Zap, ArrowRight, Play, CheckCircle } from 'lucide-react'
import React, { useState } from 'react'
import { sendMessageWithRetry } from '../utils/GemniAiModel'
import { db } from '../utils/Database_Connection'
import { MockInterview } from '../utils/Schema'
import { useUser } from '@clerk/nextjs'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'

export default function Home() {
  const Router = useRouter()
  const { user, isSignedIn } = useUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MockMaster ProPrep</span>
            </div>
            <div className="flex items-center gap-4">
              {isSignedIn ? (
                <button
                  onClick={() => Router.push('/DashBoard')}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => Router.push('/sign-in')}
                    className="text-white hover:text-purple-300 transition-colors"
                  >
                    Sign In
                  </button>
            
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full mb-8">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Interview Practice</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Master Your Next
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Technical Interview
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Practice AI-generated mock interviews tailored to your job role. 
            Get real-time feedback, improve your responses, and land your dream job with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <AddInterview />
            <button
              onClick={() => {
                const element = document.getElementById('features')
                element?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Choose MockMaster ProPrep?
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Everything you need to ace your technical interviews in one powerful platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">AI-Generated Questions</h3>
            <p className="text-gray-300">
              Get interview questions tailored to your specific job role and experience level, generated by advanced AI technology.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Voice Responses</h3>
            <p className="text-gray-300">
              Answer questions naturally using your voice for a realistic interview experience with speech-to-text technology.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Detailed Feedback</h3>
            <p className="text-gray-300">
              Receive comprehensive feedback and ratings on your responses to identify areas for improvement and track progress.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Industry Relevant</h3>
            <p className="text-gray-300">
              Questions and scenarios based on real interview experiences from top tech companies across various industries.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Instant Results</h3>
            <p className="text-gray-300">
              Get immediate feedback and performance scores right after your interview to quickly assess your performance.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Fast & Efficient</h3>
            <p className="text-gray-300">
              Complete a full mock interview session in under 30 minutes and get actionable insights to improve quickly.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
    

      {/* Footer */}
      <footer className="bg-black/50 border-t border-white/20">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">MockMaster ProPrep</span>
            </div>
            <p className="text-gray-400">
              © 2024 MockMaster ProPrep. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const AddInterview = () => {
  const [loading, setloading] = useState(false)
  const { user, isSignedIn } = useUser()
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
      // Minimal prompt with very short answers to avoid token limits
      const randomSeed = Math.random().toString(36).substring(7)
      
      const InputPrompt = `Generate 5 ${InputValues.Job_Position} questions. JSON: [{"question":"...","answer":"1 sentence max"}]. Session: ${randomSeed}.`

      let MockResponse = ''
      try {
        console.log('Sending prompt to AI:', InputPrompt.substring(0, 200) + '...')
        
        // Increased timeout and removed fallback dependency
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 15000)
        )
        
        const apiPromise = sendMessageWithRetry(InputPrompt)
        const Result = await Promise.race([apiPromise, timeoutPromise])
        
        MockResponse = Result.response
          .text()
          .replace('```json', '')
          .replace('```', '')
          .trim()
        
        console.log('Raw AI response:', MockResponse)
        
        // Validate JSON structure
        try {
          const parsed = JSON.parse(MockResponse)
          if (!Array.isArray(parsed) || parsed.length !== 5 || 
              !parsed.every(item => item.question && item.answer)) {
            console.error('Invalid AI response structure:', parsed)
            throw new Error(`Invalid structure: expected 5 questions with question/answer fields, got ${parsed?.length || 0} items`)
          }
          console.log('Successfully validated AI response')
        } catch (validationErr) {
          console.error('AI response validation failed:', validationErr)
          console.error('Response that failed validation:', MockResponse)
          throw new Error('AI generated invalid response format. Please try again.')
        }
      } catch (err) {
        console.error('AI generation failed:', err)
        
        // Handle token limit specifically
        if (err.message.includes('token limit') || err.message.includes('exceeded')) {
          throw new Error('AI response too long. Please try again with simpler job description.')
        }
        
        // Don't use fallback - show error to user
        throw new Error('Failed to generate questions: ' + err.message)
      }

      if (!MockResponse) {
        throw new Error('AI returned empty response')
      }

      const generatedMockId = uuidv4()
      console.log('Creating interview with MockId:', generatedMockId)
      console.log('Random seed used:', randomSeed)
      console.log('Full AI response:', MockResponse)
      
      const Response_Of_DB = await db
        .insert(MockInterview)
        .values({
          MockId: generatedMockId,
          jsonMockResp: MockResponse,
          JobPosition: InputValues.Job_Position,
          JobDescription: InputValues.Job_Description,
          JobExperience: InputValues.Year_Of_Experience,
          CreatedBy: user?.primaryEmailAddress?.emailAddress,
          CreatedAt: moment().format('DD-MM-yyyy'),
        })
        .returning({ MockId: MockInterview.MockId })

      console.log('Interview created with ID:', Response_Of_DB[0]?.MockId)
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
    <Dialog>
      <DialogTrigger className="w-full">
        <div 
          className={`group bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 transition-all duration-300 cursor-pointer transform shadow-2xl ${
            isSignedIn 
              ? 'hover:scale-[1.05] hover:shadow-purple-500/25' 
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
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 ${
              isSignedIn 
                ? 'bg-white/20 group-hover:scale-110' 
                : 'bg-gray-600'
            }`}>
              <CirclePlus size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {isSignedIn ? 'Start Your Interview' : 'Sign In Required'}
            </h3>
            <p className="text-purple-100">
              {isSignedIn 
                ? 'Create a personalized mock interview in seconds' 
                : 'Please sign in to create interviews'
              }
            </p>
          </div>
        </div>
      </DialogTrigger>
      
      {isSignedIn && (
        <DialogContent className="bg-slate-800 border border-white/20 text-white max-w-lg">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Create New Interview
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Provide details about the job position to generate personalized interview questions
          </DialogDescription>
          
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
                <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white border-0 font-medium py-3 rounded-lg transition-colors">
                  Cancel
                </button>
              </DialogTrigger>
              <button
                onClick={() => GenerateAiText()}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Start Interview'
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}
