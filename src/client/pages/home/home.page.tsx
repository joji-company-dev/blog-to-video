import { PageLayout } from "@/src/client/app/ui/page-layout";
import { BlogUrlForm } from "@/src/client/pages/home/ui/BlogUrlForm";
import { Typography } from "@/src/client/shared/shadcn/components/typography";

export function HomePage() {
  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-5xl border border-gray-200 rounded-lg p-8">
        <Typography.H1 className="text-center">Blog To Video</Typography.H1>
        <div className="my-6">
          <BlogUrlForm />
        </div>
      </div>
    </PageLayout>
  );
}
