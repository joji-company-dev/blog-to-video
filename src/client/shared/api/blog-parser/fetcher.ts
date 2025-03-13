import { generateFetcher } from "@/src/client/shared/lib/api-fetcher/generateFetcher";
import { BlogContent } from "@/src/server/blog-parser/blog-parser.model";

const BASE_URL =
  typeof window !== "undefined" ? window.location.origin : process.env.API_URL;

export const blogParserFetcher = generateFetcher<
  void,
  { url: string },
  void,
  { result: "success" | "error"; data: BlogContent }
>({
  base: BASE_URL,
  endpoint: "/api/parse-blog",
  method: "GET",
});
