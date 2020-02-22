import { bench } from './bench.js';

;(async () => {

const args = [new Uint8Array(await fetch('./mobydick.txt').then(x => x.arrayBuffer())), 10000];
// const args = [new Uint8Array(await fetch('./homebridge.log').then(x => x.arrayBuffer())), 1];

bench(...args);

})();