import { apiFetchers } from "@/src/client/shared/api";
import { useEffect, useState } from "react";

interface VideoJobStatus {
  jobId: string;
  progress: "pending" | "processing" | "done" | "error";
  outputPath?: string;
  videoUrl?: string;
}

export function useVideoJobStatus(jobId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<VideoJobStatus | null>(null);

  const fetchStatus = async () => {
    if (!jobId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetchers.videoApi.getVideoStatusFetcher({
        queryParam: { jobId },
      });

      if (response.result !== "success") {
        throw new Error(response.data?.message || "작업 상태 조회 실패");
      }

      const jobStatus: VideoJobStatus = {
        jobId: response.data.jobId,
        progress: response.data.progress,
        outputPath: response.data.outputPath,
        videoUrl: response.data.videoUrl,
      };

      setStatus(jobStatus);
      return jobStatus;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("알 수 없는 오류가 발생했습니다.");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 작업 상태가 done이나 error가 아니면 일정 간격으로 상태 확인
  useEffect(() => {
    if (!jobId || status?.progress === "done" || status?.progress === "error") {
      return;
    }

    const intervalId = setInterval(() => {
      fetchStatus().catch(console.error);
    }, 3000); // 3초마다 상태 확인

    return () => clearInterval(intervalId);
  }, [jobId, status?.progress]);

  // 초기 상태 확인
  useEffect(() => {
    if (jobId) {
      fetchStatus().catch(console.error);
    }
  }, [jobId]);

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}
