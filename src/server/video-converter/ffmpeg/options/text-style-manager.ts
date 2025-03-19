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
  /** 텍스트 줄바꿈 설정 */
  textWrap?: {
    /** 자동 줄바꿈 사용 여부 */
    enabled: boolean;
    /** 최대 텍스트 너비 (픽셀 단위 또는 비디오 너비 대비 비율, 예: 900 또는 "0.8") */
    maxLineWidth: number | string;
    /** 줄 간격 (폰트 크기 배수) */
    lineSpacing: number;
  };
}

/**
 * 텍스트 스타일 부분 옵션 타입
 */
export type PartialTextStyleOptions = {
  [P in keyof TextStyleOptions]?: P extends "position"
    ? { x?: string; y?: string }
    : P extends "shadow"
    ? { enabled?: boolean; x?: number; y?: number; color?: string }
    : P extends "textWrap"
    ? {
        enabled?: boolean;
        maxLineWidth?: number | string;
        lineSpacing?: number;
      }
    : TextStyleOptions[P];
};

/**
 * 텍스트 스타일 관리 클래스
 */
export class TextStyleManager {
  #options: TextStyleOptions;
  #videoWidth: number;
  #videoHeight: number;

  /**
   * 기본 옵션으로 초기화
   */
  constructor(
    videoWidth: number,
    videoHeight: number,
    customOptions?: PartialTextStyleOptions
  ) {
    this.#videoWidth = videoWidth;
    this.#videoHeight = videoHeight;

    // 기본 옵션 설정
    this.#options = {
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
      textWrap: {
        enabled: true,
        maxLineWidth: "0.8", // 기본적으로 화면 너비의 80%
        lineSpacing: 1.2,
      },
    };

    // 사용자 정의 옵션이 있는 경우 기본 옵션에 병합
    if (customOptions) {
      this.mergeOptions(customOptions);
    }
  }

  /**
   * 비디오 해상도 설정
   */
  setVideoResolution(width: number, height: number): void {
    this.#videoWidth = width;
    this.#videoHeight = height;
  }

  /**
   * 모든 텍스트 스타일 옵션 반환
   */
  getOptions(): TextStyleOptions {
    return { ...this.#options };
  }

  /**
   * 텍스트 스타일 옵션 설정
   */
  setOptions(options: PartialTextStyleOptions): void {
    this.mergeOptions(options);
  }

  /**
   * 사용자 정의 옵션을 기본 옵션에 병합
   */
  mergeOptions(newOptions: PartialTextStyleOptions): void {
    if (newOptions.fontSize !== undefined) {
      this.#options.fontSize = newOptions.fontSize;
    }

    if (newOptions.fontColor !== undefined) {
      this.#options.fontColor = newOptions.fontColor;
    }

    if (newOptions.boxEnabled !== undefined) {
      this.#options.boxEnabled = newOptions.boxEnabled;
    }

    if (newOptions.boxColor !== undefined) {
      this.#options.boxColor = newOptions.boxColor;
    }

    if (newOptions.boxBorderWidth !== undefined) {
      this.#options.boxBorderWidth = newOptions.boxBorderWidth;
    }

    // position 객체 병합
    if (newOptions.position) {
      if (newOptions.position.x !== undefined) {
        this.#options.position.x = newOptions.position.x;
      }

      if (newOptions.position.y !== undefined) {
        this.#options.position.y = newOptions.position.y;
      }
    }

    // shadow 객체 병합
    if (newOptions.shadow) {
      if (newOptions.shadow.enabled !== undefined) {
        this.#options.shadow.enabled = newOptions.shadow.enabled;
      }

      if (newOptions.shadow.x !== undefined) {
        this.#options.shadow.x = newOptions.shadow.x;
      }

      if (newOptions.shadow.y !== undefined) {
        this.#options.shadow.y = newOptions.shadow.y;
      }

      if (newOptions.shadow.color !== undefined) {
        this.#options.shadow.color = newOptions.shadow.color;
      }
    }

    // textWrap 객체 병합
    if (newOptions.textWrap) {
      if (!this.#options.textWrap) {
        this.#options.textWrap = {
          enabled: true,
          maxLineWidth: "0.8",
          lineSpacing: 1.2,
        };
      }

      if (newOptions.textWrap.enabled !== undefined) {
        this.#options.textWrap.enabled = newOptions.textWrap.enabled;
      }

      if (newOptions.textWrap.maxLineWidth !== undefined) {
        this.#options.textWrap.maxLineWidth = newOptions.textWrap.maxLineWidth;
      }

      if (newOptions.textWrap.lineSpacing !== undefined) {
        this.#options.textWrap.lineSpacing = newOptions.textWrap.lineSpacing;
      }
    }
  }

  /**
   * 텍스트에 자동 줄바꿈 적용
   */
  wrapText(text: string): string[] {
    if (!this.#options.textWrap?.enabled) {
      return [text];
    }

    const maxLineWidth = this.#options.textWrap.maxLineWidth;
    let effectiveMaxWidth: number;

    // 최대 너비를 계산
    if (typeof maxLineWidth === "string" && maxLineWidth.includes(".")) {
      // 비율로 지정된 경우 (예: "0.8")
      const ratio = parseFloat(maxLineWidth);
      effectiveMaxWidth = this.#videoWidth * ratio;
    } else {
      // 픽셀로 지정된 경우
      effectiveMaxWidth =
        typeof maxLineWidth === "string"
          ? parseInt(maxLineWidth, 10)
          : maxLineWidth;
    }

    // 추정 글자당 평균 너비 (폰트 크기에 비례)
    const avgCharWidth = this.#options.fontSize * 0.6;
    const charsPerLine = Math.floor(effectiveMaxWidth / avgCharWidth);

    // 텍스트 줄바꿈 처리
    const lines: string[] = [];
    let currentLine = "";
    const words = text.split(" ");

    for (const word of words) {
      if ((currentLine + word).length <= charsPerLine) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }

        // 단어 자체가 너무 길 경우 강제 줄바꿈
        if (word.length > charsPerLine) {
          let remainingWord = word;
          while (remainingWord.length > 0) {
            const chunk = remainingWord.slice(0, charsPerLine);
            remainingWord = remainingWord.slice(charsPerLine);
            lines.push(chunk);
          }
          currentLine = "";
        } else {
          currentLine = word;
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Y 좌표 위치 계산
   */
  calculateYPosition(
    baseY: string,
    lineIndex: number,
    lineCount: number,
    lineHeight: number
  ): string {
    if (baseY.includes("h*")) {
      // h*3/4 같은 형식인 경우
      return `${baseY}+${lineIndex * lineHeight}`;
    } else if (baseY.includes("h-")) {
      // h-th-50 같은 형식인 경우
      return `${baseY}-${(lineCount - 1 - lineIndex) * lineHeight}`;
    } else {
      // 단순한 숫자나 다른 형식인 경우
      return `${baseY}+${lineIndex * lineHeight}`;
    }
  }

  /**
   * 텍스트 이스케이프 처리
   */
  escapeText(text: string): string {
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

  /**
   * 단일 텍스트 라인의 drawtext 필터 생성
   */
  createSingleLineFilter(
    fontPath: string,
    text: string,
    yPosition?: string
  ): string {
    let filter =
      `drawtext=fontfile='${fontPath}'` +
      `:text='${this.escapeText(text)}'` +
      `:fontcolor=${this.#options.fontColor}` +
      `:fontsize=${this.#options.fontSize}`;

    if (this.#options.boxEnabled) {
      filter +=
        `:box=1` +
        `:boxcolor=${this.#options.boxColor}` +
        `:boxborderw=${this.#options.boxBorderWidth}`;
    }

    filter += `:x=${this.#options.position.x}`;
    filter += `:y=${yPosition || this.#options.position.y}`;

    if (this.#options.shadow.enabled) {
      filter +=
        `:shadowx=${this.#options.shadow.x}` +
        `:shadowy=${this.#options.shadow.y}` +
        `:shadowcolor=${this.#options.shadow.color}`;
    }

    return filter;
  }

  /**
   * 텍스트 필터 문자열 생성
   */
  createTextFilterString(fontPath: string, text: string): string {
    const lines = this.wrapText(text);

    // 단일 라인이면 간단히 처리
    if (lines.length === 1) {
      return this.createSingleLineFilter(fontPath, lines[0]);
    }

    // 여러 줄 처리
    const lineHeight =
      this.#options.fontSize * (this.#options.textWrap?.lineSpacing || 1.2);
    const filters: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const yPosition = this.calculateYPosition(
        this.#options.position.y,
        i,
        lines.length,
        lineHeight
      );

      filters.push(this.createSingleLineFilter(fontPath, lines[i], yPosition));
    }

    // 모든 줄의 필터를 쉼표로 연결하여 반환
    return filters.join(",");
  }
}
