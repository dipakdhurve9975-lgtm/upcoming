import type {Chapter} from '../content/types';

export function textbookUrl(chapter:Pick<Chapter,'file'>,base:string):string{
 const path=chapter.file.replace(/^public\//,'');
 return `${base.endsWith('/')?base:base+'/'}${encodeURI(path)}`;
}
