'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { db } from '../../../../utils/Database_Connection'
import { UserAnswer } from '../../../../utils/Schema'
import { eq } from 'drizzle-orm'

import { Button } from '../../../../components/ui/button'
import { useRouter } from 'next/navigation'
import End_Interview from '../../../../components/End_Interview'
const EndInterview = ({ params }) => {
  const [loading, setloading] = useState(true)
  const [overallrating, setrating] = useState(0)

  const Router = useRouter()
  const GetFeedBackData = useCallback(async () => {
    const FeedBackResult = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.MockIdREF, params.interviewID))
      .orderBy(UserAnswer.id)

    console.log(FeedBackResult)

    const count = FeedBackResult.length || 1
    const totalRating = FeedBackResult.reduce(
      (sum, item) => sum + (Number(item.rating) || 0),
      0
    )
    const averageRating = totalRating / count
    setrating(averageRating)
    setloading(false)
  }, [params.interviewID])

  useEffect(() => {
    GetFeedBackData()
  }, [GetFeedBackData])

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
          <div className="px-6 py-8">
            {/* Header Section */}
            <div className="max-w-4xl mx-auto text-center mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                <h1 className="text-4xl font-bold mb-4">Interview Complete!</h1>
              </div>
              
              {/* Rating Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    {Number.isFinite(overallrating) ? overallrating.toFixed(1) : 'N/A'}
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-8 h-8 ${i < Math.floor(overallrating) ? 'text-yellow-400' : 'text-gray-600'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  {overallrating > 7 ? (
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold shadow-lg">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Congratulations! You Passed This Interview
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-semibold shadow-lg">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Review Feedback Below to Improve
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="max-w-6xl mx-auto">
              <End_Interview interviewID={params.interviewID} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center p-8">
            <Button
              onClick={() => Router.push('/DashBoard')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-xl transform transition-all duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              GO TO HOME
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default EndInterview
