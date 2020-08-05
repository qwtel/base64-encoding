import { terser } from "rollup-plugin-terser";

export default [
  {
    input: 'mjs/index.js',
    output: {
      file: `dist/index.js`,
      format: 'umd',
      name: 'base64Encoding',
      sourcemap: true
    },
    plugins: [terser()],
  }, 
  {
    input: 'mjs/index.js',
    output: {
      file: `dist/module.js`,
      format: 'es',
      sourcemap: true
    },
    plugins: [terser()],
  }
];
