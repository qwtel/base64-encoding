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

function ensureMemory(memory, pointer, targetLength) {
  const availableMemory = memory.buffer.byteLength - pointer;
  if (availableMemory < targetLength) {
    const nPages = Math.ceil((targetLength - availableMemory) / BYTES_PER_PAGE);
    memory.grow(nPages);
  }
}

function textEncodeInto(uint8, str) {
  if ('encodeInto' in TextEncoder.prototype) {
    new TextEncoder().encodeInto(str, uint8)
  } else {
    uint8.set(new TextEncoder().encode(str))
  }
  return uint8;
}

function textEncodeIntoMemory(instance, memory, str) {
  const pBufCoded = instance.exports.__heap_base.value;
  const bufCodedLen = str.length;
  ensureMemory(memory, pBufCoded, bufCodedLen);

  const bufCoded = new Uint8Array(memory.buffer, pBufCoded, bufCodedLen + 1);
  textEncodeInto(bufCoded, str);
  bufCoded[bufCodedLen] = '\0';

  return [pBufCoded, bufCodedLen]
}

function decode(instance, str) {
  const { memory } = instance.exports;

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

function writeIntoMemory(instance, memory, arrayBuffer) {
  const pString = instance.exports.__heap_base.value;
  const stringLen = arrayBuffer.byteLength;
  ensureMemory(memory, pString, stringLen);

  const string = new Uint8Array(memory.buffer, pString, stringLen + 1);
  string.set(new Uint8Array(arrayBuffer));
  string[stringLen] = '\0';

  return [pString, stringLen];
}

function encode(instance, arrayBuffer, urlFriendly) {
  // console.time('wasm');
  const { memory}  = instance.exports;

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

export class WebAssemblyBase64Impl {
  async init() {
    const { instance } = await WebAssembly.instantiate(decodeJS(WASM));
    this.instance = instance;
  }

  encode(arrayBuffer, urlFriendly) {
    return encode(this.instance, arrayBuffer, urlFriendly);
  }

  decode(string) { 
    return decode(this.instance, string);
  }
}

export class JavaScriptBase64Impl {
  async init() {}

  encode(arrayBuffer, urlFriendly) {
    return encodeJS(arrayBuffer, urlFriendly);
  }

  decode(string) {
    return decodeJS(string);
  }
}

const _impl = new WeakMap();
const _initPromise = new WeakMap();

class Base64 {
  constructor() {
    let impl;
    if ('WebAssembly' in globalThis) {
      _impl.set(this, impl = new WebAssemblyBase64Impl());
    } else if ('Uint8Array' in globalThis && 'DataView' in globalThis) {
      _impl.set(this, impl = new JavaScriptBase64Impl());
    } else {
      throw Error(
        'Platform unsupported. Make sure Uint8Array and DataView exist'
      );
    }

    _initPromise.set(this, impl.init());
  }

  /** 
   * @returns {Promise<this>}
   */
  get initialized() {
    return _initPromise.get(this).then(() => this);
  }
}

export class Base64Encoder extends Base64 {
  /**
   * Set to encode URL friendly Base64.
   * Decoding is not affected.
   * @type {boolean}
   */
  urlFriendly = false;

  /**
   * @param {{ urlFriendly?: boolean }} [options]
   */
  constructor(options = {}) {
    super(options);

    const { urlFriendly = false } = options;
    this.urlFriendly = urlFriendly;
  }

  /** 
   * @param {ArrayBuffer} arrayBuffer
   * @returns {string}
   */
  encode(arrayBuffer) {
    return _impl.get(this).encode(arrayBuffer, this.urlFriendly);
  }
}

export class Base64Decoder extends Base64 {
  /** 
   * @param {string} string
   * @returns {ArrayBuffer}
   */
  decode(string) {
    return _impl.get(this).decode(string);
  }
}
