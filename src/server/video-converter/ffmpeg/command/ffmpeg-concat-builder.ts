import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { Logger } from "../../../utils/logger";

/**
 * FFmpeg 영상 합치기 명령 설정 인터페이스
 */
export interface FFmpegConcatOptions {
  /** 입력 파일 경로 배열 */
  inputPaths: string[];
  /** 출력 파일 경로 */
  outputPath: string;
  /** 임시 파일 저장 디렉토리 */
  tempDir: string;
}

/**
 * FFmpeg 영상 합치기를 위한 빌더 클래스
 */
export class FFmpegConcatBuilder {
  #logger: Logger;
  #options: FFmpegConcatOptions;
  #command: ffmpeg.FfmpegCommand;
  #inputListPath: string;

  /**
   * @param logger 로깅을 위한 Logger 인스턴스
   * @param options 합치기 명령 설정 옵션
   */
  constructor(logger: Logger, options: FFmpegConcatOptions) {
    this.#logger = logger;
    this.#options = options;
    this.#command = ffmpeg();
    this.#inputListPath = path.join(
      options.tempDir,
      `input_list_${Date.now()}.txt`
    );
  }

  /**
   * 입력 파일 목록 생성
   */
  async createInputList(): Promise<this> {
    this.#logger.debug(`입력 파일 목록 생성: ${this.#inputListPath}`);

    // 입력 파일 존재 여부 확인
    for (const [index, filePath] of this.#options.inputPaths.entries()) {
      try {
        if (!fs.existsSync(filePath)) {
          this.#logger.warn(
            `파일 ${index + 1}/${
              this.#options.inputPaths.length
            }를 찾을 수 없음: ${filePath}`
          );
        } else {
          const stats = fs.statSync(filePath);
          this.#logger.debug(
            `파일 ${index + 1}/${
              this.#options.inputPaths.length
            } 확인: ${filePath} (${stats.size} 바이트)`
          );
        }
      } catch (error) {
        this.#logger.warn(`파일 확인 오류: ${error}`);
      }
    }

    // 입력 목록 파일 생성
    const fileContent = this.#options.inputPaths
      .map((file) => `file '${file}'`)
      .join("\n");

    this.#logger.debug(`입력 목록 내용:\n${fileContent}`);

    await fs.promises.writeFile(this.#inputListPath, fileContent);
    return this;
  }

  /**
   * 입력 설정
   */
  withInputOptions(): this {
    this.#command
      .input(this.#inputListPath)
      .inputOptions(["-f concat", "-safe 0"]);
    return this;
  }

  /**
   * 출력 설정
   */
  withOutputOptions(): this {
    this.#command.outputOptions(["-c copy"]).output(this.#options.outputPath);
    return this;
  }

  /**
   * 시작 이벤트 리스너 설정
   */
  withStartListener(): this {
    this.#command.on("start", (commandLine) => {
      this.#logger.debug(`FFmpeg 합치기 명령 실행: ${commandLine}`);
    });
    return this;
  }

  /**
   * 명령 실행 및 결과 처리
   */
  execute(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.#command
        .on("end", async () => {
          this.#logger.debug(`비디오 합치기 완료: ${this.#options.outputPath}`);

          // 출력 파일 확인
          try {
            const stats = fs.statSync(this.#options.outputPath);
            this.#logger.debug(`생성된 파일 크기: ${stats.size} 바이트`);
          } catch (error) {
            this.#logger.warn(`출력 파일 확인 오류: ${error}`);
          }

          // 임시 파일 삭제
          try {
            await fs.promises.unlink(this.#inputListPath);
            this.#logger.debug(`임시 파일 삭제: ${this.#inputListPath}`);
          } catch (error) {
            this.#logger.warn(`임시 파일 삭제 오류: ${error}`);
          }

          resolve(this.#options.outputPath);
        })
        .on("error", async (err, stdout, stderr) => {
          this.#logger.error(`FFmpeg 합치기 오류: ${err.message}`);
          this.#logger.error(`표준 출력: ${stdout}`);
          this.#logger.error(`오류 출력: ${stderr}`);

          // 오류 발생시에도 임시 파일 삭제 시도
          try {
            await fs.promises.unlink(this.#inputListPath);
            this.#logger.debug(`임시 파일 삭제: ${this.#inputListPath}`);
          } catch (error) {
            this.#logger.error(`임시 파일 삭제 실패: ${error}`);
          }

          reject(new Error(`FFmpeg 합치기 실패: ${err.message}`));
        })
        .run();
    });
  }

  /**
   * 빌더 패턴으로 명령 생성
   */
  static async build(
    logger: Logger,
    options: FFmpegConcatOptions
  ): Promise<string> {
    const builder = new FFmpegConcatBuilder(logger, options);

    await builder.createInputList();

    return builder
      .withInputOptions()
      .withOutputOptions()
      .withStartListener()
      .execute();
  }
}
