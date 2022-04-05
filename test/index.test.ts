import 'https://gist.githubusercontent.com/qwtel/b14f0f81e3a96189f7771f83ee113f64/raw/TestRequest.ts'
import {
  assert,
  assertExists,
  assertEquals,
  assertStrictEquals,
  assertStringIncludes,
  assertThrows,
  assertRejects,
  assertArrayIncludes,
} from 'https://deno.land/std@0.133.0/testing/asserts.ts'
const { test } = Deno;

import { toByteArray, fromByteArray } from '../base64-js.ts';
import { Base64Encoder, Base64Decoder } from '../index.ts';

const td = new TextDecoder();
const decode = td.decode.bind(td);

const te = new TextEncoder();
const encode = te.encode.bind(te);

test('fromByteArray', () => {
  assertEquals(fromByteArray(encode(""      )), ""        );
  assertEquals(fromByteArray(encode("f"     )), "Zg=="    );
  assertEquals(fromByteArray(encode("fo"    )), "Zm8="    );
  assertEquals(fromByteArray(encode("foo"   )), "Zm9v"    );
  assertEquals(fromByteArray(encode("foob"  )), "Zm9vYg==");
  assertEquals(fromByteArray(encode("fooba" )), "Zm9vYmE=");
  assertEquals(fromByteArray(encode("foobar")), "Zm9vYmFy");
})

test('toByteArray', () => {
  assertEquals(toByteArray(""        ), encode(""      ))
  assertEquals(toByteArray("Zg=="    ), encode("f"     ));
  assertEquals(toByteArray("Zm8="    ), encode("fo"    ));
  assertEquals(toByteArray("Zm9v"    ), encode("foo"   ));
  assertEquals(toByteArray("Zm9vYg=="), encode("foob"  ));
  assertEquals(toByteArray("Zm9vYmE="), encode("fooba" ));
  assertEquals(toByteArray("Zm9vYmFy"), encode("foobar"));
})

test('fromByteArray URL-friendly', () => {
  assertEquals(fromByteArray(encode("f"     ), true), "Zg"      );
  assertEquals(fromByteArray(encode("fo"    ), true), "Zm8"     );
  assertEquals(fromByteArray(encode("foo"   ), true), "Zm9v"    );
  assertEquals(fromByteArray(encode("foob"  ), true), "Zm9vYg"  );
  assertEquals(fromByteArray(encode("fooba" ), true), "Zm9vYmE" );
  assertEquals(fromByteArray(encode("foobar"), true), "Zm9vYmFy");
})

test('toByteArray URL-friendly', () => {
  assertEquals(toByteArray("Zg"      ), encode("f"     ));
  assertEquals(toByteArray("Zm8"     ), encode("fo"    ));
  assertEquals(toByteArray("Zm9v"    ), encode("foo"   ));
  assertEquals(toByteArray("Zm9vYg"  ), encode("foob"  ));
  assertEquals(toByteArray("Zm9vYmE" ), encode("fooba" ));
  assertEquals(toByteArray("Zm9vYmFy"), encode("foobar"));
})

const mobyDick   = await Deno.readFile('./test/mobydick.txt').then(decode)
const mobyDick64 = await Deno.readFile('./test/mobydick.b64').then(decode)
const mobyDick64URLFriendly = mobyDick64
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/\=/g, '');

test('a larger text', () => {
  assertEquals(fromByteArray(encode(mobyDick)),       mobyDick64           );
  assertEquals(fromByteArray(encode(mobyDick), true), mobyDick64URLFriendly);

  assertEquals(toByteArray(mobyDick64), encode(mobyDick));
})

const b64e = new Base64Encoder();

test('the JS implementation', () => {
  assertEquals(b64e.encode(encode("f"     )), "Zg=="    );
  assertEquals(b64e.encode(encode(""      )), ""        );
  assertEquals(b64e.encode(encode("fo"    )), "Zm8="    );
  assertEquals(b64e.encode(encode("foo"   )), "Zm9v"    );
  assertEquals(b64e.encode(encode("foob"  )), "Zm9vYg==");
  assertEquals(b64e.encode(encode("fooba" )), "Zm9vYmE=");
  assertEquals(b64e.encode(encode("foobar")), "Zm9vYmFy");
})

test('the JS implementation - Moby dick', () => {
  assertEquals(b64e.encode(encode(mobyDick)), mobyDick64);
})

test('the WASM implementation', async () => {
  await b64e.optimize();
  assertEquals(b64e.encode(encode("f"     )), "Zg=="    );
  assertEquals(b64e.encode(encode(""      )), ""        );
  assertEquals(b64e.encode(encode("fo"    )), "Zm8="    );
  assertEquals(b64e.encode(encode("foo"   )), "Zm9v"    );
  assertEquals(b64e.encode(encode("foob"  )), "Zm9vYg==");
  assertEquals(b64e.encode(encode("fooba" )), "Zm9vYmE=");
  assertEquals(b64e.encode(encode("foobar")), "Zm9vYmFy");
})

test('the WASM implementation - Moby dick', async () => {
  await b64e.optimize();
  assertEquals(b64e.encode(encode(mobyDick)), mobyDick64);
})

test('Testing the JS implementation -- URL freindly', () => {
  const b64e = new Base64Encoder({ urlFriendly: true });
  assertEquals(b64e.encode(encode("f"     )), "Zg"      );
  assertEquals(b64e.encode(encode(""      )), ""        );
  assertEquals(b64e.encode(encode("fo"    )), "Zm8"     );
  assertEquals(b64e.encode(encode("foo"   )), "Zm9v"    );
  assertEquals(b64e.encode(encode("foob"  )), "Zm9vYg"  );
  assertEquals(b64e.encode(encode("fooba" )), "Zm9vYmE" );
  assertEquals(b64e.encode(encode("foobar")), "Zm9vYmFy");
  assertEquals(b64e.encode(encode(mobyDick)), mobyDick64URLFriendly);
})

test('Testing the WASM implementation -- URL freindly', async () => {
  const b64e = await new Base64Encoder({ urlFriendly: true }).optimize();
  assertEquals(b64e.encode(encode("f"     )), "Zg"      );
  assertEquals(b64e.encode(encode(""      )), ""        );
  assertEquals(b64e.encode(encode("fo"    )), "Zm8"     );
  assertEquals(b64e.encode(encode("foo"   )), "Zm9v"    );
  assertEquals(b64e.encode(encode("foob"  )), "Zm9vYg"  );
  assertEquals(b64e.encode(encode("fooba" )), "Zm9vYmE" );
  assertEquals(b64e.encode(encode("foobar")), "Zm9vYmFy");
  assertEquals(b64e.encode(encode(mobyDick)), mobyDick64URLFriendly);
})

const b64d = new Base64Decoder();

test('xx', () => {
  assertEquals(b64d.decode("Zg=="    ), encode("f"     ));
  assertEquals(b64d.decode(""        ), encode(""      ));
  assertEquals(b64d.decode("Zm8="    ), encode("fo"    ));
  assertEquals(b64d.decode("Zm9v"    ), encode("foo"   ));
  assertEquals(b64d.decode("Zm9vYg=="), encode("foob"  ));
  assertEquals(b64d.decode("Zm9vYmE="), encode("fooba" ));
  assertEquals(b64d.decode("Zm9vYmFy"), encode("foobar"));
})

test('xx-', () => {
  assertEquals(b64d.decode(mobyDick64), encode(mobyDick));
})

test('xxx', () => {
  assertEquals(b64d.decode("Zg"      ), encode("f"     ));
  assertEquals(b64d.decode(""        ), encode(""      ));
  assertEquals(b64d.decode("Zm8"     ), encode("fo"    ));
  assertEquals(b64d.decode("Zm9v"    ), encode("foo"   ));
  assertEquals(b64d.decode("Zm9vYg"  ), encode("foob"  ));
  assertEquals(b64d.decode("Zm9vYmE" ), encode("fooba" ));
  assertEquals(b64d.decode("Zm9vYmFy"), encode("foobar"));
})

test('xxx-', () => {
  assertEquals(b64d.decode(mobyDick64URLFriendly), encode(mobyDick));
})

test('the WASM implementation', async () => {
  await b64d.optimize();
  assertEquals(b64d.decode("Zg=="    ), encode("f"     ));
  assertEquals(b64d.decode(""        ), encode(""      ));
  assertEquals(b64d.decode("Zm8="    ), encode("fo"    ));
  assertEquals(b64d.decode("Zm9v"    ), encode("foo"   ));
  assertEquals(b64d.decode("Zm9vYg=="), encode("foob"  ));
  assertEquals(b64d.decode("Zm9vYmE="), encode("fooba" ));
  assertEquals(b64d.decode("Zm9vYmFy"), encode("foobar"));
})

test('the WASM implementation -- mbody ick ', async () => {
  await b64d.optimize();
  assertEquals(b64d.decode(mobyDick64), encode(mobyDick));
})

test('???', async () => {
  await b64d.optimize();
  assertEquals(b64d.decode("Zg"      ), encode("f"     ));
  assertEquals(b64d.decode(""        ), encode(""      ));
  assertEquals(b64d.decode("Zm8"     ), encode("fo"    ));
  assertEquals(b64d.decode("Zm9v"    ), encode("foo"   ));
  assertEquals(b64d.decode("Zm9vYg"  ), encode("foob"  ));
  assertEquals(b64d.decode("Zm9vYmE" ), encode("fooba" ));
  assertEquals(b64d.decode("Zm9vYmFy"), encode("foobar"));
})

test('???-', async () => {
  await b64d.optimize();
  assertEquals(b64d.decode(mobyDick64URLFriendly), encode(mobyDick));
})

