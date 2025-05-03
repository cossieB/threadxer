import { z } from "zod";

export const CreatePostSchema = z.object({
    text: z.string().max(180),
    quotedPost: z.string().uuid().optional(),
    replyTo: z.string().uuid().optional(),
    media: z.object({
        url: z.string().url(),
        isVideo: z.boolean(),
        ref: z.string()
    }).array().optional().default([]),
})
export type CreatePost = z.infer<typeof CreatePostSchema>
