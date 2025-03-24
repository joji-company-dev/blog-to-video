import {
  blogBlockModelWithAnalysis,
  BlogBlockWithAnalysis,
  TextBlockWithAnalysis,
} from "@/src/common/model/blocks";
import { AiScriptCreatorImpl } from "@/src/server/blog-sequencer/openai-blog-sequencer/ai-script-creator";

export async function POST(request: Request) {
  const { targetBlock, systemPromptOverride } = await request.json();

  if (!targetBlock) {
    return new Response("Content is required", { status: 400 });
  }

  const blogBlock = blogBlockModelWithAnalysis.parse(targetBlock);
  const textBlocks = getTextBlocks(targetBlock);

  const scriptCreator = new AiScriptCreatorImpl();
  try {
    const scriptedBlogBlock = await scriptCreator.createScript(
      textBlocks,
      blogBlock,
      systemPromptOverride
    );

    return new Response(
      JSON.stringify({
        result: "success",
        data: scriptedBlogBlock,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("블로그 파싱 오류:", error);
    return new Response(
      JSON.stringify({
        result: "error",
        data: {
          message: "블로그 파싱 오류",
        },
      }),
      { status: 500 }
    );
  }
}

const getTextBlocks = (
  targetBlock: BlogBlockWithAnalysis
): TextBlockWithAnalysis[] => {
  switch (targetBlock.type) {
    case "text":
      return [targetBlock];
    case "multipleImageAndMultipleText":
      return targetBlock.textBlocks;
    default:
      throw new Error(`targetBlock type is not supported: ${targetBlock.type}`);
  }
};
