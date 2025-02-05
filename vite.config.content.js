import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/content/content.js',
      name: 'content',
      fileName: () => 'content.js',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined
      }
    },
    emptyOutDir: false,
    outDir: 'dist'
  }
}); 