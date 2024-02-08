import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import { compare, genSalt, hash } from "bcrypt";
import { randomInt } from "crypto";
import { PostgresError } from "postgres";
import { RefreshTokens, User, VerificationCodes } from "../db/schema";
import { handleTokens } from "../utils/generateCookies";
import { eq } from "drizzle-orm";
import { draftVerificationEmail } from "../utils/draftEmail";
import titleCase from "../lib/titleCase";
import { TRPCError } from "@trpc/server"
import { redis } from "../redis";

export async function checkAvailability(email?: string, username?: string) {

}
type CreateUser = {
    username: string,
    password: string,
    confirmPassword: string,
    email: string
}
export async function signupUser(body: CreateUser) {
    
}

export async function loginUser(req: Request, res: Response, next: NextFunction) {
    
}

export async function logoutUser(req: Request, res: Response, next: NextFunction) {

}