import { Redis } from "ioredis";

const redisURL = new URL(process.env.REDIS_PRIVATE_URL!);
// @ts-expect-error
export const redis = new Redis({
    family: 0,
    host: redisURL.hostname,
    port: redisURL.port,
    username: redisURL.username,
    password: redisURL.password
});