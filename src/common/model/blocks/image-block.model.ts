import { imageAnalysisModel } from "@/src/common/model/image-analysis.model";
import { z } from "zod";

export const imageBlockModel = z.object({
  type: z.literal("image"),
  value: z.object({
    src: z.string(),
  }),
});

export const imageBlockModelWithAnalysis = imageBlockModel.extend({
  value: z.object({
    src: z.string(),
    analysis: imageAnalysisModel,
  }),
});

export type ImageBlock = z.infer<typeof imageBlockModel>;
export type ImageBlockWithAnalysis = z.infer<
  typeof imageBlockModelWithAnalysis
>;
