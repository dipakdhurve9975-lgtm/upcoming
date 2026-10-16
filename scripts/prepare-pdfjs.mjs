import {cpSync,mkdirSync} from 'node:fs';

const source=new URL('../node_modules/pdfjs-dist/',import.meta.url),target=new URL('../public/pdfjs/',import.meta.url);
mkdirSync(target,{recursive:true});
for(const folder of ['cmaps','standard_fonts','wasm','iccs'])cpSync(new URL(folder,source),new URL(folder,target),{recursive:true});
cpSync(new URL('LICENSE',source),new URL('LICENSE',target));
console.log('Prepared PDF.js font, character-map, image decoder and colour-profile assets.');
