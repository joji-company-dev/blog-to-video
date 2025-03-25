import {
  imageBlockModelWithAnalysis,
  MultipleImageAndMultipleTextBlockWithAnalysis,
  TextBlock,
  textBlockModelWithAnalysis,
} from "@/src/common/model/blocks";
import { BlogContentWithAnalysis } from "@/src/common/model/blog-content.model";
import { TEXT_BLOCK_DURATION_PER_CHARACTER } from "@/src/server/blog-sequencer/commands/constants";
import { SequenceCommand } from "@/src/server/blog-sequencer/commands/sequence-command.interface";
import { z } from "zod";

export const createMultipleImageMultipleTextCommandArgsModel = z.object({
  type: z.literal("createMultipleImageMultipleText"),
  targetImageIndexes: z.array(z.number()),
  targetTextIndexes: z.array(z.number()),
});

export type CreateMultipleImageMultipleTextCommandArgs = z.infer<
  typeof createMultipleImageMultipleTextCommandArgsModel
>;

export class CreateMultipleImageMultipleTextCommandImpl
  implements SequenceCommand
{
  constructor(
    private readonly args: CreateMultipleImageMultipleTextCommandArgs
  ) {}

  async execute(
    blogContent: BlogContentWithAnalysis
  ): Promise<MultipleImageAndMultipleTextBlockWithAnalysis> {
    const { targetImageIndexes, targetTextIndexes } = this.args;

    const targetImages = targetImageIndexes.map((index) => {
      const imageBlock = imageBlockModelWithAnalysis.parse(
        blogContent.blocks[index]
      );
      return imageBlock;
    });

    const targetTexts = targetTextIndexes.map((index) => {
      const textBlock = { ...blogContent.blocks[index] } as TextBlock;
      textBlock.duration = Math.round(
        textBlock.value.replaceAll(/<[^>]*>?\\n/g, "").replaceAll(" ", "")
          .length * TEXT_BLOCK_DURATION_PER_CHARACTER
      );
      return textBlockModelWithAnalysis.parse(textBlock);
    });

    const totalDuration = targetTexts.reduce(
      (acc, curr) => acc + curr.duration,
      0
    );

    targetImages.forEach((image) => {
      image.duration = totalDuration / targetImages.length;
    });

    return {
      type: "multipleImageAndMultipleText",
      duration: totalDuration,
      imageBlocks: targetImages,
      textBlocks: targetTexts,
    };
  }
}
