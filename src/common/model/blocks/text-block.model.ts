import { z } from "zod";

export const textBlockModel = z.object({
  type: z.literal("text"),
  value: z.string(),
});

export type TextBlock = z.infer<typeof textBlockModel>;
