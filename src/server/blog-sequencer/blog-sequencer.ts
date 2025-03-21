import {
  blogContentModelWithAnalysis,
  BlogContentWithAnalysis,
} from "@/src/common/model/blog-content.model";
import { AiSequenceCommanderImpl } from "@/src/server/blog-sequencer/openai-blog-sequencer/ai-sequence-commander";

export interface BlogSequencer {
  sequencify(blog: BlogContentWithAnalysis): Promise<BlogContentWithAnalysis>;
}

export class BlogSequencerImpl implements BlogSequencer {
  private readonly aiSequenceCommander: AiSequenceCommanderImpl;

  constructor(openaiBlogSequencer?: AiSequenceCommanderImpl) {
    this.aiSequenceCommander =
      openaiBlogSequencer ?? new AiSequenceCommanderImpl();
  }

  async sequencify(
    blog: BlogContentWithAnalysis
  ): Promise<BlogContentWithAnalysis> {
    const sequenceCommands = await this.aiSequenceCommander.sequencifyV2(
      blog.blocks
    );
    const newBlogBlocks = [];

    for (const command of sequenceCommands) {
      const result = await command.execute(blog);

      newBlogBlocks.push(result);
    }

    const newBlog = blogContentModelWithAnalysis.parse({
      ...blog,
      blocks: newBlogBlocks,
    });

    return newBlog;
  }
}
