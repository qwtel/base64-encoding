import './global-this.js';

import { jsImpl, WASMImpl } from './base64.js';

const _impl = new WeakMap();
const _initPromise = new WeakMap();

class Base64 {
  constructor() {
    if (!'Uint8Array' in globalThis && 'DataView' in globalThis) {
      throw Error(
        'Platform unsupported. Make sure Uint8Array and DataView exist'
      );
    }
    _impl.set(this, jsImpl);
  }

  /** 
   * @returns {Promise<this>}
   */
  get initialized() {
    if (!_initPromise.has(this)) {
      _initPromise.set(this, (async () => {
        if ('WebAssembly' in globalThis) {
          const impl = await new WASMImpl().init();
          _impl.set(this, impl);
          return this;
        };
      })());
    }

    return _initPromise.get(this);
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