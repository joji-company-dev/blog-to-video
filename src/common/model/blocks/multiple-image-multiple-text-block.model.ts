import { commonBlockModel } from "@/src/common/model/blocks/common-block.model";
import { z } from "zod";
import {
  imageBlockModel,
  imageBlockModelWithAnalysis,
} from "./image-block.model";
import { textBlockModel } from "./text-block.model";

export const multipleImageAndMultipleTextBlockModel = commonBlockModel.extend({
  type: z.literal("multipleImageAndMultipleText"),
  imageBlocks: z.array(imageBlockModel),
  textBlocks: z.array(textBlockModel),
});

export const multipleImageAndMultipleTextBlockModelWithAnalysis =
  multipleImageAndMultipleTextBlockModel.extend({
    imageBlocks: z.array(imageBlockModelWithAnalysis),
  });

export type MultipleImageAndMultipleTextBlock = z.infer<
  typeof multipleImageAndMultipleTextBlockModel
>;

export type MultipleImageAndMultipleTextBlockWithAnalysis = z.infer<
  typeof multipleImageAndMultipleTextBlockModelWithAnalysis
>;
