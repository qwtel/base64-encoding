PACKAGE_NAME := $(shell basename $(shell pwd))
PACKAGE_VERSION := $(shell git describe --tags --abbrev=0)

cpp:
	clang --target=wasm32 -O3 -flto -nostdlib -Wl,--no-entry -Wl,--export-all -Wl,--lto-O3 -o ./base64.wasm ./base64.c

base64: cpp
	base64 ./base64.wasm | fold -w80 | ./bin/into.ts '[A-Za-z0-9+=/][A-Za-z0-9+=/\n]{78,}[A-Za-z0-9+=/]' ./base64.ts

wasm:	base64

# sed-config:
# 	sed -i '' "s/$(PACKAGE_NAME)-[0-9]+\.[0-9]+\.[0-9]+/$(PACKAGE_NAME)-$(PACKAGE_VERSION)/" docs/_config.yml

# sed-license: 
# 	sed -i "s/licenses\//docs\/licenses\//" LICENSE.md

# sed: sed-config sed-license

# copy: 
# 	cp ./README.md ./docs && cp ./LICENSE.md ./docs 

# changelog-head: 
# 	echo "\n\n## v$(PACKAGE_VERSION)" | ./bin/after.js 'CHANGELOG' ./CHANGELOG.md

# changelog-list: 
# 	git log v$(PACKAGE_VERSION)..HEAD --pretty=format:'- %s' --reverse | ./bin/after.ts 'CHANGELOG' ./CHANGELOG.md

# git-add-dot:
# 	git add .

# preversion: | changelog-list
# version: | changelog-head copy sed git-add-dot

# "clean": "shx rm -rf cjs module base64* index*",
# "pretest": "npm run build:mjs",
# "test": "node test/test.js",
# "bench": "node bench/node-bench.js",
# "copy": "shx cp docs/README.md README.md && shx cp docs/LICENSE.md LICENSE.md",
# "sed": "npm run sed:_config && npm run sed:LICENSE",
# "sed:_config": "shx sed -i \"s/$npm_package_name-[0-9]+\\.[0-9]+\\.[0-9]+/$npm_package_name-$npm_package_version/\" docs/_config.yml > /dev/null",
# "sed:LICENSE": "shx sed -i \"s/licenses\\//docs\\/licenses\\//\" LICENSE.md > /dev/null",
# "wasm": "npm run wasm:cpp && npm run wasm:b64",
# "wasm:cpp": "clang --target=wasm32 -O3 -flto -nostdlib -Wl,--no-entry -Wl,--export-all -Wl,--lto-O3 -o src/base64.wasm src/base64.c",
# "wasm:b64": "base64 src/base64.wasm | bin/into.js '[A-Za-z0-9+=/]{80,}' src/base64.ts",
# "build": "(npm run build:mjs & npm run build:cjs & wait) && npm run build:dist",
# "build:mjs": "tsc -d -p tsconfig.json",
# "build:cjs": "tsc -d -p tsconfig.cjs.json && shx sed -i 's/\\.js/.cjs/g' cjs/*.js > /dev/null && for f in cjs/*.js; do shx mv \"$f\" \"${f%.js}.cjs\"; done",
# "build:dist": "rollup -c",
# "changelog:head": "echo \"\\n\\n## v$npm_package_version\" | bin/after.js 'CHANGELOG' docs/CHANGELOG.md",
# "changelog:list": "git log v$npm_package_version..HEAD --pretty=format:'- %s' --reverse | bin/after.js 'CHANGELOG' docs/CHANGELOG.md",
# "preversion": "npm run changelog:list",
# "version": "npm run changelog:head && npm run copy && npm run sed && git add .",
# "prepack": "npm run clean && npm run build"
