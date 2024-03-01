import jwt, {type JwtPayload} from 'jsonwebtoken'
import { publicProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { eq } from 'drizzle-orm';
import { db } from '../db/drizzle';
import { RefreshTokens } from '../db/schema';
import { handleTokens } from '../utils/generateCookies';

export const refreshRoutes = router({
    getAccessToken: publicProcedure
        .query(async ({ ctx }) => {
            const refresh = ctx.req.cookies.rf;
            if (!refresh)
                throw new TRPCError({code: 'UNAUTHORIZED', message: 'No Token'})
            try {
                const token = jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
                const found = await db.query.RefreshTokens.findFirst({
                    where(fields, operators) {
                        return operators.eq(fields.token, refresh)
                    },
                })
                // Handling refresh token reuse
                if (!found) {
                    await db.delete(RefreshTokens).where(eq(RefreshTokens.userId, token.user.userId));
                    ctx.res.clearCookie('rf')
                    throw new TRPCError({code: 'UNAUTHORIZED', message: 'Invalid Token'})
                }
                const { accessToken, cookie, fb } = await handleTokens(token.user, async refreshToken => {
                    await db.transaction(async tx => {
                        await tx.delete(RefreshTokens).where(eq(RefreshTokens.token, refresh))
                        await tx.insert(RefreshTokens).values({
                            token: refreshToken,
                            userId: token.user.userId
                        })
                    })
                })
                ctx.res.header('Set-Cookie', cookie)
                return { jwt: accessToken, fb }
            }
            catch (error: any) {
                console.error(error)
                throw new TRPCError({code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later."})
            }
        })
})