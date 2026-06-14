// Single-file build: bundles the whole app (incl. Design Lab) into ONE
// self-contained HTML in dist-single/ — no node_modules / server needed to RUN it.
// Build:  npm run build:html   →   dist-single/index.html
// This config is separate so the normal `npm run dev` / `npm run build` stay unchanged.
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        return path.resolve(__dirname, 'src/assets', id.replace('figma:asset/', ''))
      }
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [figmaAssetResolver(), react(), tailwindcss(), viteSingleFile()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  build: {
    outDir: 'dist-single',
    assetsInlineLimit: 100000000, // inline everything (fonts/images) as data URIs
    cssCodeSplit: false,
    chunkSizeWarningLimit: 100000,
    emptyOutDir: true,
  },
})
