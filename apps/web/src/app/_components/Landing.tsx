'use client'
import React from 'react'
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

const Landing = () => {
    const router = useRouter();
    const session =  useSession();
    const isAuthenticated = session?.data?.user;
    React.useEffect(()=>{
        if (!isAuthenticated){
            router.push('/auth/sign-in');
            return;
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
