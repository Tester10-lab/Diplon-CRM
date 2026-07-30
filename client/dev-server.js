import * as esbuild from 'esbuild';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const stitchDir = path.join(rootDir, 'stitch_diplon_premium_travel_erp (2)', 'stitch_diplon_premium_travel_erp');

const PORT = 3000;

// Start Tailwind CLI compiler in watch mode
const twProcess = spawn('npx', ['tailwindcss', '-i', './src/index.css', '-o', './public/output.css', '--watch'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

twProcess.on('error', (err) => {
  console.error('Tailwind watcher error:', err);
});

// Build bundle in memory / ctx
const ctx = await esbuild.context({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outfile: 'public/bundle.js',
  format: 'esm',
  target: 'es2022',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.css': 'empty',
    '.svg': 'file',
  },
  define: {
    'process.env.NODE_ENV': '"development"',
  },
});

await ctx.watch();

console.log('esbuild watching src/main.tsx...');

// Simple HTTP server with no-cache headers
const server = http.createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  let reqUrl = req.url.split('?')[0];

  // Route: /stitch catalog viewer
  if (reqUrl === '/stitch' || reqUrl === '/stitch/') {
    if (fs.existsSync(stitchDir)) {
      const screens = fs.readdirSync(stitchDir).filter(f => fs.statSync(path.join(stitchDir, f)).isDirectory());
      let html = `<!DOCTYPE html>
<html class="dark" lang="en">
<head>
  <meta charset="utf-8">
  <title>Diplon Travel ERP — Stitch Design Catalog</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body class="bg-slate-950 text-slate-100 p-8 font-sans">
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div>
        <h1 class="text-2xl font-extrabold text-amber-400">🎨 Stitch UI Design System Catalog</h1>
        <p class="text-xs text-slate-400">33 Exported High-Density Enterprise & Field Operations Screens</p>
      </div>
      <a href="/" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs">← Back to SPA App</a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${screens.map(s => `
        <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 hover:border-indigo-500/50 transition-all">
          <div className="font-bold text-sm text-slate-100">${s.replace(/_/g, ' ').toUpperCase()}</div>
          <div class="flex items-center gap-2">
            <a href="/stitch/${s}/code.html" target="_blank" class="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold hover:bg-indigo-500/30">
              📄 View HTML
            </a>
            <a href="/stitch/${s}/screen.png" target="_blank" class="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700">
              🖼 Screenshot
            </a>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(html);
    }
  }

  // Route: /stitch/:screen/file
  if (reqUrl.startsWith('/stitch/')) {
    const relPath = reqUrl.replace('/stitch/', '');
    const fullPath = path.join(stitchDir, relPath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const ext = path.extname(fullPath);
      const mimeTypes = {
        '.html': 'text/html',
        '.png': 'image/png',
        '.css': 'text/css',
        '.js': 'text/javascript',
      };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      return fs.createReadStream(fullPath).pipe(res);
    }
  }

  if (reqUrl === '/') {
    reqUrl = '/index.html';
  }

  if (reqUrl === '/index.html') {
    let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    html = html.replace('/src/main.tsx', '/public/bundle.js');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(html);
  }

  const filePath = path.join(__dirname, reqUrl);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    return fs.createReadStream(filePath).pipe(res);
  }

  // SPA fallback to index.html for client-side routing
  let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  html = html.replace('/src/main.tsx', '/public/bundle.js');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`\n  🚀 Diplon ERP Dev Server running at http://localhost:${PORT}/\n`);
  console.log(`  🎨 Stitch UI Catalog available at http://localhost:${PORT}/stitch\n`);
});
