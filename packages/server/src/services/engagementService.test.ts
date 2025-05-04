import { describe, test } from "vitest";
import assert from "node:assert";
import * as engagementService from "#server/services/engagementService.js";

describe("engagementService tests", () => {
    test("like and unlike", async () => {
        const res = await engagementService.likeOrUnlikePost("00000000-0000-0000-0000-000000000000", {
            userId: "00000000-0000-0000-0000-000000000000",
        })
        assert(res === 1)
        const res2 = await engagementService.likeOrUnlikePost("00000000-0000-0000-0000-000000000000", {
            userId: "00000000-0000-0000-0000-000000000000",
        })
        assert(res2 === -1)
    })
    test("respost and unrespost", async () => {
        const res = await engagementService.repostOrUnrepost("00000000-0000-0000-0000-000000000000", {
            userId: "00000000-0000-0000-0000-000000000000",
        })
        assert(res === 1)
        const res2 = await engagementService.repostOrUnrepost("00000000-0000-0000-0000-000000000000", {
            userId: "00000000-0000-0000-0000-000000000000",
        })
        assert(res2 === -1)
    })
    
})