import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { Logger } from "../../utils/logger";
import { VideoCut } from "../model/video-cut.model";
import {
  FFmpegCommandBuilder,
  FFmpegCommandOptions,
} from "./command/ffmpeg-command-builder";
import { FFmpegConcatBuilder } from "./command/ffmpeg-concat-builder";
import {
  VideoRenderOptions,
  VideoRenderOptionsManager,
} from "./options/video-render-options-manager";

/**
 * FFmpegRenderer 설정 옵션 인터페이스
 */
export interface FFmpegRendererOptions {
  /** 출력 디렉토리 경로 */
  outputDir: string;
  /** 디버그 모드 활성화 여부 */
  debug?: boolean;
  /** 사용할 폰트 경로 */
  fontPath?: string;
  /** 비디오 렌더링 옵션 */
  renderOptions?: Partial<VideoRenderOptions>;
  /** 하드웨어 가속 사용 여부 */
  useHardwareAccel?: boolean;
}

/**
 * 시스템별 기본 폰트 경로
 */
const SYSTEM_FONTS = {
  // macOS
  macos: [
    "/System/Library/Fonts/AppleSDGothicNeo.ttc",
    "/System/Library/Fonts/Helvetica.ttc",
  ],
  // Windows
  windows: ["C:\\Windows\\Fonts\\malgun.ttf", "C:\\Windows\\Fonts\\arial.ttf"],
  // Linux
  linux: [
    "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
  ],
};

/**
 * fluent-ffmpeg를 사용하여 영상을 렌더링하는 클래스
 */
export class FFmpegRenderer {
  #outputDir: string;
  #fontPath: string;
  #logger: Logger;
  #renderOptions: VideoRenderOptionsManager;
  #useHardwareAccel: boolean;

  constructor(options: FFmpegRendererOptions) {
    this.#outputDir = options.outputDir;
    this.#logger = new Logger("FFmpegRenderer", options.debug ?? true);
    this.#fontPath = options.fontPath ?? this.#findSystemFont();
    this.#renderOptions = new VideoRenderOptionsManager(options.renderOptions);
    this.#useHardwareAccel = options.useHardwareAccel ?? false;

    this.#ensureOutputDirExists();
    this.#checkFFmpegInstallation();
  }

  #findSystemFont(): string {
    let systemFonts: string[] = [];

    if (process.platform === "darwin") {
      systemFonts = SYSTEM_FONTS.macos;
    } else if (process.platform === "win32") {
      systemFonts = SYSTEM_FONTS.windows;
    } else {
      systemFonts = SYSTEM_FONTS.linux;
    }

    for (const font of systemFonts) {
      try {
        if (fs.existsSync(font)) {
          this.#logger.debug(`폰트 파일 발견: ${font}`);
          return font;
        }
      } catch (error) {
        this.#logger.error(`폰트 확인 중 오류: ${error}`);
      }
    }

    this.#logger.warn(
      `사용 가능한 폰트를 찾을 수 없습니다. 텍스트 렌더링에 문제가 발생할 수 있습니다.`
    );
    return systemFonts[0];
  }

  #checkFFmpegInstallation() {
    try {
      const command = ffmpeg();
      this.#logger.debug("FFmpeg 모듈이 정상적으로 로드되었습니다.");
      command.on("error", () => {});
    } catch (error) {
      this.#logger.error(`FFmpeg 로드 오류: ${error}`);
      this.#logger.warn(
        "시스템에 FFmpeg가 설치되어 있는지 확인하세요: ffmpeg -version"
      );
    }
  }

  /**
   * 렌더링 옵션 매니저 반환
   */
  getRenderOptions(): VideoRenderOptionsManager {
    return this.#renderOptions;
  }

  /**
   * 이미지와 텍스트로 구성된 비디오 컷을 렌더링합니다.
   */
  async renderVideoCut(cut: VideoCut, outputPath: string): Promise<string> {
    this.#logger.debug(`비디오 컷 렌더링 시작 - ID: ${cut.id}`);

    const imageUrl = cut.imageUrl;
    const renderOpts = this.#renderOptions.getOptions();

    const commandOptions: FFmpegCommandOptions = {
      outputPath,
      duration: cut.duration,
      resolution: renderOpts.resolution,
      renderOptions: renderOpts,
      useHardwareAccel: this.#useHardwareAccel,
    };

    const builder = new FFmpegCommandBuilder(commandOptions);

    if (await this.#canUseImage(imageUrl)) {
      builder.withImageInput(imageUrl as string);
    } else {
      builder.withBlackBackground();
    }

    builder
      .withOutputOptions()
      .withStartListener()
      .withProgressListener()
      .withResizeFilter();

    // 헤더 텍스트 필터 추가 (상단)
    if (cut.header) {
      const headerStyle = {
        ...this.#renderOptions.getOptions().textStyle,
        position: { x: "(w-text_w)/2", y: "h*0.1" }, // 상단 10% 위치
        fontSize: 60,
        fontColor: "white",
        boxColor: "black@0.6",
        shadow: { enabled: true, x: 2, y: 2, color: "black@0.5" },
      };

      this.#renderOptions.setTextStyle(headerStyle);
      builder.withTextFilter(
        this.#renderOptions.createTextFilterString(this.#fontPath, cut.header)
      );
    }

    // 본문 텍스트 필터 추가 (중앙)
    if (cut.subtitle) {
      const subtitleStyle = {
        ...this.#renderOptions.getOptions().textStyle,
        position: { x: "(w-text_w)/2", y: "h*0.5" }, // 화면 중앙
        fontSize: 56,
        fontColor: "white",
        boxColor: "black@0.5",
      };

      this.#renderOptions.setTextStyle(subtitleStyle);
      builder.withTextFilter(
        this.#renderOptions.createTextFilterString(this.#fontPath, cut.subtitle)
      );
    }

    // 푸터 텍스트 필터 추가 (하단)
    if (cut.footer) {
      const footerStyle = {
        ...this.#renderOptions.getOptions().textStyle,
        position: { x: "(w-text_w)/2", y: "h*0.9" }, // 하단 10% 위치
        fontSize: 48,
        fontColor: "white",
        boxColor: "black@0.5",
        shadow: { enabled: true, x: 1, y: 1, color: "black@0.4" },
      };

      this.#renderOptions.setTextStyle(footerStyle);
      builder.withTextFilter(
        this.#renderOptions.createTextFilterString(this.#fontPath, cut.footer)
      );
    }

    builder.applyFilters().withOutput();

    return builder.execute();
  }

  /**
   * 주어진 이미지 URL에 대해 검은 배경을 사용해야 하는지 확인합니다.
   * @param imageUrl 이미지 URL 또는 파일 경로
   * @returns 검은 배경을 사용해야 하면 true, 이미지를 사용해야 하면 false
   */
  async #canUseImage(imageUrl?: string): Promise<boolean> {
    // 이미지 URL이 없는 경우
    if (!imageUrl) {
      return false;
    }

    this.#logger.debug(`이미지 경로: ${imageUrl}`);

    // GIF 파일인지 확인
    const isGif = imageUrl.toLowerCase().endsWith(".gif");
    if (isGif) {
      this.#logger.debug(`GIF 이미지가 감지되었습니다: ${imageUrl}`);
    }

    // 로컬 이미지 파일인 경우 존재 여부 확인
    if (this.#isLocalFilePath(imageUrl)) {
      try {
        if (!fs.existsSync(imageUrl)) {
          this.#logger.warn(`이미지 파일을 찾을 수 없습니다: ${imageUrl}.`);
          return false;
        }
        return true; // 파일이 존재하면 이미지 사용
      } catch (error) {
        this.#logger.warn(`이미지 파일 확인 중 오류: ${error}.`);
        return false;
      }
    }

    // URL인 경우 그대로 사용 (유효성 검사 없음)
    return true;
  }

  /**
   * 여러 비디오 컷을 하나의 장면으로 합칩니다.
   */
  async concatSceneCuts(
    cutPaths: string[],
    outputPath: string
  ): Promise<string> {
    this.#logger.debug(`비디오 컷 합치기 시작 - 컷 수: ${cutPaths.length}`);
    this.#logger.debug(`출력 경로: ${outputPath}`);

    return FFmpegConcatBuilder.build(this.#logger, {
      inputPaths: cutPaths,
      outputPath,
      tempDir: this.#outputDir,
    });
  }

  /**
   * 여러 장면을 하나의 영상으로 합칩니다.
   */
  async concatScenes(
    scenePaths: string[],
    outputPath: string
  ): Promise<string> {
    this.#logger.debug(
      `최종 비디오 합치기 시작 - 장면 수: ${scenePaths.length}`
    );
    this.#logger.debug(`최종 출력 경로: ${outputPath}`);
    return this.concatSceneCuts(scenePaths, outputPath);
  }

  #isLocalFilePath(path: string): boolean {
    return (
      path.startsWith("/") ||
      path.startsWith("./") ||
      path.startsWith("../") ||
      /^[A-Z]:\\/.test(path)
    );
  }

  #ensureOutputDirExists() {
    try {
      if (!fs.existsSync(this.#outputDir)) {
        this.#logger.debug(`출력 디렉토리 생성: ${this.#outputDir}`);
        fs.mkdirSync(this.#outputDir, { recursive: true });
      } else {
        this.#logger.debug(`출력 디렉토리 확인: ${this.#outputDir}`);
      }
    } catch (error) {
      this.#logger.error(`출력 디렉토리 생성 오류: ${error}`);
    }
  }
}
