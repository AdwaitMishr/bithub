import Link from "next/link";

import { api, HydrateClient } from "@/trpc/server";
import Landing from "./_components/Landing";
import { GameCanvas } from "./_components/GameComponent";



export default async function Home() {
  return (
    <HydrateClient>
      <main>
        <GameCanvas/>
        <Landing/>
      </main>
    </HydrateClient>
  );
}
