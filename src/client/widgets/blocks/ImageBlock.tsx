/* eslint-disable @next/next/no-img-element */
import { Input } from "@/src/client/shared/shadcn/components/input";
import { ImageBlock as ImageBlockType } from "@/src/common/model/blog-parser.model";
import { useRef } from "react";

interface ImageBlockProps<IsEditable extends boolean> {
  block: ImageBlockType;
  isEditable: IsEditable;
  onChange?: IsEditable extends true ? (block: ImageBlockType) => void : never;
}

export function ImageBlock<IsEditable extends boolean>({
  block,
  isEditable,
  onChange,
}: ImageBlockProps<IsEditable>) {
  if (isEditable) {
    return <EditableImageBlock block={block} onChange={onChange} />;
  }
  return <ReadOnlyImageBlock block={block} />;
}

export function ReadOnlyImageBlock({
  block,
}: Omit<ImageBlockProps<false>, "isEditable" | "onChange">) {
  return (
    <div className="p-2">
      <img src={block.value.src} alt="이미지" />
    </div>
  );
}

export function EditableImageBlock({
  block,
  onChange,
}: Omit<ImageBlockProps<true>, "isEditable">) {
  const inputRef = useRef<HTMLInputElement>(null);

  const validateImageType = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    return allowedTypes.includes(file.type);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateImageType(file)) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;
      console.log(e.target.result);
      onChange?.({
        ...block,
        value: {
          ...block.value,
          src: e.target.result as string,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-2">
      <img
        src={block.value.src}
        alt="이미지"
        className="cursor-pointer hover:opacity-80"
        onClick={() => inputRef.current?.click()}
      />
      <Input
        ref={inputRef}
        className="hidden"
        type="file"
        onChange={handleChange}
      />
    </div>
  );
}
