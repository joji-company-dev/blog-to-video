import { VideoCut } from "@/src/server/video-converter/model/video-cut.model";

export interface VideoScene {
  id: string;
  jobId: string;
  cuts: VideoCut[];
  outputPath?: string;
}
