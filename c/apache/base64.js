import '../../global-this.js';

import {
  toByteArray as decodeJS,
  fromByteArray as encodeJS
} from '../../index.js';

const WASM = `
AGFzbQEAAAABFgRgAABgAX8Bf2ACf38Bf2ADf39/AX8DBgUAAQIBAwQFAXABAQEFBAEAgQEGIwV/AUHQioAEC38AQYAIC38AQcEKC38AQYAIC38AQdCKgAQL
B5wBCgZtZW1vcnkCABFfX3dhc21fY2FsbF9jdG9ycwAAEEJhc2U2NGRlY29kZV9sZW4AAQxCYXNlNjRkZWNvZGUAAhBCYXNlNjRlbmNvZGVfbGVuAAMMQmFz
ZTY0ZW5jb2RlAAQMX19kc29faGFuZGxlAwEKX19kYXRhX2VuZAMCDV9fZ2xvYmFsX2Jhc2UDAwtfX2hlYXBfYmFzZQMECqoHBQIACz4BA38gACEBA0AgAS0A
ACECIAFBAWoiAyEBIAJBgIiAgABqLQAAQcAASQ0ACyADIABrQQJqQQRtQQNsQQFqC9gDAQZ/IAEhAgNAIAItAAAhAyACQQFqIgQhAiADQYCIgIAAai0AAEHA
AEkNAAsgBCABQX9zaiICQQNqQQRtIQUCQCACQQVIDQAgBCABayIGQXpqIQcDQCAAIAFBAWoiAy0AAEGAiICAAGotAABBBHYgAS0AAEGAiICAAGotAABBAnRy
OgAAIABBAWogAUECaiIELQAAQYCIgIAAai0AAEECdiADLQAAQYCIgIAAai0AAEEEdHI6AAAgAEECaiABQQNqLQAAQYCIgIAAai0AACAELQAAQYCIgIAAai0A
AEEGdHI6AAAgAEEDaiEAIAFBBGohASACQXxqIgJBBEoNAAsgBiAHQXxxa0F7aiECCyAFQQNsIQMCQCACQQJIDQAgACABLQABQYCIgIAAai0AAEEEdiABLQAA
QYCIgIAAai0AAEECdHI6AAACQCACQQJHDQAgAEEBaiEADAELIAAgAS0AAkGAiICAAGotAABBAnYgAS0AAUGAiICAAGotAABBBHRyOgABAkAgAkEETg0AIABB
AmohAAwBCyAAIAEtAANBgIiAgABqLQAAIAEtAAJBgIiAgABqLQAAQQZ0cjoAAiAAQQNqIQALIABBADoAACADQQAgAmtBA3FrCxAAIABBAmpBA21BAnRBAXIL
+gIBBX9BACEDAkACQCACQX5qIgRBAU4NACAAIQUMAQsgACEFA0AgBSABIANqIgYtAABBAnZBgIqAgABqLQAAOgAAIAVBAWogBi0AAEEEdEEwcSAGQQFqIgct
AABBBHZyQYCKgIAAai0AADoAACAFQQJqIActAABBAnRBPHEgBkECaiIGLQAAQQZ2ckGAioCAAGotAAA6AAAgBUEDaiAGLQAAQT9xQYCKgIAAai0AADoAACAF
QQRqIQUgA0EDaiIDIARIDQALCwJAIAMgAk4NACAFIAEgA2oiBi0AAEECdkGAioCAAGotAAA6AAAgBi0AAEEEdEEwcSEHAkACQCADIAJBf2pHDQAgBSAHQYCK
gIAAai0AADoAAUE9IQYMAQsgBSAGQQFqIgYtAABBBHYgB3JBgIqAgABqLQAAOgABIAYtAABBAnRBPHFBgIqAgABqLQAAIQYLIAVBPToAAyAFIAY6AAIgBUEE
aiEFCyAFQQA6AAAgBSAAa0EBagsLyQIBAEGACAvBAkBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEA+QEBAPzQ1Njc4OTo7PD1A
QEBAQEBAAAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBlAQEBAQEAaGxwdHh8gISIjJCUmJygpKissLS4vMDEyM0BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA
QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA
QEBAQEBAQEBAQEBAQEBAQEBBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvAABbBG5hbWUB
VAUAEV9fd2FzbV9jYWxsX2N0b3JzARBCYXNlNjRkZWNvZGVfbGVuAgxCYXNlNjRkZWNvZGUDEEJhc2U2NGVuY29kZV9sZW4EDEJhc2U2NGVuY29kZQAlCXBy
b2R1Y2VycwEMcHJvY2Vzc2VkLWJ5AQVjbGFuZwU5LjAuMQ==
`.trim().split('\n').join('');

const BYTES_PER_PAGE = 64 * 1024;

// TODO: Enforce max size
// TODO: Shrink/discard after use?
// TODO: Encode streaming!?
/** @param {WebAssembly.Memory} memory @param {number} pointer, @param {number} targetLength */
function ensureMemory(memory, pointer, targetLength) {
  const availableMemory = memory.buffer.byteLength - pointer;
  if (availableMemory < targetLength) {
    const nPages = Math.ceil((targetLength - availableMemory) / BYTES_PER_PAGE);
    memory.grow(nPages);
  }
}

/** @param {Uint8Array} uint8 @param {string} string */
function textEncodeInto(uint8, string) {
  if (typeof TextEncoder !== 'undefined') {
    if ('encodeInto' in TextEncoder.prototype) {
      new TextEncoder().encodeInto(string, uint8)
    } else {
      uint8.set(new TextEncoder().encode(string))
    }
  } else {
    for (let i = 0; i < bufCodedLen; i++) {
      uint8[i] = string.charCodeAt(i);
    }
  }
  return uint8;
}

/** @param {WebAssembly.Instance} instance @param {WebAssembly.Memory} memory @param {string} string 
 *  @returns {[number, number] */
function textEncodeIntoMemory(instance, memory, string) {
  const pBufCoded = instance.exports.__heap_base.value;
  const bufCodedLen = string.length;
  ensureMemory(memory, pBufCoded, bufCodedLen);

  const bufCoded = new Uint8Array(instance.exports.memory.buffer, pBufCoded, bufCodedLen);
  textEncodeInto(bufCoded, string);

  return [pBufCoded, bufCodedLen]
}

/** @param {WebAssembly.Instance} instance @param {string} string */
function decode(instance, string) {
  /** @type {WebAssembly.Memory} */
  const memory = instance.exports.memory

  const [pBufCoded, bufCodedLen] = textEncodeIntoMemory(instance, memory, string)

  const pBufPlain = pBufCoded + bufCodedLen;
  const bufPlainLen = instance.exports.Base64decode_len(pBufCoded);
  ensureMemory(memory, pBufPlain, bufPlainLen);

  const lenReal = instance.exports.Base64decode(pBufPlain, pBufCoded);
  const bufPlain = new Uint8Array(instance.exports.memory.buffer, pBufPlain, lenReal);

  // Return a copy
  // NOTE: We could return a view directly into WASM memory for some efficiency gains, 
  //       but this would require that the caller understands that it will be overwritten upon next use.
  return new Uint8Array(bufPlain).buffer;
}

/** @param {WebAssembly.Instance} instance @param {WebAssembly.Memory} memory @param {ArrayBuffer} arrayBuffer 
 *  @returns {[number, number] */
function writeIntoMemory(instance, memory, arrayBuffer) {
  const pString = instance.exports.__heap_base.value;
  const stringLen = arrayBuffer.byteLength;
  ensureMemory(memory, pString, stringLen);

  const string = new Uint8Array(memory.buffer, pString, stringLen);
  string.set(new Uint8Array(arrayBuffer));

  return [pString, stringLen];
}

/** @param {WebAssembly.Instance} instance @param {ArrayBuffer} arrayBuffer */
function encode(instance, arrayBuffer) {
  /** @type {WebAssembly.Memory} */
  const memory = instance.exports.memory

  const [pString, stringLen] = writeIntoMemory(instance, memory, arrayBuffer);

  const pEncoded = pString + stringLen;
  const encodedLen = instance.exports.Base64encode_len(stringLen);
  ensureMemory(memory, pEncoded, encodedLen);

  const encoded = new Uint8Array(instance.exports.memory.buffer, pEncoded, encodedLen);

  instance.exports.Base64encode(pEncoded, pString, stringLen);

  return new TextDecoder().decode(encoded);
}


class Promises {
  /** 
   * Encode foobar
   * @param {ArrayBuffer} arrayBuffer @returns {Promise<string>}
   */
  async encode(arrayBuffer) { }

  /** 
   * Decode foobar
   * @param {string} string @returns {Promise<ArrayBuffer>}
   */
  async decode(string) { }
}

class Base64 {
  /**
   * @returns {Promise<Base64>}
   */
  get initialized() { }

  /**
   * @param {ArrayBuffer} arrayBuffer
   * @returns {string}
   */
  encode(arrayBuffer) { }

  /**
   * @param {string} string
   * @returns {ArrayBuffer}
   */
  decode(string) { }

  /**
   * @returns {Promises}
   */
  get promises() { }
}

/** We only need a single one of this b/c the JS implementation doesn't have state.
 *  @type {Promises} */
const jsPromises = new class JSPromises extends Promises {
  async encode(arrayBuffer) { return encodeJS(arrayBuffer) }
  async decode(string) { return decodeJS(string) }
};

class WASMPromises extends Promises {
  constructor(p) { super(); this.p = p }
  async encode(arrayBuffer) { return encode((await this.p).instance, arrayBuffer) }
  async decode(string) { return decode((await this.p).instance, string) }
}

export class JavaScriptBase64 extends Base64 {
  /** @returns {Promise<this>} */
  get initialized() { return Promise.resolve(this) }

  /** @param {ArrayBuffer} arrayBuffer @returns {string} */
  encode(arrayBuffer) { return encodeJS(arrayBuffer) }

  /** @param {string} string @returns {ArrayBuffer} */
  decode(string) { return decodeJS(string) }

  /** @returns {Promises} */
  get promises() { return jsPromises }
}

// TODO: Replace with #private variables when those ship

/** @type {Map<Base64, Promise<WebAssembly.WebAssemblyInstantiatedSource>>} */
const _instancePromise = new WeakMap();

/** @type {Map<Base64, WebAssembly.WebAssemblyInstantiatedSource>} */
const _instance = new WeakMap();

/** @type {Map<Base64, Promises>} */
const _promises = new WeakMap();

export class WebAssemblyBase64 extends Base64 {
  constructor() {
    super();
    const instancePromise = WebAssembly.instantiate(decodeJS(WASM));
    _instancePromise.set(this, instancePromise);
    _promises.set(this, new WASMPromises(instancePromise));
  }

  /** @returns {Promise<this>} */
  get initialized() {
    return _instancePromise.get(this).then(({ instance }) => {
      _instance.set(this, instance);
      return this;
    });
  }

  /** @param {ArrayBuffer} arrayBuffer @returns {string} */
  encode(arrayBuffer) { return encode(_instance.get(this), arrayBuffer) }

  /** @param {string} string @returns {ArrayBuffer} */
  decode(string) { return decode(_instance.get(this), string) }

  /** @returns {Promises} */
  get promises() { return _promises.get(this) }
}

export {
  WebAssemblyBase64 as WASMBase64,
  JavaScriptBase64 as JSBase64,
}

/**
 * Create a `Base64` instance for the current platform.
 * @returns {Base64}
 */
export async function createBase64() {
  if ('WebAssembly' in globalThis) {
    return await new WebAssemblyBase64().initialized;
  } else if ('Uint8Array' in globalThis && 'DataView' in globalThis) {
    return new JavaScriptBase64();
  }
  throw Error('Platform unsupported. Make sure `Uint8Array` and `DataView` exist');
}
