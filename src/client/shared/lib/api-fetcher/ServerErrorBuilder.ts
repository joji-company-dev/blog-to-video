import { ServerError } from "./ServerError";

/**
 * @description ServerError를 생성해주는 Builder입니다.
 */
export class ServerErrorBuilder {
  private constructor() {
    // do nothing
  }

  /**
   * @description 인터넷 연결에 문제가 있음을 나타내는 에러를 생성합니다.
   */
  static buildInternetConnectionError() {
    return new ServerError(ServerError.messages.INTERNET_CONNECTION);
  }

  /**
   * @description 서버 응답에 문제가 있음을 나타내는 에러를 생성합니다.
   * @param {string} statusCode
   */
  static buildServerResponseError(statusCode: string, message?: string) {
    return new ServerError(
      message ?? ServerError.messages.SERVER_RESPONSE,
      statusCode
    );
  }

  static buildAuthenticationError() {
    return new ServerError(ServerError.messages.AUTHENTICATION);
  }

  static buildAuthorizationError() {
    return new ServerError(ServerError.messages.AUTHORIZATION);
  }
}
