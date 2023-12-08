import 'express';

interface Locals {
    user?: {
        userId: string
    }
}

declare module 'express' {
    export interface Response {
        locals: Locals
    }
}