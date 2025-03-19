import { z } from "zod";
import { imageBlockModel } from "./image-block.model";
import { textBlockModel } from "./text-block.model";

export const singleImageAndSingleTextBlockModel = z.object({
  type: z.literal("singleImageAndSingleText"),
  duration: z.number(),
  imageBlock: imageBlockModel,
  textBlock: textBlockModel,
});

export type SingleImageAndSingleTextBlock = z.infer<
  typeof singleImageAndSingleTextBlockModel
>;
