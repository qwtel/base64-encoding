import '../../global-this.js';

import {
  toByteArray as decodeJS,
  fromByteArray as encodeJS
} from '../../index.js';

const WASM = `
AGFzbQEAAAABFwRgAABgAX8Bf2ACf38Bf2AEf39/fwF/AwYFAAECAQMEBQFwAQEBBQMBAAIGIQV/AUGg
iwQLfwBBgAgLfwBBkQsLfwBBgAgLfwBBoIsECwecAQoGbWVtb3J5AgARX193YXNtX2NhbGxfY3RvcnMA
ABBCYXNlNjRkZWNvZGVfbGVuAAEMQmFzZTY0ZGVjb2RlAAIQQmFzZTY0ZW5jb2RlX2xlbgADDEJhc2U2
NGVuY29kZQAEDF9fZHNvX2hhbmRsZQMBCl9fZGF0YV9lbmQDAg1fX2dsb2JhbF9iYXNlAwMLX19oZWFw
X2Jhc2UDBAqqBwUCAAs+AQN/IAAhAQNAIAEtAAAhAiABQQFqIgMhASACQYCIgIAAai0AAEHAAEkNAAsg
AyAAa0ECakEEbUEDbEEBagvYAwEGfyABIQIDQCACLQAAIQMgAkEBaiIEIQIgA0GAiICAAGotAABBwABJ
DQALIAQgAUF/c2oiAkEDakEEbSEFAkAgAkEFSA0AIAQgAWsiBkF6aiEHA0AgACABQQFqIgMtAABBgIiA
gABqLQAAQQR2IAEtAABBgIiAgABqLQAAQQJ0cjoAACAAQQFqIAFBAmoiBC0AAEGAiICAAGotAABBAnYg
Ay0AAEGAiICAAGotAABBBHRyOgAAIABBAmogAUEDai0AAEGAiICAAGotAAAgBC0AAEGAiICAAGotAABB
BnRyOgAAIABBA2ohACABQQRqIQEgAkF8aiICQQRKDQALIAYgB0F8cWtBe2ohAgsgBUEDbCEDAkAgAkEC
SA0AIAAgAS0AAUGAiICAAGotAABBBHYgAS0AAEGAiICAAGotAABBAnRyOgAAAkAgAkECRw0AIABBAWoh
AAwBCyAAIAEtAAJBgIiAgABqLQAAQQJ2IAEtAAFBgIiAgABqLQAAQQR0cjoAAQJAIAJBBE4NACAAQQJq
IQAMAQsgACABLQADQYCIgIAAai0AACABLQACQYCIgIAAai0AAEEGdHI6AAIgAEEDaiEACyAAQQA6AAAg
A0EAIAJrQQNxawsQACAAQQJqQQNtQQJ0QQFyC/oCAQZ/QYCKgIAAQdCKgIAAIANBAUYiBBshBUEAIQYC
QAJAIAJBfmoiB0EBTg0AIAAhAwwBCyAAIQMDQCADIAUgASAGaiIILQAAQQJ2ai0AADoAACADQQFqIAUg
CC0AAEEEdEEwcSAIQQFqIgktAABBBHZyai0AADoAACADQQJqIAUgCS0AAEECdEE8cSAIQQJqIggtAABB
BnZyai0AADoAACADQQNqIAUgCC0AAEE/cWotAAA6AAAgA0EEaiEDIAZBA2oiBiAHSA0ACwsCQCAGIAJO
DQBB/gBBPSAEGyEIIAMgBSABIAZqIgktAABBAnZqLQAAOgAAIAktAABBBHRBMHEhAQJAAkAgBiACQX9q
Rw0AIAMgBSABai0AADoAASAIIQUMAQsgAyAFIAlBAWoiBi0AAEEEdiABcmotAAA6AAEgBSAGLQAAQQJ0
QTxxai0AACEFCyADIAg6AAMgAyAFOgACIANBBGohAwsgA0EAOgAAIAMgAGtBAWoLC5kDAQBBgAgLkQNA
QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAPkA+QD80NTY3ODk6Ozw9QEBA
QEBAQAABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZQEBAQD9AGhscHR4fICEiIyQlJicoKSorLC0uLzAx
MjNAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA
QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA
QEBAQEBAQEBAQEBAQEBAQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJz
dHV2d3h5ejAxMjM0NTY3ODktXwAAAAAAAAAAAAAAAAAAAABBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZ
WmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvAABbBG5hbWUBVAUAEV9fd2FzbV9j
YWxsX2N0b3JzARBCYXNlNjRkZWNvZGVfbGVuAgxCYXNlNjRkZWNvZGUDEEJhc2U2NGVuY29kZV9sZW4E
DEJhc2U2NGVuY29kZQAlCXByb2R1Y2VycwEMcHJvY2Vzc2VkLWJ5AQVjbGFuZwU5LjAuMQ==
`.trim().split('\n').join('');

const BYTES_PER_PAGE = 64 * 1024;

// TODO: Enforce max size
// TODO: Shrink/discard after use?
// TODO: Encode streaming!?

/** 
 * @param {WebAssembly.Memory} memory
 * @param {number} pointer
 * @param {number} targetLength
 */
function ensureMemory(memory, pointer, targetLength) {
  const availableMemory = memory.buffer.byteLength - pointer;
  if (availableMemory < targetLength) {
    const nPages = Math.ceil((targetLength - availableMemory) / BYTES_PER_PAGE);
    memory.grow(nPages);
  }
}

/** 
 * @param {Uint8Array} uint8 
 * @param {string} str
 */
function textEncodeInto(uint8, str) {
  if (typeof TextEncoder !== 'undefined') {
    if ('encodeInto' in TextEncoder.prototype) {
      new TextEncoder().encodeInto(str, uint8)
    } else {
      uint8.set(new TextEncoder().encode(str))
    }
  } else {
    for (let i = 0; i < bufCodedLen; i++) {
      uint8[i] = str.charCodeAt(i);
    }
  }
  return uint8;
}

/** 
 * @param {WebAssembly.Instance} instance
 * @param {WebAssembly.Memory} memory
 * @param {string} str 
 * @returns {[number, number]}
 */
function textEncodeIntoMemory(instance, memory, str) {
  const pBufCoded = instance.exports.__heap_base.value;
  const bufCodedLen = str.length;
  ensureMemory(memory, pBufCoded, bufCodedLen);

  const bufCoded = new Uint8Array(memory.buffer, pBufCoded, bufCodedLen + 1);
  textEncodeInto(bufCoded, str);
  bufCoded[bufCodedLen] = '\0';

  return [pBufCoded, bufCodedLen]
}

/**
 * @param {WebAssembly.Instance} instance
 * @param {string} str
 */
function decode(instance, str) {
  /** @type {WebAssembly.Memory} */
  const memory = instance.exports.memory

  const [pBufCoded, bufCodedLen] = textEncodeIntoMemory(instance, memory, str);

  const pBufPlain = pBufCoded + bufCodedLen;
  const bufPlainLen = instance.exports.Base64decode_len(pBufCoded);
  ensureMemory(memory, pBufPlain, bufPlainLen);

  const lenReal = instance.exports.Base64decode(pBufPlain, pBufCoded);
  const bufPlain = new Uint8Array(memory.buffer, pBufPlain, lenReal);

  // Return a copy
  // NOTE: We could return a view directly into WASM memory for some efficiency 
  // gains, but this would require that the caller understands that it will be
  // overwritten upon next use.
  return new Uint8Array(bufPlain).buffer;
}

/**
 * @param {WebAssembly.Instance} instance
 * @param {WebAssembly.Memory} memory
 * @param {ArrayBuffer} arrayBuffer 
 * @returns {[number, number]}
 */
function writeIntoMemory(instance, memory, arrayBuffer) {
  const pString = instance.exports.__heap_base.value;
  const stringLen = arrayBuffer.byteLength;
  ensureMemory(memory, pString, stringLen);

  const string = new Uint8Array(memory.buffer, pString, stringLen + 1);
  string.set(new Uint8Array(arrayBuffer));
  string[stringLen] = '\0';

  return [pString, stringLen];
}

/**
 * @param {WebAssembly.Instance} instance 
 * @param {ArrayBuffer} arrayBuffer
 * @param {boolean} urlFriendly
 */
function encode(instance, arrayBuffer, urlFriendly) {
  // console.time('wasm');
  /** @type {WebAssembly.Memory} */
  const memory = instance.exports.memory

  const [pString, stringLen] = writeIntoMemory(instance, memory, arrayBuffer);

  const pEncoded = pString + stringLen;
  const encodedLen = instance.exports.Base64encode_len(stringLen);
  ensureMemory(memory, pEncoded, encodedLen);

  // -1 so we don't include string termination char '\0'
  const encoded = new Uint8Array(memory.buffer, pEncoded, encodedLen - 1);

  instance.exports.Base64encode(
    pEncoded, 
    pString, 
    stringLen, 
    urlFriendly ? 1 : 0
  );
  // console.timeEnd('wasm');

  // NOTE: Actually, most of the runtime is spent building the string.
  //       As far as I know, this is the fastest way.
  // console.time('text');
  const str = new TextDecoder().decode(encoded);
  // console.timeEnd('text');

  return str;
}

// class Promises {
//   /** 
//    * Encode foobar
//    * @param {ArrayBuffer} arrayBuffer @returns {Promise<string>}
//    */
//   async encode(arrayBuffer) { }

//   /** 
//    * Decode foobar
//    * @param {string} string @returns {Promise<ArrayBuffer>}
//    */
//   async decode(string) { }
// }

class Base64 {
  /**
   * @param {{ urlFriendly?: boolean }} [options]
   */
  constructor(options = {}) {
    const { urlFriendly = false } = options;
    this.urlFriendly = urlFriendly;
  }
}

// TODO: Replace with #private variables when those ship

/** @type {Map<Base64, Promise<WebAssembly.WebAssemblyInstantiatedSource>>} */
const _instancePromise = new WeakMap();

/** @type {Map<Base64, WebAssembly.WebAssemblyInstantiatedSource>} */
const _instance = new WeakMap();

export class WebAssemblyBase64 extends Base64 {
  /**
   * @param {{ urlFriendly?: boolean }} [options]
   */
  constructor(options) {
    super(options);
    const instancePromise = WebAssembly.instantiate(decodeJS(WASM));
    _instancePromise.set(this, instancePromise);
  }

  /**
   * @returns {Promise<this>}
   */
  get initialized() {
    return _instancePromise.get(this).then(({ instance }) => {
      _instance.set(this, instance);
      return this;
    });
  }

  /** 
   * @param {ArrayBuffer} arrayBuffer 
   * @returns {string}
   */
  encode(arrayBuffer) {
    return encode(_instance.get(this), arrayBuffer, this.urlFriendly);
  }

  /** 
   * @param {string} string 
   * @returns {ArrayBuffer}
   */
  decode(string) { 
    return decode(_instance.get(this), string);
  }
}

export class JavaScriptBase64 extends Base64 {
  /** 
   * @returns {Promise<this>}
   */
  get initialized() {
    return Promise.resolve(this);
  }

  /** 
   * @param {ArrayBuffer} arrayBuffer
   * @param {boolean} urlFriendly
   * @returns {string}
   */
  encode(arrayBuffer) {
    return encodeJS(arrayBuffer, this.urlFriendly);
  }

  /** 
   * @param {string} string
   * @returns {ArrayBuffer}
   */
  decode(string) {
    return decodeJS(string);
  }
}

export {
  WebAssemblyBase64 as WASMBase64,
  JavaScriptBase64 as JSBase64,
}

/**
 * Factory function for `Base64` class that tests for WebAssembly availability.
 * @returns {Base64}
 */
export async function createBase64() {
  if ('WebAssembly' in globalThis) {
    return await new WebAssemblyBase64().initialized;
  } else if ('Uint8Array' in globalThis && 'DataView' in globalThis) {
    return new JavaScriptBase64();
  }
  throw Error('Platform unsupported. Make sure Uint8Array and DataView exist');
}
