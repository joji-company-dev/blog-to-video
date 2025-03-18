import OpenAI from "openai";
import "server-only";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_PROJECT_ID = process.env.OPENAI_PROJECT_ID;
const OPENAI_ORGANIZATION_ID = process.env.OPENAI_ORGANIZATION_ID;

export class OpenaiClient {
  private _client: OpenAI;

  constructor() {
    const openAi = new OpenAI({
      apiKey: OPENAI_API_KEY,
      project: OPENAI_PROJECT_ID,
      organization: OPENAI_ORGANIZATION_ID,
    });
    this._client = openAi;
  }

  get client() {
    return this._client;
  }
}
