import * as T from 'three';
import type {Vec3} from './modelTypes';
export const v=(p:Vec3)=>new T.Vector3(...p);
/** Smooth deformed surface, with a longitudinal cut option. No external meshes. */
export function envelope(size:Vec3,cut=false,bean=0){
 const positions:number[]=[],uvs:number[]=[],indices:number[]=[];const nu=48,nv=64;
 for(let i=0;i<=nu;i++){const u=i/nu*Math.PI;for(let j=0;j<=nv;j++){const a=(cut?Math.PI:0)+j/nv*(cut?Math.PI:2*Math.PI);const r=Math.sin(u);const x=size[0]*Math.cos(u);const taper=1+.035*Math.sin(u*7)*Math.cos(a*3);positions.push(x,size[1]*r*Math.cos(a)*taper+bean*Math.sin(u*2),size[2]*r*Math.sin(a)*taper);uvs.push(i/nu,j/nv);}}
 for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+nv+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
export function organic(size:Vec3,detail=.07){const max=Math.max(...size),nx=max<.3?12:max<1?22:40,ny=max<.3?8:max<1?16:28;const g=new T.SphereGeometry(1,nx,ny),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const r=1+detail*(.45*Math.sin(x*7+y*3)+.3*Math.cos(y*9-z*4)+.25*Math.sin(z*8+x*3));p.setXYZ(i,x*r*size[0],y*r*size[1],z*r*size[2]);}g.computeVertexNormals();return g;}
export function curve(points:Vec3[]){return new T.CatmullRomCurve3(points.map(v));}
export function tubeGeometry(points:Vec3[],radius:number,segments=points.length<=3?16:Math.max(64,points.length*2)){return new T.TubeGeometry(curve(points),segments,radius,10,false);}
export function sheet(nu:number,nv:number,point:(u:number,v:number)=>Vec3){const pos:number[]=[],uv:number[]=[],ix:number[]=[];for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){pos.push(...point(i/nu,j/nv));uv.push(i/nu,j/nv);}for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const k=i*(nv+1)+j;ix.push(k,k+nv+1,k+1,k+1,k+nv+1,k+nv+2);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;}

/** Reverse a parametrisation whose first axis runs from the top pole downwards. */
export function faceOutward(g:T.BufferGeometry){const ix=g.index!;for(let i=0;i<ix.count;i+=3){const b=ix.getX(i+1);ix.setX(i+1,ix.getX(i+2));ix.setX(i+2,b);}g.computeVertexNormals();return g;}
