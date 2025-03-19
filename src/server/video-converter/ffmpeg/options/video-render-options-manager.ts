import {
  PartialTextStyleOptions,
  TextStyleManager,
  TextStyleOptions,
} from "./text-style-manager";

/**
/**
 * 비디오 렌더링 기본 옵션 인터페이스
 */
export interface VideoRenderOptions {
  /** 초당 프레임 수 */
  fps: number;
  /** 픽셀 포맷 */
  pixelFormat: string;
  /** 비디오 코덱 */
  videoCodec: string;
  /** 해상도 */
  resolution: { width: number; height: number };
  /** 방향 */
  orientation: "landscape" | "portrait";

  /** 텍스트 스타일 옵션 */
  textStyle: TextStyleOptions;
}

const DEFAULT_RESOLUTIONS: Record<
  "landscape" | "portrait",
  { width: number; height: number }
> = {
  landscape: { width: 1280, height: 720 },
  portrait: { width: 720, height: 1280 },
};

/**
 * 비디오 렌더링 옵션 관리 클래스
 */
export class VideoRenderOptionsManager {
  #options: Omit<VideoRenderOptions, "textStyle">;
  #textStyleManager: TextStyleManager;

  /**
   * 기본 옵션으로 초기화
   */
  constructor(
    customOptions?: Partial<Omit<VideoRenderOptions, "orientation">>
  ) {
    // 기본 옵션 설정
    this.#options = {
      fps: 30,
      pixelFormat: "yuv420p",
      videoCodec: "libx264",
      resolution: DEFAULT_RESOLUTIONS.landscape,
      orientation: "landscape",
    };

    // 텍스트 스타일 매니저 초기화
    this.#textStyleManager = new TextStyleManager(
      this.#options.resolution.width,
      this.#options.resolution.height,
      customOptions?.textStyle
    );

    // 사용자 정의 옵션이 있는 경우 기본 옵션에 병합
    if (customOptions) {
      this.#mergeOptions(customOptions);
    }
  }

  /**
   * 사용자 정의 옵션을 기본 옵션에 병합
   */
  #mergeOptions(customOptions: Partial<VideoRenderOptions>): void {
    if (customOptions.fps !== undefined) {
      this.#options.fps = customOptions.fps;
    }

    if (customOptions.pixelFormat !== undefined) {
      this.#options.pixelFormat = customOptions.pixelFormat;
    }

    if (customOptions.videoCodec !== undefined) {
      this.#options.videoCodec = customOptions.videoCodec;
    }

    if (customOptions.resolution) {
      this.#options.resolution = customOptions.resolution;
      this.#options.orientation =
        customOptions.resolution.width > customOptions.resolution.height
          ? "landscape"
          : "portrait";

      // 텍스트 스타일 매니저에 해상도 업데이트
      this.#textStyleManager.setVideoResolution(
        customOptions.resolution.width,
        customOptions.resolution.height
      );
    }

    if (customOptions.textStyle) {
      this.#textStyleManager.mergeOptions(customOptions.textStyle);
    }
  }

  /**
   * 모든 렌더링 옵션 반환
   */
  getOptions(): VideoRenderOptions {
    return {
      ...this.#options,
      textStyle: this.#textStyleManager.getOptions(),
    };
  }

  /**
   * 텍스트 스타일 옵션 설정
   */
  setTextStyle(textStyle: PartialTextStyleOptions): void {
    this.#textStyleManager.setOptions(textStyle);
  }

  /**
   * FPS 설정
   */
  setFps(fps: number): void {
    this.#options.fps = fps;
  }

  /**
   * 픽셀 포맷 설정
   */
  setPixelFormat(format: string): void {
    this.#options.pixelFormat = format;
  }

  /**
   * 비디오 코덱 설정
   */
  setVideoCodec(codec: string): void {
    this.#options.videoCodec = codec;
  }

  /**
   * 해상도 설정
   */
  setResolution(width: number, height: number): void {
    if (width < 320 || height < 240) {
      throw new Error("Resolution must be greater than 320x240");
    }

    this.#options.resolution = { width, height };
    this.#options.orientation = width > height ? "landscape" : "portrait";

    // 텍스트 스타일 매니저에 해상도 업데이트
    this.#textStyleManager.setVideoResolution(width, height);
  }

  /**
   * 텍스트 필터 문자열 생성
   */
  createTextFilterString(fontPath: string, text: string): string {
    return this.#textStyleManager.createTextFilterString(fontPath, text);
  }
}
