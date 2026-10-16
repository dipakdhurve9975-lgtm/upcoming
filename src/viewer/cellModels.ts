import * as T from 'three';
import type {Builder} from './modelBuilders';
import type {Vec3} from './modelTypes';
import {envelope,sheet} from './geometry';

function squaredEnvelope(size:Vec3,cut:boolean){
 const g=envelope([1,1,1],cut),p=g.attributes.position;
 const soften=(n:number)=>Math.sign(n)*Math.pow(Math.abs(n),.42);
 for(let i=0;i<p.count;i++)p.setXYZ(i,soften(p.getX(i))*size[0],soften(p.getY(i))*size[1],soften(p.getZ(i))*size[2]);
 g.computeVertexNormals();return g;
}
function cellShell(b:Builder,id:string,size:Vec3,plant:boolean){
 for(const cut of [false,true]){const m=b.mesh(id,plant?squaredEnvelope(size,cut):envelope(size,cut));m.userData.view=cut?'cut':'full';}
 const pts:Vec3[]=[];for(let i=0;i<=128;i++){const a=i/128*Math.PI*2,c=Math.cos(a),s=Math.sin(a);pts.push([size[0]*(plant?Math.sign(c)*Math.pow(Math.abs(c),.42):c),size[1]*(plant?Math.sign(s)*Math.pow(Math.abs(s),.42):s),0]);}
 const rim=b.tube(id,pts,.035);rim.userData.view='cut';
}
function inCut(b:Builder,ids:string[]){for(const id of ids)b.groups.get(id)?.traverse(o=>{if(o instanceof T.Mesh)o.userData.view='cut';});}

export function buildCell(b:Builder){
 const plant=b.config.id==='plant-cell';
 if(plant){cellShell(b,'middle-lamella',[2.96,2.61,1.26],true);cellShell(b,'wall',[2.86,2.51,1.18],true);}
 cellShell(b,'membrane',plant?[2.7,2.35,1.06]:[2.35,2.8,1.12],plant);
 const cyto=b.mesh('cytoplasm',plant?squaredEnvelope([2.61,2.26,.98],true):envelope([2.26,2.7,1.03],true));cyto.userData.view='cut';
 const n:Vec3=plant?[.95,.85,.05]:[0,-.55,.05];
 const nuclear=b.mesh('nucleus',envelope([.72,.69,.53],true),n);nuclear.userData.view='cut';
 const nuclearFront=b.mesh('envelope',envelope([.78,.75,.58],true),n,{roughness:.6});nuclearFront.userData.view='cut';
 const ring:Vec3[]=[];for(let i=0;i<=80;i++){const a=i/80*Math.PI*2;ring.push([n[0]+.78*Math.cos(a),n[1]+.75*Math.sin(a),n[2]]);}b.tube('envelope',ring,.035);
 const core=b.blob('nucleolus',[n[0]-.05,n[1]-.02,.55],[.19,.21,.12],.04);core.userData.view='cut';
 // Curved cisternae and their surface ribosomes follow the labelled textbook organelles.
 for(let j=0;j<4;j++){
  const r=.9+j*.17;
  b.mesh('rer',sheet(48,6,(u,w)=>{const a=(plant?.45:1.05)+u*Math.PI*1.25;return [n[0]+r*Math.cos(a),n[1]+r*.75*Math.sin(a),-.12+(w-.5)*.33+.035*Math.sin(u*8)];}));
  for(let k=0;k<13;k++){const a=(plant?.45:1.05)+k/12*Math.PI*1.25;b.blob('ribosomes',[n[0]+r*Math.cos(a),n[1]+r*.75*Math.sin(a),.09],[.032,.032,.032],.01);}
 }
 const sx=plant?-.8:-1.25,sy=plant?1.55:.85;
 for(let j=0;j<5;j++)b.tube('ser',[[sx-.35,sy+j*.075,-.1],[sx-.1,sy+.2+j*.075,.05],[sx+.25,sy+.02+j*.075,.05],[sx+.48,sy+.22+j*.075,-.12]],.047);
 const gx=plant?1.95:0,gy=plant?.05:1.16;
 for(let j=0;j<5;j++)b.mesh('golgi',sheet(30,8,(u,w)=>{const x=(u-.5)*.78;return [gx+x,gy+j*.11+.22*Math.pow(x/.39,2),-.05+(w-.5)*.35];}));
 for(let j=0;j<5;j++)b.blob('golgi',[gx+.5+j%2*.08,gy+.1+j*.15,.05],[.055,.055,.055],.015);
 const mito:Vec3[]=plant?[[-1.75,1.45,.1],[-2,-.2,.12],[1.65,-1.7,.1]]:[[-1.5,-.9,.15],[1.35,-1.35,.1],[1.6,1.05,.12],[0,-2.15,.1]];
 for(const [i,p] of mito.entries()){
  const m=b.blob('mitochondria',p,[.21,.43,.2],.04);m.rotation.z=i%2?.55:-.5;
  const fold:Vec3[]=[];for(let j=0;j<=24;j++){const t=j/24;fold.push([p[0]+Math.sin(t*Math.PI*8)*.09,p[1]-.31+t*.62,p[2]+.19]);}b.tube('mitochondria',fold,.018);
 }
 for(const [i,p] of ((plant?[[-.2,1.9,.1],[2,1,.1],[1.9,-.7,.1]]:[[-1.15,1.65,.1],[1.3,.5,.1],[1.55,-.2,.1]]) as Vec3[]).entries()){b.blob('lysosome',p,[.105,.11,.1],.025);b.blob('peroxisome',[p[0]-.2,p[1]-.38,.1],[.08,.08,.08],.01);if(i===0)b.blob('peroxisome',plant?[-1.7,-1.8,.1]:[-1.4,.5,.1],[.09,.09,.09],.01);}
 for(let i=0;i<35;i++){const a=i*2.399,r=1.6+(i%4)*.12;const x=Math.cos(a)*r,y=Math.sin(a)*r;if(plant&&x<.6&&y<.4)continue;b.blob('ribosomes',[x,y,.12],[.025,.025,.025],.01);}
 if(plant){
  b.blob('vacuole',[-.65,-.65,-.02],[1.38,1.4,.62],.06);
  for(const [i,p] of ([[-1.6,1,.15],[-2,-1.25,.1],[.65,-1.9,.1],[2,1.65,.1],[2,-1.2,.1]] as Vec3[]).entries()){const c=b.blob('chloroplasts',p,[.22,.45,.19],.03);c.rotation.z=i%2?.5:-.45;for(let j=0;j<4;j++){const bar=b.mesh('chloroplasts',new T.CylinderGeometry(.1,.1,.035,16),[p[0],p[1]-.2+j*.12,p[2]+.13]);bar.rotation.x=Math.PI/2;}}
  for(let j=0;j<4;j++)b.tube('plasmodesmata',[[2.61,.6+j*.18,-.3],[2.85,.6+j*.18,-.3],[3.02,.6+j*.18,-.3]],.034);
  b.tube('microtubule',[[-2.1,.65,.1],[-1.95,.25,.14],[-1.85,-.2,.1]],.04);
 }else{
  // Two short cylindrical centrioles; nine peripheral triplet bundles are described in Ch8.
  for(let side=0;side<2;side++){const group=new T.Group();group.position.set(.1+side*.3,.58+side*.12,.2);if(side)group.rotation.z=Math.PI/2;for(let j=0;j<9;j++){const a=j/9*Math.PI*2;for(let k=0;k<3;k++){const m=b.mesh('centriole',new T.CylinderGeometry(.014,.014,.28,7),[Math.cos(a)*(.115+k*.018),0,Math.sin(a)*(.115+k*.018)]);group.add(m);}}b.groups.get('centriole')!.add(group);}
  for(let j=0;j<16;j++){const x=-1.5+j*.2,y=2.8*Math.sqrt(Math.max(.05,1-(x/2.35)**2));b.tube('microvilli',[[x,y-.1,-.12],[x+.02,y+.18,-.1],[x+.04,y+.42,-.12]],.052);}
 }
 inCut(b,['cytoplasm','nucleus','envelope','nucleolus','rer','ser','golgi','ribosomes','mitochondria','lysosome','peroxisome',...(plant?['vacuole','chloroplasts','microtubule']:['centriole'])]);
}
