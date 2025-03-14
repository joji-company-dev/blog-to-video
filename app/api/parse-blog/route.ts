import { BlogParserFactory } from "@/src/server/blog-parser";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response("URL is required", { status: 400 });
  }

  const parser = new BlogParserFactory().create(url);
  try {
    await parser.initialize();
    const blogContent = await parser.parse(url);

    return new Response(
      JSON.stringify({
        result: "success",
        data: blogContent,
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
  } finally {
    await parser?.close();
  }
}
