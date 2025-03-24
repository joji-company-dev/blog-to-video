import { BlogBlock } from "@/src/common/model/blocks";
import {
  SequenceCommandArgs,
  sequenceCommandArgsModel,
} from "@/src/server/blog-sequencer/commands/sequence-command-args";
import { SequenceCommandFactory } from "@/src/server/blog-sequencer/commands/sequence-command-factory";
import { SequenceCommand } from "@/src/server/blog-sequencer/commands/sequence-command.interface";
import { OpenaiClient } from "@/src/server/openai-client/openai-client";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

export interface AiSequenceCommander {
  generateSequenceCommands(blogBlocks: BlogBlock[]): Promise<SequenceCommand[]>;
}

export class AiSequenceCommanderImpl implements AiSequenceCommander {
  private openaiClient: OpenaiClient;

  constructor() {
    this.openaiClient = new OpenaiClient();
  }

  async generateSequenceCommands(
    blogBlocks: BlogBlock[]
  ): Promise<SequenceCommand[]> {
    const blocksWithIds = blogBlocks.map((block, index) => ({
      ...block,
      id: `block-${index}`,
    }));

    const openai = this.openaiClient.client;

    const systemPrompt = `
    당신은 블로그 게시물을 비디오 시퀀스로 변환하는 전문가입니다.
    
    ## 작업 설명
    주어진 블로그 블록(BlogBlock)들을 분석하여 비디오 시퀀스 명령(SequenceCommand)으로 변환해야 합니다.
    
    ## BlogBlock 데이터 구조
    입력되는 BlogBlock은 다음 두 가지 유형만 포함됩니다:
    1. TextBlock: { type: "text", content: string, id: string } - 텍스트 콘텐츠만 포함하는 블록
    2. ImageBlock: { type: "image", url: string, id: string } - 이미지 URL만 포함하는 블록
    
    각 블록은 고유한 id 속성을 가지고 있으며, 이 id는 "block-0", "block-1"과 같은 형식입니다.
    
    ## 입력 데이터
    - BlogBlock 배열: TextBlock과 ImageBlock으로만 구성됩니다.
    - 각 블록은 고유한 id와 주어진 전체 블로그 블록 배열 내에서의 인덱스(배열 위치)를 가집니다.
    - 블록의 id는 원본 배열에서의 위치를 나타냅니다 (예: "block-0"은 원본 배열의 0번 인덱스).
    - 모든 인덱스는 0부터 시작합니다(zero-based index).
    
    ## 출력 규칙
    1. 텍스트와 이미지를 적절히 조합하여 효과적인 비디오 시퀀스를 만들어야 합니다.
    2. 각 시퀀스 명령은 다음과 같은 블록 참조 인덱스를 정확하게 포함해야 합니다:
       - targetTextIndexes: 명령이 참조하는 텍스트 블록들의 인덱스 배열 (id에서 숫자 부분만 추출)
       - targetImageIndexes: 명령이 참조하는 이미지 블록들의 인덱스 배열 (id에서 숫자 부분만 추출)
       - targetTextIndex: 명령이 참조하는 단일 텍스트 블록 인덱스 (id에서 숫자 부분만 추출)
       - targetImageIndex: 명령이 참조하는 단일 이미지 블록 인덱스 (id에서 숫자 부분만 추출)
    3. 이러한 인덱스 값들은 반드시 블록의 id에서 추출한 숫자와 일치해야 합니다.
    4. 잘못된 인덱스 참조가 있으면 전체 시퀀스 생성이 실패할 수 있습니다.
    5. 모든 블록은 적어도 하나의 명령에서 참조되어야 합니다.
    
    ## 인덱스 참조 예시
    원본 블로그 블록 배열이 다음과 같다고 가정:
    [
      { type: "text", content: "소개 텍스트", id: "block-0" },               // id: block-0
      { type: "image", url: "image1.jpg", id: "block-1" },                  // id: block-1
      { type: "text", content: "본문 텍스트 1", id: "block-2" },             // id: block-2
      { type: "text", content: "본문 텍스트 2", id: "block-3" },             // id: block-3
      { type: "image", url: "image2.jpg", id: "block-4" }                   // id: block-4
    ]
    
    올바른 인덱스 참조:
    - id가 "block-0"인 텍스트 블록을 참조: targetTextIndex = 0
    - id가 "block-1"인 이미지 블록을 참조: targetImageIndex = 1
    - id가 "block-0", "block-2", "block-3"인 텍스트 블록들을 함께 참조: targetTextIndexes = [0, 2, 3]
    - id가 "block-1", "block-4"인 이미지 블록들을 함께 참조: targetImageIndexes = [1, 4]
    
    ## 출력 형식
    블록 인덱스가 정확하게 참조된 시퀀스 명령들의 배열을 JSON 형식으로 반환해야 합니다.
    
    ## 중요한 점
    - 모든 인덱스는 블록의 id에서 추출한 숫자입니다 (예: "block-3"에서 3).
    - 블록 참조 인덱스 값이 정확하지 않으면 전체 시퀀스 생성이 실패합니다.
    - 반드시 블록의 id를 확인하여 올바른 인덱스를 참조하세요.
    - 존재하지 않는 인덱스를 참조하지 마세요.
    - 블록의 type 속성을 확인하여 "text"인지 "image"인지 구분하세요.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-11-20",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "system",
          content: "출력 언어: 한국어",
        },
        {
          role: "user",
          content: JSON.stringify(blocksWithIds),
        },
      ],
      response_format: zodResponseFormat(
        z.object({
          sequenceCommands: z.array(sequenceCommandArgsModel),
        }),
        "sequenceCommandArgs"
      ),
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const parsedContent = JSON.parse(content) as {
      sequenceCommands: SequenceCommandArgs[];
    };

    const validatedContent = parsedContent.sequenceCommands.map(
      (commandArgs) => {
        return sequenceCommandArgsModel.parse(commandArgs);
      }
    );

    const sequenceCommands = validatedContent.map((commandArgs) => {
      return SequenceCommandFactory.createSequenceCommand(commandArgs);
    });

    return sequenceCommands;
  }
}
