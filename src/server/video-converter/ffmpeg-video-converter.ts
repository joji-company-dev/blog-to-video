import { BlogContent } from "@/src/common/model/blog-parser.model";
import { VideoRequestResult } from "@/src/common/model/video-request-result";
import fs from "fs";
import path from "path";
import { BlogToVideoJobService } from "./service/blog-to-video-job.service";
import { VideoJobService } from "./service/video-job.service";
import { TaskQueue } from "./task-queue";
import { VideoConverter } from "./video-converter.interface";

export class FFmpegVideoConverter implements VideoConverter {
  #taskQueue: TaskQueue;
  #outputDir: string;
  #blogToVideoService: BlogToVideoJobService;
  #videoJobService: VideoJobService;

  constructor(outputDir: string = "./output") {
    // 출력 디렉토리 생성
    this.#outputDir = path.resolve(process.cwd(), outputDir);
    if (!fs.existsSync(this.#outputDir)) {
      fs.mkdirSync(this.#outputDir, { recursive: true });
    }

    // 서비스 초기화
    this.#taskQueue = new TaskQueue();
    this.#blogToVideoService = new BlogToVideoJobService();
    this.#videoJobService = new VideoJobService(this.#outputDir);
  }

  async convert(blogContent: BlogContent): Promise<VideoRequestResult> {
    try {
      // 1. 블로그 콘텐츠를 비디오 작업으로 변환
      const videoJob = this.#blogToVideoService.createVideoJob(blogContent);

      // 2. 비디오 작업 등록
      this.#videoJobService.registerJob(videoJob);

      // 3. 작업 큐에 비디오 생성 작업 추가
      this.#taskQueue.add(() => this.#videoJobService.processJob(videoJob));

      // 4. 작업 큐 처리 시작 (이미 처리 중이 아니라면)
      if (!this.#taskQueue.processingTask) {
        this.#taskQueue.process().catch(console.error);
      }

      // 5. 결과 반환 (작업 ID 포함)
      return {
        progress: "pending",
        data: {
          id: videoJob.id,
        },
      };
    } catch (error) {
      console.error("비디오 변환 오류:", error);
      return {
        progress: "error",
        data: {
          id: "error",
        },
      };
    }
  }

  /**
   * 작업 ID로 작업 상태를 조회합니다.
   */
  getJobStatus(jobId: string): {
    progress: VideoRequestResult["progress"];
    outputPath?: string;
  } {
    const job = this.#videoJobService.getJob(jobId);

    if (!job) {
      return { progress: "error" };
    }

    // 작업 상태에 따른 진행 상태 매핑
    let progress: VideoRequestResult["progress"];
    switch (job.status) {
      case "pending":
        progress = "pending";
        break;
      case "processing":
        progress = "processing";
        break;
      case "done":
        progress = "done";
        break;
      case "error":
        progress = "error";
        break;
      default:
        progress = "error";
        break;
    }

    // 완료된 작업이면 출력 경로 포함
    const outputPath =
      progress === "done"
        ? path.join(this.#outputDir, `${job.id}_final.mp4`)
        : undefined;

    return { progress, outputPath };
  }
}
