import {
  BlogBlock,
  TextBlock,
  textBlockModelWithAnalysis,
} from "@/src/common/model/blocks";
import { OpenaiClient } from "@/src/server/openai-client/openai-client";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";

export interface AiScriptCreator {
  createScript(
    target: TextBlock[],
    context?: BlogBlock,
    systemPromptOverride?: string
  ): Promise<TextBlock[]>;
}

export class AiScriptCreatorImpl implements AiScriptCreator {
  private readonly openai: OpenaiClient;
  constructor(openai?: OpenaiClient) {
    this.openai = openai ?? new OpenaiClient();
  }

  async createScript(
    target: TextBlock[],
    context?: BlogBlock,
    systemPromptOverride?: string
  ): Promise<TextBlock[]> {
    const systemPrompt =
      systemPromptOverride ??
      `당신은 블로그 콘텐츠를 영상 자막으로 변환하는 전문가입니다.
제공된 텍스트를 다음 지침에 따라 영상 자막으로 재작성해주세요:

1. 문장을 간결하고 명확하게 만들어주세요
2. 구어체로 변환하여 자연스러운 대화 흐름을 만들어주세요
3. 각 문장은 짧게 유지하고 복잡한 문장은 여러 개로 나누어주세요
4. 시청자가 이해하기 쉽도록 전문 용어는 더 쉬운 표현으로 바꿔주세요
5. 원본 콘텐츠의 핵심 정보와 의미는 유지해주세요
6. 영상에서 말하기 적합한 억양과 표현을 사용해주세요
7. 블로그 형식의 요소(링크, 참조 등)는 영상에 맞게 수정해주세요
8. IMPORTANT: 지나치게 긴 문장이나 복잡한 설명이 있는 블록은 여러 개의 블록으로 분할해주세요

변환 예시:

입력:
{
  "targetBlocks": [
    {
      "id": "block-1",
      "type": "text",
      "value": "이번 연구 결과에 따르면, 규칙적인 운동은 심혈관 질환 발병률을 23.4% 감소시키는 것으로 나타났으며, 이는 기존 연구(참조: Smith et al., 2018)의 결과와 일치합니다."
    },
    {
      "id": "block-2", 
      "type": "text",
      "value": "인공지능 기술은 최근 급속도로 발전하고 있으며, 특히 자연어 처리, 컴퓨터 비전, 강화학습 분야에서 놀라운 성과를 보이고 있습니다. 이런 기술 발전은 의료, 금융, 교육 등 다양한 산업 분야에 혁신적인 변화를 가져오고 있으며, 특히 의학 진단, 자율주행차, 개인화된 교육 시스템 등에서 실질적인 응용이 이루어지고 있습니다."
    }
  ]
}

출력:
{
  "blocks": [
    {
      "id": "block-1",
      "type": "text",
      "value": "연구 결과를 보니까요, 꾸준히 운동하면 심장 질환이 확실히 줄어든다고 합니다."
    },
    {
      "id": "block-1-1",
      "type": "text",
      "value": "그 감소율이 무려 23%나 됩니다. 이전 연구들과도 비슷한 결과가 나왔어요."
    },
    {
      "id": "block-2-1", 
      "type": "text",
      "value": "인공지능 기술이 요즘 정말 빠르게 발전하고 있어요."
    },
    {
      "id": "block-2-2", 
      "type": "text",
      "value": "특히 자연어 처리, 이미지 인식, 강화학습 분야에서 놀라운 성과들이 나오고 있죠."
    },
    {
      "id": "block-2-3", 
      "type": "text",
      "value": "이런 기술들이 의료, 금융, 교육 같은 여러 분야에 혁신을 가져오고 있어요."
    },
    {
      "id": "block-2-4", 
      "type": "text",
      "value": "실제로 의료 진단, 자율주행차, 맞춤형 교육 시스템 등에서 활용되고 있답니다."
    }
  ]
}

각 블록은 한 번에 말할 수 있는 적절한 길이로 나눠주시고, 자연스러운 흐름을 유지해야 합니다.
출력은 반드시 위 예시처럼 원본 텍스트블록 구조를 유지하면서 각 블록의 value 내용만 자막에 적합하게 변환해주세요.`;

    const response = await this.openai.client.chat.completions.create({
      model: "gpt-4o-mini",

      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            targetBlocks: target,
          }),
        },
      ],
      response_format: zodResponseFormat(
        z.object({
          blocks: z.array(textBlockModelWithAnalysis),
        }),
        "scripted-text-blocks"
      ),
      temperature: 0.7,
    });

    try {
      if (!response.choices[0].message.content) {
        throw new Error("스크립트 변환 중 오류 발생: 응답이 없습니다.");
      }
      const scriptBlocks = JSON.parse(response.choices[0].message.content);
      const parsedScriptBlocks = scriptBlocks.blocks.map((block: unknown) =>
        textBlockModelWithAnalysis.parse(block)
      );

      return parsedScriptBlocks;
    } catch (error) {
      console.error("스크립트 변환 중 오류 발생:", error);
      throw new Error("스크립트 변환 중 오류 발생:", error as Error);
    }
  }
}
