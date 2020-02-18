import { promises as fs } from 'fs';
;(async () => {
  const [a, b] = await Promise.all([
    fs.readFile('./c/apache/base64.js', 'utf8'),
    fs.readFile('./c/apache/base64.b64', 'utf8'),
  ]);
  const c = a.replace(/[A-Za-z0-9+=/\n]{120,}/, '\n' + b);
  await fs.writeFile('./c/apache/base64.js', c, 'utf8');
})()
