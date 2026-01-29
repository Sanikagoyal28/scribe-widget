import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';

// Plugin to copy extension files after build
function copyExtensionFiles() {
  return {
    name: 'copy-extension-files',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const publicDir = resolve(__dirname, 'public');

      // Copy manifest.json
      copyFileSync(
        resolve(__dirname, 'manifest.json'),
        resolve(distDir, 'manifest.json')
      );

      // Copy all public files
      const publicFiles = ['background.js', 'content-script.js', 'iframe.html', 'iframe.js'];
      publicFiles.forEach(file => {
        const srcPath = resolve(publicDir, file);
        if (existsSync(srcPath)) {
          copyFileSync(srcPath, resolve(distDir, file));
        }
      });

      // Copy icons directory
      const iconsDir = resolve(distDir, 'icons');
      if (!existsSync(iconsDir)) {
        mkdirSync(iconsDir, { recursive: true });
      }

      // Copy icon files if they exist
      const srcIconsDir = resolve(publicDir, 'icons');
      if (existsSync(srcIconsDir)) {
        const iconFiles = readdirSync(srcIconsDir);
        iconFiles.forEach(file => {
          copyFileSync(
            resolve(srcIconsDir, file),
            resolve(iconsDir, file)
          );
        });
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'sidepanel.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
