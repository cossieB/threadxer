import { sql } from "drizzle-orm";
import { pgTable, uuid, varchar, text, timestamp, jsonb, integer, unique, primaryKey, boolean } from "drizzle-orm/pg-core";

export const Account = pgTable('accounts', {
    userId: uuid('user_id').primaryKey().defaultRandom(),
    username: varchar('username', {length: 50}).unique().notNull(),
    usernameLower: varchar('username', {length: 50}).unique().notNull(),
    email: text('email').unique().notNull(),
    emailVerified: timestamp('email_verified', {mode: 'date', withTimezone: true}), 
    lastLogin: timestamp('last_login', {mode: 'date', withTimezone: true}),
    passwordHash: text('password'),
})

export const User = pgTable('users', {
    userId: uuid('user_id').primaryKey().references(() => Account.userId, {onDelete: 'cascade', onUpdate: 'cascade'}).unique(),
    dateJoined: timestamp('date_joined', {mode: 'date', withTimezone: true}).notNull().defaultNow(),
    bio: varchar('bio', {length: 255}).notNull().default(""),
    avatar: text('avatar'),
    banner: text('banner')
})

export const Post = pgTable('post', {
    postId: uuid('post_id').primaryKey().defaultRandom(),
    text: varchar('text', {length: 255}),
    dateCreated: timestamp('date_created', {withTimezone: true}).defaultNow().notNull(),
    views: integer('views'),
    reply_to: uuid('reply_to').references(() => Post.postId, {onDelete: 'set null', onUpdate: 'cascade'}),
    quoted_post: uuid('quoting').references(() => Post.postId, {onDelete: 'set null', onUpdate: 'cascade'}),
    didQuote: boolean('did_quote').notNull().default(false)
})

export const Repost = pgTable('reposts', {
    repostId: uuid('repost_id').primaryKey().defaultRandom(),
    postId: uuid('post_id').references(() => Post.postId, {onDelete: 'cascade', onUpdate: 'cascade'}).notNull(),
    dateCreated: timestamp('date_created', {withTimezone: true}).defaultNow().notNull()
})

export const Media = pgTable('media', {
    mediaId: uuid('media_id').primaryKey().defaultRandom(),
    postId: uuid('post_id').references(() => Post.postId, {onDelete: 'set null', onUpdate: 'cascade'}),
    url: text('url').notNull(),
    uploadThingResponse: jsonb('uploadthing_response').notNull().default(sql`'{}'::jsonb`)
})

export const Likes = pgTable('likes', {
    likeId: uuid('like_id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => User.userId, {onDelete: 'cascade', onUpdate: 'cascade'}).notNull(),
    postId: uuid('post_id').references(() => Post.postId, {onDelete: 'cascade', onUpdate: 'cascade'}).notNull(),
    dateCreated: timestamp('date_created', {withTimezone: true}).defaultNow().notNull()
}, t => ({
    uniq: unique().on(t.postId, t.userId)
}))

export const FollowerFollowee = pgTable('follower_followee', {
    followerId: uuid('follower_id').references(() => User.userId, {onDelete: 'cascade', onUpdate: 'cascade'}).notNull(),
    followeeId: uuid('followee_id').references(() => User.userId, {onDelete: 'cascade', onUpdate: 'cascade'}).notNull(),
    dateFollowed: timestamp('date_followed', {withTimezone: true}).defaultNow().notNull()
}, t => ({
    id: primaryKey(t.followeeId, t.followerId)
}))