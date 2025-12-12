'use client'
import Image from 'next/image'
import React from 'react'
import Logo from '../public/WebsiteLogo.svg'
import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'

import { useRouter } from 'next/navigation'
const Header = () => {
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  return (
    <div className=" px-3 py-4 shadow-md items-center flex justify-between  cursor-pointer">
      <div className=" flex gap-2 items-center">
        <Image
          className=" w-12 sm:w-20  "
          src={Logo}
          alt="Logo"
          onClick={() => router.push('/')}
        />
      </div>
      <div className=" ">
        <div
          className="   flex justify-center items-center gap-4 font-bold cursor-pointer"
          onClick={() => router.push('/')}
        >
          <p className=" text-xl  sm:text-4xl">MockMaster ProPrep</p>
        </div>
      </div>

      {isSignedIn ? (
        <div className=" flex  gap-4 items-center">
          <p className=" hidden sm:inline">{user.fullName}</p>
          <UserButton />
        </div>
      ) : (
        <Link
          className=" bg-green-300 hidden sm:inline  p-4 rounded-lg"
          href={'./sign-in'}
        >
          {' '}
          Lets Get Started
        </Link>
      )}
    </div>
  )
}

export default Header
