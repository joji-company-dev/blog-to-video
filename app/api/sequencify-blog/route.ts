import { blogContentModel } from "@/src/common/model/blog-content.model";
import { BlogAnalyzerImpl } from "@/src/server/blog-analyzer";
import { BlogSequencerFactory } from "@/src/server/blog-sequencer";

export async function POST(request: Request) {
  const { content } = await request.json();

  if (!content) {
    return new Response("Content is required", { status: 400 });
  }

  const blogContent = blogContentModel.parse(content);

  const sequencer = BlogSequencerFactory.create("openai");
  const analyzer = new BlogAnalyzerImpl();
  try {
    const analyzedBlogContent = await analyzer.analyzeBlogContent(blogContent);
    const sequencedBlogContent = await sequencer.sequencify(
      analyzedBlogContent
    );

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
