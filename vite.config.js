import { posterImageResponse } from './server/poster-image.mjs';
import { mcpResponse } from './server/mcp.mjs';
import { likesResponse } from './server/likes.mjs';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import safeParser from 'postcss-safe-parser';

import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: 'likes-feed',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        if (['/mcp', '/api/poster/image'].includes(url.pathname)) {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const request = new Request(new URL(req.url, 'http://' + req.headers.host), {
            method: req.method,
            headers: req.headers,
            body: chunks.length ? Buffer.concat(chunks) : undefined
          });
          const response = url.pathname === '/mcp'
            ? await mcpResponse(request)
            : await posterImageResponse(request, process.env.OPENAI_API_KEY);
          res.writeHead(response.status, Object.fromEntries(response.headers));
          res.end(Buffer.from(await response.arrayBuffer()));
          return;
        }
        if (!['/api/likes', '/api/likes/image'].includes(url.pathname)) return next();
        const response = await likesResponse(url);
        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(Buffer.from(await response.arrayBuffer()));
      });
    }
  }],
  server: {
    hmr: true,
    watch: {
      ignored: ['**/public/r/**', '**/public/og/**']
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': '/src',
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@content': path.resolve(__dirname, 'src/content'),
      '@tailwind': path.resolve(__dirname, 'src/tailwind'),
      '@ts-default': path.resolve(__dirname, 'src/ts-default'),
      '@ts-tailwind': path.resolve(__dirname, 'src/ts-tailwind'),
      'react-virtualized': 'react-virtualized/dist/commonjs'
    }
  },
  css: {
    postcss: {
      parser: safeParser
    }
  },
  assetsInclude: ['**/*.glb'],
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        'studio-frame': path.resolve(__dirname, 'studio-frame.html'),
        'shape-frame': path.resolve(__dirname, 'shape-frame.html')
      },
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) return;
        warn(warning);
      }
    }
  }
});
