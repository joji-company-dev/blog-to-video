import { BlogContent } from "@/src/common/model/blog-content.model";

export interface BlogSequencer {
  sequencify(blog: BlogContent): Promise<BlogContent>;
}
