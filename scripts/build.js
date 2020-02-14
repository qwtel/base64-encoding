// Quick and dirty way of converting ES modules to Common JS. 
// DOES ONLY WORK FOR A SUBSET OF CASES!

import fs from 'fs';
import path from 'path';

const RE = [
  [/import[^\S]*(['"]([^'"]*)['"])/gu, 'require($1)'],
  [/import[^\S]*\{([^}]*)\}[^\S]*from[^\S]*(['"]([^'"]*)['"])/gu, 'const {$1} = require($2)'],
  [/import[^\S]*\*[^\S]*as[^\S]*([^\s]*)[^\S]from[^\S](['"]([^'"]*)['"])/gu, 'const $1 = require($2)'],
  [/export[^\S]*\*[^\S]*as[^\S]*([^\s]*)[^\S]from[^\S](['"]([^'"]*)['"])/gu, 'module.exports.$1 = require($2)'],
  [/export[^\S]*(async[^\S]*)?(class|function)(\*)?[^\S]+(\w+)/gu, 'module.exports.$4 = $1$2$3 $4'],
  [/export[^\S]*(const|let|var)[^\S]+(\w+)/gu, '$1 $2 = module.exports.$2'],
  [/export[^\S]*\{([^}]*)\}/gu, 'Object.assign(module.exports, {$1});'],
  [/([^\s*]+) as ([^\s]+)/gu, '$1: $2'], // taking care of all the `something as somethingElse`.
];

export async function commonjsify(fileName) {
  let text = await fs.promises.readFile(fileName, 'utf-8');
  for (const args of RE) text = text.replace(...args);
  return text;
}

;(async () => {
  for (const f of ['index.js']) {
    const base = path.basename(f, '.js');
    const dest = path.resolve(`${base}.cjs`)
    await fs.promises.writeFile(dest, await commonjsify(path.resolve(f)), 'utf-8');
  }
})();