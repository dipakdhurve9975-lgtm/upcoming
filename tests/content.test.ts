import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {questions,concepts,pageQuestions,hasVisualization} from '../src/content/membrane.ts';
import {parseProgress,score} from '../src/lib/progress.ts';
const library=JSON.parse(readFileSync(new URL('../src/content/library.json',import.meta.url),'utf8'));
test('all 31 source files exist and 458 page records remain in order',()=>{
 assert.equal(library.length,31);assert.equal(library.reduce((n:any,c:any)=>n+c.pageCount,0),458);
 assert.equal(new Set(library.map((c:any)=>c.id)).size,31);
 for(const c of library){assert.ok(existsSync(c.file));assert.equal(c.pages.length,c.pageCount);c.pages.forEach((p:any,i:number)=>assert.equal(p.pdfPage,i+1));}
 assert.equal(library.some((c:any)=>c.id==='bio-11-11'),false);
});
test('each question has four unique options, a valid answer and matching supplied page',()=>{
 assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
 for(const q of questions){const c=library.find((c:any)=>c.id===q.source.chapterId);assert.ok(c);assert.equal(c.pages[q.source.pdfPage-1].printedPage,q.source.printedPage);assert.equal(new Set(q.options).size,4);assert.ok(q.correct>=0&&q.correct<4);assert.equal(q.kind,'Original NCERT-based practice');assert.ok(q.hint&&q.explanation&&q.concept);}
 assert.equal(pageQuestions('bio-11-08',9).length,4);assert.equal(pageQuestions('bio-11-08',10).length,4);assert.equal(pageQuestions('bio-11-08',11).length,0);
});
test('all model labels link to the inspected source figure',()=>{assert.equal(concepts.length,6);for(const c of concepts){assert.equal(c.source.chapterId,'bio-11-08');assert.equal(c.source.pdfPage,9);assert.equal(c.source.printedPage,93);assert.equal(c.source.figure,'8.4');}assert.equal(hasVisualization('bio-11-08',9),true);assert.equal(hasVisualization('bio-11-15',9),false);});
test('revealed answers never earn a score and incorrect attempts do not count correct',()=>{const [a,b,c]=questions;const result=score([a,b,c],{[a.id]:{selected:a.correct,status:'checked'},[b.id]:{selected:(b.correct+1)%4,status:'checked'},[c.id]:{selected:null,status:'revealed'}});assert.deepEqual(result,{attempted:2,correct:1,reviewed:3});});
test('corrupt storage and invalid attempts recover safely',()=>{assert.equal(parseProgress('broken').chapterId,'bio-11-08');assert.deepEqual(parseProgress('{"version":99}').attempts,{});const data=parseProgress(JSON.stringify({version:1,pdfPage:-5,theme:'garbage',read:[1,'bio-11-08:9'],attempts:{bad:{selected:8,status:'checked'},good:{selected:0,status:'checked'}}}));assert.equal(data.pdfPage,9);assert.equal(data.theme,'light');assert.deepEqual(data.read,['bio-11-08:9']);assert.deepEqual(Object.keys(data.attempts),['good']);});
test('source excerpts support the answer concepts',()=>{const text=readFileSync(new URL('./fixtures/membrane-source.txt',import.meta.url),'utf8').replace(/\s+/g,' ');for(const phrase of ['polar head towards the outer sides','hydrophobic tails towards','52 per cent protein and 40 per cent lipids','lateral movement of proteins','against their concentration gradient','Movement of water by diffusion is called osmosis'])assert.ok(text.includes(phrase),phrase);});
