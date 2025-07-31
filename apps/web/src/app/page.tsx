import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  

  return (
    <HydrateClient>
      <main>

      </main>
    </HydrateClient>
  );
}
