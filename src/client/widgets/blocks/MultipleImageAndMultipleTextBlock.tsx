import { Input } from "@/src/client/shared/shadcn/components/input";
import { Label } from "@/src/client/shared/shadcn/components/label";
import { TypographySmall } from "@/src/client/shared/shadcn/components/typography";
import { ImageBlock } from "@/src/client/widgets/blocks/ImageBlock";
import { TextBlock } from "@/src/client/widgets/blocks/TextBlock";
import { MultipleImageAndMultipleTextBlock as MultipleImageAndMultipleTextBlockType } from "@/src/common/model/blocks";

export interface MultipleImageAndMultipleTextBlockProps<
  IsEditable extends boolean
> {
  block: MultipleImageAndMultipleTextBlockType;
  isEditable: IsEditable;
  onChange?: IsEditable extends true
    ? (block: MultipleImageAndMultipleTextBlockType) => void
    : never;
}

export function MultipleImageAndMultipleTextBlock<IsEditable extends boolean>({
  block,
  isEditable,
  onChange,
}: MultipleImageAndMultipleTextBlockProps<IsEditable>) {
  if (isEditable) {
    return (
      <EditableMultipleImageAndMultipleTextBlock
        block={block}
        onChange={onChange}
      />
    );
  }
  return <ReadOnlyMultipleImageAndMultipleTextBlock block={block} />;
}

function EditableMultipleImageAndMultipleTextBlock({
  block,
  onChange,
}: Omit<MultipleImageAndMultipleTextBlockProps<true>, "isEditable">) {
  const { imageBlocks, textBlocks, duration } = block;
  return (
    <div>
      <div className="p-2">
        <Label>
          <TypographySmall>duration(초):</TypographySmall>
          <Input
            type="number"
            step={0.1}
            value={duration}
            onChange={(e) => {
              onChange?.({ ...block, duration: parseFloat(e.target.value) });
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
    </div>
  );
}

function ReadOnlyMultipleImageAndMultipleTextBlock({
  block,
}: Omit<MultipleImageAndMultipleTextBlockProps<false>, "isEditable">) {
  const { imageBlocks, textBlocks, duration } = block;

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
        <div className="space-y-2">
          {textBlocks.map((textBlock, index) => (
            <div key={index} className="rounded-lg border p-2">
              <TextBlock block={textBlock} isEditable={false} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
