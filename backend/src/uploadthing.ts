import { createUploadthing, type FileRouter } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter = {
    videoAndImage: f({
        image: {
            maxFileSize: "2MB",
            maxFileCount: 4,
        },
        video: {
            maxFileSize: "8MB",
        },
    }).onUploadComplete((data) => {
        console.log("upload completed", data);
    }),
    avatar: f({
        image: {
            maxFileSize: "1024B"
        }
    })
    .middleware(async ({req, res}) => {
        console.log(res.locals.token?.user)
        return {userId: res.locals.token?.user.userId}
    })
    .onUploadComplete(data => {
        console.log(data)
    })
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;