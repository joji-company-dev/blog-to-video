import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import { BlogParser } from "./blog-parser.interface";
import {
  BlogBlock,
  BlogContent,
  ImageBlock,
  TextBlock,
} from "./blog-parser.model";
import { mergeLineBreak } from "../utils/text.utils";
import { log } from "../utils/logger.utils";

export class TiStoryBlogParser implements BlogParser {
  private isInitialized: boolean = false;
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.browser = await puppeteer.launch({
      defaultViewport: { width: 1920, height: 1080 },
    });
    this.page = await this.browser.newPage();
    this.isInitialized = true;
  }

  async parse(url: string): Promise<BlogContent> {
    log("🚀 티스토리 블로그 파싱 시작:", url);
    await this.initialize();

    await this.page!.goto(url, { waitUntil: "networkidle0" });
    const articleEl = await this.getArticleElement();
    const { titleEl: headerEl, contentEl } = await this.getContentElements(
      articleEl
    );

    const title = await this.parseTitle(headerEl);
    const blocks = await this.parseBlocks(contentEl);

    log("🎉 티스토리 블로그 파싱 완료");
    return { title, blocks };
  }

  private async getArticleElement(): Promise<ElementHandle<Element>> {
    const articleEl = await this.page!.$("article");
    if (articleEl) {
      log("🔍 article 요소 찾기 완료");
      return articleEl;
    }
    const mainEl = await this.page!.$("main");
    if (mainEl) {
      log("🔍 main 요소 찾기 완료");
      return mainEl;
    }
    throw new Error("article 또는 main 요소를 찾을 수 없습니다.");
  }

  private async getContentElements(articleEl: ElementHandle<Element>) {
    let titleEl: ElementHandle<Element> | null;
    let contentEl: ElementHandle<Element> | null;
    const headingEl = await articleEl.$("h1");
    if (headingEl) {
      titleEl = headingEl;
    } else {
      titleEl = await articleEl.$(".title_view, .title-article, h2");
    }
    if (!titleEl) {
      throw new Error("제목을 찾을 수 없습니다.");
    }
    log("🔍 header 요소 찾기 완료");

    const entryContentEl = await articleEl.$(".entry-content");
    if (entryContentEl) {
      contentEl = entryContentEl;
    } else {
      contentEl = await articleEl.$(".article-view, .article_view");
    }

    if (!contentEl) {
      throw new Error(
        ".entry-content 또는 .article_view 요소를 찾을 수 없습니다."
      );
    }

    return { titleEl, contentEl };
  }

  private async parseTitle(titleEl: ElementHandle<Element>): Promise<string> {
    const titleText = mergeLineBreak(
      (await titleEl.evaluate((el) => el.textContent)) ?? ""
    )?.trim();
    log("📝 블로그 제목 파싱 완료:", titleText);
    return titleText ?? "";
  }

  private async parseBlocks(
    contentEl: ElementHandle<Element>
  ): Promise<BlogBlock[]> {
    const childElements = await contentEl.$$("p, figure", {
      isolate: false,
    });
    log(`🔄 컨텐츠 요소 ${childElements.length}개 발견, 파싱 시작`);

    const blocks = await Promise.all(
      childElements.map((element) => this.parseBlock(element))
    ).then((blocks) =>
      blocks.filter((block): block is BlogBlock[] => block !== null).flat()
    );

    log(`✅ 총 ${blocks.length}개의 블록 파싱 완료`);
    return blocks;
  }

  private async parseBlock(
    element: ElementHandle<HTMLElement>
  ): Promise<BlogBlock[] | null> {
    const tagName = await element.evaluate((el) => el.tagName);

    if (tagName === "P") {
      return this.parseTextBlock(element);
    }
    return this.parseImageBlock(element);
  }

  private async parseTextBlock(
    element: ElementHandle<HTMLElement>
  ): Promise<TextBlock[] | null> {
    const text = await element.evaluate((el) => el.innerText);
    const trimmedText = (text ?? "").trim();

    if (!trimmedText) {
      return null;
    }

    return [
      {
        type: "text",
        value: trimmedText,
      },
    ];
  }

  private async parseImageBlock(
    element: ElementHandle<Element>
  ): Promise<ImageBlock[] | null> {
    const imageElements = await element.$$("img");
    if (imageElements.length === 0) {
      return null;
    }

    const srcs = await Promise.all(
      imageElements.map(async (imageElement) => {
        const src = await imageElement.evaluate((el) => el.src);
        return src;
      })
    );

    return srcs.map((src) => ({
      type: "image",
      value: { src },
    }));
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
