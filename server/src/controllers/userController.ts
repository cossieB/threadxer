import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import type { Request, Response, NextFunction } from "express";
import { Media, Post, RefreshTokens, User } from "../db/schema";
import { and, eq, desc, isNotNull } from "drizzle-orm";
import { validateUrl } from "../lib/validateUrl";
import { getPosts } from "../queries/getPosts";
import { getPostsAndReposts } from "../queries/getPostsAndReposts";
import { getLikes } from "../queries/getLikes";
import { formatPosts } from "../utils/formatPosts";
import { handleTokens } from "../utils/generateCookies";
import jwt, { type JwtPayload } from "jsonwebtoken";

export async function getUser(req: Request, res: Response, next: NextFunction) {

}

export async function updateUser(req: Request, res: Response, next: NextFunction) {

}

export async function getUserPosts(req: Request, res: Response, next: NextFunction) {

}

export async function getUserReplies(req: Request, res: Response, next: NextFunction) {

}

export async function getUserLikes(req: Request, res: Response, next: NextFunction) {

}

export async function getUserMedia(req: Request, res: Response, next: NextFunction) {

}