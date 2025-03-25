import { multipleImageAndMultipleTextBlockModelWithAnalysis } from "@/src/common/model/blocks";
import {
  BlogContent,
  BlogContentWithAnalysis,
} from "@/src/common/model/blog-content.model";
import {
  ImageAnalyzer,
  ImageAnalyzerImpl,
} from "@/src/server/blog-analyzer/image-analyzer/image-analyzer";

export interface BlogAnalyzer {
  analyzeBlogContent(
    blogContent: BlogContent
  ): Promise<BlogContentWithAnalysis>;
}

export class BlogAnalyzerImpl implements BlogAnalyzer {
  private imageAnalyzer: ImageAnalyzer;

  constructor(imageAnalyzer?: ImageAnalyzer) {
    this.imageAnalyzer = imageAnalyzer ?? new ImageAnalyzerImpl();
  }

  async analyzeBlogContent(
    blogContent: BlogContent
  ): Promise<BlogContentWithAnalysis> {
    const analyzedBlocks = await Promise.all(
      blogContent.blocks.map(async (block) => {
        if (block.type === "image") {
          return this.imageAnalyzer.analyzeImageBlock(block);
        }
        if (block.type === "multipleImageAndMultipleText") {
          const imageBlocks = await Promise.all(
            block.imageBlocks.map((imageBlock) =>
              this.imageAnalyzer.analyzeImageBlock(imageBlock)
            )
          );

          return multipleImageAndMultipleTextBlockModelWithAnalysis.parse({
            ...block,
            imageBlocks,
          });
        }
        return block;
      })
    );

    return {
      ...blogContent,
      blocks: analyzedBlocks,
    };
  }
}
