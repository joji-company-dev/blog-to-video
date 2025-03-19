import {
  ImageBlock,
  ImageBlockWithAnalysis,
  MultipleImageAndSingleTextBlock,
  MultipleImageAndSingleTextBlockWithAnalysis,
  SingleImageAndMultipleTextBlock,
  SingleImageAndMultipleTextBlockWithAnalysis,
  SingleImageAndSingleTextBlock,
  SingleImageAndSingleTextBlockWithAnalysis,
} from "@/src/common/model/blocks";
import {
  BlogContent,
  BlogContentWithAnalysis,
} from "@/src/common/model/blog-content.model";
import {
  ImageAnalysis,
  imageAnalysisModel,
} from "@/src/common/model/image-analysis.model";
import { OpenaiClient } from "@/src/server/openai-client/openai-client";
import { zodResponseFormat } from "openai/helpers/zod.mjs";

export interface ImageAnalyzer {
  analyzeBlogContent(blogContent: BlogContent): Promise<BlogContent>;
  analyzeMultipleImageAndSingleTextBlock(
    block: MultipleImageAndSingleTextBlock
  ): Promise<MultipleImageAndSingleTextBlock>;
  analyzeSingleImageAndSingleTextBlock(
    block: SingleImageAndSingleTextBlock
  ): Promise<SingleImageAndSingleTextBlock>;
  analyzeImageBlock(imageBlock: ImageBlock): Promise<ImageBlock>;
  analyzeImage(imageSrc: string): Promise<ImageAnalysis>;
}

export class ImageAnalyzerImpl implements ImageAnalyzer {
  private openaiClient: OpenaiClient;

  constructor() {
    this.openaiClient = new OpenaiClient();
  }

  async analyzeBlogContent(
    blogContent: BlogContent
  ): Promise<BlogContentWithAnalysis> {
    const analyzedBlocks = await Promise.all(
      blogContent.blocks.map(async (block) => {
        if (block.type === "image") {
          return this.analyzeImageBlock(block);
        }
        if (block.type === "multipleImageAndSingleText") {
          return this.analyzeMultipleImageAndSingleTextBlock(block);
        }
        if (block.type === "singleImageAndSingleText") {
          return this.analyzeSingleImageAndSingleTextBlock(block);
        }
        if (block.type === "singleImageAndMultipleText") {
          return this.analyzeSingleImageAndMultipleTextBlock(block);
        }
        return block;
      })
    );

    return {
      ...blogContent,
      blocks: analyzedBlocks,
    };
  }

  async analyzeMultipleImageAndSingleTextBlock(
    block: MultipleImageAndSingleTextBlock
  ): Promise<MultipleImageAndSingleTextBlockWithAnalysis> {
    const analyzedImageBlocks = await Promise.all(
      block.imageBlocks.map(async (imageBlock) => {
        const analyzedImageBlock = await this.analyzeImageBlock(imageBlock);
        return analyzedImageBlock;
      })
    );

    block.imageBlocks = analyzedImageBlocks;

    return {
      ...block,
      imageBlocks: analyzedImageBlocks,
    };
  }

  async analyzeSingleImageAndSingleTextBlock(
    block: SingleImageAndSingleTextBlock
  ): Promise<SingleImageAndSingleTextBlockWithAnalysis> {
    const analyzedImageBlock = await this.analyzeImageBlock(block.imageBlock);
    block.imageBlock = analyzedImageBlock;
    return {
      ...block,
      imageBlock: analyzedImageBlock,
    };
  }

  async analyzeSingleImageAndMultipleTextBlock(
    block: SingleImageAndMultipleTextBlock
  ): Promise<SingleImageAndMultipleTextBlockWithAnalysis> {
    const analyzedImageBlock = await this.analyzeImageBlock(block.imageBlock);
    block.imageBlock = analyzedImageBlock;
    return {
      ...block,
      imageBlock: analyzedImageBlock,
    };
  }

  async analyzeImageBlock(
    imageBlock: ImageBlock
  ): Promise<ImageBlockWithAnalysis> {
    const analysis = await this.analyzeImage(imageBlock.value.src);
    return {
      ...imageBlock,
      value: { ...imageBlock.value, analysis },
    };
  }

  async analyzeImage(imageSrc: string): Promise<ImageAnalysis> {
    const analyzeImageSystemPrompt = `
    당신은 이미지 분석을 도와주는 도우미입니다.
    이미지가 주어지면 해당 이미지를 분석하는 것을 도와주어야 합니다.
    `;
    const openai = this.openaiClient.client;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: analyzeImageSystemPrompt,
        },
        {
          role: "system",
          content: "출력 언어: 한국어",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "What is in the image?" },
            { type: "image_url", image_url: { url: imageSrc } },
          ],
        },
      ],
      response_format: zodResponseFormat(imageAnalysisModel, "image"),
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const parsedContent = imageAnalysisModel.parse(JSON.parse(content));

    return parsedContent;
  }
}
