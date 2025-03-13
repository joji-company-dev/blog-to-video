import { BlogParser } from "@/src/client/features/blog-parser/BlogParser";

export async function BlogParserPage({
  searchParams,
}: {
  searchParams: Promise<{ url: string }>;
}) {
  const url = (await searchParams).url;

  return (
    <div>
      <BlogParser url={url} />
    </div>
  );
}
