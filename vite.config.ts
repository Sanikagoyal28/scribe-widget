import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    // Fix "process is not defined" error for browser
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': JSON.stringify({}),
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'EkaScribe',
      fileName: (format) => `scribe-widget.${format}.js`,
      formats: ['umd', 'es'],
    },
    rollupOptions: {
      output: {
        // Use named exports to avoid the .default issue
        exports: 'named',
        globals: {},
      },
    },
    cssCodeSplit: false,
    minify: 'esbuild',
  },
  server: {
    port: 3000,
    open: true,
  },
});
