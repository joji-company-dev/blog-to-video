/**
 * 로깅 시스템을 위한 범용 로거 클래스
 * 다양한 컴포넌트에서 일관된 로깅 인터페이스를 제공합니다.
 */
export class Logger {
  #prefix: string;
  #debug: boolean;
  #verbose: boolean;
  /**
   * @param prefix 로그 메시지 앞에 추가될 접두사
   * @param debug 디버그 모드 활성화 여부
   * @param verbose 깊은 디버그 모드 활성화 여부
   */
  constructor(prefix: string, debug = true, verbose = false) {
    this.#prefix = prefix;
    this.#debug = debug;
    this.#verbose = verbose;
  }

  /**
   * 디버그 로그 출력
   */
  debug(message: string): void {
    if (this.#debug) {
      console.log(`[${this.#prefix}] ${message}`);
    }
  }

  verbose(message: string): void {
    if (this.#verbose) {
      console.log(`[${this.#prefix}] ${message}`);
    }
  }

  /**
   * 경고 로그 출력
   */
  warn(message: string): void {
    if (this.#debug) {
      console.warn(`[${this.#prefix}] ⚠️ ${message}`);
    }
  }

  /**
   * 에러 로그 출력
   */
  error(message: string): void {
    if (this.#debug) {
      console.error(`[${this.#prefix}] 🔴 ${message}`);
    }
  }

  /**
   * 디버그 모드 설정
   */
  setDebugMode(debug: boolean): void {
    this.#debug = debug;
  }

  /**
   * 현재 디버그 모드 상태 반환
   */
  isDebugMode(): boolean {
    return this.#debug;
  }
}
