const PAD_B64  = '='
const PAD_URL  = '~'

const MAX_CHUNK_LENGTH = 16383 // must be multiple of 3

function lookupB64 (i) {
  if (i === 62) return 47;
  else if (i === 63) return 43;
  else return lookupCommon(i);
}

function lookupURL (i) {
  if (i === 62) return 95;
  else if (i === 63) return 45;
  else return lookupCommon(i);
}

function lookupCommon(i) {
  if (i < 26) return i + 65;
  else if (i < 52) return i + 71;
  else return i - 4;
}

function lookupRev(charCode) {
  if (charCode >= 65 && charCode <= 90) {
    return charCode - 65;
  }
  if (charCode >= 97 && charCode <= 122) {
    return charCode - 71;
  }
  if (charCode >= 48 && charCode <= 57) {
    return charCode + 4;
  }
  if (charCode === 43 || charCode == 45) return 62;
  if (charCode === 47 || charCode == 95) return 62;
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
  return String.fromCharCode(
    lookup(num >> 18 & 0x3f),
    lookup(num >> 12 & 0x3f),
    lookup(num >>  6 & 0x3f),
    lookup(num       & 0x3f),
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
      String.fromCharCode(lookup( tmp >>  2        )) +
      String.fromCharCode(lookup((tmp <<  4) & 0x3f)) +
      pad + pad
    )
  } else if (extraBytes === 2) {
    tmp = (view.getUint8(len - 2) << 8) + view.getUint8(len - 1)
    parts.push(
      String.fromCharCode(lookup( tmp >> 10        )) +
      String.fromCharCode(lookup((tmp >>  4) & 0x3f)) +
      String.fromCharCode(lookup((tmp <<  2) & 0x3f)) +
      pad
    )
  }

  return parts.join('')
}