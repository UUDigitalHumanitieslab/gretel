The `xpath.js` is generated using

> jison -m amd xpath.jison xpath.jisonlex -o xpath.js

Do not modify the `xpath.js` directly! A definition to be used in TypeScript is found under `/ts/parser/xpath.d.ts`, this will need to be updated manually if the usage of the grammar was changed.
