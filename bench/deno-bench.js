#!/usr/bin/env -S deno run --allow-read

import { bench } from './bench.js';

const [, __dirname, __filename] = new URL(import.meta.url).pathname.match(/^(.*)\/(.*)$/);

await bench(await Deno.readFile(`${__dirname}/mobydick.txt`), 68_104);
await bench(await Deno.readFile(`${__dirname}/movie.mov`), 1);
