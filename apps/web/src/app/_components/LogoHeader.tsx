"use client"
import React from 'react';
import Image from "next/image";
import Link from 'next/link';


const LogoHeader = () => {
  return (
    <div className='flex h-12 m-2 mx-8 align-middle items-center sticky top-0 left-0 backdrop-blur-md'>
        <Link href='/'>
        <Image src="/bithub-md-logo.svg" width={128} height={96} alt='Bithub logo'/>
        </Link>
      
    </div>
  )
}

export default LogoHeader
