import { z } from "zod";
import {
  blogBlockModel,
  blogBlockModelWithAnalysis,
} from "./blocks/blog-block.model";

export const blogContentModel = z.object({
  title: z.string(),
  blocks: z.array(blogBlockModel),
});

export const blogContentModelWithAnalysis = blogContentModel.extend({
  blocks: z.array(blogBlockModelWithAnalysis),
});

export type BlogContent = z.infer<typeof blogContentModel>;
export type BlogContentWithAnalysis = z.infer<
  typeof blogContentModelWithAnalysis
>;
