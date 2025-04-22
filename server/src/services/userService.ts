import postgres from "postgres";
import { TRPCError } from "@trpc/server";
import { db } from "~/db/drizzle.js";
import { User, VerificationCodes } from "~/db/schema.js";
import { compare, genSalt, hash } from "bcrypt";
import { randomInt } from "crypto";
import titleCase from "~/lib/titleCase.js";

export async function createUser(
    email: string,
    password: string,
    username: string,
) {
    const displayName = titleCase(username.replaceAll('_', ' '))

    const salt = await genSalt(10);
    const passwordHash = await hash(password, salt);

    try {
        const rows = await db.insert(User)
            .values({
                email: email.toLowerCase(),
                username,
                usernameLower: username.toLowerCase(),
                passwordHash,
                displayName
            })
            .returning({
                userId: User.userId,
                username: User.username,
                avatar: User.avatar,
                banner: User.avatar,
                email: User.email
            });
        return rows[0]
    }
    catch (error) {
        if (error instanceof postgres.PostgresError) {
            if (error.message.includes('users_username_unique'))
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Username is not available' })
            if (error.message.includes("users_email_unique"))
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email is not available' })
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong." })
    }
}

export async function getUserBy(field: 'email' | 'usernameLower' | 'userId', value: string) {
    return await db.query.User.findFirst({
        columns: {
            passwordHash: false,
            emailVerified: false,
            usernameLower: false,
            email: false,
            userId: false,
            lastLogin: false
        },
        where(fields, operators) {
            return operators.eq(fields[field], value.toLowerCase())
        }
    })
}

export async function getUserWithSensitiveInfoBy(field: "email" | "usernameLower" | "userId", value: string) {
    return await db.query.User.findFirst({
        where(fields, operators) {
            return operators.eq(fields[field], value.toLowerCase())
        }
    })
}