// import resolve from 'rollup-plugin-node-resolve';
// import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
// import { uglify } from "rollup-plugin-uglify";

export default [
  // {
  //   input: 'cjs/index.cjs',
  //   output: {
  //     file: `dist/index.js`,
  //     format: 'umd',
  //     name: 'base64Encoding',
  //     sourcemap: true
  //   },
  //   plugins: [
  //     resolve(),
  //     commonjs(),
  //     uglify(),
  //   ],
  // }, 
  {
    input: 'index.js',
    output: {
      file: `module/index.js`,
      format: 'es',
      sourcemap: true
    },
    plugins: [terser()],
  }
];
