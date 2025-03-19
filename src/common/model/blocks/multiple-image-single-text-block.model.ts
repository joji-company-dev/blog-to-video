import { z } from "zod";
import { imageBlockModel } from "./image-block.model";
import { textBlockModel } from "./text-block.model";

export const multipleImageAndSingleTextBlockModel = z.object({
  type: z.literal("multipleImageAndSingleText"),
  duration: z.number(),
  imageBlocks: z.array(imageBlockModel),
  textBlock: textBlockModel,
});

export type MultipleImageAndSingleTextBlock = z.infer<
  typeof multipleImageAndSingleTextBlockModel
>;
