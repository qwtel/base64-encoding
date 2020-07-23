import { jsImpl, WASMImpl } from './base64.js';

const _impl = new WeakMap();
const _initPromise = new WeakMap();
const _urlFriendly = new WeakMap();

class Base64 {
  constructor() {
    if (typeof Uint8Array === 'undefined' || typeof DataView === 'undefined') {
      throw Error(
        'Platform unsupported. Make sure Uint8Array and DataView exist.'
      );
    }

    _impl.set(this, jsImpl);

    if (typeof 'WebAssembly' !== 'undefined') {
      _initPromise.set(this, new WASMImpl().init().then((impl) => {
        _impl.set(this, impl);
        return this;
      }));
    } else {
      _initPromise.set(this, Promise.resolve(this));
    }
  }

  /** 
   * @returns {Promise<this>}
   */
  get initialized() {
    return _initPromise.get(this);
  }
}

export class Base64Encoder extends Base64 {
  /**
   * Set to encode URL friendly Base64.
   * Decoding is not affected.
   * @param {boolean} urlFriendly;
   */
  set urlFriendly(urlFriendly) {
    _urlFriendly.set(this, urlFriendly);
  };

  /**
   * @returns {boolean}
   */
  get urlFriendly() {
    return _urlFriendly.get(this);
  };

  /**
   * @param {{ urlFriendly?: boolean }} [options]
   */
  constructor({ urlFriendly = false } = {}) {
    super();
    _urlFriendly.set(this, urlFriendly);
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