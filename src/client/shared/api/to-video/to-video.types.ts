import { BlogContent } from "@/src/common/model/blog-parser.model";

// 요청 타입
export interface CreateVideoRequest {
  content: BlogContent;
}

// 응답 타입
export interface VideoJobResponse {
  result: "success" | "error";
  data: {
    jobId: string;
    progress: "pending" | "processing" | "done" | "error";
    outputPath?: string;
    videoUrl?: string;
    message?: string;
  };
}

// API 엔드포인트 정의
export const VIDEO_API_ENDPOINTS = {
  CREATE_VIDEO: "/api/to-video",
  GET_VIDEO_STATUS: "/api/to-video",
} as const;
