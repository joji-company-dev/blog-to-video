import { BlogContentWithAnalysis } from "@/src/common/model/blog-content.model";
import { AiSequenceCommander } from "@/src/server/blog-sequencer/openai-blog-sequencer/ai-sequence-commander";

export interface BlogSequencer {
  sequencify(blog: BlogContentWithAnalysis): Promise<BlogContentWithAnalysis>;
}

export class BlogSequencerImpl implements BlogSequencer {
  private readonly aiSequenceCommander: AiSequenceCommander;

  constructor(openaiBlogSequencer?: AiSequenceCommander) {
    this.aiSequenceCommander = openaiBlogSequencer ?? new AiSequenceCommander();
  }

  async sequencify(
    blog: BlogContentWithAnalysis
  ): Promise<BlogContentWithAnalysis> {
    return this.aiSequenceCommander.sequencify(blog);
  }
}
