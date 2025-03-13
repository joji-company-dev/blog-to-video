/* eslint-disable @next/next/no-img-element */
"use client";

import { useParseBlog } from "@/src/client/features/blog-parser/useParseBlog";

export interface BlogParserProps {
  url: string;
}

export function BlogParser({ url }: BlogParserProps) {
  const { data, isLoading, error } = useParseBlog(url);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (!data) return <div>No data</div>;

  return (
    <div>
      <h1>{data.data.title}</h1>
      {data.data?.blocks.map((block) => {
        switch (block.type) {
          case "text":
            return <div key={block.value}>{block.value}</div>;
          case "image":
            return (
              <div key={block.value.src}>
                <img src={block.value.src} alt={"이미지"} />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
