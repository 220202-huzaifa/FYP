import React from 'react'
import AddInterview from '../../components/Add_Interview'
const page = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            <h1 className="text-5xl font-bold mb-4">Interview Dashboard</h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Practice AI-powered mock interviews, track your progress, and improve your skills
          </p>
        </div>
        
        <AddInterview />
      </div>
    </main>
  )
}

export default page
