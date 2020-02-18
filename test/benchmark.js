/**
 * Note that this is not very precise as results will depend on ordering,
 * but it's good enough to determine that performance stayed in the same ballpark.
 */
import fs from 'fs';
import path from 'path';

import base64JS from 'base64-js'

import { fromByteArray as fromByteArraySwitch } from './base64-switch.js'
import { fromByteArray as fromByteArrayMap } from './base64-map.js'
import { fromByteArray as fromByteArrayMath } from './base64-math.js'
import { encode } from '../index.js'
import { WebAssemblyBase64 } from '../c/apache/base64.js';

;(async () => {

const mobyDick = await fs.promises.readFile(path.resolve('test/mobydick.txt'));

const N = 10000
const P = 26

console.time('WebAssemblyBase64'.padEnd(P))
const base64 = await new WebAssemblyBase64().initialized
for (let i = 0; i < N; i++) base64.encode(mobyDick.buffer)
console.timeEnd('WebAssemblyBase64'.padEnd(P))

console.time('WebAssemblyBase64.promises'.padEnd(P))
for (let i = 0; i < N; i++) await base64.promises.encode(mobyDick.buffer)
console.timeEnd('WebAssemblyBase64.promises'.padEnd(P))

console.time('base64-js'.padEnd(P))
const uint8 = new Uint8Array(mobyDick.buffer)
for (let i = 0; i < N; i++) base64JS.fromByteArray(uint8)
console.timeEnd('base64-js'.padEnd(P))

console.time('web-base64'.padEnd(P))
for (let i = 0; i < N; i++) encode(mobyDick.buffer)
console.timeEnd('web-base64'.padEnd(P))

console.time('web-base64/math'.padEnd(P))
for (let i = 0; i < N; i++) fromByteArrayMath(mobyDick.buffer)
console.timeEnd('web-base64/math'.padEnd(P))

console.time('web-base64/map'.padEnd(P))
for (let i = 0; i < N; i++) fromByteArrayMap(mobyDick.buffer)
console.timeEnd('web-base64/map'.padEnd(P))

console.time('web-base64/switch'.padEnd(P))
for (let i = 0; i < N; i++) fromByteArraySwitch(mobyDick.buffer)
console.timeEnd('web-base64/switch'.padEnd(P))

})();