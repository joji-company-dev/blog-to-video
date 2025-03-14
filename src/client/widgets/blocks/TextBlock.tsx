import { Typography } from "@/src/client/shared/shadcn/components/typography";
import { TextBlock as TextBlockType } from "@/src/common/model/blog-parser.model";

export interface TextBlockProps {
  block: TextBlockType;
}

export function TextBlock({ block }: TextBlockProps) {
  return (
    <div className="rounded-lg border p-2">
      <Typography.H4>타입: {block.type}</Typography.H4>
      <Typography.P>{block.value}</Typography.P>
    </div>
  );
}
