import { z } from "zod";
import {
  imageBlockModel,
  imageBlockModelWithAnalysis,
} from "./image-block.model";

import {
  multipleImageAndMultipleTextBlockModel,
  multipleImageAndMultipleTextBlockModelWithAnalysis,
} from "./multiple-image-multiple-text-block.model";
import { textBlockModel, textBlockModelWithAnalysis } from "./text-block.model";

export const blogBlockModel = z.union([
  textBlockModel,
  imageBlockModel,

  multipleImageAndMultipleTextBlockModel,
]);

export const blogBlockModelWithAnalysis = z.union([
  textBlockModelWithAnalysis,
  imageBlockModelWithAnalysis,

  multipleImageAndMultipleTextBlockModelWithAnalysis,
]);

export type BlogBlock = z.infer<typeof blogBlockModel>;
export type BlogBlockWithAnalysis = z.infer<typeof blogBlockModelWithAnalysis>;

export * from "./image-block.model";
export * from "./multiple-image-multiple-text-block.model";
export * from "./text-block.model";
