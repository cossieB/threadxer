import * as jwt from "jsonwebtoken";
import { TokenUser } from "./types.ts";

declare module 'jsonwebtoken' {
    export interface JwtPayload {
        user?: TokenUser
    }
}