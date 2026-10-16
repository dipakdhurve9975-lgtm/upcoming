import type {SourceRef} from '../content/types';
export type Vec3=[number,number,number];
export interface Structure {id:string;label:string;color:string;description:string;source:SourceRef;anchor:Vec3;view?:'full'|'cut';}
export interface LearningStep {title:string;description:string;parts:string[];source:SourceRef;flowIds?:string[];}
export interface ModelConfig {id:string;title:string;subtitle:string;source:SourceRef;relatedPages:number[];structures:Structure[];guides:LearningStep[];cycle?:LearningStep[];camera:Vec3;cutaway?:boolean;process?:string;scope:string;annotations?:{label:string;anchor:Vec3;source:SourceRef}[];}
export interface ModelViewState {selected:string|null;hidden:string[];isolate:boolean;labels:boolean;cutaway:boolean;arrows:boolean;playing:boolean;speed:number;step:number;mode:'guided'|'cycle';}
