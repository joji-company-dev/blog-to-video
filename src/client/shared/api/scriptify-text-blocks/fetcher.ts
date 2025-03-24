import { generateFetcher } from "@/src/client/shared/lib/api-fetcher/generateFetcher";
import {
  BlogBlockWithAnalysis,
  TextBlockWithAnalysis,
} from "@/src/common/model/blocks";

const BASE_URL =
  typeof window !== "undefined" ? window.location.origin : process.env.API_URL;

export const sequencifyBlogFetcher = generateFetcher<
  void,
  void,
  {
    targetBlock: BlogBlockWithAnalysis;
    systemPromptOverride?: string;
  },
  { result: "success" | "error"; data: TextBlockWithAnalysis[] }
>({
  base: BASE_URL,
  endpoint: "/api/scriptify-text-blocks",
  method: "POST",
});
