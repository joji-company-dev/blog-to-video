import ffmpeg from "fluent-ffmpeg";
import { Logger } from "../../../utils/logger";
import { VideoRenderOptions } from "../options/video-render-options-manager";

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
  /** 하드웨어 가속 사용 여부 */
  useHardwareAccel?: boolean;
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
    ];

    // 하드웨어 가속 설정
    if (this.#options.useHardwareAccel) {
      const platform = process.platform;

      if (platform === "darwin") {
        // macOS에서의 VideoToolbox 가속
        this.#command.outputOption("-c:v h264_videotoolbox");
      } else if (platform === "win32") {
        // Windows에서의 NVIDIA NVENC 가속
        this.#command.outputOption("-c:v h264_nvenc");
      } else if (platform === "linux") {
        // Linux에서의 VAAPI 가속
        this.#command
          .outputOption("-vaapi_device /dev/dri/renderD128")
          .outputOption('-vf "format=nv12,hwupload"')
          .outputOption("-c:v h264_vaapi");
      }

      this.#logger.debug(`하드웨어 가속 활성화 (${platform})`);
    } else {
      // 소프트웨어 인코딩
      this.#command.outputOption("-c:v libx264");
    }

    this.#command.outputOptions(outputOptions);
    return this;
  }

  /**
   * 리사이즈 필터를 추가합니다.
   */
  withResizeFilterWithScaleUp(): this {
    const { width, height } = this.#options.resolution;

    // 정사각형 크기 계산 (비디오 높이에 맞춤)
    const squareSize = Math.min(height, width);

    // 이미지를 squareSize x squareSize 크기로 스케일링
    const scaleFilter = `scale=${squareSize}:${squareSize}`;

    // 1:1 비율로 이미지 조정 필터
    // 원본 이미지를 먼저 정사각형으로 잘라내고
    const cropFilter = `crop=${squareSize}:${squareSize}:(${width}-${squareSize})/2:(${height}-${squareSize})/2`;

    // 비디오 프레임 중앙에 배치
    const padFilter = `pad=${width}:${height}:(${width}-${squareSize})/2:(${height}-${squareSize})/2`;

    this.#videoFilters.push(cropFilter);
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
   * 리사이즈 필터를 추가합니다.
   */
  withResizeFilterWithNoScaleUp(): this {
    const { width, height } = this.#options.resolution;

    // 정사각형 크기 계산 (비디오 높이에 맞춤)
    const squareSize = Math.min(height, width);

    // 원본 이미지가 더 작은 경우에는 원본 크기 유지
    const scaleFilter = `scale='min(${squareSize},iw)':'min(${squareSize},ih)':force_original_aspect_ratio=decrease`;

    // 이미지 중앙 정렬을 위한 패딩
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
