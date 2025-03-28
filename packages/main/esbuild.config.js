import esbuild from 'esbuild';

// TypeScript 파일을 esbuild로 빌드
esbuild.build({
  entryPoints: ['src/index.ts'], // 진입점 파일
  bundle: true,
  outfile: 'dist/index.js', // 출력 파일
  platform: 'node', // Node.js 환경에서 실행
  format: "esm",
  loader: {
    '.ts': 'ts', // TypeScript 파일 로드
  },
  external: ["googleapis", "gaxios"], // ✅ Node.js 내장 모듈을 번들에서 제외
})