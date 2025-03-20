import { BlogContentWithAnalysis } from "@/src/common/model/blog-content.model";
import { OpenaiBlogSequencer } from "@/src/server/blog-sequencer/openai-blog-sequencer/openai-blog-sequencer";

export interface BlogSequencer {
  sequencify(blog: BlogContentWithAnalysis): Promise<BlogContentWithAnalysis>;
}

export class BlogSequencerImpl implements BlogSequencer {
  private readonly openaiBlogSequencer: OpenaiBlogSequencer;

  constructor(openaiBlogSequencer?: OpenaiBlogSequencer) {
    this.openaiBlogSequencer = openaiBlogSequencer ?? new OpenaiBlogSequencer();
  }

  async sequencify(
    blog: BlogContentWithAnalysis
  ): Promise<BlogContentWithAnalysis> {
    return this.openaiBlogSequencer.sequencify(blog);
  }
}
