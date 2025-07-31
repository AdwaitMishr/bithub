import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db"; // your drizzle instance
import { env } from "@/env";
import {cache} from "react"
import {headers} from "next/headers"
 
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true
    },
    updateAccountOnSignIn: {
        enabled: true
    },
    session: {
        cookieCache: {
          enabled: true,
          maxAge: 5 * 60,
        },
    },
    
});

export const getSession = cache(async () => {
    return await auth.api.getSession({
        headers: await headers(),
    });
});