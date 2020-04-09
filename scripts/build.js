#!/usr/bin/env node

// Quick and dirty way of converting ES modules to Common JS. 
// DOES ONLY WORK FOR A SUBSET OF CASES!

// Q: Why don't use babel/tscript/swfsasdf???
// A: Because they're 
//    a. huge 
//    b. take __forever__ to configure 
//    c. don't do what I want, which is to apply a couple of regexes

import fs from 'fs';
import path from 'path';

const RULES = [
  [/import[^\S]*(['"]([^'"]*)['"])/gu, 'require($1)'],
  [/import[^\S]*\{([^}]*)\}[^\S]*from[^\S]*(['"]([^'"]*)['"])/gu, 'const {$1} = require($2)'],
  [/import[^\S]*\*[^\S]*as[^\S]*([^\s]*)[^\S]from[^\S](['"]([^'"]*)['"])/gu, 'const $1 = require($2)'],
  [/export[^\S]*\*[^\S]*as[^\S]*([^\s]*)[^\S]from[^\S](['"]([^'"]*)['"])/gu, 'module.exports.$1 = require($2)'],
  [/export[^\S]*(async[^\S]*)?(class|function)(\*)?[^\S]+(\w+)/gu, 'module.exports.$4 = $1$2$3 $4'],
  [/export[^\S]*(const|let|var)[^\S]+(\w+)/gu, '$1 $2 = module.exports.$2'],
  [/export[^\S]*\{([^}]*)\}/gu, ['Object.assign(module.exports, {>$});', ',', [
    [/([^\S]*)(\w+)[^\S]+as[^\S]+(\w+)/u, '$1$3: $2'],
    [/(.*)/u, '$1'],
  ]]],
];

export async function commonjsify(fileName) {
  let text = await fs.promises.readFile(fileName, 'utf-8');

  for (let [regex, replacer] of RULES) {
    if (Array.isArray(replacer)) {
      replacer = makeNestedReplacer(...replacer);
    }
    text = text.replace(regex, replacer);
  }

  return text;
}

function makeNestedReplacer(newString, splitter, args2) {
  return (_, inner) => {
    return newString.replace('>$', inner
      .split(splitter)
      .map((line) => {
        for (const [regex2, replacer2] of args2) {
          line = line.replace(regex2, replacer2)
        }
        return line;
      })
      .join(splitter)
    );
  };
}

;(async () => {
  const files = process.argv.splice(2);
  for (const f of files) {
    const base = path.basename(f, '.js');
    const dest = path.resolve(`${base}.cjs`);
    await fs.promises.writeFile(dest, await commonjsify(path.resolve(f)), 'utf-8');
  }
})();