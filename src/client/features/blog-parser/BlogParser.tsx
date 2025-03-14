"use client";

import { PATHS } from "@/src/client/app/routes/paths";
import { useParseBlog } from "@/src/client/features/blog-parser/useParseBlog";
import { Button } from "@/src/client/shared/shadcn/components/button";
import { Separator } from "@/src/client/shared/shadcn/components/separator";
import { Typography } from "@/src/client/shared/shadcn/components/typography";
import { BlogBlock } from "@/src/client/widgets/blocks/BlogBlock";
import Link from "next/link";
import { BounceLoader } from "react-spinners";
export interface BlogParserProps {
  url: string;
}

export function BlogParser({ url }: BlogParserProps) {
  const { data, isLoading, error } = useParseBlog(url);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <BounceLoader />
        <Typography.Lead>블로그 분석 중...</Typography.Lead>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <Typography.Lead>블로그 분석 중 오류가 발생했습니다.</Typography.Lead>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            새로고침
          </Button>
          <Link href={PATHS.ROOT}>
            <Button variant="default">홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <Typography.Lead>블로그 데이터를 불러오지 못했습니다.</Typography.Lead>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            새로고침
          </Button>
          <Link href={PATHS.ROOT}>
            <Button variant="default">홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Typography.H3 className="text-center">블로그 분석 결과</Typography.H3>
      </div>

      <div className="flex justify-end gap-2 md:gap-4">
        <Button variant="outline">편집</Button>
        <Button variant="default">영상 만들기</Button>
      </div>
      <div className="flex flex-col gap-2 rounded-lg border p-4">
        <div className="space-y-4">
          <Typography.H3>Title</Typography.H3>
          <Typography.H4>{data.data.title}</Typography.H4>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
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
