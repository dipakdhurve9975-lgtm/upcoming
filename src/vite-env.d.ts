/// <reference types="vite/client" />
declare module 'pdfjs-dist/build/pdf.mjs' {
  export const GlobalWorkerOptions: {workerSrc: string};
  export function getDocument(options: {url: string; disableAutoFetch?: boolean; disableStream?: boolean}): {promise: Promise<PDFDocument>; destroy(): Promise<void>};
  export interface PDFDocument {numPages: number; getPage(n:number): Promise<PDFPage>; destroy(): Promise<void>}
  export interface PDFPage { getViewport(o:{scale:number}):{width:number;height:number}; render(o:{canvas:HTMLCanvasElement;viewport:{width:number;height:number}}):{promise:Promise<void>;cancel():void}; getTextContent():Promise<{items:Array<{str?:string}>}>; cleanup(): void; }
}
