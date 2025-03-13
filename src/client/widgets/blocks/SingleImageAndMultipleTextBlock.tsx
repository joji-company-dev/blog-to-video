import { SingleImageAndMultipleTextBlock as SingleImageAndMultipleTextBlockType } from "@/src/common/model/blog-parser.model";

export interface SingleImageAndMultipleTextBlockProps {
  block: SingleImageAndMultipleTextBlockType;
}

export function SingleImageAndMultipleTextBlock({
  block,
}: SingleImageAndMultipleTextBlockProps) {
  return <div>{JSON.stringify(block)}</div>;
}
