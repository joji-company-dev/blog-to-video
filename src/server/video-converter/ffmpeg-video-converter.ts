import { BlogContent } from "@/src/common/model/blog-parser.model";
import { VideoRequestResult } from "@/src/common/model/video-request-result";
import fs from "fs";
import path from "path";
import {
  BlogToVideoJobService,
  IBlogToVideoJobService,
} from "./service/blog-to-video-job.service";
import {
  IVideoJobWorkerService,
  VideoJobWorkerService,
} from "./service/video-job-worker.service";
import { ITaskQueue, TaskQueue } from "./task-queue";
import { VideoConverter } from "./video-converter.interface";

export class FFmpegVideoConverter implements VideoConverter {
  #taskQueue: ITaskQueue;
  #outputDir: string;
  #blogToVideoService: IBlogToVideoJobService;
  #videoJobWorkerService: IVideoJobWorkerService;

  constructor(
    options: {
      outputDir?: string;
      taskQueue?: ITaskQueue;
      blogToVideoService?: IBlogToVideoJobService;
      videoJobWorkerService?: IVideoJobWorkerService;
    } = {}
  ) {
    this.#outputDir = this.#resolveOutputDir(options.outputDir || "./output");

    this.#taskQueue = options.taskQueue || new TaskQueue();
    this.#blogToVideoService =
      options.blogToVideoService || new BlogToVideoJobService();
    this.#videoJobWorkerService =
      options.videoJobWorkerService ||
      new VideoJobWorkerService(this.#outputDir);
  }

  #resolveOutputDir(outputDir: string) {
    const outputDirPath = path.resolve(process.cwd(), outputDir);
    if (!fs.existsSync(outputDirPath)) {
      fs.mkdirSync(outputDirPath, { recursive: true });
    }
    return outputDirPath;
  }

  async convert(blogContent: BlogContent): Promise<VideoRequestResult> {
    try {
      const videoJob = this.#blogToVideoService.createVideoJob(blogContent);

      // 2. 비디오 작업 등록
      this.#videoJobWorkerService.registerJob(videoJob);

      // 3. 작업 큐에 비디오 생성 작업 추가
      this.#taskQueue.add(() =>
        this.#videoJobWorkerService.processJob(videoJob)
      );

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
    const job = this.#videoJobWorkerService.getJob(jobId);

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
