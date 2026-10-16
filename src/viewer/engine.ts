import * as THREE from 'three';
import {CameraFlight,SpecimenHotspots} from './SpecimenHotspots';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import type {PartId} from '../content/types';
export interface ViewerState {selected:PartId|null;hidden:PartId[];isolate:boolean;labels:boolean;playing:boolean;}
const colors:Record<PartId,string>={heads:'#83bdca',tails:'#bca781',integral:'#c37d73',peripheral:'#a18cb9',sugar:'#dbb85e',cholesterol:'#87a781'};
const positions:Record<PartId,THREE.Vector3>={heads:new THREE.Vector3(-2.6,.9,1.2),tails:new THREE.Vector3(-2.6,0,1.5),integral:new THREE.Vector3(.7,1.5,.25),peripheral:new THREE.Vector3(-1.5,1.25,-.65),sugar:new THREE.Vector3(.7,2.4,.2),cholesterol:new THREE.Vector3(2.7,.45,1.1)};

export class MembraneEngine {
 private renderer:THREE.WebGLRenderer;private scene=new THREE.Scene();private camera=new THREE.PerspectiveCamera(36,1,.1,80);private controls:OrbitControls;
 private root=new THREE.Group();private groups={} as Record<PartId,THREE.Group>;private materials={} as Record<PartId,THREE.MeshStandardMaterial>;
 private frame=0;private disposed=false;private observer:ResizeObserver;private state:ViewerState={selected:null,hidden:[],isolate:false,labels:true,playing:false};
 private clock=0;private lastTime=0;private start=[0,0];private ray=new THREE.Raycaster();private labels=new Map<PartId,HTMLButtonElement>();
 private hotspots:SpecimenHotspots;private flight:CameraFlight;
 private protein:THREE.Mesh|null=null;
 constructor(private host:HTMLElement,private onSelect:(p:PartId|null)=>void,private onFailure:()=>void){
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'default'});this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.18;
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const canvas=this.renderer.domElement;canvas.setAttribute('aria-label','Interactive membrane. Arrow keys rotate, plus and minus zoom. Use the structure list to select parts.');canvas.tabIndex=0;canvas.setAttribute('role','img');host.appendChild(canvas);
  this.camera.position.set(7,5.8,9.7);this.controls=new OrbitControls(this.camera,canvas);this.controls.target.set(0,.2,0);this.controls.enableDamping=true;this.controls.dampingFactor=.09;this.controls.minDistance=5;this.controls.maxDistance=20;this.controls.maxPolarAngle=Math.PI*.85;this.controls.addEventListener('change',this.invalidate);
  this.scene.add(new THREE.HemisphereLight('#fff7e8','#8f9c98',2.3));
  const key=new THREE.DirectionalLight('#fff8ed',3.4);key.position.set(-3,8,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.bias=-.001;key.shadow.normalBias=.035;this.scene.add(key);
  const rim=new THREE.DirectionalLight('#c5e4ed',2.1);rim.position.set(3,2,-5);this.scene.add(rim);
  const fill=new THREE.DirectionalLight('#ffdcc4',.6);fill.position.set(1,-2,3);this.scene.add(fill);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.11}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.6;ground.receiveShadow=true;this.scene.add(ground);
  this.scene.add(this.root);this.build();
  this.flight=new CameraFlight(this.camera,this.controls);this.hotspots=new SpecimenHotspots(host,this.camera,new Map(Object.entries(this.groups)),Object.entries(positions).map(([id,anchor])=>({id,label:({heads:'Polar heads',tails:'Hydrophobic tails',integral:'Integral protein',peripheral:'Peripheral protein',sugar:'Sugar',cholesterol:'Cholesterol'} as Record<string,string>)[id],anchor:anchor.toArray() as [number,number,number]})),id=>onSelect(id as PartId));
  canvas.addEventListener('pointerdown',this.pointerDown);canvas.addEventListener('pointerup',this.pointerUp);canvas.addEventListener('keydown',this.keyDown);canvas.addEventListener('webglcontextlost',this.contextLost);document.addEventListener('visibilitychange',this.visibility);
  this.observer=new ResizeObserver(this.resize);this.observer.observe(host);this.controls.update();this.resize();
 }
 private build(){
  for(const id of Object.keys(colors) as PartId[]){const group=new THREE.Group();group.userData.part=id;this.groups[id]=group;this.root.add(group);this.materials[id]=new THREE.MeshStandardMaterial({color:colors[id],roughness:id==='heads'?.32:.48,metalness:.04});}
  const lipids:{x:number;z:number;wave:number}[]=[];
  for(let x=-3.55;x<=3.56;x+=.33)for(let z=-1.55;z<=1.56;z+=.33){if(Math.hypot((x-.65)/.8,(z-.15)/.65)<1||Math.hypot((x+2)/.48,(z+.15)/.45)<1)continue;lipids.push({x,z,wave:.08*Math.sin(x*.9)*Math.cos(z)});}
  const headGeom=new THREE.SphereGeometry(.158,16,12);const headMesh=new THREE.InstancedMesh(headGeom,this.materials.heads,lipids.length*2);headMesh.userData.part='heads';headMesh.castShadow=true;headMesh.receiveShadow=true;
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(.035,-.2,0),new THREE.Vector3(-.03,-.42,.025),new THREE.Vector3(.05,-.58,.01),new THREE.Vector3(.025,-.7,0)]);
  const tailGeom=new THREE.TubeGeometry(curve,14,.038,6,false);const tailMesh=new THREE.InstancedMesh(tailGeom,this.materials.tails,lipids.length*4);tailMesh.userData.part='tails';tailMesh.castShadow=true;tailMesh.receiveShadow=true;
  const d=new THREE.Object3D();let h=0,t=0;
  for(const p of lipids)for(const side of [1,-1]){d.position.set(p.x,side*.88+p.wave,p.z);d.rotation.set(0,0,0);d.scale.set(1,.87,1);d.updateMatrix();headMesh.setMatrixAt(h++,d.matrix);for(const dx of [-.065,.065]){d.position.set(p.x+dx,side*.78+p.wave,p.z);d.rotation.set(side===1?0:Math.PI,0,0);d.scale.set(1,1,1);d.updateMatrix();tailMesh.setMatrixAt(t++,d.matrix);}}
  this.groups.heads.add(headMesh);this.groups.tails.add(tailMesh);
  this.protein=this.blob('integral',[.65,.12,.15],[.58,1.37,.53],.12);this.blob('integral',[-2,-.1,-.15],[.34,1.04,.32],.08);
  this.blob('peripheral',[-1.4,1.06,-.8],[.55,.25,.33],.12);this.blob('peripheral',[2.05,-1.02,.35],[.5,.26,.35],.1);
  // Surface coils are schematic, following the visual language of Figure 8.4.
  this.tube('peripheral',[[-1.45,1.15,-.8],[-1.8,1.65,-.9],[-1.55,2.05,-.8],[-2,2.25,-.7],[-2.35,1.9,-.7]],.055);
  this.tube('integral',[[.6,-1.05,.15],[.8,-1.3,.4],[1.4,-1.25,.65],[1.65,-1.05,.6]],.055);
  this.tube('sugar',[[.62,1.35,.12],[.55,1.7,.13],[.75,1.93,.18],[.65,2.17,.2],[.8,2.4,.25]],.045);
  this.tube('sugar',[[.75,1.93,.18],[1.02,2.08,.15],[1.24,2.16,.2]],.04);
  for(const pos of [[.55,1.7,.13],[.75,1.93,.18],[.65,2.17,.2],[.8,2.4,.25],[1.02,2.08,.15],[1.24,2.16,.2]])this.blob('sugar',pos,[.09,.09,.09],.02);
  for(const [x,z,side] of [[2.7,1.1,1],[1.7,-.7,1],[-2.8,.7,-1],[-.6,1.2,1]]){this.tube('cholesterol',[[x,.72*side,z],[x+.04,.5*side,z],[x-.04,.3*side,z],[x,.1*side,z]],.075);this.blob('cholesterol',[x,.73*side,z],[.095,.095,.095],.01);}
 }
 private blob(id:PartId,position:number[],scale:number[],variation:number){const geometry=new THREE.SphereGeometry(1,40,30);const attr=geometry.attributes.position;for(let i=0;i<attr.count;i++){const x=attr.getX(i),y=attr.getY(i),z=attr.getZ(i);const r=1+variation*(Math.sin(y*7+x*3)*.5+Math.cos(z*9-y*4)*.3+Math.sin(x*11+z*3)*.2);attr.setXYZ(i,x*r,y*r,z*r);}geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,this.materials[id]);mesh.position.set(position[0],position[1],position[2]);mesh.scale.set(scale[0],scale[1],scale[2]);mesh.userData.part=id;mesh.castShadow=true;mesh.receiveShadow=true;this.groups[id].add(mesh);return mesh;}
 private tube(id:PartId,points:number[][],radius:number){const c=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p as [number,number,number])));const mesh=new THREE.Mesh(new THREE.TubeGeometry(c,36,radius,8,false),this.materials[id]);mesh.userData.part=id;mesh.castShadow=true;this.groups[id].add(mesh);}
 configure(state:ViewerState){const changed=state.selected!==this.state.selected;this.state=state;this.renderer.domElement.dataset.selected=state.selected||'';for(const id of Object.keys(colors) as PartId[]){this.groups[id].visible=!state.hidden.includes(id)&&(!state.isolate||!state.selected||state.selected===id);this.materials[id].emissive.set(state.selected===id?colors[id]:'#000000');this.materials[id].emissiveIntensity=state.selected===id?.24:0;}this.root.updateMatrixWorld(true);this.hotspots.changed();if(changed&&state.selected)this.flight.focus(this.groups[state.selected]);this.invalidate();}
 private resize=()=>{const w=this.host.clientWidth,h=this.host.clientHeight;if(w<1||h<1)return;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);this.invalidate();};
 private invalidate=()=>{if(!this.frame&&!this.disposed&&!document.hidden)this.frame=requestAnimationFrame(this.render);};
 private render=(time:number)=>{this.frame=0;if(this.disposed)return;const delta=Math.min((time-this.lastTime)/1000,.05);this.lastTime=time;if(this.state.playing){this.clock+=delta;const shift=Math.sin(this.clock*.8)*.13;this.groups.integral.position.x=shift;this.groups.sugar.position.x=shift;}
  this.controls.update();const before=performance.now();this.renderer.render(this.scene,this.camera);this.renderer.domElement.dataset.renderMs=(performance.now()-before).toFixed(2);this.renderer.domElement.dataset.triangles=String(this.renderer.info.render.triangles);this.renderer.domElement.dataset.drawCalls=String(this.renderer.info.render.calls);
  this.hotspots.update(this.state.labels,this.state.selected,time);const flying=this.flight.update(time);
  if(this.state.playing||flying)this.invalidate();
 };
 private pointerDown=(e:PointerEvent)=>{this.flight.cancel();this.start=[e.clientX,e.clientY];};
 private pointerUp=(e:PointerEvent)=>{if(Math.hypot(e.clientX-this.start[0],e.clientY-this.start[1])>5)return;const b=this.renderer.domElement.getBoundingClientRect();this.ray.setFromCamera(new THREE.Vector2((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1),this.camera);const candidates=Object.values(this.groups).filter(g=>g.visible);const hit=this.ray.intersectObjects(candidates,true)[0];if(hit?.object.userData.part)this.onSelect(hit.object.userData.part as PartId);else this.onSelect(null);};
 private keyDown=(e:KeyboardEvent)=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key)){e.preventDefault();if(e.key==='+'||e.key==='=')this.zoom(.85);else if(e.key==='-')this.zoom(1.15);else this.rotate(e.key==='ArrowLeft'?-.15:e.key==='ArrowRight'?.15:0,e.key==='ArrowUp'?-.15:e.key==='ArrowDown'?.15:0);}};
 private contextLost=(e:Event)=>{e.preventDefault();this.onFailure();};
 private visibility=()=>{if(document.hidden){cancelAnimationFrame(this.frame);this.frame=0;}else{this.lastTime=performance.now();this.invalidate();}};
 zoom(factor:number){this.flight.cancel();const offset=this.camera.position.clone().sub(this.controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,5,20));this.camera.position.copy(this.controls.target).add(offset);this.controls.update();this.invalidate();}
 rotate(theta:number,phi=0){this.flight.cancel();const offset=this.camera.position.clone().sub(this.controls.target);const s=new THREE.Spherical().setFromVector3(offset);s.theta+=theta;s.phi=THREE.MathUtils.clamp(s.phi+phi,.2,2.6);this.camera.position.copy(this.controls.target).add(new THREE.Vector3().setFromSpherical(s));this.controls.update();this.invalidate();}
 reset(){this.flight.cancel();this.clock=0;this.groups.integral.position.x=0;this.groups.sugar.position.x=0;this.camera.position.set(7,5.8,9.7);this.controls.target.set(0,.2,0);this.controls.update();this.invalidate();}
 dispose(){this.disposed=true;cancelAnimationFrame(this.frame);this.observer.disconnect();this.controls.removeEventListener('change',this.invalidate);this.controls.dispose();document.removeEventListener('visibilitychange',this.visibility);const c=this.renderer.domElement;c.removeEventListener('pointerdown',this.pointerDown);c.removeEventListener('pointerup',this.pointerUp);c.removeEventListener('keydown',this.keyDown);c.removeEventListener('webglcontextlost',this.contextLost);const geometries=new Set<THREE.BufferGeometry>();const materials=new Set<THREE.Material>();this.scene.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}if(o instanceof THREE.DirectionalLight)o.shadow.dispose();});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.hotspots.dispose();this.renderer.dispose();c.remove();this.labels.forEach(l=>l.remove());}
}
