import { Input } from "@/src/client/shared/shadcn/components/input";
import { Label } from "@/src/client/shared/shadcn/components/label";
import { Textarea } from "@/src/client/shared/shadcn/components/textarea";
import {
  Typography,
  TypographySmall,
} from "@/src/client/shared/shadcn/components/typography";
import { TextBlock as TextBlockType } from "@/src/common/model/blocks";

export interface TextBlockProps<IsEditable extends boolean> {
  block: TextBlockType;
  isEditable: IsEditable;
  isShowDuration?: boolean;
  onChange?: IsEditable extends true ? (block: TextBlockType) => void : never;
}

export function TextBlock<IsEditable extends boolean>({
  block,
  isEditable,
  isShowDuration = true,
  onChange,
}: TextBlockProps<IsEditable>) {
  if (isEditable) {
    return (
      <EditableTextBlock
        block={block}
        isShowDuration={isShowDuration}
        onChange={onChange}
      />
    );
  }
  return <ReadOnlyTextBlock block={block} isShowDuration={isShowDuration} />;
}

export function ReadOnlyTextBlock({
  block,
  isShowDuration,
}: Omit<TextBlockProps<false>, "onChange" | "isEditable">) {
  return (
    <div className="p-2">
      <div className="flex flex-col gap-2">
        {isShowDuration && (
          <TypographySmall>
            <span className="text-muted-foreground">duration(초):</span>{" "}
            {block.duration}초
          </TypographySmall>
        )}
        <Typography.P>{block.value}</Typography.P>
      </div>
    </div>
  );
}

export function EditableTextBlock({
  block,
  isShowDuration,
  onChange,
}: Omit<TextBlockProps<true>, "isEditable">) {
  return (
    <div className="p-2">
      <div className="flex flex-col gap-2">
        {isShowDuration && (
          <Label>
            <TypographySmall>duration(초):</TypographySmall>
            <Input
              type="number"
              step={0.1}
              value={block.duration}
              onChange={(e) =>
                onChange?.({ ...block, duration: parseFloat(e.target.value) })
              }
            />
          </Label>
        )}
        <Textarea
          value={block.value}
          onChange={(e) => onChange?.({ ...block, value: e.target.value })}
        />
      </div>
    </div>
  );
}
