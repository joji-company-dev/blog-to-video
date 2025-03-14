import { BlogContent } from "@/src/common/model/blog-parser.model";

export interface BlogSequencer {
  sequencify(blog: BlogContent): Promise<BlogContent>;
}
