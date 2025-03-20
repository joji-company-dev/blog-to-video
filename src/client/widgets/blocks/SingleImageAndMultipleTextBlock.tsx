import { ImageBlock } from "@/src/client/widgets/blocks/ImageBlock";
import { TextBlock } from "@/src/client/widgets/blocks/TextBlock";
import { SingleImageAndMultipleTextBlock as SingleImageAndMultipleTextBlockType } from "@/src/common/model/blocks";

export interface SingleImageAndMultipleTextBlockProps<
  IsEditable extends boolean
> {
  block: SingleImageAndMultipleTextBlockType;
  isEditable: IsEditable;
  onChange?: IsEditable extends true
    ? (block: SingleImageAndMultipleTextBlockType) => void
    : never;
}

export function SingleImageAndMultipleTextBlock<IsEditable extends boolean>({
  block,
  isEditable,
  onChange,
}: SingleImageAndMultipleTextBlockProps<IsEditable>) {
  if (isEditable) {
    return (
      <EditableSingleImageAndMultipleTextBlock
        block={block}
        onChange={onChange}
      />
    );
  }
  return <ReadOnlySingleImageAndMultipleTextBlock block={block} />;
}

function EditableSingleImageAndMultipleTextBlock({
  block,
  onChange,
}: Omit<SingleImageAndMultipleTextBlockProps<true>, "isEditable">) {
  const { imageBlock, textBlocks } = block;

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
      <div className="space-y-2">
        {textBlocks.map((textBlock, index) => (
          <div key={index} className="rounded-lg border p-2">
            <TextBlock
              block={textBlock}
              isEditable={true}
              onChange={(newTextBlock) => {
                onChange?.({
                  ...block,
                  textBlocks: textBlocks.map((_, i) =>
                    i === index ? newTextBlock : _
                  ),
                });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadOnlySingleImageAndMultipleTextBlock({
  block,
}: Omit<SingleImageAndMultipleTextBlockProps<false>, "isEditable">) {
  const { imageBlock, textBlocks } = block;
  return (
    <div className="flex gap-4">
      <ImageBlock block={imageBlock} isEditable={false} />
      <div className="space-y-2">
        {textBlocks.map((textBlock, index) => (
          <div key={index} className="rounded-lg border p-2">
            <TextBlock block={textBlock} isEditable={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
