import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'EkaScribe',
      fileName: (format) => `scribe-widget.${format}.js`,
      formats: ['umd', 'es'],
    },
    rollupOptions: {
      // Don't externalize React - bundle it for standalone use
      output: {
        globals: {},
      },
    },
    cssCodeSplit: false,
    minify: 'terser',
  },
  server: {
    port: 3000,
    open: true,
  },
});
