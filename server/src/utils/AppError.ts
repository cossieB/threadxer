import { TRPCError } from "@trpc/server";

export default class AppError extends Error {
    public status
    constructor(message: string, status: number) {
        super(message);
        this.status = status
    }
    toTRPCError = () => {
        const map = new Map<number, TRPCError['code']>([
            [400, "BAD_REQUEST"],
            [401, "UNAUTHORIZED"],
            [403, "FORBIDDEN"],
            [500, "INTERNAL_SERVER_ERROR"]
        ])
        return new TRPCError({
            message: this.message,
            code: map.get(this.status) ?? "INTERNAL_SERVER_ERROR"
        })
    }
}