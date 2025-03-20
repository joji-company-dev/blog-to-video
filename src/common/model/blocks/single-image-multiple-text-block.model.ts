import { z } from "zod";
import {
  imageBlockModel,
  imageBlockModelWithAnalysis,
} from "./image-block.model";
import { textBlockModel } from "./text-block.model";

export const singleImageAndMultipleTextBlockModel = z.object({
  type: z.literal("singleImageAndMultipleText"),
  duration: z.number(),
  imageBlock: imageBlockModel,
  textBlocks: z.array(textBlockModel),
});

export const singleImageAndMultipleTextBlockModelWithAnalysis =
  singleImageAndMultipleTextBlockModel.extend({
    imageBlock: imageBlockModelWithAnalysis,
  });

export type SingleImageAndMultipleTextBlock = z.infer<
  typeof singleImageAndMultipleTextBlockModel
>;

export type SingleImageAndMultipleTextBlockWithAnalysis = z.infer<
  typeof singleImageAndMultipleTextBlockModelWithAnalysis
>;
