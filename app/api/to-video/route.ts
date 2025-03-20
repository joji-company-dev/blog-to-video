import {
  BlogContent,
  blogContentModel,
} from "@/src/common/model/blog-content.model";
import { VideoRequestResult } from "@/src/common/model/video-request-result";
import { FFmpegVideoConverter } from "@/src/server/video-converter";

const videoConverter = new FFmpegVideoConverter({
  outputDir: "./public/videos",
});

export async function POST(request: Request) {
  const { content } = await request.json();

  if (!content) {
    return new Response("Content is required", { status: 400 });
  }

  try {
    // 블로그 콘텐츠 검증
    const blogContent: BlogContent = blogContentModel.parse(content);

    // 영상 변환 작업 시작
    const result: VideoRequestResult = await videoConverter.convert(
      blogContent
    );

    // 변환 작업 결과 반환
    return new Response(
      JSON.stringify({
        result: "success",
        data: {
          jobId: result.data.id,
          progress: result.progress,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("블로그 파싱 오류:", error);
    return new Response(
      JSON.stringify({
        result: "error",
        data: {
          message: error instanceof Error ? error.message : "블로그 파싱 오류",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// 작업 상태 확인 API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return new Response(
      JSON.stringify({
        result: "error",
        data: {
          message: "작업 ID가 필요합니다.",
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // 작업 상태 조회
    const { progress, outputPath } = videoConverter.getJobStatus(jobId);

    // 작업 상태에 따른 응답 생성
    return new Response(
      JSON.stringify({
        result: "success",
        data: {
          jobId,
          progress,
          outputPath,
          videoUrl: outputPath
            ? `/videos/${outputPath.split("/").pop()}`
            : undefined,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("작업 상태 조회 오류:", error);
    return new Response(
      JSON.stringify({
        result: "error",
        data: {
          message: "작업 상태 조회 오류",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
