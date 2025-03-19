import { BlogContent } from "@/src/common/model/blog-content.model";

export interface BlogParser {
  initialize(): Promise<void>;
  parse(url: string): Promise<BlogContent>;
  close(): Promise<void>;
}
