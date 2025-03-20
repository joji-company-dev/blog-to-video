import {
  BlogBlock,
  blogBlockModel,
  ImageBlock,
  imageBlockModel,
  TextBlock,
  textBlockModel,
} from "@/src/common/model/blocks";
import { BlogContent } from "@/src/common/model/blog-content.model";
import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import { log } from "../utils/logger.utils";
import { mergeLineBreak, mergeSpace } from "../utils/text.utils";
import { BlogParser } from "./blog-parser.interface";

export class NaverBlogParser implements BlogParser {
  private isInitialized: boolean = false;
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor() {}

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.browser = await puppeteer.launch({
      defaultViewport: { width: 1920, height: 1080 },
    });
    this.page = await this.browser.newPage();
    this.isInitialized = true;

    log("✅ 브라우저 초기화 완료");
  }

  async parse(url: string): Promise<BlogContent> {
    log("🚀 네이버 블로그 파싱 시작:", url);
    await this.initialize();

    await this.navigateToIframe(url);
    const seViewerEl = await this.getSeViewer();
    const { documentTitleEl, mainContainerEl } = await this.getContentElements(
      seViewerEl
    );

    if (!documentTitleEl || !mainContainerEl) {
      throw new Error("블로그 제목 또는 본문 요소를 찾을 수 없습니다.");
    }

    const title = await this.parseTitle(documentTitleEl);
    const blocks = await this.parseBlocks(mainContainerEl);

    log("🎉 네이버 블로그 파싱 완료");
    return { title, blocks };
  }

  private async navigateToIframe(url: string): Promise<void> {
    await this.page!.goto(url, { waitUntil: "networkidle0" });
    log("📄 블로그 페이지 로딩 완료");

    const iframe = await this.page?.locator("iframe").waitHandle();
    if (!iframe) {
      throw new Error("iframe을 찾을 수 없습니다.");
    }
    log("🔍 iframe 요소 찾기 완료");

    const iframeUrl = await iframe.evaluate((el) => el.src);
    log("🔗 iframe URL 추출:", iframeUrl);

    await this.page!.goto(iframeUrl, { waitUntil: "networkidle2" });
    log("📄 iframe 내부 페이지 로딩 완료");
  }

  private async getSeViewer() {
    await this.page!.waitForSelector(".se-viewer");
    log("🔍 본문 컨테이너(.se-viewer) 찾기 완료");

    const seViewerEl = await this.page?.$(".se-viewer");
    if (!seViewerEl) {
      throw new Error("seViewer을 찾을 수 없습니다.");
    }
    return seViewerEl;
  }

  private async getContentElements(seViewerEl: ElementHandle<Element>) {
    const documentTitleEl = await seViewerEl.$(".se-documentTitle");
    const mainContainerEl = await seViewerEl.$(".se-main-container");
    if (!mainContainerEl) {
      throw new Error("mainContainer을 찾을 수 없습니다.");
    }
    return { documentTitleEl, mainContainerEl };
  }

  private async parseTitle(
    documentTitleEl: ElementHandle<Element>
  ): Promise<string> {
    const titleText = mergeLineBreak(
      (await documentTitleEl?.$eval(
        ".se-title-text",
        (el: Element) => el.textContent
      )) ?? ""
    )?.trim();
    log("📝 블로그 제목 파싱 완료:", titleText);
    return titleText ?? "";
  }

  private async parseBlocks(
    mainContainerEl: ElementHandle<Element>
  ): Promise<BlogBlock[]> {
    const childElements = await mainContainerEl.$$(".se-component");
    log(`🔄 컨텐츠 요소 ${childElements.length}개 발견, 파싱 시작`);

    const blocks = await Promise.all(
      childElements.map((childElement) => this.parseBlock(childElement))
    ).then((blocks) =>
      blocks.filter((block): block is BlogBlock => block !== null)
    );

    log(`✅ 총 ${blocks.length}개의 블록 파싱 완료`);
    return blocks;
  }

  private async parseBlock(
    childElement: ElementHandle<Element>
  ): Promise<BlogBlock | null> {
    const className = await childElement.evaluate(
      (el: Element) => el.className
    );

    if (className.includes("se-image") || className.includes("se-imageStrip")) {
      const imageBlock = await this.parseImageBlock(childElement);
      if (!imageBlock) {
        return null;
      }
      return blogBlockModel.parse(imageBlock);
    }
    const textBlock = await this.parseTextBlock(childElement);
    if (textBlock) {
      return blogBlockModel.parse(textBlock);
    }
    return null;
  }

  private async parseImageBlock(
    element: ElementHandle<Element>
  ): Promise<ImageBlock | null> {
    const imageElement = await element.$("img");
    if (!imageElement) {
      return null;
    }

    const src = await imageElement.evaluate(
      (el: HTMLImageElement) => el.getAttribute("data-lazy-src") || el.src
    );

    const imageBlock = imageBlockModel.parse({
      type: "image",
      value: {
        src: src ?? "",
      },
    });

    return imageBlock;
  }

  private async parseTextBlock(
    element: ElementHandle<Element>
  ): Promise<TextBlock | null> {
    const text = await element.evaluate((el: Element) => el.textContent);
    const trimmedText = mergeLineBreak(mergeSpace(text ?? "")).trim();

    if (!trimmedText) {
      return null;
    }

    const textBlock = textBlockModel.parse({
      type: "text",
      value: trimmedText,
    });

    return textBlock;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
