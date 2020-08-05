#!/usr/bin/env -S node

import path from 'path';
import fs from 'fs';

import { bench } from './bench.js';

const __filename = path.basename(new URL(import.meta.url).pathname);
const __dirname = path.dirname(new URL(import.meta.url).pathname);

;(async () => {

await bench(await fs.promises.readFile(path.resolve(__dirname, 'mobydick.txt')), 68_104);
await bench(await fs.promises.readFile(path.resolve(__dirname, 'movie.mov')), 1);

})();