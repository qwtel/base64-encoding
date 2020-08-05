import { bench } from './bench.js';

;(async () => {

await bench(new Uint8Array(await fetch('./mobydick.txt').then(x => x.arrayBuffer())), 68_104);
await bench(new Uint8Array(await fetch('./movie.mov').then(x => x.arrayBuffer())), 1);

})();