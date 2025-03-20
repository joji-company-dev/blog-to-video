import { BlogContent } from "@/src/common/model/blog-content.model";
import { VideoRequestResult } from "@/src/common/model/video-request-result";

export interface VideoConverter {
  convert(blogContent: BlogContent): Promise<VideoRequestResult>;
}
