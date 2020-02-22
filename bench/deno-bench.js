#!/usr/bin/env -S deno --allow-read

import { bench } from './bench.js';

const [, __dirname, __filename] = new URL(import.meta.url).pathname.match(/^(.*)\/(.*)$/);

const mobyDick = await Deno.readFile(`${__dirname}/mobydick.txt`);

bench(mobyDick, 10_000);