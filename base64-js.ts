/**
 * Slightly modernized version of [`base64-js`][1]. 
 * Performance is slightly improved due to pre-allocating arrays.
 * 
 * This version drops support for platforms that don't provide 
 * `Uint8Array` and `DataView`. Use the original in those cases.
 * 
 * [1]: https://github.com/beatgammit/base64-js
 * [2]: https://tools.ietf.org/html/rfc3986#section-2.3
 */

const b64lookup: string[] = []
const urlLookup: string[] = []
const revLookup: number[] = []

const CODE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const CODE_B64 = CODE + '+/'
const CODE_URL = CODE + '-_'
const PAD = '='

const MAX_CHUNK_LENGTH = 16383 // must be multiple of 3

for (let i = 0, len = CODE_B64.length; i < len; ++i) {
  b64lookup[i] = CODE_B64[i]
  urlLookup[i] = CODE_URL[i]
  revLookup[CODE_B64.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64: string) {
  const len = b64.length

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  let validLen = b64.indexOf(PAD)
  if (validLen === -1) validLen = len

  const placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

function _byteLength(validLen: number, placeHoldersLen: number) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

/**
 * Takes a base 64 string and converts it to an array buffer.
 * Accepts both regular Base64 and the URL-friendly variant,
 * where `+` => `-`, `/` => `_`, and the padding character is omitted.
 * 
 * @param str A Base64 string in either regular or  URL-friendly representation.
 * @returns The binary data as `Uint8Array`.
 */
export function toByteArray(str: string): Uint8Array {
  let tmp: number

  switch (str.length % 4) {
    case 2: str += "=="; break
    case 3: str += "="; break
  }

  const [validLen, placeHoldersLen] = getLens(str)

  const arr = new Uint8Array(_byteLength(validLen, placeHoldersLen))

  let curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  const len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  let i: number
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

  return arr
}

function tripletToBase64 (lookup: string[], num: number) {
  return (
    lookup[num >> 18 & 0x3f] +
    lookup[num >> 12 & 0x3f] +
    lookup[num >>  6 & 0x3f] +
    lookup[num       & 0x3f]
  )
}

function encodeChunk (
  lookup: string[],
  view: DataView,
  start: number,
  end: number
) {
  let tmp: number;
  const output = new Array((end - start) / 3)
  for (let i = start, j = 0; i < end; i += 3, j++) {
    tmp =
      ((view.getUint8(i    ) << 16) & 0xff0000) +
      ((view.getUint8(i + 1) <<  8) & 0x00ff00) +
      ( view.getUint8(i + 2)        & 0x0000ff)
    output[j] = tripletToBase64(lookup, tmp)
  }
  return output.join('')
}

const bs2dv = (bs: BufferSource) => bs instanceof ArrayBuffer
  ? new DataView(bs)
  : new DataView(bs.buffer, bs.byteOffset, bs.byteLength)

/**
 * Encodes binary data provided in an array buffer as a Base64 string.
 * @param bufferSource The raw data to encode.
 * @param urlFriendly Set to true to encode in a URL-friendly way.
 * @returns The contents a Base64 string.
 */
export function fromByteArray(
  bufferSource: BufferSource, 
  urlFriendly = false
): string {
  const view = bs2dv(bufferSource)
  const len = view.byteLength
  const extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  const len2 = len - extraBytes
  const parts = new Array(
    Math.floor(len2 / MAX_CHUNK_LENGTH) + Math.sign(extraBytes)
  )
  const lookup = urlFriendly ? urlLookup : b64lookup
  const pad = urlFriendly ? '' : PAD

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
    const tmp = view.getUint8(len - 1)
    parts[j] = (
      lookup[ tmp >>  2]         +
      lookup[(tmp <<  4) & 0x3f] +
      pad + pad
    )
  } else if (extraBytes === 2) {
    const tmp = (view.getUint8(len - 2) << 8) + view.getUint8(len - 1)
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
