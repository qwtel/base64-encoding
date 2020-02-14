# Web Base64
Slightly modernized version of [`base64-js`](https://github.com/beatgammit/base64-js). 
Performance should be close to the same.
Main difference is the option to generate URL-friendly Base64,
where
- `+` => `-`,
- `/` => `_` and
- `=` => `~` (these are unreserved URI characters according to [RFC 3986](https://tools.ietf.org/html/rfc3986#section-2.3))

This version also drops support for platforms that don't provide `Uint8Array` and `DataView` (use a polyfill instead).