import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig(({ mode }) => {
  // 환경변수 로드
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    define: {
      global: 'globalThis',
      'process.env.DATABASE_URL': JSON.stringify(env.DATABASE_URL),
      'process.env.DATABASE_PASSWORD': JSON.stringify(env.DATABASE_PASSWORD),
    },
    resolve: {
      alias: {
        buffer: 'buffer',
        process: 'process/browser',
        util: 'util',
        stream: 'stream-browserify',
        crypto: 'crypto-browserify',
      },
    },
    optimizeDeps: {
      include: [
        'buffer',
        'process',
        'util',
        'stream-browserify',
        'crypto-browserify',
        'react-force-graph-2d',
      ],
      esbuildOptions: {
        plugins: [
          NodeGlobalsPolyfillPlugin({
            buffer: true,
            process: true,
          }),
          NodeModulesPolyfillPlugin(),
        ],
      },
    },
    build: {
      rollupOptions: {
        external: [],
      },
    },
    ssr: {
      // SSR에서 제외할 패키지 목록
      noExternal: ['react-force-graph-2d', 'buffer', 'process'],
      // 외부화할 패키지들 - 서버에서 실행되지 않도록 함
      external: ['force-graph', 'd3', 'kapsule', 'accessors'],
    },
  };
});
