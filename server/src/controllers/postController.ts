import type { Request, Response, NextFunction } from "express";
import { db } from "../db/drizzle";
import { Hashtags, Likes, Media, Post, User } from "../db/schema";
import AppError from "../utils/AppError";
import { eq, desc, isNull } from "drizzle-orm";
import { getHashtags } from "../utils/getHashtags";
import { getPosts } from "../queries/getPosts";
import { formatPosts } from "../utils/formatPosts";
import { PostgresError } from "postgres";
import { postRepliesQuery } from "../queries/postRepliesQuery";

export async function createPost(req: Request, res: Response, next: NextFunction) {
    type Body = {
        text: string;
        replyTo?: string | undefined;
        quotedPost?: string | undefined;
        media: {
            url: string;
            isVideo: boolean;
            ref: string;
        }[]
    }
    const user = res.locals.token!.user
    const { text } = req.body as Body
    const media = (req.body as Body).media ?? []
    

}

export async function getPost(req: Request, res: Response, next: NextFunction) {
    const { postId } = req.params;


}

export async function getAllPosts(req: Request, res: Response, next: NextFunction) {

}

export async function getPostReplies(req: Request, res: Response, next: NextFunction) {

}

export async function getPostQuotes(req: Request, res: Response, next: NextFunction) {

}

export async function getPostLikes(req: Request, res: Response, next: NextFunction) {
    
}