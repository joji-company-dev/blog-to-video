/* eslint-disable @next/next/no-img-element */
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/client/shared/shadcn/components/collapsible";
import { Input } from "@/src/client/shared/shadcn/components/input";
import { Label } from "@/src/client/shared/shadcn/components/label";
import { Textarea } from "@/src/client/shared/shadcn/components/textarea";
import {
  TypographyMuted,
  TypographySmall,
} from "@/src/client/shared/shadcn/components/typography";
import {
  imageBlockModelWithAnalysis,
  ImageBlock as ImageBlockType,
  ImageBlockWithAnalysis as ImageBlockWithAnalysisType,
} from "@/src/common/model/blocks";
import { useRef } from "react";

interface ImageBlockProps<IsEditable extends boolean> {
  block: ImageBlockType | ImageBlockWithAnalysisType;
  isEditable: IsEditable;
  isShowDuration?: boolean;
  onChange?: IsEditable extends true
    ? (block: ImageBlockType | ImageBlockWithAnalysisType) => void
    : never;
}

export function ImageBlock<IsEditable extends boolean>({
  block,
  isEditable,
  isShowDuration = true,
  onChange,
}: ImageBlockProps<IsEditable>) {
  if (isEditable) {
    return (
      <EditableImageBlock
        isShowDuration={isShowDuration}
        block={block}
        onChange={onChange}
      />
    );
  }
  return <ReadOnlyImageBlock block={block} isShowDuration={isShowDuration} />;
}

export function ReadOnlyImageBlock({
  block,
  isShowDuration,
}: Omit<ImageBlockProps<false>, "isEditable" | "onChange">) {
  return (
    <div className="p-2">
      <div className="flex flex-col gap-2">
        {isShowDuration && (
          <TypographySmall>
            <span className="text-muted-foreground">duration(초):</span>{" "}
            {block.duration}초
          </TypographySmall>
        )}
        <img src={block.value.src} alt="이미지" />
        {hasAnalysis(block) && (
          <Collapsible className="border border-t-0 p-2 rounded-lg rounded-t-none space-y-2">
            <CollapsibleTrigger className="w-full text-left">
              <TypographyMuted>이미지 분석 결과 보기</TypographyMuted>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-2">
                <TypographySmall>
                  <span className="text-muted-foreground">설명:</span>{" "}
                  {block.value.analysis.text}
                </TypographySmall>
                <TypographySmall>
                  <span className="text-muted-foreground">키워드:</span>{" "}
                  {block.value.analysis.objects.join(", ")}
                </TypographySmall>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}

export function EditableImageBlock({
  block,
  isShowDuration,
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
      <div className="flex flex-col gap-2">
        {isShowDuration && (
          <div>
            <span className="text-muted-foreground">duration(초):</span>{" "}
            <Input
              type="number"
              step={0.1}
              value={block.duration}
              onChange={(e) => {
                onChange?.({ ...block, duration: parseFloat(e.target.value) });
              }}
            />
          </div>
        )}
        <img
          src={block.value.src}
          alt="이미지"
          className="cursor-pointer hover:opacity-80"
          onClick={() => inputRef.current?.click()}
        />

        {hasAnalysis(block) && (
          <div className="flex flex-col gap-2">
            <TypographySmall>이미지 분석 결과</TypographySmall>
            <Label>
              <TypographySmall>설명</TypographySmall>
              <Textarea
                defaultValue={block.value.analysis.text}
                onBlur={(e) => {
                  const newValue = e.target.value.trim();
                  e.target.value = newValue;
                  onChange?.({
                    ...block,
                    value: {
                      ...block.value,
                      analysis: {
                        ...block.value.analysis,
                        text: newValue,
                      },
                    },
                  });
                }}
              />
            </Label>
            <Label>
              <TypographySmall>키워드</TypographySmall>
              <Textarea
                defaultValue={block.value.analysis.objects.join(", ")}
                onBlur={(e) => {
                  const newValue = e.target.value
                    .split(",")
                    .map((text) => text.trim())
                    .filter(Boolean);
                  e.target.value = newValue.join(", ");
                  onChange?.({
                    ...block,
                    value: {
                      ...block.value,
                      analysis: {
                        ...block.value.analysis,
                        objects: newValue,
                      },
                    },
                  });
                }}
              />
            </Label>
          </div>
        )}
      </div>
      <Input
        ref={inputRef}
        className="hidden"
        type="file"
        onChange={handleChange}
      />
    </div>
  );
}

const hasAnalysis = (
  block: ImageBlockType | ImageBlockWithAnalysisType
): block is ImageBlockWithAnalysisType => {
  return imageBlockModelWithAnalysis.safeParse(block).success;
};
