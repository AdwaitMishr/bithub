import { createTRPCRouter } from "../trpc";
import { protectedProcedure } from "../trpc";
import {z} from "zod";
import {db} from "@/server/db"
import { eq } from "drizzle-orm";
import {user} from '@/server/db/schema'
import { TRPCError } from "@trpc/server";


export const helperRouter = createTRPCRouter({
    // assignUsername: protectedProcedure
    // .input(z.object({
    //     username: z.string()
    //       .min(3, { message: "Username must be at least 3 characters." })
    //       .max(20, { message: "Username cannot be longer than 20 characters." })
    //       .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores." }),
    // }))
    // .mutation(async ({ctx,input})=>{
    //     const existingUser =  await db.query.user.findFirst({
    //         where: eq(user.username, input.username)
    //     })

    //     if (existingUser) throw new TRPCError({
    //         code: 'CONFLICT',
    //         message: 'Username is already taken please try another.'
    //     })

    //     const newUser = await db.update(user).set({username: input.username}).where(eq(user.id,ctx.session.user.id));

    //     return {success: true};
    // })

})