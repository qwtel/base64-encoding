import * as Base64JS from './base64-js.ts';

const WASM = `
AGFzbQEAAAABFwRgAABgAX8Bf2ACf38Bf2AEf39/fwF/AwYFAAECAQMFAwEAAgYrB38BQaCLBAt/AEGA
CAt/AEGRCwt/AEGACAt/AEGgiwQLfwBBAAt/AEEBCwe7AQwGbWVtb3J5AgARX193YXNtX2NhbGxfY3Rv
cnMAABBCYXNlNjRkZWNvZGVfbGVuAAEMQmFzZTY0ZGVjb2RlAAIQQmFzZTY0ZW5jb2RlX2xlbgADDEJh
c2U2NGVuY29kZQAEDF9fZHNvX2hhbmRsZQMBCl9fZGF0YV9lbmQDAg1fX2dsb2JhbF9iYXNlAwMLX19o
ZWFwX2Jhc2UDBA1fX21lbW9yeV9iYXNlAwUMX190YWJsZV9iYXNlAwYKqAcFAgALPgEDf0EAIQEDQCAA
IAFqIQIgAUEBaiIDIQEgAi0AAEGAiICAAGotAABBwABJDQALIANBAmpBBG1BA2xBAWoLxQMBBH9BAyEC
A0AgASACaiEDIAJBAWoiBCECIANBfWotAABBgIiAgABqLQAAQcAASQ0ACwJAIARBfGoiAkEFSA0AIAQh
AgNAIAAgAUEBaiIDLQAAQYCIgIAAai0AAEEEdiABLQAAQYCIgIAAai0AAEECdHI6AAAgAEEBaiABQQJq
IgUtAABBgIiAgABqLQAAQQJ2IAMtAABBgIiAgABqLQAAQQR0cjoAACAAQQJqIAFBA2otAABBgIiAgABq
LQAAIAUtAABBgIiAgABqLQAAQQZ0cjoAACAAQQNqIQAgAUEEaiEBIAJBfGoiAkEISg0ACyACQXxqIQIL
AkAgAkECSA0AIAAgAS0AAUGAiICAAGotAABBBHYgAS0AAEGAiICAAGotAABBAnRyOgAAAkAgAkECRw0A
IABBAWohAAwBCyAAIAEtAAJBgIiAgABqLQAAQQJ2IAEtAAFBgIiAgABqLQAAQQR0cjoAAQJAIAJBBE4N
ACAAQQJqIQAMAQsgACABLQADQYCIgIAAai0AACABLQACQYCIgIAAai0AAEEGdHI6AAIgAEEDaiEACyAA
QQA6AAAgBEF/akEEbUEDbEEAIAJrQQNxawsQACAAQQJqQQNtQQJ0QQFyC4sDAQZ/QYCKgIAAQdCKgIAA
IANBAUYbIQRBACEFIAAhBgJAIAJBA0gNACACQX5qIQdBACEFIAAhBgNAIAYgBCABIAVqIggtAABBAnZq
LQAAOgAAIAZBAWogBCAILQAAQQR0QTBxIAhBAWoiCS0AAEEEdnJqLQAAOgAAIAZBAmogBCAJLQAAQQJ0
QTxxIAhBAmoiCC0AAEEGdnJqLQAAOgAAIAZBA2ogBCAILQAAQT9xai0AADoAACAGQQRqIQYgBUEDaiIF
IAdIDQALCwJAIAUgAk4NACAGIAQgASAFaiIILQAAQQJ2ai0AADoAACAILQAAQQR0QTBxIQkCQAJAAkAg
BSACQX9qRw0AIAYgBCAJai0AADoAASADRQ0BIAZBAmohBgwDCyAGIAQgCSAIQQFqIggtAABBBHZyai0A
ADoAASAGIAQgCC0AAEECdEE8cWotAAA6AAIgA0UNASAGQQNqIQYMAgsgBkE9OgACCyAGQT06AAMgBkEE
aiEGCyAGQQA6AAAgBiAAa0EBagsLmQMBAEGACAuRA0BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA
QEBAQEBAQEBAQEBAQEA+QD5APzQ1Njc4OTo7PD1AQEBAQEBAAAECAwQFBgcICQoLDA0ODxAREhMUFRYX
GBlAQEBAP0AaGxwdHh8gISIjJCUmJygpKissLS4vMDEyM0BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA
QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA
QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBBQkNERUZHSElKS0xN
Tk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OS1fAAAAAAAAAAAA
AAAAAAAAAEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXow
MTIzNDU2Nzg5Ky8AAHsEbmFtZQFUBQARX193YXNtX2NhbGxfY3RvcnMBEEJhc2U2NGRlY29kZV9sZW4C
DEJhc2U2NGRlY29kZQMQQmFzZTY0ZW5jb2RlX2xlbgQMQmFzZTY0ZW5jb2RlBxIBAA9fX3N0YWNrX3Bv
aW50ZXIJCgEABy5yb2RhdGEALwlwcm9kdWNlcnMBDHByb2Nlc3NlZC1ieQEOSG9tZWJyZXcgY2xhbmcG
MTMuMC4x
`.replace(/\n/g, '').trim()

const BYTES_PER_PAGE = 64 * 1024;

function ensureMemory(
  memory: WebAssembly.Memory,
  pointer: number,
  targetLength: number
) {
  const availableMemory = memory.buffer.byteLength - pointer;
  if (availableMemory < targetLength) {
    const nPages = Math.ceil((targetLength - availableMemory) / BYTES_PER_PAGE);
    memory.grow(nPages);
  }
}

const textEncodeInto: (
  encoder: TextEncoder,
  uint8: Uint8Array,
  str: string,
) => Uint8Array =
  'encodeInto' in TextEncoder.prototype
    ? (encoder, uint8, str) => (encoder.encodeInto(str, uint8), uint8)
    : (encoder, uint8, str) => (uint8.set(encoder.encode(str)), uint8);

type Val = { value: number };

function textEncodeIntoMemory(
  instance: WebAssembly.Instance,
  memory: WebAssembly.Memory,
  str: string,
  encoder: TextEncoder,
) {
  const pBufCoded = (instance.exports.__heap_base as Val).value;
  const bufCodedLen = str.length;
  ensureMemory(memory, pBufCoded, bufCodedLen);

  const bufCoded = new Uint8Array(memory.buffer, pBufCoded, bufCodedLen + 1);
  textEncodeInto(encoder, bufCoded, str);
  bufCoded[bufCodedLen] = 0;

  return [pBufCoded, bufCodedLen]
}

function decode(
  instance: WebAssembly.Instance,
  str: string,
  encoder: TextEncoder,
) {
  const { exports } = instance;
  const memory = exports.memory as WebAssembly.Memory;
  const c_Base64decode_len = exports.Base64decode_len as Function;
  const c_Base64decode = exports.Base64decode as Function;

  // console.time('textEncodeIntoMemory');
  const [pBufCoded, bufCodedLen] =
    textEncodeIntoMemory(instance, memory, str, encoder);
  // console.timeEnd('textEncodeIntoMemory');

  // console.time('c_Base64decode_len');
  const pBufPlain = pBufCoded + bufCodedLen;
  const bufPlainLen: number = c_Base64decode_len(pBufCoded);
  ensureMemory(memory, pBufPlain, bufPlainLen);
  // console.timeEnd('c_Base64decode_len');

  // console.time('c_Base64decode');
  const lenReal: number = c_Base64decode(pBufPlain, pBufCoded);
  const bufPlain = new Uint8Array(memory.buffer, pBufPlain, lenReal);
  // console.timeEnd('c_Base64decode');

  // Return a copy to avoid returning a view directly into WASM memory.
  // console.time('slice');
  const ret = bufPlain.slice();
  // console.timeEnd('slice');

  return ret;
}

const bs2u8 = (bs: BufferSource) => bs instanceof ArrayBuffer
  ? new Uint8Array(bs)
  : new Uint8Array(bs.buffer, bs.byteOffset, bs.byteLength);

function writeIntoMemory(
  instance: WebAssembly.Instance,
  memory: WebAssembly.Memory,
  bufferSource: BufferSource,
) {
  const pString = (instance.exports.__heap_base as Val).value;
  const stringLen = bufferSource.byteLength;
  ensureMemory(memory, pString, stringLen);

  // +1 so we so we have an extra byte for the string termination char '\0'
  const string = new Uint8Array(memory.buffer, pString, stringLen + 1);
  string.set(bs2u8(bufferSource))
  string[stringLen] = 0;

  return [pString, stringLen];
}

function encode(
  instance: WebAssembly.Instance,
  bufferSource: BufferSource,
  urlFriendly: boolean,
) {
  // console.time('wasm');
  const { exports } = instance;
  const memory = exports.memory as WebAssembly.Memory;
  const c_Base64encode_len = exports.Base64encode_len as Function;
  const c_Base64encode = exports.Base64encode as Function;

  const [pString, stringLen] = writeIntoMemory(instance, memory, bufferSource);

  const pEncoded = pString + stringLen;
  const encodedLen: number = c_Base64encode_len(stringLen);
  ensureMemory(memory, pEncoded, encodedLen);

  const encodedLenReal: number = c_Base64encode(
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

let decodedWASM: Uint8Array | null = null;

export class WASMImpl {
  instance!: WebAssembly.Instance;
  encoder = new TextEncoder();

  async init() {
    decodedWASM ||= Base64JS.decode(WASM);
    const { instance } = await WebAssembly.instantiate(decodedWASM);
    this.instance = instance;
    return this;
  }

  encode(bufferSource: BufferSource, urlFriendly: boolean): string {
    return encode(this.instance, bufferSource, urlFriendly);
  }

  decode(input: string): Uint8Array {
    return decode(this.instance, input, this.encoder);
  }
}

// `jsImpl` is a singleton because it doesn't have any state
export { Base64JS as jsImpl }
