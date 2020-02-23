#!/usr/bin/env node

import { resolve } from 'path';
import { promises as fs } from 'fs';

async function read(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk); 
  return Buffer.concat(chunks).toString('utf8');
}

(async () => {
  try {
    const [,, regex, o] = process.argv;
    const stdin = await read(process.stdin);
    const a = await fs.readFile(resolve(o), 'utf-8');
    const c = a.replace(new RegExp(regex), stdin);
    await fs.writeFile(resolve(o), c, 'utf-8');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
