import { db } from "#server/db/drizzle.js"
import { Post, User } from "#server/db/schema.js"
import { afterAll, beforeAll } from "vitest"

beforeAll(async () => {
    await db.insert(User).values({
        email: "test@testers.com",
        passwordHash: "DSKdfsklfjakldfjsklasdf",
        username: "tester",
        usernameLower: "tester",
        userId: "00000000-0000-0000-0000-000000000000"
    })
    .onConflictDoNothing()
    await db.insert(Post).values({
        text: "For testing purposes",
        userId: "00000000-0000-0000-0000-000000000000",
        postId: "00000000-0000-0000-0000-000000000000"
    })
    .onConflictDoNothing()
    const arr: Promise<any>[] = new Array(10)
    for (let i = 0; i < 10; i++) {
        arr.push(db.insert(User).values({
            email: "test" + i + "@testers.com",
            passwordHash: "" + Math.random(),
            username: "test" + i,
            usernameLower: "test" + i,
        }).onConflictDoNothing())
    }
    await Promise.all(arr)
})

// export async function setup(project: TestProject) {
//     project.onTestsRerun(() => {
//         throw "SHIT"
//     })
//     console.error("setup")
//     await writeFile("./hello.txt", "abc 123", "utf-8")

// }

// export async function teardown(project: TestProject) {
//     await db.execute(`TRUNCATE users, posts CASCADE`)
// }