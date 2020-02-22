#!/usr/bin/env node

import path from 'path';
import fs from 'fs';

import { bench } from './bench.js';

const __filename = path.basename(new URL(import.meta.url).pathname);
const __dirname = path.dirname(new URL(import.meta.url).pathname);

;(async () => {

const args = [await fs.promises.readFile(path.resolve(__dirname, './bench/mobydick.txt')), 10000];
// const args = [await fs.promises.readFile(path.resolve(__dirname, './homebridge.log')), 1];

bench(...args);

})();