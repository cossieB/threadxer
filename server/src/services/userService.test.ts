import { describe, test, expect, afterAll, beforeAll } from "vitest";
import assert from "node:assert"
import * as userService from "~/services/userService.js";
import AppError from "~/utils/AppError.js";
import { User } from "~/db/schema.js";
import { db } from "~/db/drizzle.js";

describe("userService tests", () => {
    beforeAll(async () => {
        await createRandomUsers();
    })
    afterAll(async () => {
        await db.delete(User)
    })
    test("create a user", async () => {
        const user = await userService.createUser("test@test.com", "sdkdfjskfasksdf", "test user");
        assert(!(user instanceof AppError))
        expect(user).toHaveProperty("userId")
        expect(user).toMatchObject({
            username: "test user",
            email: "test@test.com"
        })
    })
    test("duplicate email", async () => {
        const error = await userService.createUser("test1@testers.com", "dvavsdfea dfsa f", "Tester")
        assert(error instanceof AppError)
        expect(error.message).toBe("Email is not available")
        expect(error.status).toBe(400)
    })
    test("duplicate username", async () => {
        const error = await userService.createUser("hello@test.com", "sdkdfjskfasksdf", "test5")
        assert(error instanceof AppError)
        expect(error.message).toBe("Username is not available")
        expect(error.status).toBe(400)
    })
    test("retrieve created user", async () => {
        const [user1, user2] = await Promise.all([userService.getUserBy("email", "test@test.com"), userService.getUserBy("usernameLower", "test user")])
        expect(user1).toBeDefined()
        expect(user2).toBeDefined()
        expect(user1).toEqual(user2)
    })
})

async function createRandomUsers() {
    const arr: Promise<any>[] = new Array(10)
    for (let i = 0; i < 10; i++) {
        arr.push(db.insert(User).values({
            email: "test" + i + "@testers.com",
            passwordHash: "" + Math.random(),
            username: "test" + i,
            usernameLower: "test" + i,
        }))
    }
    await Promise.all(arr)
}