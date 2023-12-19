import { sql } from "drizzle-orm";
import { pgTable, uuid, varchar, text, timestamp, jsonb, integer, unique, primaryKey, boolean, foreignKey, date } from "drizzle-orm/pg-core";

export const User = pgTable('users', {
    userId: uuid('user_id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 50 }).unique().notNull(),
    usernameLower: varchar('username_lower', { length: 50 }).unique().notNull(),
    email: text('email').unique().notNull(),
    emailVerified: timestamp('email_verified', { mode: 'date', withTimezone: true }),
    lastLogin: timestamp('last_login', { mode: 'date', withTimezone: true }),
    passwordHash: text('password').notNull(),
    dateJoined: timestamp('date_joined', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
    bio: varchar('bio', { length: 255 }).notNull().default(""),
    avatar: text('avatar').notNull().default("https://upload.wikimedia.org/wikipedia/commons/5/55/Question_Mark.svg"),
    banner: text('banner').notNull().default("/default_banner.png"),
    displayName: varchar('display_name', { length: 50 }).notNull().default(""),
    location: varchar('location', {length: 100}).notNull().default(""),
    website: varchar('website'),
    dateOfBirth: date('dob')
})
export const VerificationCodes = pgTable('verification_codes', {
    userId: uuid('user_id').references(() => User.userId, { onDelete: 'cascade', onUpdate: 'cascade' }).primaryKey(),
    code: varchar('code', {length: 6}).notNull(),
    expiry: timestamp('expiry', {withTimezone: true}).default(sql`NOW() + INTERVAL '72 hours'`).notNull(),
    dateUsed: timestamp('date_used', {withTimezone: true})
})

export const Post = pgTable('posts', {
    postId: uuid('post_id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => User.userId, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
    text: varchar('text', { length: 255 }).notNull(),
    dateCreated: timestamp('date_created', { withTimezone: true }).defaultNow().notNull(),
    views: integer('views').notNull().default(0),
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
    postId: uuid('post_id').notNull().references(() => Post.postId, { onDelete: 'cascade', onUpdate: 'cascade' }),
    url: text('url').notNull()
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
    id: primaryKey({columns: [t.followeeId, t.followerId]})
}))

export const Hashtags = pgTable('hashtags', {
    hashtag: varchar('hashtag'),
    postId: uuid('post_id').notNull().references(() => Post.postId, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, t => ({
    unique: primaryKey({columns: [t.hashtag, t.postId]})
}))

export const RefreshTokens = pgTable('refresh_tokens', {
    token: text('token').primaryKey(),
    userId: uuid('user_id').references(() => User.userId, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
})