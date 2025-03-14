import { ImageBlock } from "@/src/client/widgets/blocks/ImageBlock";
import { MultipleImageAndSingleTextBlock } from "@/src/client/widgets/blocks/MultipleImageAndSingleTextBlock";
import { SingleImageAndMultipleTextBlock } from "@/src/client/widgets/blocks/SingleImageAndMultipleTextBlock";
import { SingleImageAndSingleTextBlock } from "@/src/client/widgets/blocks/SingleImageAndSingleTextBlock";
import { TextBlock } from "@/src/client/widgets/blocks/TextBlock";
import { BlogBlock as BlogBlockType } from "@/src/common/model/blog-parser.model";

interface BlogBlockProps {
  block: BlogBlockType;
}

export function BlogBlock({ block }: BlogBlockProps) {
  switch (block.type) {
    case "text":
      return <TextBlock block={block} />;
    case "image":
      return <ImageBlock block={block} />;
    case "singleImageAndSingleText":
      return <SingleImageAndSingleTextBlock block={block} />;
    case "singleImageAndMultipleText":
      return <SingleImageAndMultipleTextBlock block={block} />;
    case "multipleImageAndSingleText":
      return <MultipleImageAndSingleTextBlock block={block} />;
    default:
      throw new Error(`Unknown block: ${JSON.stringify(block)}`);
  }
}
