export type Subject = 'Biology' | 'Physics' | 'Chemistry';
export interface SourceRef { chapterId:string; pdfPage:number; printedPage:number; section:string; figure?:string; }
export interface Chapter {id:string; class:number; subject:string; number:number; title:string; file:string; originalFile?:string; pageCount:number; readable:boolean; edition:string; sha256:string; syllabusStatus:string; pages:{pdfPage:number;printedPage:number|null;mapping:string;figures:string[];hasText:boolean}[];}
export interface Question {id:string;source:SourceRef;concept:string;difficulty:'Foundation'|'Application';text:string;options:[string,string,string,string];correct:number;hint:string;explanation:string;kind:'Original NCERT-based practice';}
export type PartId='heads'|'tails'|'integral'|'peripheral'|'sugar'|'cholesterol';
export interface Concept {id:PartId;label:string;color:string;description:string;source:SourceRef;}
export interface Attempt {selected:number|null;status:'checked'|'revealed';}
export interface Progress {version:1;chapterId:string;pdfPage:number;read:string[];attempts:Record<string,Attempt>;bookmarks:string[];theme:'light'|'dark';}
