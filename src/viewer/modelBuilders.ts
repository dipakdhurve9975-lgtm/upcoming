import * as T from 'three';
import type {ModelConfig,Vec3} from './modelTypes';
import {curve,envelope,faceOutward,organic,sheet,tubeGeometry,v} from './geometry';
import {buildCell} from './cellModels';
import {buildSkeleton} from './skeletonModel';
import {buildSarcomere} from './sarcomereModel';
export interface FlowPath {id:string;from:string;to:string;points:Vec3[];color:string;}
export interface BuiltModel {root:T.Group;groups:Map<string,T.Group>;flows:FlowPath[];animate:(step:number,phase:number,cycle:boolean)=>void;}
export const heartRoutes:FlowPath[]=[
 {id:'body-vena',from:'body',to:'vena',color:'#659bc7',points:[[-3.8,-2.8,-.2],[-3.8,-.2,-.3],[-1.25,2.9,-.6]]},
 {id:'vena-ra',from:'vena',to:'ra',color:'#659bc7',points:[[-1.25,2.9,-.6],[-1.25,1.7,-.45],[-1.05,1,-.3],[-1.05,1,.06]]},
 {id:'ra-rv',from:'ra',to:'rv',color:'#659bc7',points:[[-1.05,1,.06],[-1,.27,.06],[-.92,-.8,.06]]},
 {id:'rv-pa',from:'rv',to:'pa',color:'#659bc7',points:[[-.92,-.8,.06],[-.6,-.4,.1],[-.3,.8,.45],[-.35,2,.5],[-.8,2.5,.35],[-1.7,2.55,-.15]]},
 {id:'pa-lungs',from:'pa',to:'lungs',color:'#659bc7',points:[[-1.7,2.55,-.15],[-1.9,3.5,.9],[-3.8,3.3,0]]},
 {id:'lungs-pv',from:'lungs',to:'pv',color:'#d77878',points:[[-3.8,3.3,0],[-2.3,4,-.7],[1.8,2.8,-.7],[2.2,1.3,-.7]]},
 {id:'pv-la',from:'pv',to:'la',color:'#d77878',points:[[2.2,1.3,-.7],[1.6,1.3,-.65],[.9,1.1,-.4],[.9,1.05,.06]]},
 {id:'la-lv',from:'la',to:'lv',color:'#d77878',points:[[.9,1.05,.06],[.85,.27,.06],[.82,-.95,.06]]},
 {id:'lv-aorta',from:'lv',to:'aorta',color:'#d77878',points:[[.82,-.95,.06],[.5,.2,-.15],[.3,1.7,-.3],[.4,2.7,-.5],[.9,3,-.6],[1.7,2.6,-.8],[1.8,1,-1]]},
 {id:'aorta-body',from:'aorta',to:'body',color:'#d77878',points:[[1.8,1,-1],[2.9,3.2,-.3],[3.8,1,0],[3.8,-2.8,-.2],[-3.8,-2.8,-.2]]},
];
export class Builder {
 root=new T.Group();groups=new Map<string,T.Group>();flows:FlowPath[]=[]; animations:Array<(s:number,p:number,c:boolean)=>void>=[];
 private tissueTexture:T.DataTexture|null=null;
 private tissue(){if(this.tissueTexture)return this.tissueTexture;const data=new Uint8Array(128*128*4);let seed=7519;for(let i=0;i<128*128;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const n=110+((seed>>>24)%65);data.set([n,n,n,255],i*4);}const texture=new T.DataTexture(data,128,128);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.minFilter=texture.magFilter=T.LinearFilter;texture.repeat.set(4,4);texture.needsUpdate=true;return this.tissueTexture=texture;}
 private materialCache=new Map<string,T.MeshStandardMaterial>();private shapeCache=new Map<string,T.BufferGeometry>();
 constructor(readonly config:ModelConfig){for(const p of config.structures){const g=new T.Group();g.name=p.id;g.userData.part=p.id;this.groups.set(p.id,g);this.root.add(g);}}
 material(id:string,extra:T.MeshStandardMaterialParameters={}){const key=id+JSON.stringify(extra);let material=this.materialCache.get(key);if(!material){material=new T.MeshStandardMaterial({color:this.config.structures.find(p=>p.id===id)?.color||'#bca489',roughness:.43,metalness:.025,side:T.DoubleSide,...(this.config.id==='heart'?{bumpMap:this.tissue(),bumpScale:.012}:{}),...extra});this.materialCache.set(key,material);}return material;}
 mesh(id:string,geo:T.BufferGeometry,pos:Vec3=[0,0,0],extra:T.MeshStandardMaterialParameters={}){const m=new T.Mesh(geo,this.material(id,extra));m.position.copy(v(pos));m.userData.part=id;m.castShadow=true;m.receiveShadow=true;this.groups.get(id)!.add(m);return m;}
 blob(id:string,pos:Vec3,size:Vec3,detail=.07){const key=JSON.stringify([size,detail]);let geometry=this.shapeCache.get(key);if(!geometry){geometry=organic(size,detail);this.shapeCache.set(key,geometry);}return this.mesh(id,geometry,pos);}
 tube(id:string,points:Vec3[],r:number){return this.mesh(id,tubeGeometry(points,r));}
 shell(id:string,pos:Vec3,size:Vec3,bean=0){const full=this.mesh(id,envelope(size,false,bean),pos);full.userData.view='full';const half=this.mesh(id,envelope(size,true,bean),pos);half.userData.view='cut';
  // Longitudinal cut lies in z=0; rim follows the same outer contour.
  const pts:Vec3[]=[];for(let i=0;i<=120;i++){const t=i/120*Math.PI*2;pts.push([pos[0]+size[0]*Math.cos(t),pos[1]+size[1]*Math.sin(t)+bean*Math.sin(t*2),pos[2]]);}const rim=this.tube(id,pts,.035);rim.userData.view='cut';return {full,half};}
 finish():BuiltModel{for(const [id,group] of this.groups){const buckets=new Map<string,T.Mesh[]>();for(const child of group.children){if(!(child instanceof T.Mesh)||child.userData.view||child.userData.boneUnit||Array.isArray(child.material))continue;const key=child.geometry.uuid+child.material.uuid;const bucket=buckets.get(key)||[];bucket.push(child);buckets.set(key,bucket);}for(const meshes of buckets.values()){if(meshes.length<2)continue;const first=meshes[0],instances=new T.InstancedMesh(first.geometry,first.material,meshes.length);instances.userData.part=id;instances.castShadow=first.castShadow;instances.receiveShadow=first.receiveShadow;meshes.forEach((mesh,i)=>{mesh.updateMatrix();instances.setMatrixAt(i,mesh.matrix);group.remove(mesh);});instances.instanceMatrix.needsUpdate=true;group.add(instances);}}return {root:this.root,groups:this.groups,flows:this.flows,animate:(s,p,c)=>this.animations.forEach(fn=>fn(s,p,c))};}
}
function mitochondrion(b:Builder){
 b.shell('outer',[0,0,0],[2.85,.98,1.02],.1);b.shell('inner',[0,0,0],[2.65,.81,.88],.09);
 const space=b.mesh('space',envelope([2.76,.9,.95],true,.1),[0,0,0],{transparent:true,opacity:.14,depthWrite:false});space.userData.view='cut';
 const matrix=b.mesh('matrix',envelope([2.57,.73,.79],true,.09),[0,0,0],{roughness:.8});matrix.userData.view='cut';
 for(let i=0;i<9;i++){const x=-2.05+i*.51;const reach=.68*Math.sqrt(1-(x/2.65)**2);const g=sheet(18,26,(u,w)=>{const z=-reach+w*reach;const wave=Math.sin(u*Math.PI);return [x+(u-.5)*.25+.045*Math.sin(w*Math.PI*2+i),-.48*Math.sqrt(Math.max(.02,1-(z/.9)**2))+wave*(.72+.15*Math.sin(i*1.8)),z];});b.mesh('cristae',g);}
}
function flower(b:Builder){
 for(const side of [-1,1]){b.mesh('petal',sheet(54,42,(u,w)=>{const width=Math.sin(Math.PI*u)*1.25;const radial=.1+1.1*Math.sin(u*Math.PI*.8);return [side*(radial+(w-.5)*width),-1+u*3.6+.08*Math.sin(w*Math.PI*5)*Math.sin(u*Math.PI),-.35-.45*Math.sin(w*Math.PI)*Math.sin(u*Math.PI)];}),[0,0,0],{roughness:.5});b.mesh('sepal',sheet(34,24,(u,w)=>[side*(.6+u*.5)+(w-.5)*.32*Math.sin(u*Math.PI),-.5-u*1.5,.08+.04*Math.sin(w*Math.PI)]));}
 b.shell('ovary',[0,-1,0],[.65,.85,.5]);b.tube('style',[[0,-.3,0],[0,.7,.03],[0,1.9,.06]],.075);b.blob('stigma',[0,1.98,.06],[.15,.08,.13],.1);
 for(let i=0;i<10;i++){const side=i<5?-1:1,j=i%5,x=side*(.5+j*.28),y=1.2+(j%3)*.28,z=.1+(j%2)*.18;b.tube('filament',[[side*.68,-.95,-.05],[side*.7,.2,z],[x,y,z]],.035);for(const offset of [-.055,.055]){const a=b.blob('anther',[x+offset,y+.1,z],[.07,.19,.09],.04);a.rotation.z=side*-.22;}}
}
function chloroplast(b:Builder){b.shell('outer',[0,0,0],[2.85,1.06,1.5]);b.shell('inner',[0,0,0],[2.7,.94,1.37]);const stroma=b.mesh('stroma',envelope([2.6,.85,1.28],true),[0,0,0],{roughness:.8});stroma.userData.view='cut';
 const centers:Vec3[]=[[-1.7,-.4,-.35],[-.45,-.4,.3],[.85,-.4,-.35],[1.8,-.4,.2]];
 for(const [i,c] of centers.entries())for(let j=0;j<6;j++){const id=i===2&&j===5?'thylakoid':'grana';const disc=b.mesh(id,new T.CylinderGeometry(.38,.38,.075,40),[c[0],c[1]+j*.135,c[2]],{roughness:.37});disc.scale.z=.85;const ring=b.mesh(id,new T.TorusGeometry(.37,.016,6,40),[c[0],c[1]+j*.135+.037,c[2]]);ring.rotation.x=Math.PI/2;ring.scale.y=.85;}
 for(let i=0;i<centers.length-1;i++){const a=centers[i],c=centers[i+1];for(const y of [-.2,.07]){const link=b.mesh('lamellae',sheet(18,4,(u,w)=>[a[0]+(c[0]-a[0])*u,y+.03*Math.sin(u*Math.PI),a[2]+(c[2]-a[2])*u+(w-.5)*.17]));link.castShadow=false;}}
}
function heart(b:Builder){
 const chambers:[string,Vec3,Vec3][]=[['ra',[-1.05,1,0],[.87,.77,.8]],['la',[.9,1.05,0],[.75,.69,.77]],['rv',[-.92,-.8,0],[.94,1.45,.85]],['lv',[.82,-.95,0],[.87,1.65,.92]]];
 // A continuous ventricular envelope, partitioned into selectable chamber surfaces.
 for(const [id,side] of [['rv',-1],['lv',1]] as [string,number][]){const surface=b.mesh(id,sheet(100,100,(u,w)=>{const angle=(side===1?-.5:.5)*Math.PI+w*Math.PI,t=u;const radial=Math.pow(Math.sin(Math.PI*t),.75)*(1.15-.55*t);const x=.58*t+1.9*radial*Math.cos(angle),y=1.3-3.7*t,z=.06+1.06*radial*Math.sin(angle);return [x,y,z];}),[0,0,0],{color:'#ae5555',roughness:.36});faceOutward(surface.geometry);surface.userData.view='full';}
 for(const [id,pos,size] of chambers){const atrial=id==='ra'||id==='la';if(atrial){const full=b.blob(id,[pos[0]*.9,pos[1]-.05,-.05],[size[0],size[1]*.82,.75],.025);full.userData.view='full';}
 const centerX=atrial?pos[0]*.9: id==='rv'?-.8:.72,centerY=atrial?1.02:id==='rv'?-.55:-.76,rx=atrial?.66:.64,ry=atrial?.57:id==='rv'?1.1:1.34;
 const cavity=b.mesh(id,sheet(64,64,(u,w)=>{const t=u*Math.PI,a=w*Math.PI;return [centerX+rx*Math.sin(t)*Math.cos(a)+(atrial?0:(id==='rv'?.55:.18)*u),centerY+ry*Math.cos(t),.045-(atrial?.53:.69)*Math.sin(t)*Math.sin(a)];}),[0,0,0],{color:atrial?'#8e4148':'#843a42',roughness:.54});faceOutward(cavity.geometry);cavity.userData.view='cut';
 const outline:Vec3[]=[];for(let i=0;i<=120;i++){const t=i/120*Math.PI*2;outline.push([centerX+rx*Math.cos(t)+(atrial?0:(id==='rv'?.275:.09)*(1-Math.sin(t))),centerY+ry*Math.sin(t),.045]);}const rim=b.tube(id,outline,atrial?.095:.12);rim.userData.view='cut';
 if(!atrial){const wall=b.mesh(id,sheet(70,70,(u,w)=>{const angle=(id==='lv'?-.5:1)*Math.PI+w*Math.PI/2;const radial=Math.pow(Math.sin(Math.PI*u),.75)*(1.15-.55*u);return [.58*u+1.9*radial*Math.cos(angle),1.3-3.7*u,.06+1.06*radial*Math.sin(angle)];}),[0,0,0],{roughness:.42});faceOutward(wall.geometry);wall.userData.view='cut';}}
 b.blob('septum',[.13,-.7,-.14],[.19,1.48,.25],.01);b.blob('atrial-septum',[0,1,-.2],[.16,.65,.3],.01);const apex=b.blob('apex',[.58,-2.34,.04],[.16,.15,.14]);apex.userData.view='cut';
 b.tube('vena',[[-1.25,2.9,-.6],[-1.25,1.7,-.45],[-1.05,1,-.3]],.26);b.tube('vena',[[-1.3,-1.7,-.6],[-1.45,.1,-.45],[-1.05,1,-.3]],.23);
 b.tube('aorta',[[.5,.2,-.15],[.3,1.7,-.3],[.4,2.7,-.5],[.9,3,-.6],[1.7,2.6,-.8],[1.8,1,-1]],.29);
 for(const x of [.6,.95,1.3])b.tube('aorta',[[x,2.9,-.6],[x-.15,3.4,-.65],[x-.1,3.65,-.65]],.12);
 b.tube('pa',[[-.6,-.4,.1],[-.3,.8,.45],[-.35,2,.5],[-.8,2.5,.35],[-1.7,2.55,-.15]],.24);b.tube('pa',[[-.4,2,.45],[.5,2.3,.3],[1.9,2.4,-.25]],.19);
 for(const side of [-1,1])for(const y of [.9,1.3])b.tube('pv',[[side*2.2,y,-.7],[side*1.6,y,-.65],[.9,1.1,-.4]],.13);
 const valveMeshes:T.Mesh[]=[];
 for(const [id,x,n] of [['tricuspid',-1,3],['mitral',.85,2]] as [string,number,number][]){for(let i=0;i<n;i++){const a=i/n*Math.PI*2,hinge:Vec3=[x+Math.cos(a)*.33,.27,.15+Math.sin(a)*.33];const mesh=b.mesh(id,sheet(16,10,(u,w)=>{const r=u*.33,angle=a+(w-.5)*Math.PI*2/n;return [Math.cos(angle)*r-Math.cos(a)*.33,-.05*Math.sin(u*Math.PI),Math.sin(angle)*r-Math.sin(a)*.33];}),hinge);mesh.userData.hingeAxis=new T.Vector3(-Math.sin(a),0,Math.cos(a));valveMeshes.push(mesh);} }
 // NCERT specifies semilunar opening/closure, not a cusp count here.
 const semi:T.Mesh[]=[];for(const [x,y,z] of [[-.3,.7,.45],[.5,.45,-.15]]){const ring=b.mesh('semilunar',new T.TorusGeometry(.22,.035,10,36),[x,y,z]);ring.rotation.x=Math.PI/2;const gate=b.mesh('semilunar',new T.CircleGeometry(.21,40),[x,y,z]);gate.rotation.x=-Math.PI/2;semi.push(gate);}

 for(const x of [-1,.85])for(let i=0;i<7;i++){const dx=(i-3)*.055;b.tube('chordae',[[x+dx,.19,.2+Math.abs(dx)],[x+dx*.4,-.35,.33],[x,-.7,.25]],.011);}
 b.blob('san',[-1.55,1.47,.14],[.14,.075,.075]);b.blob('avn',[-.38,.48,.1],[.1,.15,.07]);b.tube('his',[[-.38,.48,.1],[0,.25,.3],[.05,-.8,.55],[.5,-1.9,.2]],.035);b.tube('his',[[.02,-.2,.4],[-.3,-1.2,.4],[-1.2,-1.5,.1]],.025);
 for(const id of ['septum','atrial-septum','tricuspid','mitral','semilunar','chordae','san','avn','his'])b.groups.get(id)!.traverse(o=>{if(o instanceof T.Mesh)o.userData.view='cut';});
 // Vessel ends are open; a dark inner lining and a soft rim give visible wall thickness.
 for(const id of ['vena','pa','pv','aorta']){for(const mesh of [...b.groups.get(id)!.children]){if(!(mesh instanceof T.Mesh)||!(mesh.geometry instanceof T.TubeGeometry))continue;const c=mesh.geometry.parameters.path,r=mesh.geometry.parameters.radius;mesh.userData.view='full';const frames=c.computeFrenetFrames(80,false);const cut=b.mesh(id,sheet(80,24,(u,w)=>{const i=Math.min(80,Math.round(u*80)),normal=frames.normals[i],binormal=frames.binormals[i],angle=Math.atan2(binormal.z,normal.z)+Math.PI/2+w*Math.PI;const p=c.getPointAt(u).addScaledVector(normal,Math.cos(angle)*r).addScaledVector(binormal,Math.sin(angle)*r);return [p.x,p.y,p.z];}));cut.userData.view='cut';for(const t of [0,1]){const p=c.getPointAt(t),normal=c.getTangentAt(t);const rim=b.mesh(id,new T.TorusGeometry(r,.026,10,32),[p.x,p.y,p.z]);rim.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),normal);}}}
 b.flows=heartRoutes;
 b.animations.push((step,phase,cycle)=>{for(const [id] of chambers){const atria=id==='ra'||id==='la';const contract=cycle&&(atria?step===1:step===2||step===3);b.groups.get(id)!.scale.setScalar(contract?.94+.02*Math.cos(Math.PI*phase):1);}
 const avOpen=cycle?(step===0||step===1):![3,4,8,9].includes(step);for(const mesh of valveMeshes)mesh.quaternion.setFromAxisAngle(mesh.userData.hingeAxis,avOpen?Math.PI*.38:0);const slOpen=cycle?step===3:[3,4,8,9].includes(step);for(const mesh of semi)mesh.scale.setScalar(slOpen?.001:1);});
}
function nephron(b:Builder){
 b.shell('capsule',[-1.6,1.8,0],[.64,.6,.5]);const tuft:Vec3[]=[[-1.7,1.85,.15]];for(let j=0;j<=100;j++){const t=j/100*Math.PI*12;tuft.push([-1.6+.32*Math.sin(t*1.3),1.8+.28*Math.cos(t),.1+.27*Math.sin(t*.7)]);}tuft.push([-1.4,1.9,.15]);b.tube('glomerulus',tuft,.038);
 b.tube('afferent',[[-2.7,2.8,0],[-2.2,2.5,0],[-1.7,1.85,.15]],.09);b.tube('efferent',[[-1.4,1.9,.15],[-.9,2.3,.2],[-.6,2.7,.1]],.065);
 const pct:Vec3[]=[[-1.1,1.5,0],[-.9,.9,.1],[-.2,1.2,.2],[.05,1.7,.1],[-.5,1.9,0],[-.6,1.4,-.1],[.1,.9,0],[-.45,.6,0],[-.7,.3,0]];
 const down:Vec3[]=[[-.7,.3,0],[-.75,-.8,0],[-.75,-2.3,0],[-.4,-2.7,0],[-.1,-2.7,0]];
 const up:Vec3[]=[[-.1,-2.7,0],[.35,-2.45,0],[.5,-1.1,0],[.5,.3,0]];
 const dct:Vec3[]=[[.5,.3,0],[.7,.75,0],[1.2,.5,.2],[1.6,.8,0],[1.2,1.15,-.1],[.9,.85,0],[1.5,.4,.1],[2,.2,0]];
 const duct:Vec3[]=[[2,2.6,0],[2,.2,0],[2,-2.6,0]];
 for(const [id,p] of [['pct',pct],['descending',down],['ascending',up],['dct',dct],['collecting',duct]] as [string,Vec3[]][])b.tube(id,p,.12);
 b.tube('vasa',[[-.6,2.7,.15],[-1,.4,.1],[-1.05,-1.5,.1],[-.6,-2.9,.12],[.6,-2.85,.12],[.85,-1.1,.1],[.9,.2,.12]],.055);
 b.flows=[{id:'capsule-pct',from:'capsule',to:'pct',points:pct.slice(0,3),color:'#e8bc66'},{id:'pct-loop',from:'pct',to:'descending',points:pct,color:'#e8bc66'},{id:'descending-flow',from:'descending',to:'ascending',points:down,color:'#e8bc66'},{id:'ascending-flow',from:'ascending',to:'dct',points:up,color:'#e8bc66'},{id:'dct-flow',from:'dct',to:'collecting',points:dct,color:'#e8bc66'},{id:'collecting-flow',from:'collecting',to:'out',points:[[2,.2,0],[2,-1,0],[2,-2.6,0]],color:'#e8bc66'}];
}
function neuron(b:Builder){
 const soma=organic([.75,.7,.35],.15);b.mesh('soma',soma,[-2,0,0]);b.blob('nucleus',[-2,0,.32],[.2,.2,.12]);
 for(let i=0;i<35;i++){const a=i*2.399;const r=.3+.25*(i%4)/4;b.blob('nissl',[-2+Math.cos(a)*r,Math.sin(a)*r,.27],[.025,.015,.018],.01);}
 for(let i=0;i<7;i++){const a=(i/7*1.6+.2)*Math.PI;const x=-2+Math.cos(a)*.55,y=Math.sin(a)*.55;const end:Vec3=[-2+Math.cos(a)*1.65,Math.sin(a)*1.65,.1*Math.sin(i)];const mid:Vec3=[-2+Math.cos(a)*1.1,Math.sin(a)*1.1,0];b.tube('dendrites',[[x,y,0],mid,end],.055);for(const d of [-1,1])b.tube('dendrites',[mid,[mid[0]+Math.cos(a+d*.6)*.5,mid[1]+Math.sin(a+d*.6)*.5,.1*d],[mid[0]+Math.cos(a+d*.6)*.85,mid[1]+Math.sin(a+d*.6)*.85,.15*d]],.025);}
 const axon:Vec3[]=[[-1.4,0,0],[-.8,0,0],[.5,0,0],[2,0,0],[2.8,-.1,0]];b.tube('axon',axon,.075);
 for(let i=0;i<5;i++){const x=-.55+i*.62;const segment=b.mesh('myelin',organic([.26,.18,.18],.025),[x,0,0]);segment.rotation.x=.2;b.blob('schwann',[x,.1,.12],[.08,.045,.045],.03);if(i<4)b.mesh('nodes',new T.TorusGeometry(.08,.013,6,20),[x+.31,0,0]).rotation.y=Math.PI/2;}
 for(let i=0;i<5;i++){const y=(i-2)*.37;const path:Vec3[]=[[2.65,0,0],[3,-.1,0],[3.4,y,.1*(i%2)],[3.9,y*1.2,.1*(i%2)]];b.tube('terminal',path,.035);b.blob('knobs',path[3],[.085,.075,.075]);}
 b.flows=[{id:'dendrite-flow',from:'dendrites',to:'soma',points:[[-3.3,1,.15],[-2.7,.65,.2],[-2,0,.4]],color:'#e8bf66'},{id:'axon-flow',from:'soma',to:'axon',points:[[-2,0,.3],[-1,0,.25],[1,0,.25],[2.7,0,.25]],color:'#e8bf66'},{id:'terminal-flow',from:'axon',to:'knobs',points:[[2.7,0,.25],[3.2,-.2,.2],[3.9,-.9,.2]],color:'#e8bf66'}];
}
function dna(b:Builder){
 const turns=2.2,n=22,height=5.6,r=.95;const helices:Vec3[][]=[[],[]];for(let i=0;i<=220;i++){const t=i/220*turns*Math.PI*2;for(let s=0;s<2;s++)helices[s].push([r*Math.cos(t+s*Math.PI),i/220*height-height/2,-r*Math.sin(t+s*Math.PI)]);}
 for(const points of helices)b.tube('backbone',points,.075);
 for(let i=0;i<n;i++){const t=i/10*Math.PI*2;const a:Vec3=[r*Math.cos(t),i/n*height-height/2,-r*Math.sin(t)],c:Vec3=[-a[0],a[1],-a[2]],mid:Vec3=[0,a[1],0];const id=i%2?'gc':'at';b.tube(id,[a,[(a[0])*.5,a[1],a[2]*.5],[-.07*a[0],a[1],-.07*a[2]]],.075);b.tube(id,[[.07*a[0],a[1],.07*a[2]],[c[0]*.5,c[1],c[2]*.5],c],.075);
  const perp=new T.Vector3(a[2],0,-a[0]).normalize();for(let j=0;j<(i%2?3:2);j++){const d=(j-((i%2?3:2)-1)/2)*.065;const p=v(mid).addScaledVector(perp,d);b.tube('bonds',[[p.x-.12*a[0],p.y,p.z-.12*a[2]],[p.x+.12*a[0],p.y,p.z+.12*a[2]]],.012);}
  // Flat translucent rungs make stacked planes inspectable without atomistic claims.
  const rung=b.mesh('pairs',new T.BoxGeometry(1.7,.018,.08),[0,a[1],0],{transparent:true,opacity:.2,depthWrite:false});rung.rotation.y=t;
 }
 for(const s of [0,1]){const p=helices[s][0];b.blob('polarity',p,[.12,.12,.12],.01);} }
function leaf(b:Builder){
 for(let x=-2.7;x<=2.71;x+=.36)for(let z=-.7;z<=.71;z+=.35){b.blob('upper',[x,1,z],[.19,.13,.18],.035);if(!(x>1.1&&x<1.9&&Math.abs(z)<.4))b.blob('lower',[x,-1,z],[.19,.13,.18],.035);if(Math.abs(x)>.6)b.blob('palisade',[x,.48,z],[.16,.43,.16],.04);}
 for(let i=0;i<80;i++){const x=-2.6+(i%13)*.42,z=-.68+Math.floor(i/13)%4*.4,y=-.35-Math.floor(i/52)*.4;if(Math.abs(x)<.7)continue;if(i%4===0)continue;b.blob('spongy',[x,y,z],[.22,.23,.2],.08);}
 const air=b.blob('air',[1.2,-.45,0],[.24,.24,.3],.02);(air.material as T.MeshStandardMaterial).transparent=true;(air.material as T.MeshStandardMaterial).opacity=.08;
 for(let j=0;j<18;j++){const t=j/18*Math.PI*2;b.blob('sheath',[Math.cos(t)*.62,Math.sin(t)*.65,0],[.17,.17,.85],.03);}
 for(let i=0;i<7;i++){const x=(i%3-1)*.2,y=.13+Math.floor(i/3)*.17;b.tube('xylem',[[x,y,-.85],[x,y,0],[x,y,.85]],.09);}
 for(let i=0;i<8;i++){const x=(i%3-1)*.19,y=-.17-Math.floor(i/3)*.15;b.blob('phloem',[x,y,0],[.095,.1,.85],.02);}
 for(const side of [-1,1]){const g=b.mesh('stoma',new T.TorusGeometry(.25,.09,12,36,Math.PI*1.4),[1.5+side*.12,-1,0]);g.rotation.x=Math.PI/2;g.rotation.z=side===1?0:Math.PI;}
}
function respiration(b:Builder){
 for(const side of [-1,1]){const pos:Vec3=[side*1.1,-.2,0];const shape=organic([.95,1.65,.6],.045);const p=shape.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setX(i,x*(.8-.1*y));}shape.computeVertexNormals();const full=b.mesh('lungs',shape,pos,{transparent:true,opacity:.94});full.userData.view='full';const cut=b.mesh('lungs',envelope([.98,1.55,.62],true),pos);cut.userData.view='cut';const pleura=b.mesh('pleura',organic([1.02,1.71,.66],.03),pos,{transparent:true,opacity:.12,depthWrite:false});pleura.userData.view='full';}
 b.tube('trachea',[[0,3.1,0],[0,2,0],[0,.7,0]],.16);for(let i=0;i<15;i++){const ring=b.mesh('trachea',new T.TorusGeometry(.18,.025,8,28,Math.PI*1.7),[0,.85+i*.145,0]);ring.rotation.x=Math.PI/2;}
 b.blob('larynx',[0,3.08,0],[.27,.25,.2]);b.blob('epiglottis',[0,3.46,.03],[.14,.25,.07]);
 for(const side of [-1,1]){const bronchus:Vec3[]=[[0,.7,0],[side*.45,.35,0],[side*.9,-.1,0]];b.tube('bronchi',bronchus,.12);for(let i=0;i<8;i++){const y=.65-i*.22;const end:Vec3=[side*(1.2+.5*Math.sin(i*1.7)),y-.35,.2+Math.cos(i)*.15];b.tube('bronchioles',[[side*.6,.25,0],[side*(.8+i*.04),y,.1],end],.045);for(let k=0;k<5;k++){const a=k/5*Math.PI*2;b.blob('alveoli',[end[0]+Math.cos(a)*.11,end[1]+Math.sin(a)*.1,end[2]],[.1,.11,.09],.04);}}}
 const diaphragm=b.mesh('diaphragm',sheet(42,28,(u,w)=>{const x=(u-.5)*5.1,z=(w-.5)*1.5;return [x,-2+.56*(1-(x/2.55)**2)*(1-(z/.9)**2),z];}));
 const base=Array.from(diaphragm.geometry.attributes.position.array);b.animations.push((step,phase)=>{const expansion=step===0?.025+.07*phase:.095-.07*phase;b.groups.get('lungs')!.scale.set(1+expansion,1+expansion,1+expansion);const p=diaphragm.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=base[i*3],y=base[i*3+1],z=base[i*3+2];const flatten=step===0?phase:1-phase;p.setXYZ(i,x,y-flatten*.42*(1-(x/2.55)**2),z);}diaphragm.geometry.computeVertexNormals();p.needsUpdate=true;});
 b.flows=[{id:'air-left',from:'trachea',to:'lung-left',points:[[0,3.5,.28],[0,1.1,.28],[-.6,.3,.3],[-1.3,-.8,.35]],color:'#85b6c2'},{id:'air-right',from:'trachea',to:'lung-right',points:[[0,3.5,.28],[0,1.1,.28],[.6,.3,.3],[1.3,-.8,.35]],color:'#85b6c2'}];
}
export function buildModel(config:ModelConfig):BuiltModel{const b=new Builder(config);({heart,mitochondrion,chloroplast,nephron,neuron,dna,leaf,respiration,flower,'plant-cell':buildCell,'animal-cell':buildCell,skeleton:buildSkeleton,sarcomere:buildSarcomere} as Record<string,(b:Builder)=>void>)[config.id](b);return b.finish();}
