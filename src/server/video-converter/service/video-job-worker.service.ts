import { Logger } from "@/src/server/utils/logger";
import os from "os";
import pLimit from "p-limit";
import path from "path";
import { FFmpegRenderer } from "../ffmpeg/ffmpeg-renderer";
import { VideoJob } from "../model/video-job.model";
import { VideoScene } from "../model/video-scene.model";

export interface IVideoJobWorkerService {
  enqueueJob(job: VideoJob): Promise<void>;
  getJob(jobId: string): VideoJob | undefined;
}

/**
 * 비디오 작업을 처리하고 관리하는 서비스
 */
export class VideoJobWorkerService implements IVideoJobWorkerService {
  #outputDir: string;
  #ffmpegRenderer: FFmpegRenderer;
  #jobs: Map<string, VideoJob> = new Map();
  #logger = new Logger("VideoJobService");
  #concurrencyUpperLimit: number = 4;
  #concurrencyLimit: number = 1;
  #maxConcurrentJobs: number = 1;
  #activeJobs: number = 0;

  constructor(
    outputDir: string,
    debug = true,
    resolution: {
      width: number;
      height: number;
    } = {
      width: 1080,
      height: 1920,
    },
    concurrencyLimit?: number
  ) {
    this.#outputDir = outputDir;

    this.#ffmpegRenderer = new FFmpegRenderer({
      outputDir,
      debug,
      renderOptions: {
        resolution,
      },
      useHardwareAccel: true,
    });

    this.#configureConcurrencyLimits(concurrencyLimit);

    this.#logger.debug(
      `VideoJobService 초기화 - 출력 디렉토리: ${outputDir}, 컷 동시 처리 수: ${
        this.#concurrencyLimit
      }, 최대 동시 작업 수: ${this.#maxConcurrentJobs}`
    );
  }

  #configureConcurrencyLimits(concurrencyLimit?: number): void {
    const cpuCount = os.cpus().length;
    this.#concurrencyLimit =
      concurrencyLimit ??
      Math.max(1, Math.min(cpuCount - 1, this.#concurrencyUpperLimit));
    this.#maxConcurrentJobs = Math.max(
      1,
      Math.ceil(cpuCount / this.#concurrencyUpperLimit)
    );
  }

  #registerJob(job: VideoJob): VideoJob {
    this.#logger.debug(
      `새 작업 등록: ID=${job.id}, 제목="${job.title}", 장면 수=${job.scenes.length}`
    );
    this.#jobs.set(job.id, job);
    return job;
  }

  getJob(jobId: string): VideoJob | undefined {
    const job = this.#jobs.get(jobId);
    if (job) {
      this.#logger.debug(`작업 조회 성공: ID=${jobId}, 상태=${job.status}`);
    } else {
      this.#logger.warn(`존재하지 않는 작업 ID 조회: ${jobId}`);
    }
    return job;
  }

  #updateJobStatus(
    jobId: string,
    status: VideoJob["status"]
  ): VideoJob | undefined {
    const job = this.#jobs.get(jobId);
    if (job) {
      const prevStatus = job.status;
      job.status = status;
      this.#logger.debug(
        `작업 상태 업데이트: ID=${jobId}, ${prevStatus} -> ${status}`
      );
      return job;
    }
    this.#logger.warn(
      `존재하지 않는 작업 상태 업데이트 시도: ID=${jobId}, 상태=${status}`
    );
    return undefined;
  }

  async enqueueJob(job: VideoJob): Promise<void> {
    this.#registerJob(job);
    this.#updateJobStatus(job.id, "queued");
    this.#tryProcessNextJob();
  }

  #tryProcessNextJob(): void {
    if (this.#activeJobs >= this.#maxConcurrentJobs) {
      this.#logger.debug(
        `최대 동시 작업 수(${this.#maxConcurrentJobs})에 도달, 대기 중`
      );
      return;
    }

    const queuedJob = [...this.#jobs.values()].find(
      (j) => j.status === "queued"
    );
    if (!queuedJob) {
      return;
    }

    this.#activeJobs++;
    this.#processJob(queuedJob).finally(() => {
      this.#activeJobs--;
      this.#tryProcessNextJob();
    });
  }

  async #processJob(job: VideoJob): Promise<string> {
    this.#logger.debug(`작업 처리 시작: ID=${job.id}, 제목="${job.title}"`);

    try {
      this.#updateJobStatus(job.id, "processing");
      job.progress = 0;

      // 각 장면의 가중치 계산 (컷 수에 비례)
      const totalCuts = job.scenes.reduce(
        (sum, scene) => sum + scene.cuts.length,
        0
      );
      const sceneWeights = job.scenes.map(
        (scene) => scene.cuts.length / totalCuts
      );

      // 제한된 수의 장면 동시 처리
      const sceneLimit = pLimit(
        Math.max(1, Math.floor(this.#concurrencyLimit / 2))
      );
      const scenePromises = job.scenes.map((scene, index) =>
        sceneLimit(() =>
          this.#processScene(scene, index, job.scenes.length, (progress) => {
            job.progress =
              sceneWeights
                .slice(0, index)
                .reduce((sum, w) => sum + w * 100, 0) +
              progress * sceneWeights[index];
          })
        )
      );

      const scenePaths = await Promise.all(scenePromises);

      job.progress = 90;

      const outputFilename = `${job.id}_final.mp4`;
      const outputPath = path.join(this.#outputDir, outputFilename);

      await this.#ffmpegRenderer.concatScenes(scenePaths, outputPath);

      job.progress = 100;
      this.#updateJobStatus(job.id, "done");

      return outputPath;
    } catch (error) {
      this.#updateJobStatus(job.id, "error");
      this.#logger.error(`비디오 작업 처리 오류: ${error}`);
      throw error;
    }
  }

  async #processScene(
    scene: VideoScene,
    sceneIndex: number,
    totalScenes: number,
    onProgress: (progress: number) => void
  ): Promise<string> {
    this.#logger.debug(
      `장면 처리 시작 (${sceneIndex}/${totalScenes}): ID=${scene.id}, 컷 수=${scene.cuts.length}`
    );

    try {
      const limit = pLimit(this.#concurrencyLimit);

      // 진행도 추적 변수
      let completedCuts = 0;
      const totalCuts = scene.cuts.length;

      const cutPromises = scene.cuts.map((cut, index) =>
        limit(() => {
          const cutFilename = `${cut.id}.mp4`;
          const cutPath = path.join(this.#outputDir, cutFilename);
          this.#logger.debug(
            `컷 렌더링 시작 (${index + 1}/${scene.cuts.length}): ID=${cut.id}`
          );

          return this.#ffmpegRenderer
            .renderVideoCut(cut, cutPath)
            .then((path) => {
              completedCuts++;
              onProgress((completedCuts / totalCuts) * 80);
              return path;
            })
            .catch((error) => {
              this.#logger.error(`컷 렌더링 실패: ID=${cut.id}, 오류=${error}`);
              throw error;
            });
        })
      );

      const cutPaths = await Promise.all(cutPromises);

      onProgress(80);

      const sceneFilename = `${scene.id}.mp4`;
      const scenePath = path.join(this.#outputDir, sceneFilename);

      await this.#ffmpegRenderer.concatSceneCuts(cutPaths, scenePath);

      onProgress(100);

      scene.outputPath = scenePath;
      return scenePath;
    } catch (error) {
      this.#logger.error(`장면 처리 실패: ID=${scene.id}, 오류=${error}`);
      throw error;
    }
  }
}
