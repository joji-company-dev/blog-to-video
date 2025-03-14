type ErrorResponseSchema = {
  message: string;
  detail: object;
};

export class ServerErrorResponse implements ErrorResponseSchema {
  message: string;
  detail: object;

  constructor(message: string, detail: object) {
    this.message = message;
    this.detail = detail;
  }

  static fromSchema(params: ErrorResponseSchema) {
    return new ServerErrorResponse(params.message, params.detail);
  }

  static isErrorResponseSchema(obj: unknown): obj is ServerErrorResponse {
    if (typeof obj !== "object" || obj === null) return false;
    const keys = Object.keys(obj);
    if (!keys.length) return false;
    return (
      keys.some((key) => key === "message") &&
      keys.some((key) => key === "detail")
    );
  }
}
