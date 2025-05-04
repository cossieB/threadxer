import { describe, expect, test } from "vitest";
import assert from "node:assert";
import { db } from "#server/db/drizzle.js";
import * as postService from "#server/services/postService.js"

describe("postService tests", () => {

    test("create post", async () => {
        const postId = await postService.createPost({
            email: "test@testers.com",
            avatar: "",
            banner: "",
            isUnverified: false,
            userId: "00000000-0000-0000-0000-000000000000",
            username: "tester"
        }, {
            media: [],
            text: "Hello world this is just a test. #testing 123",
        })
        expect(postId).toBeDefined()
    })
    test("get post", async () => {
        const post = await postService.getPost("00000000-0000-0000-0000-000000000000", null)
        assert(post)
        expect(post.post.text).toBe("For testing purposes")
    })
    test("delete post forbidden", async () => {
        const deleted = await postService.deletePost("00000000-0000-0000-0000-000000000000", {
            email: "test@testers.com",
            username: "tester",
            userId: "00000000-0000-0000-0000-000000000001",
            avatar: "",
            banner: "",
            isUnverified: false
        })
        assert(deleted === false)
        const post = await db.query.Post.findFirst({
            where(fields, operators) {
                return operators.eq(fields.postId, "00000000-0000-0000-0000-000000000000")
            },
        })
        expect(post).toBeDefined()
    })
    test("delete post", async () => {
        const deleted = await postService.deletePost("00000000-0000-0000-0000-000000000000", {
            email: "test@testers.com",
            username: "tester",
            userId: "00000000-0000-0000-0000-000000000000",
            avatar: "",
            banner: "",
            isUnverified: false
        })
        assert(deleted)
        const post = await db.query.Post.findFirst({
            where(fields, operators) {
                return operators.eq(fields.postId, "00000000-0000-0000-0000-000000000000")
            },
        })
        expect(post).toBeUndefined()
    })
})