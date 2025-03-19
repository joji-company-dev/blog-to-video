import { z } from "zod";
import { blogBlockModel } from "./blocks/blog-block.model";

export const blogContentModel = z.object({
  title: z.string(),
  blocks: z.array(blogBlockModel),
});

export type BlogContent = z.infer<typeof blogContentModel>;
