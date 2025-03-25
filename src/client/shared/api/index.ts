import * as blogParserFetcher from "./blog-parser/fetcher";
import * as scriptifyTextBlocksFetcher from "./scriptify-text-blocks/fetcher";
import * as sequencifyBlogFetcher from "./sequencify-blog/fetcher";
import * as videoApiFetcher from "./to-video/to-video.fetcher";

export const apiFetchers = {
  blogParser: blogParserFetcher,
  videoApi: videoApiFetcher,
  scriptifyTextBlocks: scriptifyTextBlocksFetcher,
  sequencifyBlog: sequencifyBlogFetcher,
};
