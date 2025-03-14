import { Textarea } from "@/src/client/shared/shadcn/components/textarea";
import { Typography } from "@/src/client/shared/shadcn/components/typography";
import { TextBlock as TextBlockType } from "@/src/common/model/blog-parser.model";

export interface TextBlockProps<IsEditable extends boolean> {
  block: TextBlockType;
  isEditable: IsEditable;
  onChange?: IsEditable extends true ? (block: TextBlockType) => void : never;
}

export function TextBlock<IsEditable extends boolean>({
  block,
  isEditable,
  onChange,
}: TextBlockProps<IsEditable>) {
  if (isEditable) {
    return <EditableTextBlock block={block} onChange={onChange} />;
  }
  return <ReadOnlyTextBlock block={block} />;
}

export function ReadOnlyTextBlock({
  block,
}: Omit<TextBlockProps<false>, "onChange" | "isEditable">) {
  return (
    <div className="rounded-lg border p-2">
      <Typography.P>{block.value}</Typography.P>
    </div>
  );
}

export function EditableTextBlock({
  block,
  onChange,
}: Omit<TextBlockProps<true>, "isEditable">) {
  return (
    <div className="rounded-lg border p-2 space-y-2">
      <Textarea
        value={block.value}
        onChange={(e) => onChange?.({ ...block, value: e.target.value })}
      />
    </div>
  );
}
