import * as T from 'three';

/** Accessible surface markers shared by every specimen. Hidden geometry never contributes a hit. */
export class SpecimenHotspots {
 private items:{id:string;name:string;anchor:T.Vector3;button:HTMLButtonElement}[]=[];
 private ray=new T.Raycaster();private anchors=new Map<string,{signature:string;point:T.Vector3;owner?:T.Mesh;local?:T.Vector3}>();private dirty=true;private lastCheck=0;private visibility=new Map<string,boolean>();private lastCamera=new T.Vector3(999,999,999);
 constructor(private host:HTMLElement,private camera:T.Camera,private groups:Map<string,T.Group>,parts:{id:string;label:string;anchor:[number,number,number]}[],select:(id:string)=>void){
  this.items=parts.map(p=>{const button=document.createElement('button');button.className='specimen-hotspot';button.dataset.hotspotId=p.id;button.setAttribute('aria-label',`Select ${p.label}`);button.title=p.label;button.innerHTML='<span class="hotspot-core"></span><span class="hotspot-name"></span>';button.lastElementChild!.textContent=p.label;button.onclick=()=>select(p.id);host.appendChild(button);return {id:p.id,name:p.label,anchor:new T.Vector3(...p.anchor),button};});
 }
 changed(){this.dirty=true;}
 private meshes(group?:T.Group){const out:T.Object3D[]=[];const collect=(g:T.Object3D)=>{if(!g.visible)return;if(g instanceof T.Mesh)out.push(g);else g.children.forEach(collect);};if(group)collect(group);else this.groups.forEach(collect);return out;}
 update(labels:boolean,selected:string|null,now:number){
  const all=this.meshes();const occupied:{x:number;y:number;w:number}[]=[];const moved=this.camera.position.distanceToSquared(this.lastCamera)>.002;const check=this.dirty||moved||now-this.lastCheck>120;if(check)this.lastCamera.copy(this.camera.position);if(check)this.lastCheck=now;
  const ordered=[...this.items].sort((a,b)=>Number(b.id===selected)-Number(a.id===selected));
  for(const item of ordered){const group=this.groups.get(item.id)!;if(!this.meshes(group).length){item.button.hidden=true;continue;}let world=item.anchor.clone();
   // Snap the textbook anchor to a real visible surface vertex once per geometry view.
   const meshes=this.meshes(group) as T.Mesh[],signature=meshes.map(m=>m.uuid).join(',');let cached=this.anchors.get(item.id);
   if(!cached||cached.signature!==signature){let best=Infinity;let owner:T.Mesh|undefined;const point=new T.Vector3();for(const mesh of meshes){const positions=mesh.geometry.attributes.position;if(!positions)continue;let matrix=mesh.matrixWorld;
    if(mesh instanceof T.InstancedMesh){let nearest=new T.Matrix4(),distance=Infinity;const local=new T.Matrix4();for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,local);const candidate=new T.Matrix4().multiplyMatrices(mesh.matrixWorld,local);const d=new T.Vector3().setFromMatrixPosition(candidate).distanceToSquared(item.anchor);if(d<distance){distance=d;nearest.copy(candidate);}}matrix=nearest;}
    if(mesh instanceof T.InstancedMesh){const center=new T.Vector3().setFromMatrixPosition(matrix);this.ray.set(new T.Vector3(center.x,center.y,30),new T.Vector3(0,0,-1));const hit=this.ray.intersectObject(mesh,false)[0];if(hit){const d=hit.point.distanceToSquared(item.anchor);if(d<best){best=d;world.copy(hit.point);owner=mesh;}}}else for(let i=0;i<positions.count;i++){point.fromBufferAttribute(positions,i).applyMatrix4(matrix);const d=point.distanceToSquared(item.anchor);if(d<best){best=d;world.copy(point);owner=mesh;}}}
    this.ray.set(new T.Vector3(world.x,world.y,30),new T.Vector3(0,0,-1));const front=this.ray.intersectObjects(meshes,false)[0];if(front&&front.point.z>world.z+.08){world.copy(front.point);owner=front.object as T.Mesh;}cached={signature,point:world.clone(),owner,local:owner?world.clone().applyMatrix4(owner.matrixWorld.clone().invert()):undefined};this.anchors.set(item.id,cached);
   }world.copy(cached.local&&cached.owner?cached.local.clone().applyMatrix4(cached.owner.matrixWorld):cached.point);item.button.dataset.world=world.toArray().join(',');
   if(check){const distance=this.camera.position.distanceTo(world);this.ray.set(this.camera.position,world.clone().sub(this.camera.position).normalize());const hit=this.ray.intersectObjects(all,false)[0];this.visibility.set(item.id,!hit||hit.distance>=distance-.16);}
   const p=world.project(this.camera),x=(p.x*.5+.5)*this.host.clientWidth,y=(-p.y*.5+.5)*this.host.clientHeight,w=labels?Math.max(75,item.name.length*6+22):(this.host.clientWidth<600?42:28);
   const collision=occupied.some(o=>Math.abs(o.x-x)<(w+o.w)/2&&Math.abs(o.y-y)<(this.host.clientWidth<600?44:32));
   const visible=group.visible&&this.visibility.get(item.id)&&p.z<1&&p.z>-1&&Math.abs(p.x)<.94&&Math.abs(p.y)<.9&&!collision;
   item.button.hidden=!visible;item.button.classList.toggle('show-name',labels);item.button.classList.toggle('active',item.id===selected);item.button.setAttribute('aria-pressed',String(item.id===selected));
   if(visible){occupied.push({x,y,w});item.button.style.left=`${x}px`;item.button.style.top=`${y}px`;}
  }
  this.dirty=false;
 }
 dispose(){this.items.forEach(i=>i.button.remove());}
}

export class CameraFlight {
 private flight:{position:T.Vector3;target:T.Vector3;end:T.Vector3;focus:T.Vector3;start:number}|null=null;
 constructor(private camera:T.PerspectiveCamera,private controls:{target:T.Vector3;update:()=>void},private minimumDistance=6){}
 focus(group:T.Group){if(matchMedia('(prefers-reduced-motion: reduce)').matches){this.controls.target.copy(new T.Box3().setFromObject(group).getCenter(new T.Vector3()));this.controls.update();return;}const box=new T.Box3().setFromObject(group),focus=box.getCenter(new T.Vector3()),radius=box.getSize(new T.Vector3()).length()/2;const direction=this.camera.position.clone().sub(this.controls.target).normalize();this.flight={position:this.camera.position.clone(),target:this.controls.target.clone(),end:focus.clone().addScaledVector(direction,T.MathUtils.clamp(radius*3.3/Math.min(1,this.camera.aspect),this.minimumDistance,23)),focus,start:performance.now()};}
 cancel(){this.flight=null;}
 update(now:number){if(!this.flight)return false;const f=this.flight,t=T.MathUtils.clamp((now-f.start)/700,0,1),ease=t*t*(3-2*t);this.camera.position.lerpVectors(f.position,f.end,ease);this.controls.target.lerpVectors(f.target,f.focus,ease);this.controls.update();if(t===1)this.flight=null;return t<1;}
}
