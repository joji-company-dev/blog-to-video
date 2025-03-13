import { CustomError } from "ts-custom-error";

export class ServerError extends CustomError {
  code?: string;

  static messages = {
    INTERNET_CONNECTION: "INTERNET_CONNECTION",
    SERVER_RESPONSE: "SERVER_RESPONSE",
    AUTHENTICATION: "AUTHENTICATION",
    AUTHORIZATION: "AUTHORIZATION",
  };

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }

  static isServerError(error: unknown): error is ServerError {
    return error instanceof ServerError;
  }

  isInternetConnectionError() {
    return (
      ServerError.isServerError(this) &&
      this.message === ServerError.messages.INTERNET_CONNECTION
    );
  }

  isServerResponseError() {
    return (
      ServerError.isServerError(this) &&
      this.message === ServerError.messages.SERVER_RESPONSE
    );
  }

  isAuthenticationError() {
    return (
      ServerError.isServerError(this) &&
      this.message === ServerError.messages.AUTHENTICATION
    );
  }

  isAuthorizationError() {
    return (
      ServerError.isServerError(this) &&
      this.message === ServerError.messages.AUTHORIZATION
    );
  }
}
