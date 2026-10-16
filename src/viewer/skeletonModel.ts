import * as T from 'three';
import type {Builder} from './modelBuilders';
import type {Vec3} from './modelTypes';
import {sheet,v} from './geometry';

/** Independently modelled NCERT overview, with real geometry for every selectable group. */
export function buildSkeleton(b:Builder){
 const geometries=new Map<string,T.LatheGeometry>();
 function bone(id:string,a:Vec3,c:Vec3,r:number,head=r*1.7,unit=true){
  const length=v(a).distanceTo(v(c)),key=[length.toFixed(4),r,head].join(':');let g=geometries.get(key);
  if(!g){const profile=[[0,0],[head*.72,.025],[head,.07],[head*.92,.13],[r*1.06,.23],[r*.88,.5],[r*1.02,.77],[head*.95,.91],[head, .95],[head*.72,.985],[0,1]].map(([radius,y])=>new T.Vector2(radius,y*length));g=new T.LatheGeometry(profile,18);geometries.set(key,g);}
  const mesh=b.mesh(id,g,a,{roughness:.61,metalness:0});mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v(c).sub(v(a)).normalize());if(unit)mesh.userData.boneUnit=true;return mesh;
 }
 function plate(id:string,shape:T.Shape,pos:Vec3,depth=.07){const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:16});return b.mesh(id,g,pos,{roughness:.63,metalness:0});}
 const skull=b.blob('skull',[0,3.5,-.08],[.42,.53,.38],.012);skull.scale.z=.95;
 const face=new T.Shape();face.moveTo(-.32,-.24);face.bezierCurveTo(-.44,.02,-.38,.35,-.25,.4);face.quadraticCurveTo(0,.49,.25,.4);face.bezierCurveTo(.38,.35,.44,.02,.32,-.24);face.quadraticCurveTo(0,-.4,-.32,-.24);
 for(const side of [-1,1]){const eye=new T.Path();eye.absellipse(side*.16,.16,.115,.105,0,Math.PI*2,true,0);face.holes.push(eye);}
 const nose=new T.Path();nose.moveTo(0,.08);nose.lineTo(.075,-.1);nose.quadraticCurveTo(0,-.14,-.075,-.1);nose.closePath();face.holes.push(nose);
 plate('skull',face,[0,3.1,.27],.06);
 for(const side of [-1,1])b.blob('skull',[side*.16,3.26,.245],[.102,.095,.045],.01).material=b.material('skull',{color:'#796a53',roughness:1});
 b.tube('mandible',[[-.31,3.17,-.02],[-.34,2.99,.22],[-.23,2.87,.44],[0,2.85,.52],[.23,2.87,.44],[.34,2.99,.22],[.31,3.17,-.02]],.065);
 // A continuous alveolar ridge avoids inventing a tooth count in this grouped overview.
 b.tube('skull',[[-.26,3.01,.35],[0,2.99,.5],[.26,3.01,.35]],.052);
 b.tube('hyoid',[[-.17,2.76,.14],[-.16,2.68,.27],[0,2.66,.33],[.16,2.68,.27],[.17,2.76,.14]],.028);
 const vertebra=(id:string,y:number,size:number,z:number)=>{
  const body=b.blob(id,[0,y,z+.055],[size,.056,size*.7],.025);body.userData.boneUnit=true;
  const ring=b.mesh(id,new T.TorusGeometry(size*.66,.033,7,16),[0,y,z-.09]);ring.rotation.x=Math.PI/2;
  bone(id,[0,y,z-.17],[0,y-.045,z-.37],.026,.045,false);
  for(const side of [-1,1])bone(id,[side*.05,y,z-.09],[side*(size+.07),y-.025,z-.14],.021,.035,false);
 };
 for(let i=0;i<7;i++)vertebra('cervical',2.72-i*.09,.105,-.09-.035*Math.sin(i/6*Math.PI));
 for(let i=0;i<12;i++)vertebra('thoracic',2.07-i*.145,.135,-.23-.08*Math.sin(i/11*Math.PI));
 for(let i=0;i<5;i++)vertebra('lumbar',.28-i*.13,.175,-.15+.05*Math.sin(i/4*Math.PI));
 const sacrumShape=new T.Shape();sacrumShape.moveTo(-.23,.22);sacrumShape.quadraticCurveTo(0,.3,.23,.22);sacrumShape.lineTo(.1,-.28);sacrumShape.quadraticCurveTo(0,-.4,-.1,-.28);sacrumShape.closePath();plate('sacrum',sacrumShape,[0,-.5,-.3],.13).userData.boneUnit=true;
 bone('coccyx',[0,-.79,-.17],[0,-.97,-.04],.035,.055);
 b.blob('sternum',[0,1.5,.72],[.105,.53,.05],.02);b.blob('sternum',[0,2,.67],[.16,.16,.06],.02);
 // Rib number and anterior attachment follow the three NCERT classes exactly.
 for(let i=0;i<12;i++)for(const side of [-1,1]){
  const id=i<7?'true-ribs':i<10?'false-ribs':'floating-ribs',y=2.07-i*.145,width=.42+.57*Math.sin((i+1)/14*Math.PI),frontY=y-.2;
  const points:Vec3[]=[[side*.1,y,-.25],[side*width*.7,y+.04,-.37],[side*width,y-.08,.04],[side*width*.8,frontY,.5]];
  if(i<7)points.push([side*.28,frontY+.02,.7]);else if(i<10)points.push([side*.34,1.03-(i-7)*.07,.6]);
  if(i>=10){points.pop();points.push([side*width*.85,y-.14,.1]);}const rib=b.tube(id,points,.044);rib.scale.y=1;rib.userData.boneUnit=true;
  if(i<7){const cartilage=b.tube(id,[[side*.28,frontY+.02,.7],[side*.15,frontY+.055,.73],[side*.08,frontY+.08,.73]],.033);cartilage.material=b.material(id,{color:'#acb9a2',roughness:.7});}
  else if(i<10){const cartilage=b.tube(id,[[side*.34,1.03-(i-7)*.07,.6],[side*.24,1.07,.68],[side*.28,1.02,.7]],.031);cartilage.material=b.material(id,{color:'#acb9a2',roughness:.7});}
 }
 for(const side of [-1,1]){
  b.tube('clavicle',[[side*.06,2.15,.52],[side*.45,2.2,.47],[side*.78,2.15,.3],[side*1.12,2.12,.12]],.068);
  const scap=new T.Shape();scap.moveTo(0,0);scap.quadraticCurveTo(.26,.18,.56,.03);scap.lineTo(.32,-.65);scap.quadraticCurveTo(.2,-.75,0,0);
  const blade=plate('scapula',scap,[side*.55,2.08,-.4]);blade.scale.x=side;
  b.tube('scapula',[[side*.54,1.97,-.35],[side*.92,2.05,-.25],[side*1.13,2.12,-.1]],.058);
  bone('humerus',[side*1.16,2.02,.03],[side*1.36,.64,.02],.073,.13);
  b.blob('humerus',[side*1.15,2.02,.03],[.15,.16,.15],.015);
  bone('radius',[side*1.43,.59,.06],[side*1.68,-.57,.06],.047,.075);
  bone('ulna',[side*1.31,.62,-.015],[side*1.52,-.6,0],.042,.077);
  for(let i=0;i<8;i++){const c=b.blob('carpals',[side*(1.48+(i%4)*.075),-.65-Math.floor(i/4)*.09,.035+Math.sin(i)*.025],[.045,.05,.05],.04);c.userData.boneUnit=true;}
  for(let finger=0;finger<5;finger++){
   const x=1.76-finger*.08,start:Vec3=[side*x,-.82,.04],end:Vec3=[side*(x+(finger===0?.1:(2-finger)*.012)),-1.1+(finger===0?.11:0),.05];bone('metacarpals',start,end,.028,.04);
   const count=finger===0?2:3,lengths=finger===0?[.14,.12]:[.16+(finger%3)*.018,.12,.095];let a=end;
   for(let j=0;j<count;j++){const c:Vec3=[a[0]+side*(finger-2)*.009,a[1]-lengths[j],a[2]+.014];bone('hand-phalanges',a,c,.022-j*.002,.033-j*.002);a=c;}
  }
  // Broad iliac wing and the lower ring are one coxal group, as in Figure 17.10.
  const wing=b.mesh('coxal',sheet(30,30,(u,w)=>{const a=-.35+u*Math.PI*1.2,r=.24+w*.31;return [side*(.28+Math.sin(a)*r),-.42+Math.cos(a)*r,.02-.27*Math.sin(w*Math.PI)+.12*Math.cos(a)];}));wing.material=b.material('coxal',{roughness:.65});
  b.tube('coxal',[[side*.62,-.45,.04],[side*.52,-.72,.14],[side*.24,-.87,.32],[side*.08,-.72,.36],[side*.3,-.49,.3],[side*.62,-.45,.04]],.08);
  b.blob('coxal',[side*.56,-.48,.03],[.145,.16,.13],.025);
  bone('femur',[side*.54,-.65,.03],[side*.4,-2.18,.02],.092,.15);
  bone('femur',[side*.55,-.68,.03],[side*.32,-.5,-.01],.078,.13,false);
  b.blob('femur',[side*.32,-.5,-.01],[.145,.145,.145],.01);
  b.blob('patella',[side*.4,-2.24,.23],[.11,.14,.07],.03);
  bone('tibia',[side*.38,-2.32,.04],[side*.4,-3.66,.04],.065,.12);
  bone('fibula',[side*.59,-2.3,-.02],[side*.58,-3.66,0],.035,.06);
  const tarsalPositions:Vec3[]=[[.43,-3.75,.02],[.43,-3.85,.05],[.43,-3.81,.21],[.55,-3.82,.24],[.32,-3.82,.3],[.42,-3.82,.35],[.52,-3.82,.35]];
  for(const [i,p] of tarsalPositions.entries()){const t=b.blob('tarsals',[side*p[0],p[1],p[2]],[i===1?.105:.065,.065,i===1?.12:.067],.04);t.userData.boneUnit=true;}
  for(let toe=0;toe<5;toe++){
   const x=.26+toe*.085,a:Vec3=[side*x,-3.84,.39],c:Vec3=[side*x,-3.86,.69-(toe*.02)];bone('metatarsals',a,c,.027,.04);
   const count=toe===0?2:3;let start=c;for(let j=0;j<count;j++){const end:Vec3=[start[0],start[1],start[2]+(toe===0?.11:.08-j*.01)];bone('foot-phalanges',start,end,.021,.032);start=end;}
  }
  const shoulder=b.mesh('shoulder-joint',new T.TorusGeometry(.175,.023,8,28),[side*1.16,2.02,.045]);shoulder.rotation.y=side*.5;
  const knee=b.mesh('knee-joint',new T.TorusGeometry(.14,.021,8,28),[side*.4,-2.25,.04]);knee.rotation.x=Math.PI/2;
 }
 b.root.scale.setScalar(.75);
}
