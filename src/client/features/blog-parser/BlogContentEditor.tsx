import { Button } from "@/src/client/shared/shadcn/components/button";
import { Input } from "@/src/client/shared/shadcn/components/input";
import { Typography } from "@/src/client/shared/shadcn/components/typography";
import { BlogBlock } from "@/src/client/widgets/blocks/BlogBlock";
import {
  BlogBlock as BlogBlockType,
  BlogContent,
} from "@/src/common/model/blog-parser.model";
import { ChevronDown, ChevronUp, Trash } from "lucide-react";
import { useState } from "react";

interface BlogContentEditorProps {
  initialContent: BlogContent;
  onSave: (content: BlogContent) => void;
  onCancel: () => void;
}

export function BlogContentEditor({
  initialContent,
  onSave,
  onCancel,
}: BlogContentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const { title, blocks } = content;

  const handleBlockChange = (index: number, updatedBlock: BlogBlockType) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    setContent({ ...content, blocks: newBlocks });
  };

  const handleTitleChange = (newTitle: string) => {
    setContent({ ...content, title: newTitle });
  };

  const handleDeleteBlock = (index: number) => {
    setContent({ ...content, blocks: blocks.filter((_, i) => i !== index) });
  };

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    // 타이틀 블록은 항상 첫 번째에 위치하도록 함
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    [newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ];
    setContent({ ...content, blocks: newBlocks });
  };

  return (
    <div className="flex flex-col gap-6 bg-card text-card-foreground rounded-lg p-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button variant="default" onClick={() => onSave(content)}>
          저장
        </Button>
      </div>
      <Typography.Small className="text-muted-foreground">
        블록을 편집하거나 순서를 변경할 수 있습니다.
      </Typography.Small>
      <div className="space-y-4">
        <Typography.H3>Title</Typography.H3>
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="font-bold text-lg"
        />
      </div>
      <div className="space-y-4">
        <Typography.H3>Cuts</Typography.H3>
        <div className="flex flex-col gap-2">
          {blocks.map((block, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 border rounded-lg p-4"
            >
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMoveBlock(index, "up")}
                  disabled={index === 0}
                >
                  <ChevronUp size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMoveBlock(index, "down")}
                  disabled={index === blocks.length - 1}
                >
                  <ChevronDown size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteBlock(index)}
                >
                  <Trash size={16} />
                </Button>
              </div>

              <BlogBlock
                block={block}
                isEditable={true}
                onChange={(updatedBlock) =>
                  handleBlockChange(index, updatedBlock)
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
