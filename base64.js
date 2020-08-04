import * as Base64JS from './base64-js.js';

const WASM = `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`;

const BYTES_PER_PAGE = 64 * 1024;

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

  switch (str.length % 4) {
    case 2: str += "=="; break;
    case 3: str += "="; break;
  }

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

  // +1 so we so we have an extra byte for the string termination char '\0'
  const string = new Uint8Array(memory.buffer, pString, stringLen + 1);
  string.set(new Uint8Array(arrayBuffer));
  string[stringLen] = '\0';

  return [pString, stringLen];
}

function encode(instance, arrayBuffer, urlFriendly) {
  // console.time('wasm');
  const { memory } = instance.exports;

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
    urlFriendly ? 1 : 0,
  );
  // console.timeEnd('wasm');

  // NOTE: Interestingly, most of the runtime is spent building the string.
  //       As far as I know, this is still the fastest way.
  // console.time('text');
  const str = new TextDecoder().decode(encoded);
  // console.timeEnd('text');

  if (urlFriendly) {
    const len = str.length;
    if (str[len - 2] == '.') return str.substr(0, len - 2);
    if (str[len - 1] == '.') return str.substr(0, len - 1);
  }

  return str;
}

export class WASMImpl {
  async init() {
    const { instance } = await WebAssembly.instantiate(Base64JS.decode(WASM));
    this.instance = instance;
    return this;
  }

  encode(arrayBuffer, urlFriendly) {
    return encode(this.instance, arrayBuffer, urlFriendly);
  }

  decode(string) {
    return decode(this.instance, string);
  }
}

// `jsImpl` is a singleton because it doesn't have any state
export { Base64JS as jsImpl }
