import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { FFmpegRenderer } from "../ffmpeg/ffmpeg-renderer";
import { VideoCut } from "../model/video-cut.model";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 비디오 컷 렌더링 예제
 *
 * 이 예제는 video-cuts-fixture.json 파일을 읽어서
 * FFmpegRenderer를 사용하여 비디오를 렌더링하는 방법을 보여줍니다.
 */
async function renderVideoExample() {
  try {
    // 1. 출력 디렉토리 설정
    const outputDir = path.join(process.cwd(), "public/videos");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 2. Fixture JSON 파일 로드

    const fixtureFilePath = path.join(__dirname, "video-cuts-fixture.json");
    const fixtureData = JSON.parse(fs.readFileSync(fixtureFilePath, "utf8"));
    const cuts: VideoCut[] = fixtureData.cuts;

    console.log(`총 ${cuts.length}개의 비디오 컷을 렌더링합니다.`);

    // 3. FFmpegRenderer 초기화
    const renderer = new FFmpegRenderer({
      outputDir,
      debug: true,
      renderOptions: {
        resolution: { width: 1080, height: 1920 },
        fps: 30,
      },
    });

    // 4. 각 컷 렌더링
    const cutOutputPaths: string[] = [];
    for (const [index, cut] of cuts.entries()) {
      console.log(`[${index + 1}/${cuts.length}] 컷 렌더링: ${cut.id}`);

      const outputFileName = `cut-${cut.id}.mp4`;
      const outputPath = path.join(outputDir, outputFileName);

      const renderedPath = await renderer.renderVideoCut(cut, outputPath);
      cutOutputPaths.push(renderedPath);

      console.log(`컷 렌더링 완료: ${renderedPath}`);
    }

    // 5. 모든 컷을 하나의 장면으로 합치기
    const sceneOutputPath = path.join(outputDir, "scene-final.mp4");
    const finalVideoPath = await renderer.concatSceneCuts(
      cutOutputPaths,
      sceneOutputPath
    );

    console.log(`최종 비디오 파일이 생성되었습니다: ${finalVideoPath}`);
    console.log("렌더링이 완료되었습니다!");

    return finalVideoPath;
  } catch (error) {
    console.error("렌더링 중 오류가 발생했습니다:", error);
    throw error;
  }
}

console.log("비디오 렌더링 예제를 시작합니다...");
renderVideoExample()
  .then((outputPath) => {
    console.log(`작업이 완료되었습니다. 결과 파일: ${outputPath}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("예제 실행 중 오류가 발생했습니다:", error);
    process.exit(1);
  });
