# Base64 Encoding

Fast Base64 encoding and decoding powered by WebAssembly.

The C implementation is was chosen based on the results of https://github.com/gaspardpetit/base64,
where it scored top 3 results for both encoding and decoding.

This library is modeled after the WHATWG `TextEncoder` and `TextDecoder` API,
providing a `Base64Encoder` and `Base64Decoder` class.

The WASM binary is inlined into the JS code and is itself Base64 encoded. 

<!-- Note that a pure JS fallback will be used if WebAssembly instantiation fails for any reason. -->


## Usage

```js
const encoder = await new Base64Encoder().optimize();
encoder.encode(new TextEncoder().encode('foobar'))   // => Zm9vYmFy

const decoder = await new Base64Decoder().optimize();
new TextDecoder().decode(decoder.decode("Zm9vYmFy")) // => foobar
```

Using the WASM implementation is optional. 
It can also be used for one-shot (en|de)coding, similar to `Text(En|De)coder`:

```js
new Base64Encoder().encode(new TextEncoder().encode('foobar')) // => Zm9vYmFy
new TextDecoder().decode(new Base64Decoder().decode('Zm9vYmfY')) // => foobar
```

This will use


## Installation

The library is written in a platform-agnostic style and can be imported as-is 
in any modern JavaScript context that supports ES6 modules as well as language primitives such


## Performance
Performance-wise, this implementation provides a roughly 10x increase over 
the most common JS implementation. 



Use the code in the [bench](./bench) folder to confirm these findings for yourself, 
but keep in mind that there benchmarks are not very

However, in node there is little reason to use it (other than but a 10x decrease over node's own 
`Buffer.toString('base64')`. 

There are a rough estimates.

The C implementation was piced based on code simplicity and the speed of its C implementation
