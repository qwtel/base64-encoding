# Base64 Encoding

Fast Base64 encoding and decoding powered by WebAssembly.

Both API and implementation likely to change before the 1.0.0 release.
{:.note}

This library is modeled after the WHATWG `TextEncoder` and `TextDecoder` API,
providing a `Base64Encoder` and `Base64Decoder` class.

The C implementation was chosen based on benchmarks provided by [`gaspardpetit/base64`](https://github.com/gaspardpetit/base64).


## Usage

```js
const encoder = await new Base64Encoder().optimize();
encoder.encode(new TextEncoder().encode('foobar'))   // => Zm9vYmFy

const decoder = await new Base64Decoder().optimize();
new TextDecoder().decode(decoder.decode("Zm9vYmFy")) // => foobar
```

For one-shot usage, you can use the JS implementation without instantiating a WASM instance:

```js
new Base64Encoder().encode(new TextEncoder().encode('foobar'))   // => Zm9vYmFy
new TextDecoder().decode(new Base64Decoder().decode("Zm9vYmFy")) // => foobar
```

### URL-friendly Encoding
This implementation also supports a URL-friendly variant of Base64, where

- all `'+'` are mapped to `'-'`
- all `'/'` are mapped to `'_'`
- the padding characters `'='` are omitted

To use this variant, provide the `urlFriendly` setting when creating the encoder.

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

- The root folder ([Browse](https://unpkg.com/browse/base64-encoding/)) exports ES modules in ES2018 syntax.
All internal module paths are fully qualified, so they can be imported in Deno or the browser directly.
- The `module` folder ([Browse](https://unpkg.com/browse/base64-encoding/module/)) contains a rolled-up version of the above.
- The `cjs` folder ([Browse](https://unpkg.com/browse/base64-encoding/cjs/)) exports CommonJS modules in ES5 syntax.

The root and `cjs` folder include type declarations and source maps, so that IntelliSense works out of the box in VSCode.

The `package.json` properly sets the `main`, `module`, `type` and `exports` keys, so that `package.json-`based tools will pick the right version.


## License

TBD

Currently the C code is licensed under an ancient Apache 1.0 license that comes with some pretty old-school requirements, such as including the following in all promotional materials:

> This product includes software 
> developed by the Apache Group for use in the Apache HTTP server project 
> (http://www.apache.org/).

It is very likely that [`ap_base64.c`](https://github.com/dhamidi/apache-httpd-1.3.42/blob/master/src/ap/ap_base64.c) has been shipped under a Apache-2.0 license somewhere. 
Once I locate it, this requirement will go away.

## TODO

- Figure out why decoding is slow
- License

