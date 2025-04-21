import { z } from "zod";

export const UserCreateSchema = z.object({
    username: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
    email: z.string().email()
})

export const UserLoginSchema = z.object({
    email: z.string(),
    password: z.string()
})

export const UserResponseSchema = z.object({
    avatar: z.string(),
    banner: z.string(),
    userId: z.string(),
    username: z.string(),
    email: z.string(),
})

export const UpdateUserSchema = z.object({
    displayName: z.string().max(25).optional(),
    bio: z.string().max(180).optional(),
    website: z.string().url().nullish(),
    location: z.string().optional(),
    avatar: z.string().url().optional(),
    banner: z.string().url().optional(),
    username: z.string().optional()
})
export type UserUpdate = z.infer<typeof UpdateUserSchema>