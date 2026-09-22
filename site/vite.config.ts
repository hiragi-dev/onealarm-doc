import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// ランディングページ（プロダクトのコンセプトを伝えるトップ）のビルド設定。
// ルート直下に出力し、ドキュメントは docs/ 側で dist/docs に出力する。
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/onealarm-doc/',
  plugins: [vue()],
  server: {
    // 開発中はドキュメントが別サーバー（docs:dev / 5174）で動くため、
    // LP 内の /docs/ リンクをそのまま辿れるようにプロキシする。
    proxy: {
      '/onealarm-doc/docs': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: fileURLToPath(new URL('../dist', import.meta.url)),
    emptyOutDir: true,
  },
})
