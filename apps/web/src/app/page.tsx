import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { api, HydrateClient } from "@/trpc/server";
import Landing from "./_components/Landing";


export default async function Home() {
  

  return (
    <HydrateClient>
      <main>
        <Landing/>
      </main>
    </HydrateClient>
  );
}
