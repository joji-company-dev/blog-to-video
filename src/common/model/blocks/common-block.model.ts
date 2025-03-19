import { z } from "zod";

export const commonBlockModel = z.object({
  type: z.string(),
  duration: z.number(),
});

export type CommonBlock = z.infer<typeof commonBlockModel>;
