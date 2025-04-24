import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import assert from "node:assert";
import * as verificationService from "~/services/verificationService.js";
import { createTestUser } from "~/__tests__/unit/setup.js";
import { db } from "~/db/drizzle.js";

describe("verification tests", () => {
    afterAll(async () => {
        await db.execute(`TRUNCATE users, posts CASCADE`)
    })
    test("create code for invalid user", async () => {
        const mockFn = vi.fn()
        expect(() => verificationService.createNewVerificationCode({
            avatar: "",
            banner: "",
            email: "test@test.com",
            userId: "00000000-0000-0000-0000-000000000005",
            username: "sdkfdjk",
        }, mockFn)).rejects.toThrow("User Not Found")
    })
    test("create new code", async () => {
        const mockFn = vi.fn()
        await createTestUser()
        const code = await verificationService.createNewVerificationCode({
            avatar: "",
            banner: "",
            email: "test@test.com",
            userId: "00000000-0000-0000-0000-000000000000",
            username: "sdkfdjk",
        }, mockFn)
        expect(mockFn).toHaveBeenCalled()
        assert(typeof code === "string")
        assert(code.length === 6)
    })
})