import path from "path";
import { FFmpegRenderer } from "../ffmpeg/ffmpeg-renderer";
import { VideoJob } from "../model/video-job.model";
import { VideoScene } from "../model/video-scene.model";

/**
 * 비디오 작업을 처리하고 관리하는 서비스
 */
export class VideoJobService {
  #outputDir: string;
  #ffmpegRenderer: FFmpegRenderer;
  #jobs: Map<string, VideoJob> = new Map();
  #debug: boolean;

  constructor(
    outputDir: string,
    debug = true,
    resolution: {
      width: number;
      height: number;
    } = {
      width: 1080,
      height: 1920,
    }
  ) {
    this.#outputDir = outputDir;
    this.#debug = debug;
    this.#ffmpegRenderer = new FFmpegRenderer({
      outputDir,
      debug,
      renderOptions: {
        resolution,
      },
    });
    this.#log(`VideoJobService 초기화 - 출력 디렉토리: ${outputDir}`);
  }

  /**
   * 디버그 로그 출력
   */
  #log(message: string) {
    if (this.#debug) {
      console.log(`[VideoJobService] ${message}`);
    }
  }

  /**
   * 경고 로그 출력
   */
  #warn(message: string) {
    if (this.#debug) {
      console.warn(`[VideoJobService] ⚠️ ${message}`);
    }
  }

  /**
   * 에러 로그 출력
   */
  #error(message: string) {
    if (this.#debug) {
      console.error(`[VideoJobService] 🔴 ${message}`);
    }
  }

  /**
   * 새 비디오 작업을 등록합니다.
   */
  registerJob(job: VideoJob): VideoJob {
    this.#log(
      `새 작업 등록: ID=${job.id}, 제목="${job.title}", 장면 수=${job.scenes.length}`
    );
    this.#jobs.set(job.id, job);
    return job;
  }

  /**
   * 작업 ID로 작업을 조회합니다.
   */
  getJob(jobId: string): VideoJob | undefined {
    const job = this.#jobs.get(jobId);
    if (job) {
      this.#log(`작업 조회 성공: ID=${jobId}, 상태=${job.status}`);
    } else {
      this.#warn(`존재하지 않는 작업 ID 조회: ${jobId}`);
    }
    return job;
  }

  /**
   * 작업 상태를 업데이트합니다.
   */
  updateJobStatus(
    jobId: string,
    status: VideoJob["status"]
  ): VideoJob | undefined {
    const job = this.#jobs.get(jobId);
    if (job) {
      const prevStatus = job.status;
      job.status = status;
      this.#log(`작업 상태 업데이트: ID=${jobId}, ${prevStatus} -> ${status}`);
      return job;
    }
    this.#warn(
      `존재하지 않는 작업 상태 업데이트 시도: ID=${jobId}, 상태=${status}`
    );
    return undefined;
  }

  /**
   * 비디오 작업을 처리합니다.
   */
  async processJob(job: VideoJob): Promise<string> {
    this.#log(`작업 처리 시작: ID=${job.id}, 제목="${job.title}"`);

    try {
      // 1. 작업 상태 업데이트
      this.updateJobStatus(job.id, "processing");
      this.#log(`작업 장면 수: ${job.scenes.length}`);

      // 2. 각 장면을 처리하여 비디오 파일 생성
      const scenePaths: string[] = [];

      for (const [index, scene] of job.scenes.entries()) {
        this.#log(
          `장면 처리 시작 (${index + 1}/${job.scenes.length}): ID=${scene.id}`
        );
        const scenePath = await this.#processScene(scene);
        this.#log(`장면 처리 완료: ${scenePath}`);
        scenePaths.push(scenePath);
      }

      // 3. 모든 장면을 합쳐 최종 비디오 생성
      const outputFilename = `${job.id}_final.mp4`;
      const outputPath = path.join(this.#outputDir, outputFilename);
      this.#log(`최종 비디오 생성 시작: ${outputPath}`);

      await this.#ffmpegRenderer.concatScenes(scenePaths, outputPath);
      this.#log(`최종 비디오 생성 완료: ${outputPath}`);

      // 4. 작업 상태 업데이트
      this.updateJobStatus(job.id, "done");

      return outputPath;
    } catch (error) {
      // 오류 발생 시 작업 상태를 "error"로 업데이트
      this.updateJobStatus(job.id, "error");
      this.#error(`비디오 작업 처리 오류: ${error}`);
      throw error;
    }
  }

  /**
   * 하나의 장면을 처리합니다.
   */
  async #processScene(scene: VideoScene): Promise<string> {
    this.#log(`장면 처리: ID=${scene.id}, 컷 수=${scene.cuts.length}`);

    // 1. 각 컷을 처리하여 개별 비디오 파일 생성
    const cutPaths: string[] = [];

    for (const [index, cut] of scene.cuts.entries()) {
      const cutFilename = `${cut.id}.mp4`;
      const cutPath = path.join(this.#outputDir, cutFilename);
      this.#log(
        `컷 렌더링 시작 (${index + 1}/${scene.cuts.length}): ID=${cut.id}`
      );

      try {
        await this.#ffmpegRenderer.renderVideoCut(cut, cutPath);
        this.#log(`컷 렌더링 완료: ${cutPath}`);
        cutPaths.push(cutPath);
      } catch (error) {
        this.#error(`컷 렌더링 실패: ID=${cut.id}, 오류=${error}`);
        throw error;
      }
    }

    // 2. 모든 컷을 합쳐 하나의 장면 비디오 생성
    const sceneFilename = `${scene.id}.mp4`;
    const scenePath = path.join(this.#outputDir, sceneFilename);
    this.#log(`장면 합치기 시작: ${scenePath}`);

    try {
      await this.#ffmpegRenderer.concatSceneCuts(cutPaths, scenePath);
      this.#log(`장면 합치기 완료: ${scenePath}`);

      // 3. 장면의 출력 경로 저장
      scene.outputPath = scenePath;
      this.#log(`장면 출력 경로 설정: ${scenePath}`);

      return scenePath;
    } catch (error) {
      this.#error(`장면 합치기 실패: ID=${scene.id}, 오류=${error}`);
      throw error;
    }
  }
}
