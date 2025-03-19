import { Logger } from "@/src/server/utils/logger";

export interface ITaskQueue {
  processingTask: Promise<string | void> | null;
  add: (task: () => Promise<string | void>) => void;
  process: () => Promise<void>;
}

export class TaskQueue implements ITaskQueue {
  #logger = new Logger("TaskQueue", true);
  #queue: (() => Promise<string | void>)[] = [];
  #processingTask: Promise<string | void> | null = null;

  get processingTask() {
    return this.#processingTask;
  }

  add(task: () => Promise<string | void>) {
    this.#logger.debug(`작업 추가: ${task}`);
    this.#queue.push(task);
  }

  async process() {
    while (this.#queue.length > 0) {
      const task = this.#queue.shift();
      if (task) {
        this.#logger.debug(`작업 처리 시작: ${task}`);
        try {
          this.#processingTask = task();
          await this.#processingTask;
        } catch (error) {
          this.#logger.error(`작업 처리 오류: ${error}`);
        } finally {
          this.#processingTask = null;
        }
      }
    }
  }
}
