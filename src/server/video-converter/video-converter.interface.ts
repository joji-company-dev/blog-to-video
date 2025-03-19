import { BlogContent } from "@/src/common/model/blog-parser.model";
import { VideoRequestResult } from "@/src/common/model/video-request-result";

export interface VideoConverter {
  convert(blogContent: BlogContent): Promise<VideoRequestResult>;
}
