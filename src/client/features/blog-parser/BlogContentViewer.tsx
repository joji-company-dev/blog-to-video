import { Separator } from "@/src/client/shared/shadcn/components/separator";
import { Typography } from "@/src/client/shared/shadcn/components/typography";
import { BlogBlock } from "@/src/client/widgets/blocks/BlogBlock";
import { BlogContent } from "@/src/common/model/blog-parser.model";

interface BlogContentViewerProps {
  block: BlogContent;
}

export function BlogContentViewer({ block }: BlogContentViewerProps) {
  const { title, blocks } = block;

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <div className="space-y-4">
        <Typography.H3>Title</Typography.H3>
        <Typography.H4>{title}</Typography.H4>
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        <Typography.H3>Cuts</Typography.H3>
        <div className="flex flex-col gap-4 md:gap-8">
          {blocks.map((block, index) => (
            <BlogBlock key={index} block={block} />
          ))}
        </div>
      </div>
    </div>
  );
}
