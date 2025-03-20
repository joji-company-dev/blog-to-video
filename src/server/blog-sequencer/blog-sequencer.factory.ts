import { BlogSequencer } from "@/src/server/blog-sequencer/blog-sequencer.interface";
import { OpenaiBlogSequencer } from "@/src/server/blog-sequencer/openai-blog-sequencer";

export type BlogSequencerType = "openai";

export class BlogSequencerFactory {
  static create(type: BlogSequencerType): BlogSequencer {
    switch (type) {
      case "openai":
        return new OpenaiBlogSequencer();
      default:
        throw new Error(`Invalid blog sequencer type: ${type}`);
    }
  }
}
