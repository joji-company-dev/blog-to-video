import { BlogContent } from "./blog-parser.model";

export interface BlogParser {
  initialize(): Promise<void>;
  parse(url: string): Promise<BlogContent>;
  close(): Promise<void>;
}
