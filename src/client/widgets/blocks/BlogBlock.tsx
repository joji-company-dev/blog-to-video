import { ImageBlock } from "@/src/client/widgets/blocks/ImageBlock";
import { MultipleImageAndMultipleTextBlock } from "@/src/client/widgets/blocks/MultipleImageAndMultipleTextBlock";
import { TextBlock } from "@/src/client/widgets/blocks/TextBlock";
import { BlogBlock as BlogBlockType } from "@/src/common/model/blocks";

interface BlogBlockProps {
  block: BlogBlockType;
  isEditable?: boolean;
  onChange?: (block: BlogBlockType) => void;
}

export function BlogBlock({
  block,
  isEditable = false,
  onChange,
}: BlogBlockProps) {
  switch (block.type) {
    case "text":
      return (
        <TextBlock block={block} isEditable={isEditable} onChange={onChange} />
      );
    case "image":
      return (
        <ImageBlock block={block} isEditable={isEditable} onChange={onChange} />
      );

    case "multipleImageAndMultipleText":
      return (
        <MultipleImageAndMultipleTextBlock
          block={block}
          isEditable={isEditable}
          onChange={onChange}
        />
      );

    default:
      throw new Error(`Unknown block: ${JSON.stringify(block)}`);
  }
}
