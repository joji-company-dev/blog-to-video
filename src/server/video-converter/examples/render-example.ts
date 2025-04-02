import path from "path";
import { FFmpegRenderer } from "../ffmpeg/ffmpeg-renderer";
import { VideoCut } from "../model/video-cut.model";

/**
 * FFmpegRenderer 사용 예시
 */
async function renderExample() {
  // 출력 디렉토리 설정
  const outputDir = path.join(process.cwd(), "output");

  // 기본 설정으로 렌더러 생성
  const renderer = new FFmpegRenderer({
    outputDir,
    debug: true,
  });

  console.log("FFmpegRenderer 초기화 완료");

  // 렌더링 옵션 매니저 가져오기
  const renderOptions = renderer.getRenderOptions();

  // 텍스트 스타일 커스터마이징
  renderOptions.setTextStyle({
    fontSize: 32,
    fontColor: "yellow",
    boxColor: "blue@0.3",
    shadow: {
      enabled: true,
      x: 3,
      y: 3,
    },
  });

  // 비디오 설정 변경
  renderOptions.setFps(24);
  renderOptions.setVideoCodec("libx264");

  // 해상도 변경
  renderOptions.setResolution(1920, 1080);

  // 비디오 컷 정의
  const videoCut: VideoCut = {
    id: "example-1",
    sceneId: "scene-1",
    subtitle: "안녕하세요! 맞춤 설정 텍스트입니다.",
    duration: 5,
    // 이미지가 없으면 검정 배경 사용
    imageUrl: undefined,
  };

  try {
    // 단일 컷 렌더링
    const outputPath = path.join(outputDir, "example-cut.mp4");
    console.log(`비디오 컷 렌더링 시작... 출력 경로: ${outputPath}`);

    const result = await renderer.renderVideoCut(videoCut, outputPath);
    console.log(`비디오 컷 렌더링 완료: ${result}`);

    // 텍스트 스타일 변경
    renderOptions.setTextStyle({
      fontSize: 24,
      fontColor: "white",
      position: {
        y: "h-100",
      },
    });

    const portraitOutput = path.join(outputDir, "example-portrait.mp4");
    console.log(`세로 방향 비디오 렌더링 시작... 출력 경로: ${portraitOutput}`);

    const portraitResult = await renderer.renderVideoCut(
      {
        ...videoCut,
        id: "example-2",
        sceneId: "scene-2",
        subtitle: "세로 방향 비디오 예시",
      },
      portraitOutput
    );

    console.log(`세로 방향 비디오 렌더링 완료: ${portraitResult}`);
  } catch (error) {
    console.error("렌더링 중 오류 발생:", error);
  }
}

// 예시 실행
renderExample().catch((error) => {
  console.error("예시 실행 중 오류 발생:", error);
});
