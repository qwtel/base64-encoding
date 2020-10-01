import { jsImpl, WASMImpl } from './base64.js';

interface Impl {
  encode(bs: BufferSource, url: boolean): string;
  decode(str: string): Uint8Array;
}

const _impl = new WeakMap<Base64, Impl>();
const _urlFriendly = new WeakMap<Base64, boolean>();

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

  /** 
   * Optimize this encoder/decoder to use the faster WASM implementation.
   * @returns This encoder after WASM initialization has completed.
   */
  optimize(): Promise<this> { 
    return instantiate.call(this);
  }
}

interface Base64EncoderOptions {
  /**
   * Whether this encoder is set to encode data as URL-friendly Base64.
   * 
   * URL-friendly here means that `+` maps to `-`, `/` maps to `_`, and 
   * the padding characters `=` are is omitted, 
   * while the rest of the alphabet is shared.
   */
  urlFriendly?: boolean;
}


/**
 * Base64 encoder class to encode binary data in Base64 strings,
 * similar to `TextEncoder`.
 */
export class Base64Encoder extends Base64 {
  /**
   * Whether this encoder is set to encode data as URL-friendly Base64.
   */
  get urlFriendly() {
    return _urlFriendly.get(this);
  };

  /**
   * Creates a new encoder object with underlying WebAssembly instance.
   * 
   * Note that the WASM instance might grow its internal memory to fit large 
   * array buffers.
   */
  constructor(options: Base64EncoderOptions = {}) {
    super();
    const { urlFriendly = false } = options;
    _urlFriendly.set(this, urlFriendly);
  }

  /** 
   * Encodes an array buffer into a Base64 string.
   * 
   * @param input Binary data to be Base64 encoded
   * @returns The provided array buffer encoded as a Base64 string
   */
  encode(input: BufferSource): string {
    return _impl.get(this).encode(input, this.urlFriendly);
  }
}

/**
 * Base64 Decoder class to convert Base64 strings into array buffers,
 * similar to `TextDecoder`.
 */
export class Base64Decoder extends Base64 {
  /** 
   * Decodes a Base64 string and returns a new array buffer.
   * 
   * @param input A Base64 string. Can be either URL friendly or not. Padding may be omitted.
   * @returns The binary data as an array buffer.
   */
  decode(input: string): Uint8Array {
    return _impl.get(this).decode(input);
  }
}
