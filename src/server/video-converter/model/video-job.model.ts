import { VideoScene } from "@/src/server/video-converter/model/video-scene.model";

export interface VideoJob {
  id: string;
  title: string;
  scenes: VideoScene[];
  createdAt: Date;
  status: "pending" | "processing" | "done" | "error";
}
