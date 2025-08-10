'use client'
import React from 'react'
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { usePlayerStore } from '@/stores/usePlayerStore';

const Landing = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const initializePlayer = usePlayerStore((state) => state.initializePlayer);

  React.useEffect(() => {

    if (isPending) {
      return;
    }
    if (!session?.user) {
      router.push('/auth/sign-in');
      return;
    }

    if (!session?.user.username) {
      router.push('/chooseusername');
      return;
    }
    
    if (session?.user.username) {
      initializePlayer(session.user.username);
    }

  }, [isPending, session, router, initializePlayer]);

  return (
    <div>
      {isPending && <p>Loading...</p>}
    </div>
  )
}

export default Landing;