import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {readFileSync} from 'node:fs';
import {models,modelForPage} from '../src/content/models.ts';
import {buildModel,heartRoutes} from '../src/viewer/modelBuilders.ts';
import {specimenDistance} from '../src/viewer/framing.ts';
const library=JSON.parse(readFileSync(new URL('../src/content/library.json',import.meta.url),'utf8'));
test('all model structures and learning steps have valid supplied page references',()=>{for(const id of ['heart','plant-cell','animal-cell','skeleton','sarcomere'])assert.ok(models.some(m=>m.id===id),id);assert.ok(models.some(m=>m.source.chapterId.startsWith('bio-12')));for(const m of models){const ids=new Set(m.structures.map(p=>p.id));assert.equal(ids.size,m.structures.length);for(const s of [m.source,...m.structures.map(p=>p.source),...m.guides.map(g=>g.source),...(m.cycle||[]).map(g=>g.source)]){const ch=library.find((c:any)=>c.id===s.chapterId);assert.ok(ch,s.chapterId);assert.equal(ch.pages[s.pdfPage-1].printedPage,s.printedPage);}for(const g of [...m.guides,...m.cycle||[]])for(const p of g.parts)assert.ok(ids.has(p),`${m.id}/${p}`);}});
test('every selectable structure has real, finite scene geometry',()=>{for(const m of models){const built=buildModel(m);assert.equal(built.groups.size,m.structures.length);for(const [id,g] of built.groups){let count=0;g.traverse(o=>{if(o instanceof T.Mesh){count++;const pos=o.geometry.attributes.position;assert.ok(pos.count>0);for(const f of pos.array)assert.ok(Number.isFinite(f),`${m.id}/${id}`);}});assert.ok(count>0,`${m.id}/${id} missing mesh`);}built.animate(0,.5,false);built.animate(1,.5,false);built.animate(3,.5,true);}});
test('heart route is a directed, closed, unmixed NCERT circulation sequence',()=>{const expected=['body','vena','ra','rv','pa','lungs','pv','la','lv','aorta','body'];assert.deepEqual([heartRoutes[0].from,...heartRoutes.map(r=>r.to)],expected);heartRoutes.forEach((r,i)=>{assert.equal(r.from,expected[i]);assert.equal(r.to,expected[i+1]);assert.ok(r.points.length>=3);if(i<5)assert.equal(r.color,'#659bc7');else assert.equal(r.color,'#d77878');});});
test('cardiac cycle does not permit AV flow during ventricular ejection',()=>{const heart=models.find(m=>m.id==='heart')!;assert.equal(heart.cycle!.length,5);assert.deepEqual(heart.cycle![2].flowIds,[]);assert.ok(heart.cycle![3].flowIds!.includes('rv-pa'));assert.ok(heart.cycle![3].flowIds!.includes('lv-aorta'));assert.equal(heart.cycle![3].flowIds!.includes('ra-rv'),false);assert.equal(heart.cycle![3].flowIds!.includes('la-lv'),false);});
test('all guided flow references resolve to directional paths',()=>{for(const config of models){const built=buildModel(config);const paths=new Set(built.flows.map(f=>f.id));for(const g of [...config.guides,...config.cycle||[]])for(const id of g.flowIds||[])assert.ok(paths.has(id),`${config.id}/${id}`);}});
test('page integration never displays a model from another chapter',()=>{for(const m of models)for(const page of m.relatedPages){assert.ok(modelForPage(m.source.chapterId,page).some(x=>x.id===m.id));for(const found of modelForPage(m.source.chapterId,page))assert.equal(found.source.chapterId,m.source.chapterId);}assert.deepEqual(modelForPage('bio-12-13',1),[]);});
test('DNA helix has antipodal backbones and right-handed rise',()=>{const built=buildModel(models.find(m=>m.id==='dna')!);const backbones=built.groups.get('backbone')!;assert.equal(backbones.children.length,2);const a=(backbones.children[0] as T.Mesh).geometry as T.TubeGeometry;const b=(backbones.children[1] as T.Mesh).geometry as T.TubeGeometry;const start=a.parameters.path.getPoint(0),quarter=a.parameters.path.getPoint(1/(4*2.2));assert.ok(quarter.y>start.y);assert.ok(quarter.z<0,'right-handed rotation around positive y moves +x towards -z');for(const t of [0,.25,.5,.75,1]){const p=a.parameters.path.getPoint(t),q=b.parameters.path.getPoint(t);assert.ok(Math.abs(p.x+q.x)<1e-6);assert.ok(Math.abs(p.z+q.z)<1e-6);assert.ok(Math.abs(p.y-q.y)<1e-6);}});


test('heart pathway stages join at the same spatial endpoints',()=>{for(let i=0;i<heartRoutes.length;i++){const current=heartRoutes[i],next=heartRoutes[(i+1)%heartRoutes.length];assert.ok(new T.Vector3(...current.points.at(-1)!).distanceTo(new T.Vector3(...next.points[0]))<.001,`${current.id} to ${next.id} is disconnected`);}});

test('structures requiring a view have visible geometry in that view',()=>{for(const model of models){const built=buildModel(model);for(const part of model.structures){if(!part.view)continue;let count=0;built.groups.get(part.id)!.traverse(o=>{if(o instanceof T.Mesh&&(!o.userData.view||o.userData.view===part.view))count++;});assert.ok(count,`${model.id}/${part.id} has no ${part.view} geometry`);}}});

test('closed heart surface normals face outwards towards the specimen front',()=>{const built=buildModel(models.find(m=>m.id==='heart')!);for(const id of ['rv','lv']){const mesh=built.groups.get(id)!.children.find(o=>o instanceof T.Mesh&&o.userData.view==='full') as T.Mesh;const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal;let front=0;for(let i=1;i<p.count;i++)if(p.getZ(i)>p.getZ(front))front=i;assert.ok(n.getZ(front)>.3,id+' has inverted exterior normals');}});

test('cell figures retain plant/animal distinctions and actual cutaway geometry',()=>{
 const plant=buildModel(models.find(m=>m.id==='plant-cell')!),animal=buildModel(models.find(m=>m.id==='animal-cell')!);
 for(const id of ['wall','middle-lamella','vacuole','chloroplasts','plasmodesmata']){assert.ok(plant.groups.has(id));assert.equal(animal.groups.has(id),false);}
 for(const id of ['centriole','microvilli']){assert.ok(animal.groups.has(id));assert.equal(plant.groups.has(id),false);}
 for(const built of [plant,animal])for(const id of ['membrane','nucleus','rer','ser','golgi']){let cut=0;built.groups.get(id)!.traverse(o=>{if(o instanceof T.Mesh&&o.userData.view==='cut')cut++;});assert.ok(cut,id);}
});

test('skeletal geometry preserves NCERT vertebral, rib and extremity counts',()=>{
 const skeleton=buildModel(models.find(m=>m.id==='skeleton')!);
 for(const [id,expected] of Object.entries({cervical:7,thoracic:12,lumbar:5,sacrum:1,coccyx:1,'true-ribs':14,'false-ribs':6,'floating-ribs':4,humerus:2,radius:2,ulna:2,carpals:16,metacarpals:10,'hand-phalanges':28,femur:2,tibia:2,fibula:2,tarsals:14,metatarsals:10,'foot-phalanges':28})){let actual=0;skeleton.groups.get(id)!.traverse(o=>{if(o instanceof T.Mesh&&o.userData.boneUnit)actual++;});assert.equal(actual,expected,id);}
});

test('sliding filaments shorten the sarcomere without shortening either filament or the A band',()=>{
 const built=buildModel(models.find(m=>m.id==='sarcomere')!);
 const measure=()=>{built.root.updateMatrixWorld(true);const box=(id:string)=>new T.Box3().setFromObject(built.groups.get(id)!);const z=built.groups.get('z-lines')!.children.map(g=>g.getWorldPosition(new T.Vector3()).x);const thin=built.groups.get('thin')!.children.map(g=>new T.Box3().setFromObject(g).getSize(new T.Vector3()).x);return {z:z[1]-z[0],thin,thick:box('thick').getSize(new T.Vector3()).x,a:box('a-band').getSize(new T.Vector3()).x,i:box('i-band').getSize(new T.Vector3()).x,h:box('h-zone').getSize(new T.Vector3()).x};};
 built.animate(0,0,false);const rest=measure();built.animate(2,0,false);const contracted=measure();assert.ok(contracted.z<rest.z);assert.ok(contracted.i<rest.i);assert.ok(contracted.h<rest.h);
 for(const key of ['thick','a'] as const)assert.ok(Math.abs(rest[key]-contracted[key])<1e-6,key);
 rest.thin.forEach((length,i)=>assert.ok(Math.abs(length-contracted.thin[i])<1e-6,'thin filament shortened'));
 built.animate(3,1,false);assert.deepEqual(measure(),rest);
});

test('default framing keeps every model inside the phone and desktop canvas',()=>{
 for(const config of models)for(const aspect of [345/370,846/345]){
  const built=buildModel(config);built.root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(built.root),base=new T.Vector3(...config.camera),camera=new T.PerspectiveCamera(37,aspect,.1,80);
  camera.position.copy(base.clone().normalize().multiplyScalar(specimenDistance(box,base,37,aspect,base.length())));camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new T.Vector3(x,y,z).project(camera);assert.ok(Math.abs(p.x)<1&&Math.abs(p.y)<1,`${config.id} clipped at aspect ${aspect}`);}
 }
});
