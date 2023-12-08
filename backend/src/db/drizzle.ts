import postgres from "postgres";
import { drizzle } from 'drizzle-orm/postgres-js';
import dotenv from 'dotenv'
import * as schema from "./schema"
dotenv.config()


const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, {schema})