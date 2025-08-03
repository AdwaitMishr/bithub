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

    const submitHandler =async ()=>{
        if (!await authClient.isUsernameAvailable({username:username})){
            toast.error("Sorry, that username is not available.")
        }

        const uname = await authClient.updateUser({username:username})
        if (!uname.data){
            toast.error('An error occured, try changing the username.');
        }
        toast.success('Username set successfully. Welcome to bithub');
    }
  return (
    <div>
      <Input onChange={(e)=>{setUsername(e.target.value)}}/>
      <Button onClick={()=>{}}>Set username</Button>
    </div>
  )
}

export default page
