import {
  imageBlockModelWithAnalysis,
  SingleImageAndMultipleTextBlockWithAnalysis,
  TextBlock,
  textBlockModelWithAnalysis,
} from "@/src/common/model/blocks";
import { BlogContentWithAnalysis } from "@/src/common/model/blog-content.model";
import { TEXT_BLOCK_DURATION_PER_CHARACTER } from "@/src/server/blog-sequencer/commands/constants";
import { SequenceCommand } from "@/src/server/blog-sequencer/commands/sequence-command.interface";
import { z } from "zod";

export const createSingleImageMultipleTextCommandArgsModel = z.object({
  type: z.literal("createSingleImageMultipleText"),
  targetImageIndex: z.number(),
  targetTextIndexes: z.array(z.number()),
});

export type CreateSingleImageMultipleTextCommandArgs = z.infer<
  typeof createSingleImageMultipleTextCommandArgsModel
>;

export class CreateSingleImageMultipleTextCommandImpl
  implements SequenceCommand
{
  constructor(
    private readonly args: CreateSingleImageMultipleTextCommandArgs
  ) {}

  async execute(
    blogContent: BlogContentWithAnalysis
  ): Promise<SingleImageAndMultipleTextBlockWithAnalysis> {
    const { targetImageIndex, targetTextIndexes } = this.args;

    const targetImage = imageBlockModelWithAnalysis.parse(
      blogContent.blocks[targetImageIndex]
    );

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

    targetImage.duration = totalDuration;
    return {
      type: "singleImageAndMultipleText",
      duration: totalDuration,
      imageBlock: targetImage,
      textBlocks: targetTexts,
    };
  }
}
