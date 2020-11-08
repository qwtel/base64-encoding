#!/usr/bin/env node

import { resolve } from 'path';
import { promises as fs } from 'fs';

async function read(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk); 
  return Buffer.concat(chunks).toString('utf8');
}

function insert(str, index, value) {
  return str.substr(0, index) + value + str.substr(index);
}

(async () => {
  try {
    const [,, regex, o] = process.argv;
    const [stdin, a] = await Promise.all([
      read(process.stdin), 
      fs.readFile(resolve(o), 'utf-8')
    ]);
    const m = new RegExp(regex).exec(a);
    const c = insert(a, m.index + m[0].length, stdin);
    await fs.writeFile(resolve(o), c, 'utf-8');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
