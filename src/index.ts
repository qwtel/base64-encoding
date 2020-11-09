import { jsImpl, WASMImpl } from './base64';

interface Impl {
  encode(bs: BufferSource, url: boolean): string;
  decode(str: string): Uint8Array;
}

class Base64Provider {
  impl: Impl;

  constructor() {
    if (typeof Uint8Array === 'undefined' || typeof DataView === 'undefined') {
      throw Error(
        'Platform unsupported. Make sure Uint8Array and DataView exist.'
      );
    }
    this.impl = jsImpl;
  }

  async init() {
    if (typeof WebAssembly !== 'undefined') {
      try {
        this.impl = await new WASMImpl().init();
      } catch (err) {
        throw new Error('WASM instantiation failed: ' + err.message);
      }
    } else {
      throw new Error('WebAssembly missing in global scope.');
    }
  }

  encode(input: BufferSource, url: boolean): string {
    return this.impl.encode(input, url);
  }

  decode(input: string): Uint8Array {
    return this.impl.decode(input);
  }
}

export interface Base64EncoderOptions {
  /**
   * Whether this encoder is set to encode data as URL-friendly Base64.
   * 
   * URL-friendly here means that `+` maps to `-`, `/` maps to `_`, and 
   * the padding characters `=` are is omitted, 
   * while the rest of the alphabet is shared.
   */
  url?: boolean;

  /** @deprecated Use `url` instead. */
  urlFriendly?: boolean;
}

/**
 * Base64 encoder class to encode binary data in Base64 strings,
 * similar to `TextEncoder`.
 */
export class Base64Encoder {
  #provider: Base64Provider = new Base64Provider();
  #urlFriendly: boolean;
  
  /**
   * Whether this encoder is set to encode data as URL-friendly Base64.
   */
  get url() {
    return this.#urlFriendly;
  };

  /**
   * @deprecated Use `url` instead.
   */
  get urlFriendly() {
    return this.url;
  };

  /**
   * Creates a new encoder object with underlying WebAssembly instance.
   * 
   * Note that the WASM instance might grow its internal memory to fit large 
   * array buffers.
   */
  constructor(options: Base64EncoderOptions = {}) {
    const { url, urlFriendly } = options;
    this.#urlFriendly = url ?? urlFriendly ?? false;
  }

  /** 
   * Optimize this encoder to use the faster WASM implementation.
   * @returns This encoder after WASM initialization has completed.
   */
  async optimize(): Promise<this> { 
    await this.#provider.init();
    return this;
  }

  /** 
   * Encodes an array buffer into a Base64 string.
   * 
   * @param input Binary data to be Base64 encoded
   * @returns The provided array buffer encoded as a Base64 string
   */
  encode(input: BufferSource): string {
    return this.#provider.encode(input, this.url);
  }
}

/**
 * Base64 Decoder class to convert Base64 strings into array buffers,
 * similar to `TextDecoder`.
 */
export class Base64Decoder {
  #provider = new Base64Provider();

  /** 
   * Optimize this decoder to use the faster WASM implementation.
   * @returns This decoder after WASM initialization has completed.
   */
  async optimize(): Promise<this> { 
    await this.#provider.init();
    return this;
  }

  /** 
   * Decodes a Base64 string and returns a new array buffer.
   * 
   * @param input A Base64 string. Can be either URL friendly or not and 
   *   padding may be omitted.
   * @returns The binary data as an array buffer.
   */
  decode(input: string): Uint8Array {
    return this.#provider.decode(input);
  }
}
