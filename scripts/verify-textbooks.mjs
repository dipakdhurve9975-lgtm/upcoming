import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=new URL('../',import.meta.url);
const library=JSON.parse(readFileSync(new URL('src/content/library.json',root),'utf8'));
for(const chapter of library){
 if(!/^public\/textbooks\/bio-(11|12)-\d{2}\.pdf$/.test(chapter.file))throw Error(`Nonportable chapter path: ${chapter.id}`);
 const path=new URL(chapter.file,root),bytes=readFileSync(path);
 if(bytes.subarray(0,5).toString()!=='%PDF-')throw Error(`Invalid PDF: ${chapter.id}`);
 if(createHash('sha256').update(bytes).digest('hex')!==chapter.sha256)throw Error(`Source hash mismatch: ${fileURLToPath(path)}`);
}
console.log(`Verified ${library.length} portable textbook PDFs against the supplied source hashes.`);
