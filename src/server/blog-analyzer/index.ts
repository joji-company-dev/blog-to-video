import {
  BlogContent,
  BlogContentWithAnalysis,
} from "@/src/common/model/blog-content.model";
import {
  ImageAnalyzer,
  ImageAnalyzerImpl,
} from "@/src/server/blog-analyzer/image-analyzer";

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
        if (block.type === "multipleImageAndSingleText") {
          return this.imageAnalyzer.analyzeMultipleImageAndSingleTextBlock(
            block
          );
        }
        if (block.type === "singleImageAndSingleText") {
          return this.imageAnalyzer.analyzeSingleImageAndSingleTextBlock(block);
        }
        if (block.type === "singleImageAndMultipleText") {
          return this.imageAnalyzer.analyzeSingleImageAndMultipleTextBlock(
            block
          );
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
