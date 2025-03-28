# 비디오 렌더링 예제

이 디렉토리에는 header, subtitle, footer 텍스트 레이아웃으로 비디오를 렌더링하는 예제 코드가 포함되어 있습니다.

## 파일 설명

- `video-cuts-fixture.json`: 비디오 컷 테스트 데이터
- `render-video-cuts-example.ts`: 비디오 컷을 렌더링하는 예제 코드

## 실행 방법

1. 프로젝트 루트 디렉토리에서 다음 명령어를 실행합니다:

```bash
# TypeScript 컴파일 (필요한 경우)
npm run build

# 예제 실행
node dist/server/video-converter/examples/render-video-cuts-example.js
```

또는 ts-node를 사용하여 직접 실행할 수 있습니다:

```bash
npx ts-node src/server/video-converter/examples/render-video-cuts-example.ts
```

## 결과

실행이 완료되면 `output` 디렉토리에 다음 파일들이 생성됩니다:

- 각 비디오 컷에 대한 MP4 파일 (`cut-xxx.mp4`)
- 모든 컷을 합친 최종 비디오 파일 (`scene-final.mp4`)

## 커스터마이징

`video-cuts-fixture.json` 파일을 수정하여 다양한 텍스트와 이미지로 테스트할 수 있습니다.

### VideoCut 형식

```json
{
  "id": "cut-001",
  "sceneId": "scene-001",
  "duration": 5,
  "imageUrl": "이미지 URL",
  "header": "상단에 표시될 텍스트",
  "subtitle": "중앙에 표시될 텍스트",
  "footer": "하단에 표시될 텍스트"
}
```

## 참고사항

- 이미지 URL은 로컬 파일 경로나 웹 URL 모두 사용 가능합니다.
- 텍스트에는 `\n`을 사용하여 줄바꿈을 추가할 수 있습니다.
- FFmpeg가 시스템에 설치되어 있어야 이 예제가 작동합니다.
