import ffmpeg from "fluent-ffmpeg";
import { Logger } from "../../../utils/logger";
import { VideoRenderOptions } from "../options/video-render-options";

/**
 * FFmpeg 명령 설정 인터페이스
 */
export interface FFmpegCommandOptions {
  /** 출력 파일 경로 */
  outputPath: string;
  /** 지속 시간 (초) */
  duration?: number;
  /** 해상도 */
  resolution: { width: number; height: number };
  /** 렌더링 옵션 */
  renderOptions: VideoRenderOptions;
  /** 깊은 디버그 모드 활성화 여부 */
  verbose?: boolean;
}

/**
 * FFmpeg 명령을 빌더 패턴으로 생성하는 클래스
 */
export class FFmpegCommandBuilder {
  #command: ffmpeg.FfmpegCommand;
  #logger: Logger;
  #videoFilters: string[] = [];
  #options: FFmpegCommandOptions;
  #useBlackBackground: boolean = false;

  /**
   * @param options 명령 설정 옵션
   * @param logger 로깅을 위한 Logger 인스턴스
   */
  constructor(options: FFmpegCommandOptions, logger?: Logger) {
    this.#logger =
      logger ?? new Logger("FFmpegCommandBuilder", true, options.verbose);
    this.#command = ffmpeg();
    this.#options = options;
  }

  withImageInput(imagePath: string): this {
    this.#logger.debug(`이미지 입력 설정: ${imagePath}`);

    const isGif = imagePath.toLowerCase().includes(".gif");

    if (isGif) {
      this.#logger.debug(
        `GIF 이미지가 감지되었습니다. 애니메이션 보존 모드로 설정합니다.`
      );
      this.#command = ffmpeg()
        .input(imagePath)
        .inputOptions(["-ignore_loop", "0"]);
    } else {
      this.#command = ffmpeg().input(imagePath).inputOptions(["-loop", "1"]);
    }

    return this;
  }

  withBlackBackground(): this {
    if (!this.#options.duration) {
      throw new Error("검정 배경 사용 시 duration이 필요합니다.");
    }

    const { width, height } = this.#options.resolution;
    const fps = this.#options.renderOptions.fps;
    const duration = this.#options.duration;

    const cmd = bypass(ffmpeg())
      .input(`color=c=black:s=${width}x${height}:r=${fps}:d=${duration}`)
      .inputFormat("lavfi");

    this.#command = cmd;
    this.#useBlackBackground = true;
    return this;
  }

  /**
   * 출력 옵션 설정
   */
  withOutputOptions(): this {
    const renderOpts = this.#options.renderOptions;
    const outputOptions = [
      // 검정 배경에 이미 duration이 포함된 경우 제외
      ...(this.#useBlackBackground || !this.#options.duration
        ? []
        : [`-t ${this.#options.duration}`]),
      "-pix_fmt",
      renderOpts.pixelFormat,
      "-c:v",
      renderOpts.videoCodec,
    ];

    this.#command.outputOptions(outputOptions);
    return this;
  }

  /**
   * 리사이즈 필터를 추가합니다.
   */
  withResizeFilter(): this {
    const { width, height } = this.#options.resolution;

    // 리사이즈 필터 문자열 생성
    const scaleFilter = `scale=w='min(${width},iw)':h='min(${height},ih)',setsar=1`;
    const padFilter = `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`;

    this.#videoFilters.push(scaleFilter);
    this.#videoFilters.push(padFilter);

    // libx264 코덱을 사용하는 경우 자동으로 짝수 크기 조정
    if (this.#options.renderOptions.videoCodec === "libx264") {
      this.#logger.verbose("libx264 코덱 감지: 이미지를 짝수 크기로 조정");
      this.#videoFilters.push("scale=trunc(iw/2)*2:trunc(ih/2)*2");
    }

    return this;
  }

  /**
   * 텍스트 필터 추가
   */
  withTextFilter(textFilterString: string): this {
    this.#logger.verbose(`텍스트 필터: ${textFilterString}`);

    this.#videoFilters.push(textFilterString);
    return this;
  }

  /**
   * 모든 필터 적용
   */
  applyFilters(): this {
    if (this.#videoFilters.length > 0) {
      this.#logger.debug(`적용할 비디오 필터: ${this.#videoFilters.length}개`);
      this.#logger.verbose(`적용할 비디오 필터: ${this.#videoFilters}`);
      try {
        this.#command.videoFilters(this.#videoFilters);
        this.#logger.debug("비디오 필터 적용 완료");
      } catch (error) {
        this.#logger.error(`비디오 필터 적용 오류: ${error}`);
        this.#logger.warn("필터 적용 없이 계속 진행합니다.");
      }
    }

    return this;
  }

  /**
   * 출력 파일 설정
   */
  withOutput(): this {
    this.#command.output(this.#options.outputPath);
    return this;
  }

  /**
   * 진행 상황 이벤트 리스너 설정
   */
  withProgressListener(): this {
    const totalTime = this.#options.duration ?? 0;
    this.#command.on("progress", (progress) => {
      const time = parseInt(progress.timemark.replace(/:/g, ""));
      const percent = (time / totalTime) * 100;
      this.#logger.debug(
        `진행 상황: ${percent}%, 프레임: ${progress.frames}, FPS: ${progress.currentFps}`
      );
    });

    return this;
  }

  /**
   * 명령 실행 시작 이벤트 리스너 설정
   */
  withStartListener(): this {
    this.#command.on("start", (commandLine: string) => {
      this.#logger.verbose(`FFmpeg 명령 실행: ${commandLine}`);
    });

    return this;
  }

  /**
   * 최종 명령 객체 반환
   */
  build(): ffmpeg.FfmpegCommand {
    return this.#command;
  }

  /**
   * 명령 실행 및 결과 처리
   * @returns 출력 파일 경로를 포함하는 Promise
   */
  execute(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.#command
        .on("end", () => {
          this.#logger.debug(`비디오 렌더링 완료: ${this.#options.outputPath}`);
          resolve(this.#options.outputPath);
        })
        .on("error", (err, stdout, stderr) => {
          this.#logger.error(`FFmpeg 오류: ${err.message}`);
          this.#logger.error(`표준 출력: ${stdout}`);
          this.#logger.error(`오류 출력: ${stderr}`);
          reject(new Error(`FFmpeg 명령 실패: ${err.message}`));
        })
        .run();
    });
  }
}

/**
 * fluent-ffmpeg 모듈의 버그를 해결하기 위한 유틸리티 함수
 */
const bypass = (command: ffmpeg.FfmpegCommand): ffmpeg.FfmpegCommand => {
  const bk = command.availableFormats;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  command.availableFormats = (cb: (err: any, data: any) => void) => {
    bk.bind(command)((err, data) => {
      const lavfi = {
        canDemux: true,
        canMux: true,
        description: "Lavfi",
      };
      cb(err, { ...data, lavfi });
    });
  };
  return command;
};
