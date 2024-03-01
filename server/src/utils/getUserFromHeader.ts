import { IncomingHttpHeaders } from "http";
import { type TokenUser } from "../types";
import jwt from 'jsonwebtoken'

export function getUserFromHeader(headers: IncomingHttpHeaders) {
    const authHeader = headers.authorization
    if (!authHeader || authHeader.split(" ").length < 2) {
        return null;
    }
    const at = authHeader.split(" ")[1];

    try {
        const token = jwt.verify(at, process.env.ACCESS_TOKEN_SECRET!) as { user: TokenUser; iat: number; };
        return token.user;
    }
    catch (error) {
        return null;
    }
}
