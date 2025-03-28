import { BlogBlock, ImageBlock, TextBlock } from "@/src/common/model/blocks";
import { BlogContent } from "@/src/common/model/blog-content.model";
import { v4 as uuidv4 } from "uuid";
import { VideoCut } from "../model/video-cut.model";
import { VideoJob } from "../model/video-job.model";
import { VideoScene } from "../model/video-scene.model";

export interface IBlogToVideoJobService {
  createVideoJob(blogContent: BlogContent): VideoJob;
}

/**
 * 블로그 콘텐츠를 비디오 작업으로 변환하는 서비스
 */
export class BlogToVideoJobService {
  /**
   * 블로그 콘텐츠를 비디오 작업으로 변환합니다.
   */
  createVideoJob(blogContent: BlogContent): VideoJob {
    const jobId = uuidv4();

    return {
      id: jobId,
      title: blogContent.title,
      scenes: this.createVideoScenes(jobId, blogContent.blocks),
      createdAt: new Date(),
      status: "pending",
      progress: 0,
    };
  }

  /**
   * 블로그 블록 배열을 비디오 장면 배열로 변환합니다.
   */
  private createVideoScenes(jobId: string, blocks: BlogBlock[]): VideoScene[] {
    // 블록 타입별로 그룹화
    const scenes: VideoScene[] = [];

    // 씬 생성 로직: 컨텐츠 타입별로 적절한 장면 구성
    blocks.forEach((block) => {
      const sceneId = uuidv4();

      let cuts: VideoCut[] = [];

      switch (block.type) {
        case "multipleImageAndMultipleText":
          const imageBlocksWithTimeline = this.createTimeline(
            block.imageBlocks
          );
          const textBlocksWithTimeline = this.createTimeline(block.textBlocks);

          cuts = this.mergeImageAndTextWithTimeline(
            imageBlocksWithTimeline,
            textBlocksWithTimeline
          );
          break;
        case "text":
          // 텍스트만 있는 경우 배경색이 있는 화면에 텍스트 표시
          cuts = [this.createCutFromText(sceneId, block.value, block.duration)];
          break;

        case "image":
          // 이미지만 있는 경우
          cuts = [
            this.createCutFromImage(sceneId, block.value.src, block.duration),
          ];
          break;
      }

      if (cuts.length > 0) {
        scenes.push({
          id: sceneId,
          jobId,
          cuts,
        });
      }
    });

    return scenes;
  }

  /**
   * 텍스트로만 구성된 비디오 컷을 생성합니다.
   */
  private createCutFromText(
    sceneId: string,
    text: string,
    duration: number
  ): VideoCut {
    return {
      id: uuidv4(),
      sceneId,
      duration,
      subtitle: text,
    };
  }

  /**
   * 이미지로만 구성된 비디오 컷을 생성합니다.
   */
  private createCutFromImage(
    sceneId: string,
    imageUrl: string,
    duration: number
  ): VideoCut {
    return {
      id: uuidv4(),
      sceneId,
      duration,
      imageUrl,
    };
  }

  private createTimeline<T extends { duration: number }>(
    blocks: T[]
  ): (T & { timeline: number[] })[] {
    let prevDurations = 0;
    return blocks.map((block) => {
      prevDurations += block.duration;
      return {
        ...block,
        timeline: [prevDurations, prevDurations + block.duration],
      };
    });
  }

  private mergeImageAndTextWithTimeline(
    imageBlocksWithTimeline: (ImageBlock & { timeline: number[] })[],
    textBlocksWithTimeline: (TextBlock & { timeline: number[] })[]
  ): VideoCut[] {
    return imageBlocksWithTimeline.map((imageBlock) => {
      const textBlock = textBlocksWithTimeline.find(
        (textBlock) =>
          textBlock.timeline[0] <= imageBlock.timeline[0] &&
          textBlock.timeline[1] >= imageBlock.timeline[0]
      );
      return {
        duration: imageBlock.duration,
        imageUrl: imageBlock.value.src,
        text: textBlock?.value,
        id: uuidv4(),
        sceneId: uuidv4(),
      };
    });
  }
}
