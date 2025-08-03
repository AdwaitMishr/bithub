'use client'
import React from 'react'
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

const Landing = () => {
    const router = useRouter();
    const session =  useSession();
    React.useEffect(()=>{
        if (!session){
            router.push('/auth/sign-in');
        }
        if (!session.data?.user.username){
            router.push('/chooseusername');
        }
    },[])
  return (
    <div>
      
    </div>
  )
}

export default Landing
