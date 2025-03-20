import { z } from "zod";

export const imageAnalysisModel = z.object({
  text: z.string(),
  objects: z.array(z.string()),
});

export type ImageAnalysis = z.infer<typeof imageAnalysisModel>;
