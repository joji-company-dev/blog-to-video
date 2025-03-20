import { BlogBlock } from "@/src/common/model/blocks";
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

      // 블록 타입에 따라 다른 처리 로직 적용
      switch (block.type) {
        case "singleImageAndSingleText":
          cuts = [
            this.createCutFromImageAndText(
              sceneId,
              block.imageBlock.value.src,
              block.textBlock.value,
              block.duration
            ),
          ];
          break;

        case "singleImageAndMultipleText":
          // 여러 텍스트를 순차적으로 보여주는 컷 생성
          cuts = block.textBlocks.map((textBlock) =>
            this.createCutFromImageAndText(
              sceneId,
              block.imageBlock.value.src,
              textBlock.value,
              block.duration / block.textBlocks.length
            )
          );
          break;

        case "multipleImageAndSingleText":
          // 여러 이미지를 순차적으로 보여주는 컷 생성
          cuts = block.imageBlocks.map((imageBlock) =>
            this.createCutFromImageAndText(
              sceneId,
              imageBlock.value.src,
              block.textBlock.value,
              block.duration / block.imageBlocks.length
            )
          );
          break;

        case "text":
          // 텍스트만 있는 경우 배경색이 있는 화면에 텍스트 표시
          cuts = [this.createCutFromText(sceneId, block.value, 3)]; // 기본 3초 지속
          break;

        case "image":
          // 이미지만 있는 경우
          cuts = [this.createCutFromImage(sceneId, block.value.src, 3)]; // 기본 3초 지속
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
   * 이미지와 텍스트로 구성된 비디오 컷을 생성합니다.
   */
  private createCutFromImageAndText(
    sceneId: string,
    imageUrl: string,
    text: string,
    duration: number
  ): VideoCut {
    return {
      id: uuidv4(),
      sceneId,
      duration,
      imageUrl,
      text,
    };
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
      text,
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
}
