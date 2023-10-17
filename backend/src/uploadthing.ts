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
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;