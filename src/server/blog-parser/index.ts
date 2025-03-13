import "server-only";
import { BlogParser } from "./blog-parser.interface";
import { NaverBlogParser } from "./naver-blog-parser";
import { TiStoryBlogParser } from "./ti-story-blog-parser";

export class BlogParserFactory {
  create(url: string): BlogParser {
    if (url.includes("naver.com")) {
      return new NaverBlogParser();
    }

    if (url.includes("tistory.com")) {
      return new TiStoryBlogParser();
    }

    throw new Error("지원하지 않는 블로그 플랫폼입니다.");
  }
}
