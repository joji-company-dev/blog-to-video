import { commonBlockModel } from "@/src/common/model/blocks/common-block.model";
import { z } from "zod";
import {
  imageBlockModel,
  imageBlockModelWithAnalysis,
} from "./image-block.model";
import { textBlockModel } from "./text-block.model";

export const singleImageAndMultipleTextBlockModel = commonBlockModel.extend({
  type: z.literal("singleImageAndMultipleText"),
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
