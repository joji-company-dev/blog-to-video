import { createMultipleImageSingleTextCommandArgsModel } from "@/src/server/blog-sequencer/commands/create-multiple-image-single-text-command";
import { createSingleImageMultipleTextCommandArgsModel } from "@/src/server/blog-sequencer/commands/create-single-image-multiple-text-command";
import { createSingleImageSingleTextCommandArgsModel } from "@/src/server/blog-sequencer/commands/create-single-image-single-text-command";
import { z } from "zod";

export const sequenceCommandArgsModel = z.union([
  createSingleImageSingleTextCommandArgsModel,
  createSingleImageMultipleTextCommandArgsModel,
  createMultipleImageSingleTextCommandArgsModel,
]);

export type SequenceCommandArgs = z.infer<typeof sequenceCommandArgsModel>;
