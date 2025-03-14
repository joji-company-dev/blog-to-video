import { PageLayout } from "@/src/client/app/ui/page-layout";
import { BlogUrlForm } from "@/src/client/pages/home/ui/BlogUrlForm";
import { Separator } from "@/src/client/shared/shadcn/components/separator";
import { Typography } from "@/src/client/shared/shadcn/components/typography";

export function HomePage() {
  return (
    <PageLayout>
      <Typography.H1 className="text-center">Blog To Video</Typography.H1>
      <Separator className="my-8" />

      <BlogUrlForm />
    </PageLayout>
  );
}
