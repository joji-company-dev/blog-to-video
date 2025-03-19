import { Input } from "@/src/client/shared/shadcn/components/input";
import { Label } from "@/src/client/shared/shadcn/components/label";
import { TypographySmall } from "@/src/client/shared/shadcn/components/typography";
import { ImageBlock } from "@/src/client/widgets/blocks/ImageBlock";
import { TextBlock } from "@/src/client/widgets/blocks/TextBlock";
import { MultipleImageAndSingleTextBlock as MultipleImageAndSingleTextBlockType } from "@/src/common/model/blocks";

export interface MultipleImageAndSingleTextBlockProps<
  IsEditable extends boolean
> {
  block: MultipleImageAndSingleTextBlockType;
  isEditable: IsEditable;
  onChange?: IsEditable extends true
    ? (block: MultipleImageAndSingleTextBlockType) => void
    : never;
}

export function MultipleImageAndSingleTextBlock<IsEditable extends boolean>({
  block,
  isEditable,
  onChange,
}: MultipleImageAndSingleTextBlockProps<IsEditable>) {
  if (isEditable) {
    return (
      <EditableMultipleImageAndSingleTextBlock
        block={block}
        onChange={onChange}
      />
    );
  }
  return <ReadOnlyMultipleImageAndSingleTextBlock block={block} />;
}

function EditableMultipleImageAndSingleTextBlock({
  block,
  onChange,
}: Omit<MultipleImageAndSingleTextBlockProps<true>, "isEditable">) {
  const { imageBlocks, textBlock, duration } = block;
  return (
    <div>
      <div className="p-2">
        <Label>
          <TypographySmall>duration(초):</TypographySmall>
          <Input
            type="number"
            value={duration}
            onChange={(e) => {
              onChange?.({ ...block, duration: parseInt(e.target.value) });
            }}
          />
        </Label>
      </div>

      <div className="flex gap-4">
        <div className="space-y-2">
          {imageBlocks.map((imageBlock, index) => (
            <div key={index} className="rounded-lg border p-2">
              <ImageBlock
                block={imageBlock}
                isEditable={true}
                onChange={(newImageBlock) => {
                  onChange?.({
                    ...block,
                    imageBlocks: imageBlocks.map((_, i) =>
                      i === index ? newImageBlock : _
                    ),
                  });
                }}
              />
            </div>
          ))}
        </div>
        <div>
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
    </div>
  );
}

function ReadOnlyMultipleImageAndSingleTextBlock({
  block,
}: Omit<MultipleImageAndSingleTextBlockProps<false>, "isEditable">) {
  const { imageBlocks, textBlock, duration } = block;

  return (
    <div>
      <div className="p-2">
        <Label>
          <TypographySmall>duration(초):</TypographySmall>
          {duration}초
        </Label>
      </div>
      <div className="flex gap-4">
        <div className="space-y-2">
          {imageBlocks.map((imageBlock, index) => (
            <div key={index} className="rounded-lg border p-2">
              <ImageBlock block={imageBlock} isEditable={false} />
            </div>
          ))}
        </div>
        <div>
          <TextBlock
            block={textBlock}
            isEditable={false}
            isShowDuration={false}
          />
        </div>
      </div>
    </div>
  );
}
