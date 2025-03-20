import { ImageBlock } from "@/src/client/widgets/blocks/ImageBlock";
import { TextBlock } from "@/src/client/widgets/blocks/TextBlock";
import { SingleImageAndSingleTextBlock as SingleImageAndSingleTextBlockType } from "@/src/common/model/blocks";

interface SingleImageAndSingleTextBlockProps<IsEditable extends boolean> {
  block: SingleImageAndSingleTextBlockType;
  isEditable: IsEditable;
  onChange?: IsEditable extends true
    ? (block: SingleImageAndSingleTextBlockType) => void
    : never;
}

export function SingleImageAndSingleTextBlock<IsEditable extends boolean>({
  block,
  isEditable,
  onChange,
}: SingleImageAndSingleTextBlockProps<IsEditable>) {
  if (isEditable) {
    return (
      <EditableSingleImageAndSingleTextBlock
        block={block}
        onChange={onChange}
      />
    );
  }
  return <ReadOnlySingleImageAndSingleTextBlock block={block} />;
}

function EditableSingleImageAndSingleTextBlock({
  block,
  onChange,
}: Omit<SingleImageAndSingleTextBlockProps<true>, "isEditable">) {
  const { imageBlock, textBlock } = block;

  return (
    <div className="flex gap-4">
      <ImageBlock
        block={imageBlock}
        isEditable={true}
        onChange={(newImageBlock) => {
          onChange?.({
            ...block,
            imageBlock: newImageBlock,
          });
        }}
      />
      <TextBlock
        block={textBlock}
        isEditable={true}
        onChange={(newTextBlock) => {
          onChange?.({
            ...block,
            textBlock: newTextBlock,
          });
        }}
      />
    </div>
  );
}

function ReadOnlySingleImageAndSingleTextBlock({
  block,
}: Omit<SingleImageAndSingleTextBlockProps<false>, "isEditable">) {
  const { imageBlock, textBlock } = block;
  return (
    <div className="flex gap-4">
      <ImageBlock block={imageBlock} isEditable={false} />
      <TextBlock block={textBlock} isEditable={false} />
    </div>
  );
}
