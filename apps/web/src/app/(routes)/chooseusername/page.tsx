"use client";

import React from 'react'
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { LoaderIcon } from 'lucide-react';

const Page = () => {
    const [username, setUsername] = React.useState('');
    const [isPending, setIsPending] = React.useState(false);

    const submitHandler =async ()=>{
      setIsPending(true);
        if (!await authClient.isUsernameAvailable({username:username})){
            toast.error("Sorry, that username is not available.")
        }

        const uname = await authClient.updateUser({username:username})
        if (!uname.data){
            toast.error('That username is not available, try changing the username.');
            return;
        }
        toast.success('Username set successfully. Welcome to bithub');
        setIsPending(false);
    }
  return (
    <div className='flex-col gap-x-4 justify-center items-center align-middle mx-auto p-8 mt-24 min-h-screen'>
      <Input onChange={(e)=>{setUsername(e.target.value)}}/>
      <Button className='self-center mx-auto' variant={"outline"} onClick={submitHandler}>{isPending?<LoaderIcon className='animate-spin'/>: <>Set username</> }</Button>
    </div>
  )
}

export default Page
