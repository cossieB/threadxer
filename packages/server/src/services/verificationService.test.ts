import { describe, expect, test, vi } from "vitest";
import assert from "node:assert";
import * as verificationService from "@/services/verificationService.js";
import { db } from "@/db/drizzle.js";

describe("verification tests", () => {
    test("create code for invalid user", async () => {
        const mockFn = vi.fn()
        expect(() => verificationService.createNewVerificationCode({
            email: "test@test.com",
            userId: "00000000-0000-0000-0000-000000000005",
            username: "sdkfdjk",
        }, mockFn)).rejects.toThrow("User Not Found")
    })
    test("create new code", async () => {
        const mockFn = vi.fn()

        const code = await verificationService.createNewVerificationCode({
            email: "test@test.com",
            userId: "00000000-0000-0000-0000-000000000000",
            username: "sdkfdjk",
        }, mockFn)
        expect(mockFn).toHaveBeenCalled()
        assert(typeof code === "string")
        assert(code.length === 6)
    })
    test("verify user", async () => {
        await verificationService.verifyUser({userId: "00000000-0000-0000-0000-000000000000"})
        const user = await db.query.User.findFirst({
            where(fields, operators) {
                return operators.eq(fields.userId, "00000000-0000-0000-0000-000000000000")
            },
        })
        assert(user)
        expect(user.emailVerified).toBeTruthy()
        const code = await db.query.VerificationCodes.findFirst({
            where(fields, operators) {
                return operators.eq(fields.userId, "00000000-0000-0000-0000-000000000000")
            },
        })
        assert(code)
        expect(code.dateUsed).toBeTruthy()
    })
})