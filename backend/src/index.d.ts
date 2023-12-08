import 'express';
import { TokenUser } from './types';

declare global {
    namespace Express {
        interface Locals {
            token?: {
                user: TokenUser
                iat: number
            }
        }
    }
}