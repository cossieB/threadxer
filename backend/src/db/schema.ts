import { sql } from "drizzle-orm";
import { pgTable, uuid, varchar, text, timestamp, jsonb, integer, unique, primaryKey, boolean, foreignKey } from "drizzle-orm/pg-core";

export const Account = pgTable('accounts', {
    userId: uuid('user_id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 50 }).unique().notNull(),
    usernameLower: varchar('username_lower', { length: 50 }).unique().notNull(),
    email: text('email').unique().notNull(),
    emailVerified: timestamp('email_verified', { mode: 'date', withTimezone: true }),
    lastLogin: timestamp('last_login', { mode: 'date', withTimezone: true }),
    passwordHash: text('password').notNull(),
})

export const User = pgTable('users', {
    userId: uuid('user_id').primaryKey().references(() => Account.userId, { onDelete: 'cascade', onUpdate: 'cascade' }),
    dateJoined: timestamp('date_joined', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
    bio: varchar('bio', { length: 255 }).notNull().default(""),
    avatar: text('avatar'),
    banner: text('banner'),
    displayName: varchar('display_name', { length: 50 }).notNull().default("")
})

export const Post = pgTable('posts', {
    postId: uuid('post_id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => User.userId, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
    text: varchar('text', { length: 255 }),
    dateCreated: timestamp('date_created', { withTimezone: true }).defaultNow().notNull(),
    views: integer('views'),
    replyTo: uuid('reply_to'),
    didReply: boolean('did_reply').notNull().default(false),
    quotedPost: uuid('quoting'),
    didQuote: boolean('did_quote').notNull().default(false)
}, t => ({
    replyForeignKey: foreignKey({
        columns: [t.replyTo],
        foreignColumns: [t.postId]
    }),
    quoteForeignKey: foreignKey({
        columns: [t.quotedPost],
        foreignColumns: [t.postId]
    })
}))

export const Repost = pgTable('reposts', {
    repostId: uuid('repost_id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => User.userId, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
    postId: uuid('post_id').references(() => Post.postId, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
    dateCreated: timestamp('date_created', { withTimezone: true }).defaultNow().notNull()
})

export const Media = pgTable('media', {
    mediaId: uuid('media_id').primaryKey().defaultRandom(),
    postId: uuid('post_id').references(() => Post.postId, { onDelete: 'set null', onUpdate: 'cascade' }),
    url: text('url').notNull(),
    uploadThingResponse: jsonb('uploadthing_response').notNull().default(sql`'{}'::jsonb`)
})

export const Likes = pgTable('likes', {
    likeId: uuid('like_id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => User.userId, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
    postId: uuid('post_id').references(() => Post.postId, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
    dateCreated: timestamp('date_created', { withTimezone: true }).defaultNow().notNull()
}, t => ({
    uniq: unique().on(t.postId, t.userId)
}))

export const FollowerFollowee = pgTable('follower_followee', {
    followerId: uuid('follower_id').references(() => User.userId, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
    followeeId: uuid('followee_id').references(() => User.userId, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
    dateFollowed: timestamp('date_followed', { withTimezone: true }).defaultNow().notNull()
}, t => ({
    id: primaryKey(t.followeeId, t.followerId)
}))