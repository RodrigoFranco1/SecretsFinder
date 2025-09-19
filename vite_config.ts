import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        backend: resolve(__dirname, 'backend/script.js'),
        frontend: resolve(__dirname, 'frontend/script.js'),
      },
      output: {
        dir: 'dist',
        entryFileNames: '[name]/script.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'frontend/style.css';
          }
          return 'assets/[name].[ext]';
        },
      },
      external: [
        'caido:plugin',
        'caido:frontend',
        'caido:utils'
      ],
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: false, // Para debugging más fácil
    sourcemap: true,
  },
  css: {
    postcss: {
      plugins: []
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});