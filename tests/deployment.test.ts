import {test} from 'node:test';
import assert from 'node:assert/strict';
import {textbookUrl} from '../src/lib/textbookUrl.ts';

test('textbook URLs stay inside the deployed repository on GitHub Pages',()=>{
 const chapter={file:'public/textbooks/bio-11-08.pdf'};
 assert.equal(new URL(textbookUrl(chapter,'./'),'https://example.github.io/upcoming/').href,'https://example.github.io/upcoming/textbooks/bio-11-08.pdf');
 assert.equal(textbookUrl(chapter,'/upcoming/'),'/upcoming/textbooks/bio-11-08.pdf');
 assert.equal(textbookUrl(chapter,'/'),'/textbooks/bio-11-08.pdf');
});
