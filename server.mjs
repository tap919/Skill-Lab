import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(dist, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  
  // SPA fallback
  if (!fs.existsSync(filePath) || !ext) {
    filePath = path.join(dist, 'index.html');
  }
  
  const contentType = MIME[path.extname(filePath)] || 'text/plain';
  
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Skill Lab running at http://localhost:${PORT}`);
  console.log('   Press Ctrl+C to stop');
});