import { z } from "zod";

export const imageBlockModel = z.object({
  type: z.literal("image"),
  value: z.object({
    src: z.string(),
  }),
});

export const textBlockModel = z.object({
  type: z.literal("text"),
  value: z.string(),
});

export const singleImageAndSingleTextBlockModel = z.object({
  type: z.literal("singleImageAndSingleText"),
  duration: z.number(),
  imageBlock: imageBlockModel,
  textBlock: textBlockModel,
});

export const singleImageAndMultipleTextBlockModel = z.object({
  type: z.literal("singleImageAndMultipleText"),
  duration: z.number(),
  imageBlock: imageBlockModel,
  textBlocks: z.array(textBlockModel),
});

export const multipleImageAndSingleTextBlockModel = z.object({
  type: z.literal("multipleImageAndSingleText"),
  duration: z.number(),
  imageBlocks: z.array(imageBlockModel),
  textBlock: textBlockModel,
});

export const blogBlockModel = z.union([
  textBlockModel,
  imageBlockModel,
  singleImageAndSingleTextBlockModel,
  singleImageAndMultipleTextBlockModel,
  multipleImageAndSingleTextBlockModel,
]);

export const blogContentModel = z.object({
  title: z.string(),
  blocks: z.array(blogBlockModel),
});

export type ImageBlock = z.infer<typeof imageBlockModel>;
export type TextBlock = z.infer<typeof textBlockModel>;
export type SingleImageAndSingleTextBlock = z.infer<
  typeof singleImageAndSingleTextBlockModel
>;
export type SingleImageAndMultipleTextBlock = z.infer<
  typeof singleImageAndMultipleTextBlockModel
>;
export type MultipleImageAndSingleTextBlock = z.infer<
  typeof multipleImageAndSingleTextBlockModel
>;
export type BlogBlock = z.infer<typeof blogBlockModel>;
export type BlogContent = z.infer<typeof blogContentModel>;
