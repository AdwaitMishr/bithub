"use client";

import React from 'react'
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

const page = () => {
    const [username, setUsername] = React.useState('');
    const [isPending, setIsPending] = React.useState(false);

    const submitHandler =async ()=>{
        if (!await authClient.isUsernameAvailable({username:username})){
            toast.error("Sorry, that username is not available.")
        }

        const uname = await authClient.updateUser({username:username})
        if (!uname.data){
            toast.error('That username is not available, try changing the username.');
            return;
        }
        toast.success('Username set successfully. Welcome to bithub');
    }
  return (
    <div className='flex-col gap-x-4 justify-center items-center align-middle mx-auto p-8 mt-24'>
      <Input onChange={(e)=>{setUsername(e.target.value)}}/>
      <Button className='self-center mx-auto' variant={"outline"} onClick={submitHandler}>Set username</Button>
    </div>
  )
}

export default page
