import { describe, test, expect } from "vitest";
import assert from "node:assert"
import * as userService from "@/services/userService.js";
import AppError from "@/utils/AppError.js";

describe("userService tests", () => {
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
        const error = await userService.createUser("test1@testers.com", "dvavsdfea dfsa f", "unique username")
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
