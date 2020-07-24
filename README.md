# Base64 Encoding

Fast Base64 encoding and decoding powered by WebAssembly.

This library is modeled after the WHATWG `TextEncoder` and `TextDecoder` API,
providing a `Base64Encoder` and `Base64Decoder` class.

The WASM binary is inlined into the JS code and is itself Base64 encoded. 
Note that a pure JS fallback will be used if WebAssembly instantiation fails 
for any reason.

Performance-wise, this implementation provides a roughly 10x increase over a 
pure-JS implementation, but a 10x decrease over node's own 
`Buffer.toString('base64')`. 

## Usage

```js
const encoder = await new Base64Encoder().initialized;
encoder.encode(new TextEncoder().encode('foobar'))   // => Zm9vYmFy

const decoder = await new Base64Decoder().initialized;
new TextDecoder().decode(decoder.decode("Zm9vYmFy")) // => foobar
```
