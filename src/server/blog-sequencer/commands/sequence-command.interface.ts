import { BlogBlockWithAnalysis } from "@/src/common/model/blocks";
import { BlogContentWithAnalysis } from "@/src/common/model/blog-content.model";

export interface SequenceCommand {
  execute(blogContent: BlogContentWithAnalysis): Promise<BlogBlockWithAnalysis>;
}
