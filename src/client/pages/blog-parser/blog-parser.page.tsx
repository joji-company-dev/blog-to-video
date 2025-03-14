import { PageLayout } from "@/src/client/app/ui/page-layout";
import { BlogParser } from "@/src/client/features/blog-parser/BlogParser";
import { Typography } from "@/src/client/shared/shadcn/components/typography";

export async function BlogParserPage({
  searchParams,
}: {
  searchParams: Promise<{ url: string }>;
}) {
  const url = (await searchParams).url;

  return (
    <PageLayout className="space-y-8 h-full">
      <div className="mx-auto w-full max-w-5xl border border-gray-200 rounded-lg p-8">
        <div className="space-y-8">
          <Typography.H1 className="text-center">Blog To Video</Typography.H1>
          <BlogParser url={url} />
        </div>
      </div>
    </PageLayout>
  );
}
