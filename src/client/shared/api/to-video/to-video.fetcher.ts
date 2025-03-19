import { generateFetcher } from "@/src/client/shared/lib/api-fetcher/generateFetcher";
import {
  CreateVideoRequest,
  VIDEO_API_ENDPOINTS,
  VideoJobResponse,
} from "./to-video.types";

const BASE_URL =
  typeof window !== "undefined" ? window.location.origin : process.env.API_URL;

// 비디오 생성 API
export const createVideoFetcher = generateFetcher<
  void, // PathParams - 없음
  void, // QueryParam - 없음
  CreateVideoRequest, // Body - content: BlogContent
  VideoJobResponse // Response
>({
  base: BASE_URL,
  endpoint: VIDEO_API_ENDPOINTS.CREATE_VIDEO,
  method: "POST",
});

// 비디오 상태 조회 API
export const getVideoStatusFetcher = generateFetcher<
  void, // PathParams - 없음
  { jobId: string }, // QueryParam - jobId
  void, // Body - 없음
  VideoJobResponse // Response
>({
  base: BASE_URL,
  endpoint: VIDEO_API_ENDPOINTS.GET_VIDEO_STATUS,
  method: "GET",
});
