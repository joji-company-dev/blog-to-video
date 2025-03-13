import { SingleImageAndSingleTextBlock as SingleImageAndSingleTextBlockType } from "@/src/common/model/blog-parser.model";

interface SingleImageAndSingleTextBlockProps {
  block: SingleImageAndSingleTextBlockType;
}

export function SingleImageAndSingleTextBlock({
  block,
}: SingleImageAndSingleTextBlockProps) {
  return <div>{JSON.stringify(block)}</div>;
}
