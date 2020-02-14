import fs from 'fs';
import path from 'path';
import assert from 'assert';

import { toByteArray, fromByteArray } from '../web-base64.js';

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
const mobyDick   = await fs.promises.readFile(path.resolve('test/mobydick.txt'), 'utf-8');
const mobyDick64 = await fs.promises.readFile(path.resolve('test/mobydick.b64'), 'ascii');

assert.deepEqual(fromByteArray(encode(mobyDick)), mobyDick64);
assert.deepEqual(fromByteArray(encode(mobyDick), true), mobyDick64.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '~'));
assert.deepEqual(toByteArray(mobyDick64), encode(mobyDick));

})();