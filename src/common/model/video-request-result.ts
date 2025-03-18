import { z } from "zod";

export const videoRequestResultModel = z.object({
  progress: z.enum(["pending", "processing", "done", "error"]),
  data: z.object({
    id: z.string(),
  }),
});

export type VideoRequestResult = z.infer<typeof videoRequestResultModel>;
