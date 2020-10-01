import * as Base64JS from './base64-js.js';

const WASM = `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`;

const BYTES_PER_PAGE = 64 * 1024;

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
  if ('encodeInto' in TextEncoder.prototype) {
    new TextEncoder().encodeInto(str, uint8)
  } else {
    uint8.set(new TextEncoder().encode(str))
  }
  return uint8;
}

/**
 * @param {*} instance 
 * @param {WebAssembly.Memory} memory 
 * @param {string} str 
 */
function textEncodeIntoMemory(instance, memory, str) {
  const pBufCoded = instance.exports.__heap_base.value;
  const bufCodedLen = str.length;
  ensureMemory(memory, pBufCoded, bufCodedLen);

  const bufCoded = new Uint8Array(memory.buffer, pBufCoded, bufCodedLen + 1);
  textEncodeInto(bufCoded, str);
  bufCoded[bufCodedLen] = 0;

  return [pBufCoded, bufCodedLen]
}

/**
 * @param {*} instance 
 * @param {string} str 
 */
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
  return new Uint8Array(bufPlain);
}

const bs2u8 = /** @param {BufferSource} bs */ (bs) => ArrayBuffer.isView(bs)
  ? new Uint8Array(bs.buffer, bs.byteOffset, bs.byteLength)
  : new Uint8Array(bs);

/**
 * @param {*} instance 
 * @param {WebAssembly.Memory} memory 
 * @param {BufferSource} bufferSource 
 */
function writeIntoMemory(instance, memory, bufferSource) {
  const pString = instance.exports.__heap_base.value;
  const stringLen = bufferSource.byteLength;
  ensureMemory(memory, pString, stringLen);

  // +1 so we so we have an extra byte for the string termination char '\0'
  const string = new Uint8Array(memory.buffer, pString, stringLen + 1);
  string.set(bs2u8(bufferSource))
  string[stringLen] = 0;

  return [pString, stringLen];
}

/**
 * @param {*} instance 
 * @param {BufferSource} bufferSource 
 * @param {boolean} urlFriendly 
 */
function encode(instance, bufferSource, urlFriendly) {
  // console.time('wasm');
  const { memory } = instance.exports;

  const [pString, stringLen] = writeIntoMemory(instance, memory, bufferSource);

  const pEncoded = pString + stringLen;
  const encodedLen = instance.exports.Base64encode_len(stringLen);
  ensureMemory(memory, pEncoded, encodedLen);

  const encodedLenReal = instance.exports.Base64encode(
    pEncoded,
    pString,
    stringLen,
    urlFriendly ? 1 : 0,
  );
  // console.timeEnd('wasm');

  // -1 so we don't include string termination char '\0'
  const encoded = new Uint8Array(memory.buffer, pEncoded, encodedLenReal - 1);

  // NOTE: Interestingly, most of the runtime is spent building the string.
  //       As far as I know, this is still the fastest way.
  // console.time('text');
  const str = new TextDecoder().decode(encoded);
  // console.timeEnd('text');

  return str;
}

let decodedWASM = null;

export class WASMImpl {
  async init() {
    decodedWASM = decodedWASM || Base64JS.decode(WASM);
    const { instance } = await WebAssembly.instantiate(decodedWASM);
    this.instance = instance;
    return this;
  }

  /**
   * @param {BufferSource} bufferSource 
   * @param {boolean} urlFriendly 
   */
  encode(bufferSource, urlFriendly) {
    return encode(this.instance, bufferSource, urlFriendly);
  }

  /**
   * @param {string} input 
   */
  decode(input) {
    return decode(this.instance, input);
  }
}

// `jsImpl` is a singleton because it doesn't have any state
export { Base64JS as jsImpl }
