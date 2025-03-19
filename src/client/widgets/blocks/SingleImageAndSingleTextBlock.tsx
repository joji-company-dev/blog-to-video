import { Input } from "@/src/client/shared/shadcn/components/input";
import { Label } from "@/src/client/shared/shadcn/components/label";
import { TypographySmall } from "@/src/client/shared/shadcn/components/typography";
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
    <div>
      <div className="p-2">
        <Label>
          <TypographySmall>duration(초):</TypographySmall>
          <Input
            type="number"
            value={block.duration}
            onChange={(e) =>
              onChange?.({ ...block, duration: parseInt(e.target.value) })
            }
          />
        </Label>
      </div>
      <div className="flex gap-4">
        <ImageBlock
          block={imageBlock}
          isEditable={true}
          isShowDuration={false}
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
          isShowDuration={false}
          onChange={(newTextBlock) => {
            onChange?.({
              ...block,
              textBlock: newTextBlock,
            });
          }}
        />
      </div>
    </div>
  );
}

function ReadOnlySingleImageAndSingleTextBlock({
  block,
}: Omit<SingleImageAndSingleTextBlockProps<false>, "isEditable">) {
  const { imageBlock, textBlock } = block;
  return (
    <div>
      <div className="p-2">
        <TypographySmall>duration(초):</TypographySmall>
        <TypographySmall>{block.duration}초</TypographySmall>
      </div>
      <div className="flex gap-4">
        <ImageBlock
          block={imageBlock}
          isEditable={false}
          isShowDuration={false}
        />
        <TextBlock
          block={textBlock}
          isEditable={false}
          isShowDuration={false}
        />
      </div>
    </div>
  );
}
