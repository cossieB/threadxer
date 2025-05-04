import { AppRouter } from "threadxer-server";
import {inferRouterOutputs} from "@trpc/server"

export type RouterOutputs = inferRouterOutputs<AppRouter>
export type PostResponse = RouterOutputs["posts"]["getPost"]

export type ApiPostResponse = {
    posts: PostResponse[]
    isLastPage: boolean
}