import express from "express";
import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import { Account } from "../db/schema";
import { hash, genSalt } from 'bcrypt'
import { DrizzleError, eq } from "drizzle-orm";

export const authRouter = express.Router();

authRouter.get('/availability', async (req, res) => {
    const { username } = req.query;
    if (!username || typeof username != 'string')
        throw new AppError("Please don't bypass client validation", 400)
    if (username.length < 3)
        return res.sendStatus(204)
    const row = await db.select({
        username: Account.username
    })
        .from(Account)
        .where(eq(Account.usernameLower, username.toLowerCase()))
        .limit(1)

    const availability = row.length == 0 ? "Username is available" : "Username is already taken"
    return res.json({ availability })
})

authRouter.post('/signup', async (req, res) => {
    const { username, password, confirmPassword, email } = req.body;
    if (
        !username ||
        typeof username !== 'string' ||
        !password ||
        typeof password !== 'string' ||
        !confirmPassword ||
        typeof confirmPassword !== 'string' ||
        !email ||
        typeof email !== 'string'
    )
        throw new AppError("Please don't bypass client validation", 400)
    if (password != confirmPassword)
        throw new AppError("Please don't bypass client validation", 400)

    const salt = await genSalt(10);
    const passwordHash = await hash(password, salt)

    try {
        db.insert(Account)
            .values({
                email,
                username,
                usernameLower: username.toLowerCase(),
                passwordHash
            })
    }
    catch (error) {
        console.log(error)
        if (error instanceof DrizzleError) {
            return res.send(error.message)
        }
    }

})