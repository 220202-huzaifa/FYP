'use client'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'
import { ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react'
import { db } from '../utils/Database_Connection'
import { UserAnswer } from '../utils/Schema'
import { eq } from 'drizzle-orm'

// Add custom animation
const style = document.createElement('style')
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .animate-slideIn {
    animation: slideIn 0.5s ease-out;
  }
  
  /* Lip sync animations */
  .mouth-closed { height: 2px; }
  .mouth-small-open { height: 6px; }
  .mouth-medium-open { height: 10px; }
  .mouth-large-open { height: 14px; }
  .mouth-wide { width: 12px; }
  .mouth-narrow { width: 8px; }
  
  /* Enhanced body animations */
  @keyframes head-bob {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-2px) rotate(1deg); }
    50% { transform: translateY(-4px) rotate(0deg); }
    75% { transform: translateY(-2px) rotate(-1deg); }
  }
  
  @keyframes body-sway {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(1deg) scale(1.02); }
    50% { transform: rotate(0deg) scale(1); }
    75% { transform: rotate(-1deg) scale(0.98); }
  }
  
  @keyframes arm-gesture {
    0%, 100% { transform: rotate(0deg) translateY(0px); }
    25% { transform: rotate(8deg) translateY(-2px); }
    50% { transform: rotate(0deg) translateY(0px); }
    75% { transform: rotate(-5deg) translateY(-1px); }
  }
  
  @keyframes blink {
    0%, 90%, 100% { transform: scaleY(1); }
    95% { transform: scaleY(0.1); }
  }
  
  @keyframes breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes mouth-shape-1 {
    0%, 100% { border-radius: 50%; width: 8px; height: 3px; }
    50% { border-radius: 40%; width: 12px; height: 6px; }
  }
  
  @keyframes mouth-shape-2 {
    0%, 100% { border-radius: 50%; width: 8px; height: 3px; }
    50% { border-radius: 30%; width: 14px; height: 8px; }
  }
  
  @keyframes mouth-shape-3 {
    0%, 100% { border-radius: 50%; width: 8px; height: 3px; }
    50% { border-radius: 20%; width: 16px; height: 10px; }
  }
  
  .head-bob { animation: head-bob 2s ease-in-out infinite; }
  .body-sway { animation: body-sway 3s ease-in-out infinite; }
  .arm-gesture { animation: arm-gesture 1.5s ease-in-out infinite; }
  .blink { animation: blink 4s ease-in-out infinite; }
  .breathe { animation: breathe 2s ease-in-out infinite; }
  .mouth-animate-1 { animation: mouth-shape-1 0.3s ease-in-out infinite; }
  .mouth-animate-2 { animation: mouth-shape-2 0.4s ease-in-out infinite; }
  .mouth-animate-3 { animation: mouth-shape-3 0.5s ease-in-out infinite; }
`
if (!document.head.querySelector('style[data-avatar-animation]')) {
  style.setAttribute('data-avatar-animation', 'true')
  document.head.appendChild(style)
}

const SpeakingAvatar = ({ isSpeaking, text, questionId }) => {
  const [currentViseme, setCurrentViseme] = useState('closed')
  const [shouldShow, setShouldShow] = useState(false)
  const visemeTimerRef = useRef(null)
  const hideTimerRef = useRef(null)

  const startLipSync = useCallback((speechText) => {
    // Clear any existing animation
    if (visemeTimerRef.current) {
      clearTimeout(visemeTimerRef.current)
    }
    
    // Simple viseme simulation - in real implementation, this would come from TTS API
    const visemes = ['closed', 'small-open', 'medium-open', 'large-open', 'medium-open', 'small-open', 'closed']
    let index = 0
    
    const animateVisemes = () => {
      setCurrentViseme(visemes[index % visemes.length])
      index++
      
      // Continue animation while speaking
      if (visemeTimerRef.current) {
        const timing = Math.random() * 200 + 100 // Random timing between 100-300ms
        visemeTimerRef.current = setTimeout(animateVisemes, timing)
      }
    }
    
    // Start animation
    visemeTimerRef.current = setTimeout(animateVisemes, 100)
  }, [])

  const stopLipSync = useCallback(() => {
    if (visemeTimerRef.current) {
      clearTimeout(visemeTimerRef.current)
      visemeTimerRef.current = null
    }
    setCurrentViseme('closed')
  }, [])

  useEffect(() => {
    if (isSpeaking && text) {
      setShouldShow(true)
      startLipSync(text)
      // Clear any pending hide timer
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    } else {
      stopLipSync()
      // Delay hiding the avatar to allow animation to complete
      hideTimerRef.current = setTimeout(() => {
        setShouldShow(false)
      }, 1500) // Increased delay to 1.5 seconds
    }
    
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
      if (visemeTimerRef.current) {
        clearTimeout(visemeTimerRef.current)
      }
    }
  }, [isSpeaking, text, startLipSync, stopLipSync])

  // Show avatar when speaking or during hide delay
  if (!shouldShow) {
    return null
  }

  const getMouthClass = () => {
    const baseClass = "absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 transition-all duration-100"
    
    if (!isSpeaking) {
      return `${baseClass} w-4 h-1 rounded-full`
    }
    
    // Dynamic mouth animation based on viseme
    const visemeClasses = {
      'closed': 'w-4 h-1 rounded-full',
      'small': 'w-6 h-2 rounded-2xl mouth-animate-1',
      'medium': 'w-8 h-3 rounded-2xl mouth-animate-2',
      'large': 'w-10 h-4 rounded-2xl mouth-animate-3'
    }
    
    return `${baseClass} ${visemeClasses[currentViseme] || visemeClasses['closed']}`
  }

  return (
    <div className="flex items-center gap-3 animate-slideIn">
      <div className="relative transition-all duration-500 scale-105">
        {/* Avatar Container */}
        <div className="w-40 h-48 relative">
          <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center">
            <div className="text-center p-4">
              {/* Animated SVG Avatar */}
              <div className={`relative w-28 h-36 mx-auto ${isSpeaking ? 'body-sway' : ''}`}>
                <svg 
                  width="112" 
                  height="144" 
                  viewBox="0 0 112 144" 
                  className={`absolute inset-0 ${isSpeaking ? 'head-bob' : ''}`}
                >
                  {/* Hair */}
                  <path 
                    d="M56 12 C35 12, 18 28, 18 48 C18 53, 19 58, 21 62 L22 62 C24 58, 26 53, 26 48 C26 36, 36 26, 56 26 C76 26, 86 36, 86 48 C86 53, 88 58, 90 62 L91 62 C93 58, 94 53, 94 48 C94 28, 77 12, 56 12 Z" 
                    fill="url(#hairGradient)" 
                    className={isSpeaking ? 'breathe' : ''}
                  />
                  
                  {/* Face */}
                  <ellipse 
                    cx="56" 
                    cy="56" 
                    rx="32" 
                    ry="36" 
                    fill="url(#faceGradient)" 
                    stroke="url(#faceStroke)" 
                    strokeWidth="2"
                  />
                  
                  {/* Eyes with blinking */}
                  <g className="blink">
                    <ellipse cx="42" cy="52" rx="5" ry="7" fill="#1a1a1a" />
                    <ellipse cx="70" cy="52" rx="5" ry="7" fill="#1a1a1a" />
                    <ellipse cx="43" cy="51" rx="2" ry="2" fill="#ffffff" opacity="0.8" />
                    <ellipse cx="71" cy="51" rx="2" ry="2" fill="#ffffff" opacity="0.8" />
                  </g>
                  
                  {/* Eyebrows */}
                  <path d="M37 42 Q42 40, 47 42" stroke="url(#hairGradient)" strokeWidth="2.5" fill="none" className={isSpeaking ? 'arm-gesture' : ''} />
                  <path d="M65 42 Q70 40, 75 42" stroke="url(#hairGradient)" strokeWidth="2.5" fill="none" className={isSpeaking ? 'arm-gesture' : ''} />
                  
                  {/* Nose */}
                  <path d="M56 56 L54 60 L58 60 Z" fill="url(#faceStroke)" />
                  
                  {/* Dynamic Mouth */}
                  <g className={getMouthClass().includes('mouth-animate') ? getMouthClass().split(' ').find(c => c.startsWith('mouth-animate')) : ''}>
                    <ellipse 
                      cx="56" 
                      cy="68" 
                      rx={currentViseme === 'large' ? '10' : currentViseme === 'medium' ? '7' : currentViseme === 'small' ? '5' : '3'} 
                      ry={currentViseme === 'large' ? '5' : currentViseme === 'medium' ? '4' : currentViseme === 'small' ? '3' : '1.5'} 
                      fill="#1a1a1a" 
                      className={isSpeaking ? getMouthClass().split(' ').find(c => c.startsWith('mouth-animate')) : ''}
                    />
                  </g>
                  
                  {/* Neck */}
                  <rect x="48" y="84" width="16" height="24" fill="url(#faceGradient)" />
                  
                  {/* Shoulders/Body */}
                  <ellipse cx="56" cy="116" rx="36" ry="22" fill="url(#bodyGradient)" />
                  <rect x="20" y="104" width="72" height="32" fill="url(#bodyGradient)" />
                  
                  {/* Shirt collar */}
                  <path d="M46 92 L56 100 L66 92" stroke="url(#collarGradient)" strokeWidth="2" fill="none" />
                  
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6B46C1" />
                      <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                    <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FDBCB4" />
                      <stop offset="100%" stopColor="#F5DEB3" />
                    </linearGradient>
                    <linearGradient id="faceStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E8A598" />
                      <stop offset="100%" stopColor="#D4A574" />
                    </linearGradient>
                    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                    <linearGradient id="collarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#e0e7ff" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Floating gesture indicators */}
                {isSpeaking && (
                  <>
                    <div className="absolute top-14 -left-4 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full arm-gesture opacity-80 shadow-lg"></div>
                    <div className="absolute top-14 -right-4 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full arm-gesture opacity-80 shadow-lg"></div>
                  </>
                )}
                
                {/* Enhanced glow effect when speaking */}
                {isSpeaking && (
                  <div className="absolute -inset-3 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur-md animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
          
          {/* Enhanced speaking indicators */}
          <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 flex gap-1.5">
            <div className="w-3.5 h-8 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full animate-pulse opacity-90 shadow-lg" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3.5 h-10 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full animate-pulse opacity-90 shadow-lg" style={{ animationDelay: '100ms' }}></div>
            <div className="w-3.5 h-9 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full animate-pulse opacity-90 shadow-lg" style={{ animationDelay: '200ms' }}></div>
            <div className="w-3.5 h-7 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full animate-pulse opacity-90 shadow-lg" style={{ animationDelay: '300ms' }}></div>
          </div>
          
          {/* Top sound waves */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex gap-2">
            <div className="w-3 h-7 bg-gradient-to-t from-cyan-400 to-purple-400 rounded-full animate-pulse opacity-70 shadow-lg" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-8 bg-gradient-to-t from-cyan-400 to-purple-400 rounded-full animate-pulse opacity-70 shadow-lg" style={{ animationDelay: '250ms' }}></div>
            <div className="w-2.5 h-6 bg-purple-500 rounded-full animate-pulse opacity-60" style={{ animationDelay: '350ms' }}></div>
          </div>
          
          {/* Enhanced pulsing rings */}
          <div className="absolute -inset-4 border-2 border-blue-400 rounded-full animate-ping opacity-20"></div>
          <div className="absolute -inset-6 border border-purple-400 rounded-full animate-ping opacity-10" style={{ animationDelay: '500ms' }}></div>
          <div className="absolute -inset-8 border border-cyan-400 rounded-full animate-ping opacity-5" style={{ animationDelay: '1000ms' }}></div>
        </div>
      </div>
      
      </div>
  )
}

const End_Interview = ({ interviewID }) => {
  const [FeedBackData, setFeedbackData] = useState([])
  const [speakingFeedback, setSpeakingFeedback] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingQuestionId, setSpeakingQuestionId] = useState(null)
  const speechTimeoutRef = useRef(null)
  const [openQuestions, setOpenQuestions] = useState({})
  
  // Cleanup effect to reset states when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setIsSpeaking(false)
      setSpeakingFeedback(null)
      setSpeakingQuestionId(null)
    }
  }, [])
  
  const TexttoSpeech = (text, questionId) => {
    console.log('Speaking feedback for:', { text, questionId });
    
    // Clear any pending speech timeout
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current)
      speechTimeoutRef.current = null
    }
    
    // Debounce rapid calls - wait 150ms before actually speaking
    speechTimeoutRef.current = setTimeout(() => {
      // Prevent multiple simultaneous calls for the same content
      if (isSpeaking && speakingQuestionId === questionId) {
        console.log('Already speaking this content, skipping...');
        return;
      }
      
      // Cancel any existing speech first
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        // Wait a moment for cancel to take effect
        setTimeout(() => {
          startSpeaking(text, questionId)
        }, 50)
      } else {
        startSpeaking(text, questionId)
      }
    }, 150) // End of setTimeout debounce
  }

  const startSpeaking = (text, questionId) => {
    // Set speaking state immediately when starting
    setIsSpeaking(true)
    setSpeakingFeedback(text)
    setSpeakingQuestionId(questionId)
    
    // Start speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      
      utterance.onend = () => {
        console.log('Speech finished for:', questionId)
        // Add a small delay before resetting states to ensure audio fully stops
        setTimeout(() => {
          if (speakingQuestionId === questionId) {
            setIsSpeaking(false)
            setSpeakingFeedback(null)
            setSpeakingQuestionId(null)
          }
        }, 300)
      }
      
      utterance.onerror = (event) => {
        console.log('Speech error:', event.error)
        setIsSpeaking(false)
        setSpeakingFeedback(null)
        setSpeakingQuestionId(null)
      }
      
      // Start speaking immediately
      window.speechSynthesis.speak(utterance)
      
      // Fallback: Check if speech is actually speaking after a short delay
      setTimeout(() => {
        if (!window.speechSynthesis.speaking && speakingQuestionId === questionId) {
          console.log('Speech not actually speaking, resetting states')
          setIsSpeaking(false)
          setSpeakingFeedback(null)
          setSpeakingQuestionId(null)
        }
      }, 1000)
    } else {
      console.error('Speech synthesis not supported')
      // Reset states if TTS not supported
      setIsSpeaking(false)
      setSpeakingFeedback(null)
      setSpeakingQuestionId(null)
    }
  }

  const stopSpeaking = () => {
    console.log('Stopping speech for question:', speakingQuestionId);
    
    // Clear any pending speech timeout
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current)
      speechTimeoutRef.current = null
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    
    setIsSpeaking(false)
    setSpeakingFeedback(null)
    setSpeakingQuestionId(null)
  }
  const GetFeedBackData = useCallback(async () => {
    const FeedBackResult = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.MockIdREF, interviewID))
      .orderBy(UserAnswer.id)

    console.log(FeedBackResult)
    setFeedbackData(FeedBackResult)

    if (FeedBackResult.length > 0) {
    }
  }, [interviewID])
  useEffect(() => {
    GetFeedBackData()
  }, [GetFeedBackData])

  return (
    <div className="space-y-6">
      {FeedBackData.map((element, index) => {
        return (
          <div key={element?.id} className="flex gap-6 items-start">
            {/* Speaking Avatar - positioned outside the box */}
            {speakingQuestionId === element?.id && (
              <div className="flex-shrink-0 mt-6">
                <SpeakingAvatar 
                  isSpeaking={isSpeaking} 
                  text={speakingFeedback} 
                  questionId={speakingQuestionId}
                />
              </div>
            )}
            
            {/* Question Card */}
            <div className="flex-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                <Collapsible open={openQuestions[element?.id] || false} onOpenChange={(open) => setOpenQuestions(prev => ({...prev, [element?.id]: open}))}>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">Question {index + 1}</h3>
                          <p className="text-gray-300 leading-relaxed">{element?.Question}</p>
                        </div>
                      </div>
                      <CollapsibleTrigger className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                        {!openQuestions[element?.id] ? (
                          <ChevronDown className="w-5 h-5 text-white" />
                        ) : (
                          <ChevronUp className="w-5 h-5 text-white" />
                        )}
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  
                  <CollapsibleContent>
                    <div className="px-6 pb-6 space-y-4">
                      {/* User Answer */}
                      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-4 border border-gray-600/30">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-gray-400">Your Answer</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{element?.UserAns}</p>
                      </div>

                      {/* Feedback */}
                      <div className="bg-gradient-to-r from-blue-800/50 to-indigo-800/50 rounded-xl p-4 border border-blue-600/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-blue-400">AI Feedback</span>
                          </div>
                          {speakingQuestionId === element?.id && isSpeaking ? (
                            <button
                              onClick={stopSpeaking}
                              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg transition-colors text-sm border border-red-500/30"
                            >
                              <VolumeX size={14} />
                              Stop Speaking
                            </button>
                          ) : (
                            <button
                              onClick={() => TexttoSpeech(element?.feedback, element?.id)}
                              className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg transition-colors text-sm border border-blue-500/30"
                            >
                              <Volume2 size={14} />
                              Listen Feedback
                            </button>
                          )}
                        </div>
                        <p className="text-gray-300 leading-relaxed">{element?.feedback}</p>
                      </div>

                      {/* Correct Answer */}
                      <div className="bg-gradient-to-r from-green-800/50 to-emerald-800/50 rounded-xl p-4 border border-green-600/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-green-400">Correct Answer</span>
                          </div>
                          {speakingQuestionId === `correct-${element?.id}` && isSpeaking ? (
                            <button
                              onClick={stopSpeaking}
                              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg transition-colors text-sm border border-red-500/30"
                            >
                              <VolumeX size={14} />
                              Stop Speaking
                            </button>
                          ) : (
                            <button
                              onClick={() => TexttoSpeech(element?.CorrectAns, `correct-${element?.id}`)}
                              className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1.5 rounded-lg transition-colors text-sm border border-green-500/30"
                            >
                              <Volume2 size={14} />
                              Listen Answer
                            </button>
                          )}
                        </div>
                        
                        {/* Avatar for Correct Answer */}
                        {speakingQuestionId === `correct-${element?.id}` && isSpeaking && (
                          <div className="flex justify-center mb-4">
                            <div className="relative transition-all duration-500 scale-95">
                              <div className="w-32 h-40 relative">
                                <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center">
                                  <div className="text-center p-3">
                                    <div className={`relative w-24 h-32 mx-auto ${isSpeaking ? 'body-sway' : ''}`}>
                                      <svg 
                                        width="96" 
                                        height="128" 
                                        viewBox="0 0 96 128" 
                                        className={`absolute inset-0 ${isSpeaking ? 'head-bob' : ''}`}
                                      >
                                        {/* Hair */}
                                        <path 
                                          d="M48 8 C32 8, 16 22, 16 40 C16 44, 17 48, 18 52 L19 52 C20 48, 22 44, 22 40 C22 30, 30 22, 48 22 C66 22, 74 30, 74 40 C74 44, 76 48, 77 52 L78 52 C79 48, 80 44, 80 40 C80 22, 64 8, 48 8 Z" 
                                          fill="url(#hairGradient)" 
                                          className={isSpeaking ? 'breathe' : ''}
                                        />
                                        
                                        {/* Face */}
                                        <ellipse 
                                          cx="48" 
                                          cy="48" 
                                          rx="28" 
                                          ry="30" 
                                          fill="url(#faceGradient)" 
                                          stroke="url(#faceStroke)" 
                                          strokeWidth="2"
                                        />
                                        
                                        {/* Eyes with blinking */}
                                        <g className="blink">
                                          <ellipse cx="36" cy="44" rx="4" ry="6" fill="#1a1a1a" />
                                          <ellipse cx="60" cy="44" rx="4" ry="6" fill="#1a1a1a" />
                                          <ellipse cx="37" cy="43" rx="1.5" ry="1.5" fill="#ffffff" opacity="0.8" />
                                          <ellipse cx="61" cy="43" rx="1.5" ry="1.5" fill="#ffffff" opacity="0.8" />
                                        </g>
                                        
                                        {/* Eyebrows */}
                                        <path d="M32 36 Q36 34, 40 36" stroke="url(#hairGradient)" strokeWidth="2" fill="none" className={isSpeaking ? 'arm-gesture' : ''} />
                                        <path d="M56 36 Q60 34, 64 36" stroke="url(#hairGradient)" strokeWidth="2" fill="none" className={isSpeaking ? 'arm-gesture' : ''} />
                                        
                                        {/* Nose */}
                                        <path d="M48 48 L46 51 L50 51 Z" fill="url(#faceStroke)" />
                                        
                                        {/* Dynamic Mouth */}
                                        <ellipse 
                                          cx="48" 
                                          cy="58" 
                                          rx="4" 
                                          ry="2" 
                                          fill="#1a1a1a" 
                                          className={isSpeaking ? 'mouth-animate-2' : ''}
                                        />
                                        
                                        {/* Neck */}
                                        <rect x="42" y="72" width="12" height="20" fill="url(#faceGradient)" />
                                        
                                        {/* Shoulders/Body */}
                                        <ellipse cx="48" cy="96" rx="30" ry="18" fill="url(#bodyGradient)" />
                                        
                                        {/* Gradients */}
                                        <defs>
                                          <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#6B46C1" />
                                            <stop offset="100%" stopColor="#2563EB" />
                                          </linearGradient>
                                          <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#FDBCB4" />
                                            <stop offset="100%" stopColor="#F5DEB3" />
                                          </linearGradient>
                                          <linearGradient id="faceStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#E8A598" />
                                            <stop offset="100%" stopColor="#D4A574" />
                                          </linearGradient>
                                          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#7C3AED" />
                                            <stop offset="100%" stopColor="#3B82F6" />
                                          </linearGradient>
                                        </defs>
                                      </svg>
                                      
                                      {/* Enhanced glow effect when speaking */}
                                      {isSpeaking && (
                                        <div className="absolute -inset-2 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full blur-md animate-pulse"></div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Sound waves for correct answer */}
                                <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 flex gap-1">
                                  <div className="w-2 h-6 bg-gradient-to-t from-green-500 to-emerald-500 rounded-full animate-pulse opacity-80" style={{ animationDelay: '0ms' }}></div>
                                  <div className="w-2 h-8 bg-gradient-to-t from-green-500 to-emerald-500 rounded-full animate-pulse opacity-80" style={{ animationDelay: '100ms' }}></div>
                                  <div className="w-2 h-7 bg-gradient-to-t from-green-500 to-emerald-500 rounded-full animate-pulse opacity-80" style={{ animationDelay: '200ms' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <p className="text-gray-300 leading-relaxed">{element?.CorrectAns}</p>
                      </div>

                      {/* Rating */}
                      <div className="bg-gradient-to-r from-orange-800/50 to-red-800/50 rounded-xl p-4 border border-orange-600/30">
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-orange-400">Rating</span>
                          <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-orange-400">{element?.rating}</div>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < element?.rating ? 'text-orange-400' : 'text-gray-600'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default End_Interview
