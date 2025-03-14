/* eslint-disable @next/next/no-img-element */
import { Typography } from "@/src/client/shared/shadcn/components/typography";
import { ImageBlock as ImageBlockType } from "@/src/common/model/blog-parser.model";

interface ImageBlockProps {
  block: ImageBlockType;
}

export const ImageBlock = ({ block }: ImageBlockProps) => {
  return (
    <div className="rounded-lg border p-2">
      <Typography.H4>타입: {block.type}</Typography.H4>
      <img src={block.value.src} alt="이미지" />
    </div>
  );
};
