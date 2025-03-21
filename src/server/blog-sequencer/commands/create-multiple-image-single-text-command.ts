import {
  imageBlockModelWithAnalysis,
  MultipleImageAndSingleTextBlockWithAnalysis,
  textBlockModelWithAnalysis,
} from "@/src/common/model/blocks";
import { BlogContentWithAnalysis } from "@/src/common/model/blog-content.model";
import { TEXT_BLOCK_DURATION_PER_CHARACTER } from "@/src/server/blog-sequencer/commands/constants";
import { SequenceCommand } from "@/src/server/blog-sequencer/commands/sequence-command.interface";
import { z } from "zod";

export const createMultipleImageSingleTextCommandArgsModel = z.object({
  type: z.literal("createMultipleImageSingleText"),
  targetImageIndexes: z.array(z.number()),
  targetTextIndex: z.number(),
});

export type CreateMultipleImageSingleTextCommandArgs = z.infer<
  typeof createMultipleImageSingleTextCommandArgsModel
>;

export class CreateMultipleImageSingleTextCommandImpl
  implements SequenceCommand
{
  constructor(
    private readonly args: CreateMultipleImageSingleTextCommandArgs
  ) {}

  async execute(
    blogContent: BlogContentWithAnalysis
  ): Promise<MultipleImageAndSingleTextBlockWithAnalysis> {
    const { targetImageIndexes, targetTextIndex } = this.args;

    const targetText = textBlockModelWithAnalysis.parse(
      blogContent.blocks[targetTextIndex]
    );

    const totalDuration = Math.round(
      targetText.value.replaceAll(/<[^>]*>?\\n/g, "").replaceAll(" ", "")
        .length * TEXT_BLOCK_DURATION_PER_CHARACTER
    );

    targetText.duration = totalDuration;

    const targetImages = targetImageIndexes.map((index) => {
      const imageBlock = imageBlockModelWithAnalysis.parse(
        blogContent.blocks[index]
      );
      imageBlock.duration = totalDuration / targetImageIndexes.length;
      return imageBlock;
    });

    return {
      type: "multipleImageAndSingleText",
      duration: totalDuration,
      imageBlocks: targetImages,
      textBlock: targetText,
    };
  }
}
