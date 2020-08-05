import { jsImpl, WASMImpl } from './base64.js';

const _impl = new WeakMap();
const _urlFriendly = new WeakMap();

/**
 * @this {Base64}
 */
async function instantiate() {
  if (typeof WebAssembly !== 'undefined') {
    try {
      _impl.set(this, await new WASMImpl().init());
    } catch (err) {
      throw new Error('WASM instantiation failed: ' + err.message);
    }
  } else {
    throw new Error('WebAssembly missing from global scope.');
  }
  return this;
}

class Base64 {
  constructor() {
    if (typeof Uint8Array === 'undefined' || typeof DataView === 'undefined') {
      throw Error(
        'Platform unsupported. Make sure Uint8Array and DataView exist.'
      );
    }
    _impl.set(this, jsImpl);
  }
}

/**
 * @typedef {{ urlFriendly?: boolean }} Base64EncoderOptions
 */

/**
 * Base64 encoder class to encode binary data in Base64 strings,
 * similar to `TextEncoder`.
 */
export class Base64Encoder extends Base64 {
  /**
   * @returns {boolean} Whether this encoder is set to URL-friendly encoding.
   */
  get urlFriendly() {
    return _urlFriendly.get(this);
  };

  /** 
   * Optimize this encoder to use the faster WASM implementation.
   * @returns {Promise<this>} 
   *   This encoder after WASM initialization has completed.
   */
  optimize() { 
    return instantiate.call(this);
  }

  /**
   * Creates a new encoder object with underlying WebAssembly instance.
   * 
   * Note that the WASM instance might grow its internal memory to fit large 
   * array buffers.
   * 
   * @param {Base64EncoderOptions} [options] 
   */
  constructor({ urlFriendly = false } = {}) {
    super();
    _urlFriendly.set(this, urlFriendly);
  }

  /** 
   * Encodes an array buffer into a Base64 string.
   * @param {ArrayBuffer} arrayBuffer Binary data to be Base64 encoded
   * @returns {string} The provided array buffer encoded as a Base64 string
   */
  encode(arrayBuffer) {
    return _impl.get(this).encode(arrayBuffer, this.urlFriendly);
  }
}

/**
 * Base64 Decoder class to convert Base64 strings into array buffers,
 * similar to `TextDecoder`.
 */
export class Base64Decoder extends Base64 {
  /** 
   * Optimize this decoder to use the faster WASM implementation.
   * 
   * @returns {Promise<this>} 
   *   This decoder after WASM initialization has completed.
   */
  optimize() { 
    return instantiate.call(this);
  }

  /** 
   * Decodes a Base64 string into a .
   * @param {string} string
   * @returns {ArrayBuffer}
   */
  decode(string) {
    return _impl.get(this).decode(string);
  }
}
