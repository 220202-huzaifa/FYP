// pages/sign-up.tsx
'use client'
import { SignUp } from '@clerk/nextjs'
import { useRouter } from 'next/router'
export default function SignUpPage() {
  const router = useRouter()
  const handleSignUpSuccess = () => {
    router.push('/')
  }
  return <SignUp path="/sign-up" afterSignUp={handleSignUpSuccess} />
}
