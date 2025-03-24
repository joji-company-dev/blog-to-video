import {
  imageBlockModelWithAnalysis,
  SingleImageAndSingleTextBlockWithAnalysis,
  textBlockModelWithAnalysis,
} from "@/src/common/model/blocks";
import { BlogContentWithAnalysis } from "@/src/common/model/blog-content.model";
import { TEXT_BLOCK_DURATION_PER_CHARACTER } from "@/src/server/blog-sequencer/commands/constants";
import { SequenceCommand } from "@/src/server/blog-sequencer/commands/sequence-command.interface";
import { z } from "zod";

export const createSingleImageSingleTextCommandArgsModel = z.object({
  type: z.literal("createSingleImageSingleText"),
  targetImageIndex: z.number(),
  targetTextIndex: z.number(),
});

export type CreateSingleImageSingleTextCommandArgs = z.infer<
  typeof createSingleImageSingleTextCommandArgsModel
>;

export class CreateSingleImageSingleTextCommandImpl implements SequenceCommand {
  constructor(private readonly args: CreateSingleImageSingleTextCommandArgs) {}

  async execute(
    blogContent: BlogContentWithAnalysis
  ): Promise<SingleImageAndSingleTextBlockWithAnalysis> {
    const { targetImageIndex, targetTextIndex } = this.args;

    const targetImage = imageBlockModelWithAnalysis.parse(
      blogContent.blocks[targetImageIndex]
    );
    const targetText = textBlockModelWithAnalysis.parse(
      blogContent.blocks[targetTextIndex]
    );

    const totalDuration = Math.round(
      targetText.value.replaceAll(/<[^>]*>|\n/g, "").replaceAll(" ", "")
        .length * TEXT_BLOCK_DURATION_PER_CHARACTER
    );

    targetText.duration = totalDuration;
    targetImage.duration = totalDuration;

    return {
      type: "singleImageAndSingleText",
      duration: totalDuration,
      imageBlock: targetImage,
      textBlock: targetText,
    };
  }
}
