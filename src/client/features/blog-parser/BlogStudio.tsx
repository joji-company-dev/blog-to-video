"use client";

import { PATHS } from "@/src/client/app/routes/paths";
import { useParseBlog } from "@/src/client/features/blog-parser/useParseBlog";
import { useSequencifyBlog } from "@/src/client/features/blog-parser/useSequencifyBlog";
import { Button } from "@/src/client/shared/shadcn/components/button";
import { Typography } from "@/src/client/shared/shadcn/components/typography";
import { BlogContent } from "@/src/common/model/blog-content.model";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";
import { BlogContentEditor } from "./BlogContentEditor";
import { BlogContentViewer } from "./BlogContentViewer";
import { useCreateVideo } from "./useCreateVideo";
import { VideoJobStatusViewer } from "./VideoJobStatusViewer";

export interface BlogStudioProps {
  url: string;
}

export function BlogStudio({ url }: BlogStudioProps) {
  const { data, isLoading, error } = useParseBlog(url);
  const { sequencifyBlog, isLoading: isSequencifyLoading } =
    useSequencifyBlog();
  const { createVideo, isLoading: isVideoLoading } = useCreateVideo();
  const [blogContent, setBlogContent] = useState<BlogContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [videoJobId, setVideoJobId] = useState<string | null>(null);
  const [showVideoStatus, setShowVideoStatus] = useState(false);

  const handleSequencifyBlog = async () => {
    if (!blogContent) return;
    const response = await sequencifyBlog(blogContent);
    setBlogContent(response);
  };

  const handleCreateVideo = async () => {
    if (!blogContent) return;
    try {
      const result = await createVideo(blogContent);
      setVideoJobId(result.jobId);
      setShowVideoStatus(true);
    } catch (error) {
      console.error("비디오 생성 요청 오류:", error);
    }
  };

  useEffect(() => {
    if (data) {
      setBlogContent(data.data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <BounceLoader color="currentColor" />
        <Typography.Lead>블로그 분석 중...</Typography.Lead>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <Typography.Lead>블로그 분석 중 오류가 발생했습니다.</Typography.Lead>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            새로고침
          </Button>
          <Link href={PATHS.ROOT}>
            <Button variant="default">홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!blogContent) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <Typography.Lead>블로그 데이터를 불러오지 못했습니다.</Typography.Lead>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            새로고침
          </Button>
          <Link href={PATHS.ROOT}>
            <Button variant="default">홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 space-y-2">
      <div className="flex justify-end gap-2 md:gap-4">
        {!isEditing && (
          <>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              편집
            </Button>
            <Button
              variant="default"
              onClick={handleSequencifyBlog}
              disabled={isSequencifyLoading}
            >
              {isSequencifyLoading ? "Sequencify..." : "Sequencify!"}
            </Button>
            <Button
              variant="default"
              onClick={handleCreateVideo}
              disabled={isVideoLoading}
            >
              {isVideoLoading ? "영상 생성 중..." : "영상 만들기"}
            </Button>
          </>
        )}
      </div>

      {showVideoStatus && videoJobId && (
        <VideoJobStatusViewer
          jobId={videoJobId}
          onClose={() => setShowVideoStatus(false)}
        />
      )}

      {isEditing ? (
        <BlogContentEditor
          initialContent={blogContent}
          onSave={(content) => {
            setBlogContent(content);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <BlogContentViewer block={blogContent} />
      )}
    </div>
  );
}
