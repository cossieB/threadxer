import { afterAll, beforeAll, describe, expect, test } from "vitest";
import assert from "node:assert";
import { db } from "~/db/drizzle.js";
import { Post, User } from "~/db/schema.js";
import * as postService from "~/services/postService.js"

describe("postService tests", () => {
    beforeAll(async () => {
        await db.insert(User).values({
            email: "test@testers.com",
            passwordHash: "DSKdfsklfjakldfjsklasdf",
            username: "tester",
            usernameLower: "tester",
            userId: "00000000-0000-0000-0000-000000000000"
        })
        await db.insert(Post).values({
            text: "sample",
            userId: "00000000-0000-0000-0000-000000000000",
            postId: "00000000-0000-0000-0000-000000000000"
        })
    })
    afterAll(async () => {
        await db.execute(`TRUNCATE users, posts CASCADE`)
    })
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
        expect(post.post.text).toBe("sample")
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
    })
})