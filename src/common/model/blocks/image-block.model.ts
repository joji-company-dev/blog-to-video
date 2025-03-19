import { z } from "zod";

export const imageBlockModel = z.object({
  type: z.literal("image"),
  value: z.object({
    src: z.string(),
  }),
});

export type ImageBlock = z.infer<typeof imageBlockModel>;
