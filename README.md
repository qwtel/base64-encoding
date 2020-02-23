# Web Base64
Slightly modernized version of [`base64-js`](https://github.com/beatgammit/base64-js). 

Main difference is the option to generate URL-friendly Base64,
where
- `+` => `-`,
- `/` => `_` and
- `=` => `~` (these are unreserved URI characters according to [RFC 3986](https://tools.ietf.org/html/rfc3986#section-2.3))

This version also drops support for platforms that don't provide `Uint8Array` and `DataView`.

API has slightly changed and now expects an `ArrayBuffer` instead of an `Uint8Array`, whcih makes it easier to use with other typed arrays and without the need for additional copying. 

## Usage

```js
const mobyDick = await fs.promises.readFile(path.resolve('test/mobydick.txt'));
const b64String = fromByteArray(mobyDick.buffer)
```


This product includes software developed by the Apache Group for use in the Apache HTTP server project (http://www.apache.org/).