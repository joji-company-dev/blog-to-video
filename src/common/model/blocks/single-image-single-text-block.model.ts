import { z } from "zod";
import {
  imageBlockModel,
  imageBlockModelWithAnalysis,
} from "./image-block.model";
import { textBlockModel } from "./text-block.model";

export const singleImageAndSingleTextBlockModel = z.object({
  type: z.literal("singleImageAndSingleText"),
  duration: z.number(),
  imageBlock: imageBlockModel,
  textBlock: textBlockModel,
});

export const singleImageAndSingleTextBlockModelWithAnalysis =
  singleImageAndSingleTextBlockModel.extend({
    imageBlock: imageBlockModelWithAnalysis,
  });

export type SingleImageAndSingleTextBlock = z.infer<
  typeof singleImageAndSingleTextBlockModel
>;

export type SingleImageAndSingleTextBlockWithAnalysis = z.infer<
  typeof singleImageAndSingleTextBlockModelWithAnalysis
>;
