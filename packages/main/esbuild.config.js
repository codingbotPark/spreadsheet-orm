import esbuild from 'esbuild';
import { readFileSync } from 'fs';

// package.json을 읽어와 dependencies를 external로 동적으로 설정하기
const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
const external = Object.keys(packageJson.dependencies || {});

// TypeScript 파일을 esbuild로 빌드 (ESNext 타겟)
await esbuild.build({
  entryPoints: ['src/index.ts'], // 진입점 파일
  bundle: true,
  outfile: 'dist/index.js', // 출력 파일
  platform: 'node', // Node.js 환경에서 실행
  format: "esm",
  target: "esnext", // ✅ ESNext 타겟 설정
  loader: {
    '.ts': 'ts', // TypeScript 파일 로드
  },
  external, // Node.js 내장 모듈 및 dependencies를 번들에서 제외
  minify: false, // 디버깅을 위해 minify 비활성화 (선택사항)
  sourcemap: true, // 소스맵 생성 (선택사항)
}).catch(() => process.exit(1));