/**
 * Slightly modernized version of [`base64-js`](https://github.com/beatgammit/base64-js). 
 * Performance should be close to the same.
 * Main difference is the option to generate URL-friendly Base64,
 * where
 * - `+` => `-`,
 * - `/` => `_` and
 * - `=` => `~` (these are unreserved URI characters according to [RFC 3986](https://tools.ietf.org/html/rfc3986#section-2.3))
 * 
 * This version also drops support for platforms that don't provide `Uint8Array` and `DataView` (use a polyfill instead).
 */

const PAD_B64  = '='
const PAD_URL  = '~'

const MAX_CHUNK_LENGTH = 16383 // must be multiple of 3

function lookupB64 (i) {
  switch (i) {
    case 62: return '+';
    case 63: return '/';
    default: return lookupCommon(i);
  }
}

function lookupURL (i) {
  switch (i) {
    case 62: return '-';
    case 63: return '_';
    default: return lookupCommon(i);
  }
}

function lookupCommon(i) {
  switch(i) {
    case  0: return 'A';
    case  1: return 'B';
    case  2: return 'C';
    case  3: return 'D';
    case  4: return 'E';
    case  5: return 'F';
    case  6: return 'G';
    case  7: return 'H';
    case  8: return 'I';
    case  9: return 'J';
    case 10: return 'K';
    case 11: return 'L';
    case 12: return 'M';
    case 13: return 'N';
    case 14: return 'O';
    case 15: return 'P';
    case 16: return 'Q';
    case 17: return 'R';
    case 18: return 'S';
    case 19: return 'T';
    case 20: return 'U';
    case 21: return 'V';
    case 22: return 'W';
    case 23: return 'X';
    case 24: return 'Y';
    case 25: return 'Z';
    case 26: return 'a';
    case 27: return 'b';
    case 28: return 'c';
    case 29: return 'd';
    case 30: return 'e';
    case 31: return 'f';
    case 32: return 'g';
    case 33: return 'h';
    case 34: return 'i';
    case 35: return 'j';
    case 36: return 'k';
    case 37: return 'l';
    case 38: return 'm';
    case 39: return 'n';
    case 40: return 'o';
    case 41: return 'p';
    case 42: return 'q';
    case 43: return 'r';
    case 44: return 's';
    case 45: return 't';
    case 46: return 'u';
    case 47: return 'v';
    case 48: return 'w';
    case 49: return 'x';
    case 50: return 'y';
    case 51: return 'z';
    case 52: return '0';
    case 53: return '1';
    case 54: return '2';
    case 55: return '3';
    case 56: return '4';
    case 57: return '5';
    case 58: return '6';
    case 59: return '7';
    case 60: return '8';
    case 61: return '9';
  }
}

function lookupRev(charCode) {
  switch (charCode) {
    case  65: return  0;
    case  66: return  1;
    case  67: return  2;
    case  68: return  3;
    case  69: return  4;
    case  70: return  5;
    case  71: return  6;
    case  72: return  7;
    case  73: return  8;
    case  74: return  9;
    case  75: return 10;
    case  76: return 11;
    case  77: return 12;
    case  78: return 13;
    case  79: return 14;
    case  80: return 15;
    case  81: return 16;
    case  82: return 17;
    case  83: return 18;
    case  84: return 19;
    case  85: return 20;
    case  86: return 21;
    case  87: return 22;
    case  88: return 23;
    case  89: return 24;
    case  90: return 25;
    case  97: return 26;
    case  98: return 27;
    case  99: return 28;
    case 100: return 29;
    case 101: return 30;
    case 102: return 31;
    case 103: return 32;
    case 104: return 33;
    case 105: return 34;
    case 106: return 35;
    case 107: return 36;
    case 108: return 37;
    case 109: return 38;
    case 110: return 39;
    case 111: return 40;
    case 112: return 41;
    case 113: return 42;
    case 114: return 43;
    case 115: return 44;
    case 116: return 45;
    case 117: return 46;
    case 118: return 47;
    case 119: return 48;
    case 120: return 49;
    case 121: return 50;
    case 122: return 51;
    case  48: return 52;
    case  49: return 53;
    case  50: return 54;
    case  51: return 55;
    case  52: return 56;
    case  53: return 57;
    case  54: return 58;
    case  55: return 59;
    case  56: return 60;
    case  57: return 61;
    case  43: return 62; // +
    case  47: return 63; // /
    case  45: return 62; // -
    case  95: return 63; // _
  }
}

function getLens (b64) {
  const len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  let validLen = b64.indexOf(PAD_B64)
  if (validLen === -1) validLen = b64.indexOf(PAD_URL)
  if (validLen === -1) validLen = len

  const placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
export function byteLength(b64) {
  const [validLen, placeHoldersLen] = getLens(b64)
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength(validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

/**
 * Takes a base 64 string and converts it to `Uint8Array`.
 * Accepts both regualar Base64 and the URL-friendly variant,
 * where
 * - `+` => `-`,
 * - `/` => `_` and
 * - `=` => `~` (these are unreserved URI characters according to [RFC 3986](https://tools.ietf.org/html/rfc3986#section-2.3))
 * 
 * @param {string} b64 A Base64 string in either regular or URL-friendly representation
 * @returns {ArrayBuffer} The binary data as an `ArrayBuffer`.
 */
export function toByteArray(b64) {
  let tmp
  const [validLen, placeHoldersLen] = getLens(b64)

  const arr = new Uint8Array(_byteLength(validLen, placeHoldersLen))

  let curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  const len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  let i
  for (i = 0; i < len; i += 4) {
    tmp =
      (lookupRev(b64.charCodeAt(i    )) << 18) |
      (lookupRev(b64.charCodeAt(i + 1)) << 12) |
      (lookupRev(b64.charCodeAt(i + 2)) <<  6) |
      (lookupRev(b64.charCodeAt(i + 3))      )
    arr[curByte++] = (tmp >> 16) & 0xff
    arr[curByte++] = (tmp >>  8) & 0xff
    arr[curByte++] = (tmp      ) & 0xff
  }

  if (placeHoldersLen === 2) {
    tmp =
      (lookupRev(b64.charCodeAt(i    )) <<  2) |
      (lookupRev(b64.charCodeAt(i + 1)) >>  4)
    arr[curByte++] =  tmp        & 0xff
  }

  if (placeHoldersLen === 1) {
    tmp =
      (lookupRev(b64.charCodeAt(i    )) << 10) |
      (lookupRev(b64.charCodeAt(i + 1)) <<  4) |
      (lookupRev(b64.charCodeAt(i + 2)) >>  2)
    arr[curByte++] = (tmp >>  8) & 0xff
    arr[curByte++] =  tmp        & 0xff
  }

  return arr.buffer
}

function tripletToBase64 (lookup, num) {
  return (
    lookup(num >> 18 & 0x3f) +
    lookup(num >> 12 & 0x3f) +
    lookup(num >>  6 & 0x3f) +
    lookup(num       & 0x3f)
  )
}

function encodeChunk (lookup, view, start, end) {
  let tmp
  const output = new Array((end - start) / 3)
  for (let i = start, j = 0; i < end; i += 3, j++) {
    tmp =
      ((view.getUint8(i    ) << 16) & 0xff0000) +
      ((view.getUint8(i + 1) <<  8) & 0x00ff00) +
      ( view.getUint8(i + 2)        & 0x0000ff)
    output[j] = tripletToBase64(lookup, tmp);
  }
  return output.join('')
}

/**
 * 
 * @param {ArrayBuffer} arrayBuffer 
 * @param {boolean} [urlFriendly] Set to true to encode in a URL-friendly way.
 * @returns {string} The contents of `typedArray` as a Base64 string.
 */
export function fromByteArray(arrayBuffer, urlFriendly = false) {
  let tmp
  const view = new DataView(arrayBuffer)
  const len = view.byteLength;
  const extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  const parts = []
  const lookup = urlFriendly ? lookupURL : lookupB64;
  const pad = urlFriendly ? PAD_URL : PAD_B64

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (let i = 0, len2 = len - extraBytes; i < len2; i += MAX_CHUNK_LENGTH) {
    parts.push(encodeChunk(
      lookup,
      view, 
      i, 
      (i + MAX_CHUNK_LENGTH) > len2 ? len2 : (i + MAX_CHUNK_LENGTH),
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = view.getUint8(len - 1);
    parts.push(
      lookup( tmp >>  2        ) +
      lookup((tmp <<  4) & 0x3f) +
      pad + pad
    )
  } else if (extraBytes === 2) {
    tmp = (view.getUint8(len - 2) << 8) + view.getUint8(len - 1)
    parts.push(
      lookup( tmp >> 10        ) +
      lookup((tmp >>  4) & 0x3f) +
      lookup((tmp <<  2) & 0x3f) +
      pad
    )
  }

  return parts.join('')
}