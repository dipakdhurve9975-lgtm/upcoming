import type {Progress,Question,Attempt} from '../content/types';
export const KEY='ncert-3d-progress-v1';
export const initialProgress:Progress={version:1,chapterId:'bio-11-08',pdfPage:9,read:[],attempts:{},bookmarks:[],theme:'light'};
export function parseProgress(raw:string|null):Progress {
 try {const p=JSON.parse(raw||'null');if(!p||p.version!==1)return {...initialProgress};
 const attempts:Record<string,Attempt>={};
 if(p.attempts&&typeof p.attempts==='object')for(const [id,a] of Object.entries(p.attempts) as [string,Attempt][])if(a&&['checked','revealed'].includes(a.status)&&(a.selected===null||Number.isInteger(a.selected)&&a.selected>=0&&a.selected<4))attempts[id]=a;
 return {...initialProgress,chapterId:typeof p.chapterId==='string'?p.chapterId:initialProgress.chapterId,pdfPage:Number.isInteger(p.pdfPage)&&p.pdfPage>0?p.pdfPage:9,read:Array.isArray(p.read)?p.read.filter((s:unknown)=>typeof s==='string'):[],bookmarks:Array.isArray(p.bookmarks)?p.bookmarks.filter((s:unknown)=>typeof s==='string'):[],theme:p.theme==='dark'?'dark':'light',attempts};
 }catch{return {...initialProgress};}
}
export const readProgress=()=>{try{return parseProgress(localStorage.getItem(KEY));}catch{return {...initialProgress};}};
export function score(items:Question[],attempts:Record<string,Attempt>){return items.reduce((s,q)=>{const a=attempts[q.id];if(a?.status==='checked'){s.attempted++;if(a.selected===q.correct)s.correct++;}if(a)s.reviewed++;return s;},{attempted:0,correct:0,reviewed:0});}
