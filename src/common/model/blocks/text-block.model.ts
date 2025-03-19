import { z } from "zod";

export const textBlockModel = z.object({
  type: z.literal("text"),
  value: z.string(),
});

export type TextBlock = z.infer<typeof textBlockModel>;

export const textBlockModelWithAnalysis = textBlockModel.extend({
  value: z.string(),
});

export type TextBlockWithAnalysis = z.infer<typeof textBlockModelWithAnalysis>;
