// Local server สำหรับรัน Video→Audio converter ในเครื่อง
// ใช้งาน: node server.js
// แล้วเปิด http://localhost:8080 ใน Chrome/Edge

const http = require('http');
const fs   = require('fs');
const path = require('path');
const PORT = 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.wasm': 'application/wasm',
  '.css':  'text/css',
  '.json': 'application/json',
  '.map':  'application/json',
};

http.createServer(function(req, res) {
  // Serve only files in current directory
  var filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

  // Security: prevent path traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  var ext = path.extname(filePath).toLowerCase();
  var contentType = MIME[ext] || 'application/octet-stream';

  // COOP/COEP headers — enables SharedArrayBuffer in browser
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + req.url);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', function() {
  console.log('='.repeat(50));
  console.log('Video → Audio Converter - Local Server');
  console.log('='.repeat(50));
  console.log('เปิด browser แล้วไปที่:');
  console.log('  http://localhost:' + PORT);
  console.log('');
  console.log('กด Ctrl+C เพื่อหยุด server');
  console.log('='.repeat(50));
});
