import { MultipleImageAndSingleTextBlock as MultipleImageAndSingleTextBlockType } from "@/src/common/model/blog-parser.model";

export interface MultipleImageAndSingleTextBlockProps {
  block: MultipleImageAndSingleTextBlockType;
}

export function MultipleImageAndSingleTextBlock({
  block,
}: MultipleImageAndSingleTextBlockProps) {
  return <div>{JSON.stringify(block)}</div>;
}
