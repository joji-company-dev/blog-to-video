import { createMultipleImageMultipleTextCommandArgsModel } from "@/src/server/blog-sequencer/commands/create-multiple-image-multiple-text-command";
import { z } from "zod";

export const sequenceCommandArgsModel =
  createMultipleImageMultipleTextCommandArgsModel;

export type SequenceCommandArgs = z.infer<typeof sequenceCommandArgsModel>;
