// scripts/updatePaths.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface FileList {
  paths: string[];
}

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 설정
const ROOT_DIR = path.join(__dirname, "../");
const APP_DIR = path.join(ROOT_DIR, "app");
const CONSTANTS_FILE = path.join(ROOT_DIR, "src/client/app/routes/paths.ts");

// 디렉토리 순회 함수
function traverseDirectory(dir: string, fileList: FileList): void {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath, fileList);
    } else if (file === "page.tsx" || file === "page.ts") {
      const relativePath = fullPath
        .replace(APP_DIR, "")
        .replace(/\\/g, "/")
        .replace(/\/page\.tsx?$/, "");
      fileList.paths.push(relativePath);
    }
  });
}

// 상수명 생성 함수
function createConstantName(path: string): string {
  // root 경로인 경우 'ROOT' 반환
  if (path === "") return "ROOT";

  return path
    .replace(/^\/|\[|\]/g, "")
    .replace(/\//g, "_")
    .replace(/-/g, "_")
    .toUpperCase();
}

// 메인 실행 함수
function updatePathConstants(): void {
  const fileList: FileList = { paths: [] };
  traverseDirectory(APP_DIR, fileList);

  const pathEntries = fileList.paths
    .map((path) => {
      const name = createConstantName(path);
      return `  ${name}: "${path}"`;
    })
    .join(",\n");

  const constants = `export const PATHS = {\n${pathEntries}\n};\n`;

  // 디렉토리가 없으면 생성
  const dir = path.dirname(CONSTANTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(CONSTANTS_FILE, constants);
  console.log("Path constants updated successfully!");
}

updatePathConstants();
