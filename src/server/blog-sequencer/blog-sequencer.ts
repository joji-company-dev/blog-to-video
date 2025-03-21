import { BlogContentWithAnalysis } from "@/src/common/model/blog-content.model";
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
    return this.aiSequenceCommander.sequencify(blog);
  }
}
