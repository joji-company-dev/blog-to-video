import { z } from "zod";
import {
  imageBlockModel,
  imageBlockModelWithAnalysis,
} from "./image-block.model";
import {
  multipleImageAndSingleTextBlockModel,
  multipleImageAndSingleTextBlockModelWithAnalysis,
} from "./multiple-image-single-text-block.model";
import {
  singleImageAndMultipleTextBlockModel,
  singleImageAndMultipleTextBlockModelWithAnalysis,
} from "./single-image-multiple-text-block.model";
import {
  singleImageAndSingleTextBlockModel,
  singleImageAndSingleTextBlockModelWithAnalysis,
} from "./single-image-single-text-block.model";

import {
  multipleImageAndMultipleTextBlockModel,
  multipleImageAndMultipleTextBlockModelWithAnalysis,
} from "./multiple-image-multiple-text-block.model";
import { textBlockModel, textBlockModelWithAnalysis } from "./text-block.model";

export const blogBlockModel = z.union([
  textBlockModel,
  imageBlockModel,
  singleImageAndSingleTextBlockModel,
  singleImageAndMultipleTextBlockModel,
  multipleImageAndSingleTextBlockModel,
  multipleImageAndMultipleTextBlockModel,
]);

export const blogBlockModelWithAnalysis = z.union([
  textBlockModelWithAnalysis,
  imageBlockModelWithAnalysis,
  singleImageAndSingleTextBlockModelWithAnalysis,
  singleImageAndMultipleTextBlockModelWithAnalysis,
  multipleImageAndSingleTextBlockModelWithAnalysis,
  multipleImageAndMultipleTextBlockModelWithAnalysis,
]);

export type BlogBlock = z.infer<typeof blogBlockModel>;
export type BlogBlockWithAnalysis = z.infer<typeof blogBlockModelWithAnalysis>;

export * from "./image-block.model";
export * from "./multiple-image-multiple-text-block.model";
export * from "./multiple-image-single-text-block.model";
export * from "./single-image-multiple-text-block.model";
export * from "./single-image-single-text-block.model";
export * from "./text-block.model";
