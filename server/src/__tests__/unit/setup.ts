import { db } from "~/db/drizzle.js"
import { Post, User } from "~/db/schema.js"

export async function createRandomUsers() {
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

export async function createTestUser() {
    await db.insert(User).values({
        email: "test@testers.com",
        passwordHash: "DSKdfsklfjakldfjsklasdf",
        username: "tester",
        usernameLower: "tester",
        userId: "00000000-0000-0000-0000-000000000000"
    })
}

export async function createTestPost() {
    await db.insert(Post).values({
        text: "For testing purposes",
        userId: "00000000-0000-0000-0000-000000000000",
        postId: "00000000-0000-0000-0000-000000000000"
    })
}