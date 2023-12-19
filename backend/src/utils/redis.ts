import { Redis } from "ioredis";

function getRedis() {
    
    if (process.env.REDIS_PRIVATE_URL) {
        const redisURL = new URL(process.env.REDIS_PRIVATE_URL);
        // @ts-expect-error
        return new Redis({
            family: 0,
            host: redisURL.hostname,
            port: redisURL.port,
            username: redisURL.username,
            password: redisURL.password
        });
    }
    else return new Redis
}

export const redis =  getRedis()