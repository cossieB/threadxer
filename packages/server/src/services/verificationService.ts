import { eq, sql } from "drizzle-orm";
import { randomInt } from "node:crypto";
import postgres from "postgres";
import { db } from "#server/db/drizzle.js";
import { RefreshTokens, User, VerificationCodes } from "#server/db/schema.js";
import { redis } from "#server/redis.js";
import { TokenUser } from "#server/types.js";
import AppError from "#server/utils/AppError.js";

type EmailFunc = (to: string, name: string, code: string) => Promise<void>;

export async function createNewVerificationCode(user: Pick<TokenUser, 'userId' | 'email' | 'username'>, emailFn: EmailFunc) {
    try {
        const code = randomInt(999999).toString().padStart(6, '0');

        await db.insert(VerificationCodes)
            .values({
                code,
                userId: user.userId
            })
            .onConflictDoUpdate({
                target: VerificationCodes.userId,
                set: {
                    code,
                    expiry: sql`NOW() + INTERVAL '72 hours'`
                }
            })
        redis.setex(`verification:${user.userId}`, 259200 /* 3 days */, code)
            .catch()
        emailFn(user.email, user.username, code)
        return code
    }
    catch (error) {
        if (error instanceof postgres.PostgresError) {
            if (error.message.includes("violates foreign key constraint"))
                throw new AppError( "User Not Found", 400)
        }
    }
}
type UserPartial = Pick<TokenUser, 'userId'>

export async function getVerificationCode(user: UserPartial) {
    return db.query.VerificationCodes.findFirst({
        where(fields, operators) {
            return operators.eq(fields.userId, user.userId)
        }
    })
}

export async function verifyUser(user: UserPartial, refreshCookie?: string) {
    const now = new Date;
    await db.transaction(async tx => {
        await tx.update(User)
            .set({
                emailVerified: now
            })
            .where(eq(User.userId, user.userId))
        await tx.update(VerificationCodes)
            .set({
                dateUsed: now
            })
        if (refreshCookie)
            await tx.delete(RefreshTokens).where(eq(RefreshTokens.token, refreshCookie))
    })
}