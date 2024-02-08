import { type TokenUser } from "../types";
import jwt from 'hono/jwt';

export async function getUserFromHeader(headers: Headers) {
    const authHeader = headers.get("authorization");
    if (!authHeader || authHeader.split(" ").length < 2) {
        return null;
    }
    const at = authHeader.split(" ")[1];

    try {
        const token = await jwt.verify(at, process.env.ACCESS_TOKEN_SECRET!) as { user: TokenUser; iat: number; };
        return token.user;
    }
    catch (error) {
        return null;
    }
}
