import { generateFetcher } from "@/src/client/shared/lib/api-fetcher/generateFetcher";
import { BlogContent } from "@/src/common/model/blog-content.model";

const BASE_URL =
  typeof window !== "undefined" ? window.location.origin : process.env.API_URL;

export const sequencifyBlogFetcher = generateFetcher<
  void,
  void,
  { content: BlogContent },
  { result: "success" | "error"; data: BlogContent }
>({
  base: BASE_URL,
  endpoint: "/api/sequencify-blog",
  method: "POST",
});
