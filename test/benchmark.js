/**
 * Note that this is not very precise as results will depend on ordering,
 * but it's good enough to determine that performance stayed in the same ballpark.
 */
import fs from 'fs';
import path from 'path';

import base64 from 'base64-js'

import { fromByteArray as fromByteArraySwitch } from './base64-switch.js'
import { fromByteArray as fromByteArrayMap } from './base64-map.js'
import { fromByteArray as fromByteArrayMath } from './base64-math.js'
import { fromByteArray } from '../index.js'

;(async () => {

const mobyDick = await fs.promises.readFile(path.resolve('test/mobydick.txt'));

const N = 10000

console.time('with obj')
for (let i = 0; i < N; i++) fromByteArray(mobyDick.buffer)
console.timeEnd('with obj')

const uint8 = new Uint8Array(mobyDick.buffer)
console.time('original')
for (let i = 0; i < N; i++) base64.fromByteArray(uint8);
console.timeEnd('original')

console.time('with math')
for (let i = 0; i < N; i++) fromByteArrayMath(mobyDick.buffer)
console.timeEnd('with math')

console.time('with map')
for (let i = 0; i < N; i++) fromByteArrayMap(mobyDick.buffer)
console.timeEnd('with map')

console.time('with switch')
for (let i = 0; i < N; i++) fromByteArraySwitch(mobyDick.buffer)
console.timeEnd('with switch')

})();