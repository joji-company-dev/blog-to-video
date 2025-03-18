/**
 * 텍스트 스타일 설정 옵션 인터페이스
 */
export interface TextStyleOptions {
  /** 폰트 크기 */
  fontSize: number;
  /** 폰트 색상 */
  fontColor: string;
  /** 텍스트 박스 사용 여부 */
  boxEnabled: boolean;
  /** 박스 색상 (투명도 포함) */
  boxColor: string;
  /** 박스 테두리 두께 */
  boxBorderWidth: number;
  /** 텍스트 위치 */
  position: {
    /** X 좌표 (예: "(w-text_w)/2") */
    x: string;
    /** Y 좌표 (예: "h-th-50") */
    y: string;
  };
  /** 그림자 설정 */
  shadow: {
    /** 그림자 사용 여부 */
    enabled: boolean;
    /** 그림자 X 오프셋 */
    x: number;
    /** 그림자 Y 오프셋 */
    y: number;
    /** 그림자 색상 (투명도 포함) */
    color: string;
  };
}

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
  /** 텍스트 스타일 설정 */
  textStyle: TextStyleOptions;
  /** 해상도 */
  resolution: { width: number; height: number };
  /** 방향 */
  orientation: "landscape" | "portrait";
}

/**
 * 텍스트 스타일 부분 옵션 타입
 */
export type PartialTextStyleOptions = {
  [P in keyof TextStyleOptions]?: P extends "position"
    ? { x?: string; y?: string }
    : P extends "shadow"
    ? { enabled?: boolean; x?: number; y?: number; color?: string }
    : TextStyleOptions[P];
};

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
  #options: VideoRenderOptions;

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
      textStyle: {
        fontSize: 56,
        fontColor: "white",
        boxEnabled: true,
        boxColor: "black@0.5",
        boxBorderWidth: 5,
        position: {
          x: "(w-text_w)/2",
          y: "h*3/4",
        },
        shadow: {
          enabled: true,
          x: 2,
          y: 2,
          color: "black@0.3",
        },
      },
      resolution: DEFAULT_RESOLUTIONS.landscape,
      orientation: "landscape",
    };

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
    }

    if (customOptions.textStyle) {
      this.#mergeTextStyleOptions(customOptions.textStyle);
    }
  }

  /**
   * 텍스트 스타일 옵션 병합
   */
  #mergeTextStyleOptions(newOptions: Partial<TextStyleOptions>): void {
    const current = this.#options.textStyle;

    if (newOptions.fontSize !== undefined) {
      current.fontSize = newOptions.fontSize;
    }

    if (newOptions.fontColor !== undefined) {
      current.fontColor = newOptions.fontColor;
    }

    if (newOptions.boxEnabled !== undefined) {
      current.boxEnabled = newOptions.boxEnabled;
    }

    if (newOptions.boxColor !== undefined) {
      current.boxColor = newOptions.boxColor;
    }

    if (newOptions.boxBorderWidth !== undefined) {
      current.boxBorderWidth = newOptions.boxBorderWidth;
    }

    // position 객체 병합
    if (newOptions.position) {
      if (newOptions.position.x !== undefined) {
        current.position.x = newOptions.position.x;
      }

      if (newOptions.position.y !== undefined) {
        current.position.y = newOptions.position.y;
      }
    }

    // shadow 객체 병합
    if (newOptions.shadow) {
      if (newOptions.shadow.enabled !== undefined) {
        current.shadow.enabled = newOptions.shadow.enabled;
      }

      if (newOptions.shadow.x !== undefined) {
        current.shadow.x = newOptions.shadow.x;
      }

      if (newOptions.shadow.y !== undefined) {
        current.shadow.y = newOptions.shadow.y;
      }

      if (newOptions.shadow.color !== undefined) {
        current.shadow.color = newOptions.shadow.color;
      }
    }
  }

  /**
   * 모든 렌더링 옵션 반환
   */
  getOptions(): VideoRenderOptions {
    return { ...this.#options };
  }

  /**
   * 텍스트 스타일 옵션 반환
   */
  getTextStyle(): TextStyleOptions {
    return { ...this.#options.textStyle };
  }

  /**
   * 텍스트 스타일 옵션 설정
   */
  setTextStyle(textStyle: PartialTextStyleOptions): void {
    this.#mergeTextStyleOptions(textStyle as Partial<TextStyleOptions>);
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
    this.#options.resolution = { width, height };
    this.#options.orientation = width > height ? "landscape" : "portrait";
  }

  #escapeText(text: string): string {
    // FFmpeg drawtext 필터에서 사용되는 특수 문자들을 이스케이프 처리
    return text
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "'\\\\''")
      .replace(/"/g, '\\"')
      .replace(/:/g, "\\:")
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  createTextFilterString(fontPath: string, text: string): string {
    const style = this.#options.textStyle;
    let filter =
      `drawtext=fontfile='${fontPath}'` +
      `:text='${this.#escapeText(text)}'` +
      `:fontcolor=${style.fontColor}` +
      `:fontsize=${style.fontSize}`;

    if (style.boxEnabled) {
      filter +=
        `:box=1` +
        `:boxcolor=${style.boxColor}` +
        `:boxborderw=${style.boxBorderWidth}`;
    }

    filter += `:x=${style.position.x}` + `:y=${style.position.y}`;

    if (style.shadow.enabled) {
      filter +=
        `:shadowx=${style.shadow.x}` +
        `:shadowy=${style.shadow.y}` +
        `:shadowcolor=${style.shadow.color}`;
    }

    return filter;
  }
}
