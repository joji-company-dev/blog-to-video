import { z } from "zod";
import {
  imageBlockModel,
  imageBlockModelWithAnalysis,
} from "./image-block.model";
import { textBlockModel } from "./text-block.model";

export const multipleImageAndSingleTextBlockModel = z.object({
  type: z.literal("multipleImageAndSingleText"),
  duration: z.number(),
  imageBlocks: z.array(imageBlockModel),
  textBlock: textBlockModel,
});

export const multipleImageAndSingleTextBlockModelWithAnalysis =
  multipleImageAndSingleTextBlockModel.extend({
    imageBlocks: z.array(imageBlockModelWithAnalysis),
  });

export type MultipleImageAndSingleTextBlock = z.infer<
  typeof multipleImageAndSingleTextBlockModel
>;

export type MultipleImageAndSingleTextBlockWithAnalysis = z.infer<
  typeof multipleImageAndSingleTextBlockModelWithAnalysis
>;
