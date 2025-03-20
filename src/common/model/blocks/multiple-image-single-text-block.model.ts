import { commonBlockModel } from "@/src/common/model/blocks/common-block.model";
import { z } from "zod";
import {
  imageBlockModel,
  imageBlockModelWithAnalysis,
} from "./image-block.model";
import { textBlockModel } from "./text-block.model";

export const multipleImageAndSingleTextBlockModel = commonBlockModel.extend({
  type: z.literal("multipleImageAndSingleText"),
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
