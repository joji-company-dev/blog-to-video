"use client";

import { useParseBlog } from "@/src/client/features/blog-parser/useParseBlog";
import { Separator } from "@/src/client/shared/shadcn/components/separator";
import { Typography } from "@/src/client/shared/shadcn/components/typography";
import { BlogBlock } from "@/src/client/widgets/blocks/BlogBlock";

export interface BlogParserProps {
  url: string;
}

export function BlogParser({ url }: BlogParserProps) {
  const { data, isLoading, error } = useParseBlog(url);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (!data) return <div>블로그 데이터가 없습니다.</div>;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Typography.H3>블로그 분석 결과</Typography.H3>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border p-4">
        <Typography.H3>Title</Typography.H3>
        <Typography.H4>{data.data.title}</Typography.H4>

        <Separator className="my-4" />
        <div>
          <Typography.H3>Cuts</Typography.H3>
          <div className="flex flex-col gap-4 md:gap-8">
            {data.data?.blocks.map((block, index) => (
              <BlogBlock key={index} block={block} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
