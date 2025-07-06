import esbuild from 'esbuild';

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
  external: ["googleapis", "gaxios"], // Node.js 내장 모듈을 번들에서 제외
  minify: false, // 디버깅을 위해 minify 비활성화 (선택사항)
  sourcemap: true, // 소스맵 생성 (선택사항)
}).catch(() => process.exit(1));