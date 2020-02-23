import fs from 'fs';
import path from 'path';
import assert from 'assert';

import { toByteArray, fromByteArray } from '../base64-js.js';
import { Base64Encoder, Base64Decoder } from '../index.js';

const encode = str => new TextEncoder().encode(str).buffer;

;(async () => {

assert.deepEqual(fromByteArray(encode(""      )), ""        );
assert.deepEqual(fromByteArray(encode("f"     )), "Zg=="    );
assert.deepEqual(fromByteArray(encode("fo"    )), "Zm8="    );
assert.deepEqual(fromByteArray(encode("foo"   )), "Zm9v"    );
assert.deepEqual(fromByteArray(encode("foob"  )), "Zm9vYg==");
assert.deepEqual(fromByteArray(encode("fooba" )), "Zm9vYmE=");
assert.deepEqual(fromByteArray(encode("foobar")), "Zm9vYmFy");

assert.deepEqual(toByteArray(""        ), encode(""      ))
assert.deepEqual(toByteArray("Zg=="    ), encode("f"     ));
assert.deepEqual(toByteArray("Zm8="    ), encode("fo"    ));
assert.deepEqual(toByteArray("Zm9v"    ), encode("foo"   ));
assert.deepEqual(toByteArray("Zm9vYg=="), encode("foob"  ));
assert.deepEqual(toByteArray("Zm9vYmE="), encode("fooba" ));
assert.deepEqual(toByteArray("Zm9vYmFy"), encode("foobar"));

// URL friendly
assert.deepEqual(fromByteArray(encode("f"     ), true), "Zg~~"    );
assert.deepEqual(fromByteArray(encode("fo"    ), true), "Zm8~"    );
assert.deepEqual(fromByteArray(encode("foo"   ), true), "Zm9v"    );
assert.deepEqual(fromByteArray(encode("foob"  ), true), "Zm9vYg~~");
assert.deepEqual(fromByteArray(encode("fooba" ), true), "Zm9vYmE~");
assert.deepEqual(fromByteArray(encode("foobar"), true), "Zm9vYmFy");

assert.deepEqual(toByteArray("Zg~~"    ), encode("f"     ));
assert.deepEqual(toByteArray("Zm8~"    ), encode("fo"    ));
assert.deepEqual(toByteArray("Zm9v"    ), encode("foo"   ));
assert.deepEqual(toByteArray("Zm9vYg~~"), encode("foob"  ));
assert.deepEqual(toByteArray("Zm9vYmE~"), encode("fooba" ));
assert.deepEqual(toByteArray("Zm9vYmFy"), encode("foobar"));

// Try a larger text
const mobyDick   = await fs.promises.readFile(
  path.resolve('test/mobydick.txt'), 'utf-8');

const mobyDick64 = await fs.promises.readFile(
  path.resolve('test/mobydick.b64'), 'ascii');

const mobyDick64URLFriendly = mobyDick64
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/\=/g, '~');

assert.deepEqual(fromByteArray(encode(mobyDick)),       mobyDick64           );
assert.deepEqual(fromByteArray(encode(mobyDick), true), mobyDick64URLFriendly);

assert.deepEqual(toByteArray(mobyDick64), encode(mobyDick));

let b64e = new Base64Encoder();
// Testing the JS implementation before `initialized` promise resolves
assert.deepEqual(b64e.encode(encode("f"     )), "Zg=="    );
assert.deepEqual(b64e.encode(encode(""      )), ""        );
assert.deepEqual(b64e.encode(encode("fo"    )), "Zm8="    );
assert.deepEqual(b64e.encode(encode("foo"   )), "Zm9v"    );
assert.deepEqual(b64e.encode(encode("foob"  )), "Zm9vYg==");
assert.deepEqual(b64e.encode(encode("fooba" )), "Zm9vYmE=");
assert.deepEqual(b64e.encode(encode("foobar")), "Zm9vYmFy");

assert.deepEqual(b64e.encode(encode(mobyDick)), mobyDick64);

// Testing the WASM implementation..
await b64e.initialized;

assert.deepEqual(b64e.encode(encode("f"     )), "Zg=="    );
assert.deepEqual(b64e.encode(encode(""      )), ""        );
assert.deepEqual(b64e.encode(encode("fo"    )), "Zm8="    );
assert.deepEqual(b64e.encode(encode("foo"   )), "Zm9v"    );
assert.deepEqual(b64e.encode(encode("foob"  )), "Zm9vYg==");
assert.deepEqual(b64e.encode(encode("fooba" )), "Zm9vYmE=");
assert.deepEqual(b64e.encode(encode("foobar")), "Zm9vYmFy");

assert.deepEqual(b64e.encode(encode(mobyDick)), mobyDick64);

b64e.urlFriendly = true;

assert.deepEqual(b64e.encode(encode("f"     )), "Zg~~"    );
assert.deepEqual(b64e.encode(encode(""      )), ""        );
assert.deepEqual(b64e.encode(encode("fo"    )), "Zm8~"    );
assert.deepEqual(b64e.encode(encode("foo"   )), "Zm9v"    );
assert.deepEqual(b64e.encode(encode("foob"  )), "Zm9vYg~~");
assert.deepEqual(b64e.encode(encode("fooba" )), "Zm9vYmE~");
assert.deepEqual(b64e.encode(encode("foobar")), "Zm9vYmFy");

assert.deepEqual(b64e.encode(encode(mobyDick)), mobyDick64URLFriendly);

let b64d = new Base64Decoder()

assert.deepEqual(b64d.decode("Zg=="    ), encode("f"     ));
assert.deepEqual(b64d.decode(""        ), encode(""      ))
assert.deepEqual(b64d.decode("Zm8="    ), encode("fo"    ));
assert.deepEqual(b64d.decode("Zm9v"    ), encode("foo"   ));
assert.deepEqual(b64d.decode("Zm9vYg=="), encode("foob"  ));
assert.deepEqual(b64d.decode("Zm9vYmE="), encode("fooba" ));
assert.deepEqual(b64d.decode("Zm9vYmFy"), encode("foobar"));

assert.deepEqual(b64d.decode(mobyDick64),            encode(mobyDick));
assert.deepEqual(b64d.decode(mobyDick64URLFriendly), encode(mobyDick));

await b64d.initialized;

assert.deepEqual(b64d.decode("Zg=="    ), encode("f"     ));
assert.deepEqual(b64d.decode(""        ), encode(""      ))
assert.deepEqual(b64d.decode("Zm8="    ), encode("fo"    ));
assert.deepEqual(b64d.decode("Zm9v"    ), encode("foo"   ));
assert.deepEqual(b64d.decode("Zm9vYg=="), encode("foob"  ));
assert.deepEqual(b64d.decode("Zm9vYmE="), encode("fooba" ));
assert.deepEqual(b64d.decode("Zm9vYmFy"), encode("foobar"));

assert.deepEqual(b64d.decode(mobyDick64),            encode(mobyDick));
assert.deepEqual(b64d.decode(mobyDick64URLFriendly), encode(mobyDick));


})();