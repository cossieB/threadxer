import jwt, { type JwtPayload } from 'jsonwebtoken'
import { publicProcedure, router } from "../trpc.js";
import { TRPCError } from "@trpc/server";
import * as authService from "~/services/authService.js";

export const refreshRoutes = router({
    getAccessToken: publicProcedure
        .query(async ({ ctx }) => {
            const refresh = ctx.req.cookies.rf;
            if (!refresh)
                throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No Token' })
            try {
                const token = jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
                const found = await authService.getToken(refresh);
                // Handling refresh token reuse. The old refresh token is deleted when a new one gets issued, 
                // so refresh token reuse is a possible cause of the `found` variable being null here.
                if (!found) {
                    await authService.deleteUserTokens(token.user!.userId)
                    ctx.res.clearCookie('rf')
                    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid Token' })
                }
                const { accessToken, cookie, firebaseToken } = await authService.newRefreshToken(token.user!, refresh,);
                ctx.res.header('Set-Cookie', cookie)
                return { jwt: accessToken, firebaseToken }
            }
            catch (error: any) {
                console.error(error)
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later." })
            }
        })
})