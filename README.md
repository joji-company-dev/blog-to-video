# Blog to Video

## 소개

블로그 글을 분석하여 이를 바탕으로 영상으로 만들어주는 어플리케이션

## 기능

- 블로그 링크를 입력하면 블로그 내용을 이미지 블록과 텍스트 블록으로 파싱한다.
- 파싱된 정보를 바탕으로 영상으로 만들기 좋은 형태로 씬과 컷을 구성한다.
- 이를 바탕으로 영상을 생성한다.

## 사용 기술

- CommonJS

  - Next.js
  - TypeScript

- Client

  - Tailwind CSS
  - Shadcn UI

- Server
  - Puppeteer
  - OpenAI

## 프로젝트 구조

```
├── app                # Next.js App Router
│   ├── api            # Server Routes
│   └── page.tsx       # 메인 페이지 UI
│
├── src
│   ├── client         # 클라이언트 사이드(Feature-Sliced-Design)
│   │    ├── app
│   │    ├── entities
│   │    ├── features
│   │    ├── pages
│   │    ├── shared
│   │    ├── widgets
│   │
│   └── server         # 서버 사이드 직접 작성 코드
│       ├── blog-parser  # 블로그 파싱 관련 모듈
│       └── utils        # 유틸리티 함수
```

- 클라이언트 소스는 [Feature-Sliced Design](https://feature-sliced.design/docs/get-started/overview) 사용
