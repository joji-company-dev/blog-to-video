import { apiFetchers } from "@/src/client/shared/api";
import { BlogContent } from "@/src/common/model/blog-parser.model";
import { useState } from "react";

interface CreateVideoResult {
  jobId: string;
  progress: "pending" | "processing" | "done" | "error";
}

export function useCreateVideo() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<CreateVideoResult | null>(null);

  const createVideo = async (content: BlogContent) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetchers.videoApi.createVideoFetcher({
        body: { content },
      });

      if (response.result !== "success") {
        throw new Error(response.data?.message || "비디오 생성 요청 실패");
      }

      const videoResult: CreateVideoResult = {
        jobId: response.data.jobId,
        progress: response.data.progress,
      };

      setResult(videoResult);
      return videoResult;
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

  return {
    createVideo,
    isLoading,
    error,
    result,
  };
}
