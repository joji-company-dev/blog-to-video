import { PageLayout } from "@/src/client/app/ui/page-layout";
import { BlogParser } from "@/src/client/features/blog-parser/BlogParser";
import { Separator } from "@/src/client/shared/shadcn/components/separator";
import { Typography } from "@/src/client/shared/shadcn/components/typography";

export async function BlogParserPage({
  searchParams,
}: {
  searchParams: Promise<{ url: string }>;
}) {
  const url = (await searchParams).url;

  return (
    <PageLayout>
      <Typography.H1 className="text-center">Blog To Video</Typography.H1>
      <Separator className="my-8" />

      <BlogParser url={url} />
    </PageLayout>
  );
}
