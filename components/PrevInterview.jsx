'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { useUser } from '@clerk/nextjs'
import { db } from '../utils/Database_Connection'
import { MockInterview } from '../utils/Schema'

export const PrevInterview = () => {
  const { user } = useUser()
  const [loader, setLoader] = useState(true)
  const [prevInterviewDetails, setDetails] = useState([])
  const router = useRouter()

  const getPreviousInterviews = async () => {
    const result = await db.select().from(MockInterview)
    setDetails(result)
    setLoader(false)
  }

  useEffect(() => {
    if (user) {
      getPreviousInterviews()
    }
  }, [user])

  if (prevInterviewDetails.length > 1) {
    console.log(prevInterviewDetails)
  }

  console.log(user?.primaryEmailAddress?.emailAddress)
  return (
    <div>
      {loader ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Previous Interviews
            </h2>
            <p className="text-gray-400">Review your past interview sessions and continue where you left off</p>
          </div>
          
          {prevInterviewDetails.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Previous Interviews</h3>
              <p className="text-gray-400">Create your first mock interview to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prevInterviewDetails.map((element, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 shadow-xl"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-xs text-gray-400">
                        {element?.CreatedAt}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-white mb-1">{element?.JobPosition}</h4>
                        <p className="text-sm text-gray-400 line-clamp-2">{element?.JobDescription}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                          {element?.JobExperience} {element?.JobExperience == 1 ? 'Year' : 'Years'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Created by: {element?.CreatedBy}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() =>
                          router.push(`/Interview/${element.MockId}/EndInterview`)
                        }
                        className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 font-medium py-2"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Feedback
                      </Button>
                      <Button
                        onClick={() =>
                          router.push(`/Interview/${element.MockId}/StartInterview`)
                        }
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 font-medium py-2"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Start Again
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PrevInterview
