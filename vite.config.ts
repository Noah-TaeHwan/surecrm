import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr: {
    // SSR에서 제외할 패키지 목록
    noExternal: ['react-force-graph-2d'],
    // 외부화할 패키지들 - 서버에서 실행되지 않도록 함
    external: ['force-graph', 'd3', 'kapsule', 'accessors'],
  },
  optimizeDeps: {
    include: ['react-force-graph-2d'],
  },
});
