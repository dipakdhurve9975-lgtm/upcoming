import {useEffect,useRef,useState} from 'react';
import {BookOpen,ExternalLink,Minus,Plus,RotateCcw} from 'lucide-react';
import type {Chapter} from '../content/types';
import {textbookUrl} from '../lib/textbookUrl';
import type {PDFDocument} from 'pdfjs-dist/build/pdf.mjs';
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

export default function Reader({chapter,page}:{chapter:Chapter;page:number}) {
 const host=useRef<HTMLDivElement>(null);const canvas=useRef<HTMLCanvasElement>(null);
 const [doc,setDoc]=useState<PDFDocument|null>(null);const [width,setWidth]=useState(600);const [zoom,setZoom]=useState(1);
 const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [text,setText]=useState('');const [textView,setTextView]=useState(false);const [retry,setRetry]=useState(0);
 useEffect(()=>{const el=host.current!;const ro=new ResizeObserver(()=>setWidth(Math.max(250,el.clientWidth-40)));ro.observe(el);return()=>ro.disconnect();},[]);
 useEffect(()=>{let alive=true;let task:{destroy():Promise<void>}|undefined;setDoc(null);setLoading(true);setError('');
 import('pdfjs-dist/build/pdf.mjs').then(pdf=>{if(!alive)return;pdf.GlobalWorkerOptions.workerSrc=workerUrl;const load=pdf.getDocument({url:textbookUrl(chapter,import.meta.env.BASE_URL),disableAutoFetch:true,disableStream:true});task=load;return load.promise.then(d=>{if(alive)setDoc(d);});}).catch(()=>{if(alive){setError('This chapter could not be loaded. Try again or open the original chapter PDF.');setLoading(false);}});
 return()=>{alive=false;void task?.destroy();};},[chapter.id,retry]);
 useEffect(()=>{if(!doc)return;let alive=true;let renderTask:{cancel():void}|undefined;setLoading(true);setError('');setText('');
 doc.getPage(page).then(async p=>{if(!alive)return;const original=p.getViewport({scale:1});const cssWidth=Math.min(width,900)*zoom;const ratio=Math.min(window.devicePixelRatio||1,1.8);const viewport=p.getViewport({scale:cssWidth/original.width*ratio});
 const target=canvas.current!;target.width=viewport.width;target.height=viewport.height;target.style.width=`${cssWidth}px`;target.style.height=`${viewport.height/ratio}px`;
 const task=p.render({canvas:target,viewport});renderTask=task;await task.promise;if(!alive)return;setLoading(false);const content=await p.getTextContent();if(alive)setText(content.items.map(i=>i.str||'').filter(Boolean).join(' '));
 }).catch((e:Error)=>{if(alive&&e.name!=='RenderingCancelledException'){setError('The page could not be rendered. Try again or open the original PDF.');setLoading(false);}});
 return()=>{alive=false;renderTask?.cancel();};},[doc,page,width,zoom]);
 useEffect(()=>{host.current?.scrollTo({top:0,left:0});setTextView(false);},[chapter.id,page]);
 return <><div className="reader-tools"><span><BookOpen size={15}/> Original NCERT</span><div><button aria-label="Zoom out textbook" disabled={zoom<=.8} onClick={()=>setZoom(z=>Math.max(.8,z-.2))}><Minus size={15}/></button><button className="zoom-label" onClick={()=>setZoom(1)} aria-label="Fit textbook to width">{Math.round(zoom*100)}%</button><button aria-label="Zoom in textbook" disabled={zoom>=1.8} onClick={()=>setZoom(z=>Math.min(1.8,z+.2))}><Plus size={15}/></button><a aria-label="Open original chapter PDF" href={`${textbookUrl(chapter,import.meta.env.BASE_URL)}#page=${page}`} target="_blank" rel="noreferrer"><ExternalLink size={15}/></a></div></div>
 <div className="pdf-scroll" ref={host} tabIndex={0} aria-label="Scrollable textbook page" data-testid="reader-scroll" aria-busy={loading}>
 {loading&&!error&&<div className="pdf-loading" role="status"><span className="spinner"/> Rendering your textbook…</div>}
 {error&&<div className="reader-error" role="alert"><p>{error}</p><button className="primary" onClick={()=>setRetry(r=>r+1)}><RotateCcw size={15}/> Try again</button></div>}
 <canvas key={`${chapter.id}:${page}:${width}:${zoom}`} ref={canvas} className={`pdf-canvas ${loading||error?'loading':''}`} role="img" aria-label={`${chapter.title}, PDF page ${page}, printed page ${chapter.pages[page-1]?.printedPage??'unconfirmed'}. Original textbook page. Read text below for an accessible transcription.`}/>
 {!loading&&!error&&<div className="text-extract"><button className="text-button" aria-expanded={textView} onClick={()=>setTextView(!textView)}>{textView?'Hide':'Read'} accessible page text</button>{textView&&<><p className="muted small">Extracted from your PDF. Diagram layout and some special characters may not carry over.</p><p>{text||'No text layer on this page. Use the original page image.'}</p></>}</div>}
 </div></>;
}
