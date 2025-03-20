import { commonBlockModel } from "@/src/common/model/blocks/common-block.model";
import { imageAnalysisModel } from "@/src/common/model/image-analysis.model";
import { z } from "zod";

export const imageBlockModel = commonBlockModel.extend({
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
