import path from "path";
import { Logger } from "../../utils/logger";
import { FFmpegCommandBuilder } from "../ffmpeg/command/ffmpeg-command-builder";
import { FFmpegConcatBuilder } from "../ffmpeg/command/ffmpeg-concat-builder";
import { VideoRenderOptionsManager } from "../ffmpeg/options/video-render-options-manager";

/**
 * 빌더 클래스를 직접 사용하는 예제
 */
async function directBuilderExample() {
  // 출력 디렉토리 설정
  const outputDir = path.join(process.cwd(), "output");

  // 로거 생성
  const logger = new Logger("BuilderExample", true);
  logger.debug("빌더 패턴 직접 사용 예제 시작");

  // 렌더링 옵션 생성
  const renderOptions = new VideoRenderOptionsManager({
    fps: 24,
    videoCodec: "libx264",
    textStyle: {
      fontSize: 36,
      fontColor: "white",
      boxEnabled: true,
      boxColor: "blue@0.5",
      boxBorderWidth: 5,
      position: {
        x: "(w-text_w)/2",
        y: "h-th-50",
      },
      shadow: {
        enabled: true,
        x: 3,
        y: 3,
        color: "black@0.6",
      },
    },
  });

  // 해상도 설정
  const resolution = { width: 1280, height: 720 };

  // 출력 파일 경로
  const outputPath = path.join(outputDir, "direct-builder-example.mp4");

  try {
    // 1. 단일 검정 배경 비디오 생성
    logger.debug("검정 배경 비디오 생성 시작");

    // 폰트 경로 (OS에 따라 달라질 수 있음)
    const fontPath = "/System/Library/Fonts/Helvetica.ttc";

    // 명령 빌더 생성
    const builder = new FFmpegCommandBuilder({
      outputPath,
      duration: 5, // 5초 길이 비디오
      resolution,
      renderOptions: renderOptions.getOptions(),
    });

    // 명령 설정 (체인으로 구성)
    builder
      .withBlackBackground()
      .withOutputOptions()
      .withTextFilter(
        renderOptions.createTextFilterString(fontPath, "빌더 패턴 테스트")
      )
      .withStartListener()
      .withProgressListener()
      .applyFilters()
      .withOutput();

    // 명령 실행
    const singleVideoPath = await builder.execute();
    logger.debug(`비디오 생성 완료: ${singleVideoPath}`);

    // 2. 여러 비디오 생성 후 합치기
    logger.debug("여러 비디오 생성 및 합치기 시작");

    // 여러 비디오 생성
    const videoPaths: string[] = [];

    for (let i = 1; i <= 3; i++) {
      const segmentPath = path.join(outputDir, `segment-${i}.mp4`);

      // 각 세그먼트마다 다른 텍스트 설정
      const builder = new FFmpegCommandBuilder({
        outputPath: segmentPath,
        duration: 2, // 각 2초
        resolution,
        renderOptions: renderOptions.getOptions(),
        verbose: true,
      });

      builder
        .withBlackBackground()
        .withOutputOptions()
        .withTextFilter(
          renderOptions.createTextFilterString(fontPath, `파트 ${i}/3`)
        )
        .withStartListener()
        .withProgressListener()
        .applyFilters()
        .withOutput();

      const videoPath = await builder.execute();
      videoPaths.push(videoPath);
      logger.debug(`세그먼트 ${i} 생성 완료: ${videoPath}`);
    }

    // 생성한 비디오 합치기
    const mergedPath = path.join(outputDir, "merged-video.mp4");
    const result = await FFmpegConcatBuilder.build(logger, {
      inputPaths: videoPaths,
      outputPath: mergedPath,
      tempDir: outputDir,
    });

    logger.debug(`비디오 합치기 완료: ${result}`);
  } catch (error) {
    logger.error(`빌더 예제 실행 중 오류 발생: ${error}`);
  }
}

// 예제 실행
directBuilderExample().catch((error) => {
  console.error("예제 실행 중 오류 발생:", error);
});
