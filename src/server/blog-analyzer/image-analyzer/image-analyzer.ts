import { ImageBlock, ImageBlockWithAnalysis } from "@/src/common/model/blocks";
import {
  ImageAnalysis,
  imageAnalysisModel,
} from "@/src/common/model/image-analysis.model";
import { OpenaiClient } from "@/src/server/openai-client/openai-client";
import { zodResponseFormat } from "openai/helpers/zod.mjs";

export interface ImageAnalyzer {
  analyzeImageBlock(imageBlock: ImageBlock): Promise<ImageBlockWithAnalysis>;
  analyzeImage(imageSrc: string): Promise<ImageAnalysis>;
}

export class ImageAnalyzerImpl implements ImageAnalyzer {
  private openaiClient: OpenaiClient;

  constructor() {
    this.openaiClient = new OpenaiClient();
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
