import * as T from 'three';
import type {Builder} from './modelBuilders';

export function buildSarcomere(b:Builder){
 b.root.userData.dynamicShadows=true;b.root.userData.guideParts=['a-band','i-band','h-zone'];
 const thinLength=1.7,thickLength=3,relaxedLength=5.4,contractedLength=4;
 const left=new T.Group(),right=new T.Group();b.groups.get('thin')!.add(left,right);
 const strandGeo=new T.SphereGeometry(.033,7,5),strandMaterial=b.material('thin',{roughness:.42});
 const centres:[[number,number],...[number,number][]]=[[0,0],[.55,0],[-.55,0],[.275,.476],[-.275,.476],[.275,-.476],[-.275,-.476]];
 for(const [y,z] of centres){const rod=b.mesh('thick',new T.CylinderGeometry(.062,.062,thickLength,18),[0,y,z]);rod.rotation.z=Math.PI/2;for(let j=0;j<12;j++){const x=-1.35+j*.245;if(Math.abs(x)<.22)continue;const sign=x<0?-1:1;const head=b.blob('thick',[x,y+.11,z+.05],[.048,.075,.045],.02);head.rotation.z=sign*.5;}}
 const dummy=new T.Object3D();
 for(const side of [-1,1]){
  const mesh=new T.InstancedMesh(strandGeo,strandMaterial,18*38*2);mesh.userData.part='thin';mesh.castShadow=true;let index=0;
  for(let f=0;f<18;f++){const a=f/18*Math.PI*2,r=f%2?.8:.38,y=Math.cos(a)*r,z=Math.sin(a)*r;
   for(let i=0;i<38;i++)for(let strand=0;strand<2;strand++){const t=i/37,angle=t*Math.PI*8+strand*Math.PI;dummy.position.set(side*thinLength*t,y+Math.cos(angle)*.025,z+Math.sin(angle)*.025);dummy.updateMatrix();mesh.setMatrixAt(index++,dummy.matrix);}
  }mesh.instanceMatrix.needsUpdate=true;(side===1?left:right).add(mesh);
 }
 const zLines:T.Group[]=[];
 for(const side of [-1,1]){const end=new T.Group();end.userData.side=side;b.groups.get('z-lines')!.add(end);zLines.push(end);for(let j=-4;j<=4;j++){const horizontal=b.mesh('z-lines',new T.CylinderGeometry(.016,.016,1.95,6),[0,j*.23,0]);horizontal.rotation.x=Math.PI/2;end.add(horizontal);const vertical=b.mesh('z-lines',new T.CylinderGeometry(.016,.016,1.95,6),[0,0,j*.23]);end.add(vertical);}}
 for(let j=-3;j<=3;j++){const line=b.mesh('m-line',new T.CylinderGeometry(.013,.013,1.5,6),[0,j*.23,0]);line.rotation.x=Math.PI/2;}
 const region=(id:string,width:number,y:number,color:string)=>b.mesh(id,new T.BoxGeometry(width,.055,1.8),[0,y,0],{color,transparent:true,opacity:.3,depthWrite:false,roughness:1});
 const aBand=region('a-band',thickLength,-1.08,'#91b0c9');aBand.castShadow=false;
 const iBands=[region('i-band',1.2,-1.08,'#e5c77f'),region('i-band',1.2,-1.08,'#e5c77f')];
 const hZone=region('h-zone',2,-1.18,'#c5afd5');hZone.castShadow=false;
 b.animations.push((step,phase)=>{
  const contraction=step===1?phase:step===2?1:step===3?1-phase:0;
  const length=T.MathUtils.lerp(relaxedLength,contractedLength,contraction);
  left.position.x=-length/2;right.position.x=length/2;
  zLines.forEach(g=>g.position.x=g.userData.side*length/2);
  const iWidth=(length-thickLength)/2;for(let i=0;i<2;i++){iBands[i].scale.x=iWidth/1.2;iBands[i].position.x=(i===0?-1:1)*(thickLength/2+iWidth/2);}
  hZone.scale.x=Math.max(.01,length-2*thinLength)/2;
 });
 b.root.userData.sarcomere={thinLength,thickLength,relaxedLength,contractedLength};
 b.animations[0](0,0,false);
}
