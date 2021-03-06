/**
 * Note that this is not very precise as results will depend on ordering,
 * but it's good enough to determine that performance stayed in the same ballpark.
 */

// import { fromByteArray as fromByteArraySwitch } from './base64-switch.js'
// import { fromByteArray as fromByteArrayMap } from './base64-map.js'
// import { fromByteArray as fromByteArrayMath } from './base64-math.js'
import { encode, decode } from '../base64-js.js'
// import { base64ArrayBuffer } from './base64ArrayBuffer.js';
import { Base64Encoder, Base64Decoder } from '../index.js';

// import base64JS from 'base64-js'

export const bindAll = (ns) => { for (const key in ns) if (typeof ns[key] === 'function') ns[key] = ns[key].bind(ns); }
bindAll(console);
const { log, time, timeEnd } = console;

const P = 27;

export async function bench(mobyDick, N = 1) {
  log(`Base64 encoding ${mobyDick.byteLength} bytes of data ${N} times:`)

  let x, y

  if (typeof global !== 'undefined' && 'Buffer' in global) {
    time('node/Buffer'.padEnd(P))
    for (let i = 0; i < N; i++) x = mobyDick.toString('base64')
    timeEnd('node/Buffer'.padEnd(P))
  }

  // const t_start = Date.now()

  time('Base64Encoder/encode'.padEnd(P))
  const base64Encoder = await new Base64Encoder().optimize();
  for (let i = 0; i < N; i++) x = base64Encoder.encode(mobyDick.buffer)
  timeEnd('Base64Encoder/encode'.padEnd(P))

  time('base64-js/encode'.padEnd(P))
  for (let i = 0; i < N; i++) x = encode(mobyDick.buffer)
  timeEnd('base64-js/encode'.padEnd(P))

  // const t_end = Date.now()
  // const t = t_end - t_start;
  // const opssec = (mobyDick.byteLength * N) / (t / 1000)
  // console.log('bytes/s'.padEnd(P + 1), Math.floor(opssec).toLocaleString())

  time('Base64Decoder/decode'.padEnd(P))
  const base64Decoder = await new Base64Decoder().optimize();
  for (let i = 0; i < N; i++) y = base64Decoder.decode(x);
  timeEnd('Base64Decoder/decode'.padEnd(P))

  time('base64-js/decode'.padEnd(P))
  for (let i = 0; i < N; i++) y = decode(x)
  timeEnd('base64-js/decode'.padEnd(P))

  // time('base64ArrayBuffer (encode)'.padEnd(P))
  // for (let i = 0; i < N; i++) x = base64ArrayBuffer(mobyDick.buffer)
  // timeEnd('base64ArrayBuffer (encode)'.padEnd(P))

  /*
  if (typeof window !== 'undefined' && 'FileReader' in window && 'fetch' in window) {
    // base64 to buffer
    function base64ToBuffer(base64) {
      return fetch(`data:application/octet-binary;base64,${base64}`)
        .then(response => response.arrayBuffer());
    }

    // buffer to base64
    function bufferToBase64(buffer) {
      return new Promise((resolve, reject) => {
        const blob = new Blob([buffer], { type: 'application/octet-binary' });
        const fileReader = new FileReader();
        fileReader.onload = () => {
          const dataUrl = fileReader.result;
          const base64 = dataUrl.substr(dataUrl.indexOf(',') + 1);
          resolve(base64);
        };
        fileReader.onerror = reject;
        fileReader.readAsDataURL(blob);

      })
    }

    time('FileReader/encode'.padEnd(P))
    for (let i = 0; i < N; i++) x = await bufferToBase64(mobyDick.buffer)
    timeEnd('FileReader/encode'.padEnd(P))

    time('fetch/decode'.padEnd(P))
    for (let i = 0; i < N; i++) y = await base64ToBuffer(x);
    timeEnd('fetch/decode'.padEnd(P))
  }
  */

  // time('web-base64/math'.padEnd(P))
  // for (let i = 0; i < N; i++) fromByteArrayMath(mobyDick.buffer)
  // timeEnd('web-base64/math'.padEnd(P))

  // time('web-base64/map'.padEnd(P))
  // for (let i = 0; i < N; i++) fromByteArrayMap(mobyDick.buffer)
  // timeEnd('web-base64/map'.padEnd(P))

  // time('web-base64/switch'.padEnd(P))
  // for (let i = 0; i < N; i++) fromByteArraySwitch(mobyDick.buffer)
  // timeEnd('web-base64/switch'.padEnd(P))

  // time('base64-js'.padEnd(P))
  // const uint8 = new Uint8Array(mobyDick.buffer)
  // for (let i = 0; i < N; i++) x = base64JS.fromByteArray(uint8)
  // timeEnd('base64-js'.padEnd(P))

  log('DONE')
}