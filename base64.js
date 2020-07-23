import * as Base64JS from './base64-js.js';

const WASM = `
AGFzbQEAAAABFwRgAX8Bf2AAAGACf38Bf2AEf39/fwF/AwYFAQACAAMFAwEAAgYkBn8AQYAIC38AQZEL
C38AQYAIC38AQaCLBAt/AEEAC38AQQELB7sBDAZtZW1vcnkCABFfX3dhc21fY2FsbF9jdG9ycwAAEEJh
c2U2NGRlY29kZV9sZW4AAQxCYXNlNjRkZWNvZGUAAhBCYXNlNjRlbmNvZGVfbGVuAAMMQmFzZTY0ZW5j
b2RlAAQMX19kc29faGFuZGxlAwAKX19kYXRhX2VuZAMBDV9fZ2xvYmFsX2Jhc2UDAgtfX2hlYXBfYmFz
ZQMDDV9fbWVtb3J5X2Jhc2UDBAxfX3RhYmxlX2Jhc2UDBQrKBgUDAAELNwEDfyAAIQEDQCABLQAAIAFB
AWoiAyEBQYAIai0AAEHAAEkNAAsgAyAAa0ECakEEbUEDbEEBaguXAwEDfyABIQIDQCACLQAAIAJBAWoi
AyECQYAIai0AAEHAAEkNAAsgAyABQX9zaiICQQNqQQRtIAJBBU4EQCADIAFrQQNqIQIDQCAAIAEtAABB
gAhqLQAAQQJ0IAFBAWoiAy0AAEGACGotAABBBHZyOgAAIABBAWogAy0AAEGACGotAABBBHQgAUECaiID
LQAAQYAIai0AAEECdnI6AAAgAEECaiABQQNqLQAAQYAIai0AACADLQAAQYAIai0AAEEGdHI6AAAgAEED
aiEAIAFBBGohASACQXxqIgJBCEoNAAsgAkF8aiECC0EDbAJAIAJBAkgNACAAIAEtAABBgAhqLQAAQQJ0
IAEtAAFBgAhqLQAAQQR2cjoAACACQQJGBEAgAEEBaiEADAELIAAgAS0AAUGACGotAABBBHQgAS0AAkGA
CGotAABBAnZyOgABIAJBBEgEQCAAQQJqIQAMAQsgACABLQADQYAIai0AACABLQACQYAIai0AAEEGdHI6
AAIgAEEDaiEACyAAQQA6AABBACACa0EDcWsLEAAgAEECakEDbUECdEEBcgvhAgEGf0GACkHQCiADQQFG
IgcbIQQgACEDIAJBA04EQCACQX5qIQgDQCADIAQgASAGaiIFLQAAQQJ2ai0AADoAACADQQFqIAQgBS0A
AEEEdEEwcSAFQQFqIgktAABBBHZyai0AADoAACADQQJqIAQgCS0AAEECdEE8cSAFQQJqIgUtAABBBnZy
ai0AADoAACADQQNqIAQgBS0AAEE/cWotAAA6AAAgA0EEaiEDIAZBA2oiBiAISA0ACwsgBiACSARAQf4A
QT0gBxshBSADIAQgASAGaiIBLQAAQQJ2ai0AADoAACABLQAAQQR0QTBxIQcCfyACQX9qIAZGBEAgAyAE
IAdqLQAAOgABIAUMAQsgAyAEIAFBAWoiAS0AAEEEdiAHcmotAAA6AAEgBCABLQAAQQJ0QTxxai0AAAsh
ASADIAU6AAMgAyABOgACIANBBGohAwsgA0EAOgAAIAMgAGtBAWoLC44DAgBBgAgLwAJAQEBAQEBAQEBA
QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAPkA+QD80NTY3ODk6Ozw9QEBAQEBAQAABAgME
BQYHCAkKCwwNDg8QERITFBUWFxgZQEBAQD9AGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjNAQEBAQEBA
QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA
QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA
QEBAQEBAQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAx
MjM0NTY3ODktXwBB0AoLQEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFy
c3R1dnd4eXowMTIzNDU2Nzg5Ky8AJglwcm9kdWNlcnMBDHByb2Nlc3NlZC1ieQEFY2xhbmcGMTAuMC4w
`.trim().replace(/\n/g, '');

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
    urlFriendly ? 1 : 0,
  );
  // console.timeEnd('wasm');

  // NOTE: Interestingly, most of the runtime is spent building the string.
  //       As far as I know, this is still the fastest way.
  // console.time('text');
  const str = new TextDecoder().decode(encoded);
  // console.timeEnd('text');

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
