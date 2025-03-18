import { blogContentModel } from "@/src/common/model/blog-parser.model";
import { OpenaiBlogSequencer } from "@/src/server/blog-sequencer/openai-blog-sequencer";

export async function POST(request: Request) {
  const { content } = await request.json();

  if (!content) {
    return new Response("Content is required", { status: 400 });
  }

  const blogContent = blogContentModel.parse(content);

  const sequencer = new OpenaiBlogSequencer();
  try {
    const sequencedBlogContent = await sequencer.sequencify(blogContent);

    return new Response(
      JSON.stringify({
        result: "success",
        data: sequencedBlogContent,
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
