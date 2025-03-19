import {
  blogContentModelWithAnalysis,
  BlogContentWithAnalysis,
} from "@/src/common/model/blog-content.model";
import { BlogSequencer } from "@/src/server/blog-sequencer/blog-sequencer.interface";
import { OpenaiClient } from "@/src/server/openai-client/openai-client";
import { zodResponseFormat } from "openai/helpers/zod";

export class OpenaiBlogSequencer implements BlogSequencer {
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
You are a helpful assistant that can help with sequencing blog posts into video sequences.
You will be given a blog post and you will need to help with writing the blog post.
Each TextBlock and ImageBlock should be combined into appropriate Text-Image blocks.
Language: Korean
`;
