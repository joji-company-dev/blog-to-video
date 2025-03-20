import {
  blogContentModelWithAnalysis,
  BlogContentWithAnalysis,
} from "@/src/common/model/blog-content.model";
import { OpenaiClient } from "@/src/server/openai-client/openai-client";
import { zodResponseFormat } from "openai/helpers/zod";

export class AiSequenceCommander {
  private openaiClient: OpenaiClient;

  constructor() {
    this.openaiClient = new OpenaiClient();
  }

  async sequencify(
    blog: BlogContentWithAnalysis
  ): Promise<BlogContentWithAnalysis> {
    const openai = this.openaiClient.client;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-11-20",
      messages: [
        {
          role: "system",
          content: sequencifySystemPrompt,
        },
        {
          role: "system",
          content: "출력 언어: 한국어",
        },
        {
          role: "user",
          content: JSON.stringify(blog),
        },
      ],
      response_format: zodResponseFormat(blogContentModelWithAnalysis, "blog"),
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const parsedContent = blogContentModelWithAnalysis.parse(
      JSON.parse(content)
    );

    return parsedContent;
  }
}

const sequencifySystemPrompt = `
당신은 블로그 게시물을 비디오 시퀀스로 변환하는 것을 도와주는 도우미입니다.
블로그 게시물이 주어지면 해당 게시물을 작성하는 것을 도와주어야 합니다.
각각의 TextBlock과 ImageBlock은 적절한 Text-Image 블록으로 결합되어야 합니다.
`;
