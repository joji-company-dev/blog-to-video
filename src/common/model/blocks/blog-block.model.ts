import { z } from "zod";
import { imageBlockModel } from "./image-block.model";
import { multipleImageAndSingleTextBlockModel } from "./multiple-image-single-text-block.model";
import { singleImageAndMultipleTextBlockModel } from "./single-image-multiple-text-block.model";
import { singleImageAndSingleTextBlockModel } from "./single-image-single-text-block.model";
import { textBlockModel } from "./text-block.model";

export const blogBlockModel = z.union([
  textBlockModel,
  imageBlockModel,
  singleImageAndSingleTextBlockModel,
  singleImageAndMultipleTextBlockModel,
  multipleImageAndSingleTextBlockModel,
]);

export type BlogBlock = z.infer<typeof blogBlockModel>;

export * from "./image-block.model";
export * from "./multiple-image-single-text-block.model";
export * from "./single-image-multiple-text-block.model";
export * from "./single-image-single-text-block.model";
export * from "./text-block.model";
