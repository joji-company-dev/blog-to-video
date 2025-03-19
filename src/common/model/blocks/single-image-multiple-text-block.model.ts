import { z } from "zod";
import { imageBlockModel } from "./image-block.model";
import { textBlockModel } from "./text-block.model";

export const singleImageAndMultipleTextBlockModel = z.object({
  type: z.literal("singleImageAndMultipleText"),
  duration: z.number(),
  imageBlock: imageBlockModel,
  textBlocks: z.array(textBlockModel),
});

export type SingleImageAndMultipleTextBlock = z.infer<
  typeof singleImageAndMultipleTextBlockModel
>;
