import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db"; // your drizzle instance
import { env } from "@/env";
import {cache} from "react"
import {headers} from "next/headers"
import {username} from "better-auth/plugins/username"
 
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
    socialProviders :{
        google:{
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    plugins: [ 
        username({
            minUsernameLength: 3,
            maxUsernameLength: 16
        }) 
    ]
});

export const getSession = cache(async () => {
    return await auth.api.getSession({
        headers: await headers(),
    });
});