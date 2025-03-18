"use client";

import { Button } from "@/src/client/shared/shadcn/components/button";
import { Typography } from "@/src/client/shared/shadcn/components/typography";
import { useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";
import { useVideoJobStatus } from "./useVideoJobStatus";

interface VideoJobStatusViewerProps {
  jobId: string;
  onClose: () => void;
}

export function VideoJobStatusViewer({
  jobId,
  onClose,
}: VideoJobStatusViewerProps) {
  const { status, isLoading, error } = useVideoJobStatus(jobId);
  const [progress, setProgress] = useState(0);

  // 진행 상태에 따른 프로그레스 바 업데이트
  useEffect(() => {
    if (!status) return;

    switch (status.progress) {
      case "pending":
        setProgress(10);
        break;
      case "processing":
        setProgress(50);
        break;
      case "done":
        setProgress(100);
        break;
      case "error":
        setProgress(100);
        break;
    }
  }, [status]);

  // 진행 상태 표시 텍스트
  const getStatusText = () => {
    if (!status) return "작업 상태 확인 중...";

    switch (status.progress) {
      case "pending":
        return "변환 작업 대기 중...";
      case "processing":
        return "영상 생성 중...";
      case "done":
        return "영상 생성 완료!";
      case "error":
        return "영상 생성 오류 발생";
      default:
        return "알 수 없는 상태";
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-card text-card-foreground mt-4">
      <div className="flex justify-between items-center mb-4">
        <Typography.H4>비디오 변환 작업</Typography.H4>
        <Button variant="ghost" size="sm" onClick={onClose}>
          닫기
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading && !status ? (
          <div className="flex items-center justify-center py-4">
            <BounceLoader color="currentColor" size={30} />
          </div>
        ) : error ? (
          <div className="text-red-500">
            <Typography.P>{error.message}</Typography.P>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="h-2 w-full bg-gray-200 rounded-full">
                  <div
                    className={`h-2 rounded-full ${
                      status?.progress === "error"
                        ? "bg-red-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-medium">{getStatusText()}</span>
              {(status?.progress === "processing" ||
                status?.progress === "pending") && (
                <BounceLoader color="currentColor" size={15} />
              )}
            </div>

            {status?.progress === "done" && status.videoUrl && (
              <div className="mt-4">
                <Typography.P className="mb-2">
                  영상이 생성되었습니다!
                </Typography.P>
                <video
                  controls
                  className="w-full rounded"
                  src={status.videoUrl}
                ></video>
                <div className="mt-2">
                  <a
                    href={status.videoUrl}
                    download
                    className="text-blue-500 hover:underline text-sm"
                  >
                    다운로드
                  </a>
                </div>
              </div>
            )}

            {status?.progress === "error" && (
              <Typography.P className="text-red-500">
                영상 생성 과정에서 오류가 발생했습니다. 다시 시도해 주세요.
              </Typography.P>
            )}
          </>
        )}
      </div>
    </div>
  );
}
