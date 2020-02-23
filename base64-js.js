/**
 * Slightly modernized version of [`base64-js`][1]. 
 * Performance is ever so slightly improved due to pre-allocating arrays.
 * 
 * This version drops support for platforms that don't provide 
 * `Uint8Array` and `DataView`. Use the original in those cases.
 * 
 * [1]: https://github.com/beatgammit/base64-js
 * [2]: https://tools.ietf.org/html/rfc3986#section-2.3
 */

const b64lookup = []
const urlLookup = []
const revLookup = []

const SAME = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const CODE_B64 = SAME + '+/'
const CODE_URL = SAME + '-_'
const PAD_B64 = '='
const PAD_URL = '~'

const MAX_CHUNK_LENGTH = 16383 // must be multiple of 3

for (let i = 0, len = CODE_B64.length; i < len; ++i) {
  b64lookup[i] = CODE_B64[i]
  urlLookup[i] = CODE_URL[i]
  revLookup[CODE_B64.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;

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
 * Takes a base 64 string and converts it to an array buffer.
 * Accepts both regular Base64 and the URL-friendly variant,
 * where
 * - `+` => `-`,
 * - `/` => `_` and
 * - `=` => `~` (these are unreserved URI characters according to [RFC 3986][2])
 * 
 * [2]: https://tools.ietf.org/html/rfc3986#section-2.3
 * 
 * @param {string} str 
 *   A Base64 string in either regular or  URL-friendly representation
 * @returns {ArrayBuffer}
 *   The binary data as an `ArrayBuffer`.
 */
export function toByteArray(str) {
  let tmp
  const [validLen, placeHoldersLen] = getLens(str)

  const arr = new Uint8Array(_byteLength(validLen, placeHoldersLen))

  let curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  const len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  let i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[str.charCodeAt(i    )] << 18) |
      (revLookup[str.charCodeAt(i + 1)] << 12) |
      (revLookup[str.charCodeAt(i + 2)] <<  6) |
      (revLookup[str.charCodeAt(i + 3)]      )
    arr[curByte++] = (tmp >> 16) & 0xff
    arr[curByte++] = (tmp >>  8) & 0xff
    arr[curByte++] = (tmp      ) & 0xff
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[str.charCodeAt(i    )] <<  2) |
      (revLookup[str.charCodeAt(i + 1)] >>  4)
    arr[curByte++] =  tmp        & 0xff
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[str.charCodeAt(i    )] << 10) |
      (revLookup[str.charCodeAt(i + 1)] <<  4) |
      (revLookup[str.charCodeAt(i + 2)] >>  2)
    arr[curByte++] = (tmp >>  8) & 0xff
    arr[curByte++] =  tmp        & 0xff
  }

  return arr.buffer
}

function tripletToBase64 (lookup, num) {
  return (
    lookup[num >> 18 & 0x3f] +
    lookup[num >> 12 & 0x3f] +
    lookup[num >>  6 & 0x3f] +
    lookup[num       & 0x3f]
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
 * Encodes binary data provided in an array buffer as a Base64 string.
 * @param {BufferSource} bufferSource The raw data to encode.
 * @param {boolean} [urlFriendly] Set to true to encode in a URL-friendly way.
 * @returns {string} The contents a Base64 string.
 */
export function fromByteArray(bufferSource, urlFriendly = false) {
  const view = new DataView(bufferSource.buffer || bufferSource)
  const len = view.byteLength
  const extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  const len2 = len - extraBytes
  const parts = new Array(
    Math.floor(len2 / MAX_CHUNK_LENGTH) + Math.sign(extraBytes)
  )
  const lookup = urlFriendly ? urlLookup : b64lookup;
  const pad = urlFriendly ? PAD_URL : PAD_B64

  // Go through the array every three bytes, we'll deal with trailing stuff 
  // later
  let j = 0
  for (let i = 0; i < len2; i += MAX_CHUNK_LENGTH) {
    parts[j++] = encodeChunk(
      lookup,
      view, 
      i, 
      (i + MAX_CHUNK_LENGTH) > len2 ? len2 : (i + MAX_CHUNK_LENGTH),
    )
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    let tmp = view.getUint8(len - 1);
    parts[j] = (
      lookup[ tmp >>  2]         +
      lookup[(tmp <<  4) & 0x3f] +
      pad + pad
    )
  } else if (extraBytes === 2) {
    let tmp = (view.getUint8(len - 2) << 8) + view.getUint8(len - 1)
    parts[j] = (
      lookup[ tmp >> 10]         +
      lookup[(tmp >>  4) & 0x3f] +
      lookup[(tmp <<  2) & 0x3f] +
      pad
    )
  }

  return parts.join('')
}

export {
  fromByteArray as encode,
  toByteArray as decode,
}
