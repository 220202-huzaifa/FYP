'use client'
import { SignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Brain, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()

  const handleSignInSuccess = () => {
    router.push('/DashBoard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-lg border-r border-white/10">
          <div className="flex flex-col justify-center px-12 py-16">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">MockMaster ProPrep</span>
            </div>

            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">AI-Powered Questions</h3>
                    <p className="text-gray-400">Personalized interview questions tailored to your role</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Voice Responses</h3>
                    <p className="text-gray-400">Natural voice interaction for realistic practice</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Detailed Feedback</h3>
                    <p className="text-gray-400">Comprehensive analysis to improve your skills</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white ml-2">MockMaster ProPrep</span>
            </div>

            {/* Sign In Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-gray-400">Sign in to continue your interview preparation</p>
              </div>

              {/* Clerk Sign In */}
              <SignIn 
                path="/sign-in" 
                afterSignIn={handleSignInSuccess}
                redirectUrl="/DashBoard"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none border-none p-0 w-full",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl py-4 transition-all duration-200 font-medium",
                    socialButtonsBlockButtonText: "font-medium",
                    formFieldLabel: "text-gray-300 text-sm font-medium mb-2",
                    formFieldInput: "w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-xl py-4 px-4 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all",
                    formButtonPrimary: "w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl py-4 transition-all duration-200 transform hover:scale-[1.02] shadow-lg",
                    formButtonSecondary: "w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl py-4 transition-all duration-200",
                    footerActionLink: "text-purple-400 hover:text-purple-300 transition-colors font-medium",
                    dividerLine: "bg-white/20",
                    dividerText: "text-gray-400 text-sm",
                    identityPreview: "bg-white/10 border border-white/20 text-white rounded-xl py-4",
                    identityPreviewText: "text-white",
                    identityPreviewEditButton: "text-purple-400 hover:text-purple-300",
                    form: "space-y-4",
                    formField: "space-y-2",
                    footer: "mt-6 text-center",
                    socialButtonsBlock: "space-y-3",
                    formFieldRow: "space-y-4"
                  }
                }}
              />

              {/* Sign Up Link */}
              <div className="text-center mt-8 pt-6 border-t border-white/20">
                <p className="text-gray-300 text-sm">
                  Don't have an account?{' '}
                  <Link 
                    href="/sign-up" 
                    className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                  >
                    Get started free
                  </Link>
                </p>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-6">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
