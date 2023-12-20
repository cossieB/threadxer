import type { Request, Response, NextFunction } from "express";
import { db } from "../db/drizzle";
import { FollowerFollowee, Hashtags, Media, Post, User } from "../db/schema";
import AppError from "../utils/AppError";
import { asc, desc, eq } from "drizzle-orm";

export async function getPost(req: Request, res: Response, next: NextFunction) {

}

export async function createPost(req: Request, res: Response, next: NextFunction) {
    const user = res.locals.token!.user
    const { text } = req.body as { text: string, media?: string[] }
    const media: string[] = req.body.media ?? []
    if (text.length + media.length === 0)
        return next(new AppError("Empty posts are not allowed", 400))

    const rgx = /(?<=\s|^)(#\w+)(?=\s|$)/g
    const matches = text.matchAll(rgx); 
    const uniqueTags = new Set<string>()
    for (const match of matches) {
        uniqueTags.add(match[0].toLowerCase())
    }
    const uniques = Array.from(uniqueTags); 

    try {
        const postId = await db.transaction(async tx => {
            const row = await tx.insert(Post).values({
                userId: user.userId,
                text,
            }).returning({
                postId: Post.postId
            })
            if (media.length > 0)
                await tx.insert(Media).values(media.map(url => ({
                    postId: row[0].postId,
                    url
                })))
            if (uniques.length > 0)
                await tx.insert(Hashtags).values(uniques.map(tag => ({
                    hashtag: tag,
                    postId: row[0].postId,
                })))
            return row[0].postId
        })
        return res.json({ postId })
    }
    catch (error) {
        next(error)
    }
    res.sendStatus(200)
}

export async function getAllPosts(req: Request, res: Response, next: NextFunction) {
    const currentUser = res.locals.token?.user
    // if (currentUser) {
    //     const subquery = db.select({
    //         followeeId: FollowerFollowee.followeeId
    //     })
    //     .from(FollowerFollowee)
    //     .where(eq(FollowerFollowee.followerId, currentUser.userId))
    //     .as('sub')
    // }
    
    const posts = await db.select({
        post: Post,
        user: {
            userId: User.userId,
            username: User.username,
            avatar: User.avatar,
            banner: User.avatar,
            email: User.email,
            displayName: User.displayName
        }
    })
        .from(Post)
        .innerJoin(User, eq(User.userId, Post.userId))
        .limit(100)
        .orderBy(desc(Post.dateCreated) )

    res.json(posts)
}

