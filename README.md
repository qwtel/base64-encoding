# Base64 Encoding

Fast Base64 encoding and decoding powered by WebAssembly.

This library is modeled after the WHATWG `TextEncoder` and `TextDecoder` API,
providing a `Base64Encoder` and `Base64Decoder` class.

The C code was chosen based on https://github.com/gaspardpetit/base64

NOTE: API and implementation likely to change until 1.0.0 release.


## Usage

Using the WASM optimizes version works as follows:

```js
const encoder = await new Base64Encoder().optimize();
encoder.encode(new TextEncoder().encode('foobar'))   // => Zm9vYmFy

const decoder = await new Base64Decoder().optimize();
new TextDecoder().decode(decoder.decode("Zm9vYmFy")) // => foobar
```

For one-shot usages you can also use the JS implementation without instantiating a WASM instance.

```js
new Base64Encoder().encode(new TextEncoder().encode('foobar'))   // => Zm9vYmFy
new TextDecoder().decode(new Base64Decoder().decode("Zm9vYmFy")) // => foobar
```

### URL-friendly Encoding
This implementaiton also provides a URL-friendly variant of Base64, where

- all `'+'` are mapped to `'-'`
- all `'/'` are mapped to `'_'`
- the padding characters `'='` are omitted

To use the URL-friendly variant, provide the `urlFriendly` setting:

```js
const encoder = await new Base64Encoder({ urlFriendly: true }).optimize();
```

For decoding URL-friendly Base64 no extra steps are required.


## Performance

TBD

Currently only the encoder provides a signification performance improvement over the pure JS implementation.


## Distribution

This module is published on npm under the [`base64-encoding`](https://www.npmjs.com/package/base64-encoding) tag. 
The package contains the following:

- The `mjs` ([Browse](https://unpkg.com/browse/base64-encoding/mjs/)) folder exports ES modules in ES2018 syntax.
All module paths are fully qualified, so they can be imported in Deno or the browser directly.
- The `cjs` ([Browse](https://unpkg.com/browse/base64-encoding/cjs/)) folder exports CommonJS modules in ES5 syntax.
- The `dist` ([Browse](https://unpkg.com/browse/base64-encoding/dist/)) provides rolled up versions as UMD (ES5) as well as ES module (ES2018).

Both `mjs` and `cjs` include `d.ts` type declarations and source maps, so that IntelliSense works out of the box in VSCode.

The `package.json` properly sets the `main`, `module`, `type` and `exports` keys, so that both node and tools build to top will (hopefully) pick the right version.

### Browser
Ideally you would use your build tool of choice using the options provided above.
However, this module can also be imported as a UMD module directly via a script tag:

```html
<script src="https://unpkg.com/base64-encoding/dist/index.js"></script>
<script>
 var Base64Encoder = window.base64Encoding.Base64Encoder; 
 var Base64Decoder = window.base64Encoding.Base64Decoder;
</script>
```

For modern browsers, using the rolled-up ES module works too:

```html
<script type="module">
  import { Base64Encoder, Base64Decoder } from 'https://unpkg.com/base64-encoding/dist/module.js'
</script>
```


## License

TBD

Currently the C code is licensed under a ancient Apache 1.0 license that comes with some pretty oldschool requirements, such as including the following in all promotional materials:

> This product includes software 
> developed by the Apache Group for use in the Apache HTTP server project 
> (http://www.apache.org/).

It is very likely that `ap_base64.c` has been shipped under a Apache-2.0 license somewhere. 
Once I locate it, this requirement will go away.


tbd: https://github.com/dhamidi/apache-httpd-1.3.42/blob/master/src/ap/ap_base64.c
