import type {SourceRef} from './types';
import type {ModelConfig,Structure,Vec3} from '../viewer/modelTypes';
type Source=(chapter:string,page:number,figure:string,section:string)=>SourceRef;

/** Academic text below comes exclusively from the supplied chapters, not asset metadata. */
export function createExpansionModels(source:Source):ModelConfig[]{
 const cell=source('bio-11-08',8,'8.3','8.5');
 const make=(id:string,label:string,color:string,description:string,anchor:Vec3,ref=cell,view?:'full'|'cut'):Structure=>({id,label,color,description,anchor,source:ref,view});
 const guides=(parts:Structure[])=>parts.map(p=>({title:p.label,description:p.description,parts:[p.id],source:p.source}));
 const common=(plant:boolean):Structure[]=>[
  make('membrane','Plasma membrane','#bd9d74','The plasma membrane is labelled at the cell boundary in Figure 8.3.',[-2.45,.2,0]),
  make('cytoplasm','Cytoplasm','#b8c5a0','The cytoplasm is the main arena of cellular activities and contains the cell organelles.',[1.8,-1.2,0],cell,'cut'),
  make('nucleus','Nucleus','#ab8bb1','Eukaryotic cells possess an organised nucleus with a nuclear envelope.',plant?[.95,.8,.1]:[0,-.55,.1],cell,'cut'),
  make('envelope','Nuclear envelope','#c2a8c7','The nuclear envelope is identified around the nucleus in Figure 8.3.',plant?[1.6,.8,.1]:[.7,-.55,.1],cell,'cut'),
  make('nucleolus','Nucleolus','#705787','The nucleolus is identified within the nucleus in Figure 8.3.',plant?[.95,.8,.45]:[0,-.55,.45],cell,'cut'),
  make('rer','Rough endoplasmic reticulum','#b08f79','Ribosomes are attached to the outer surface of rough endoplasmic reticulum.',plant?[.3,1.35,.1]:[-.8,-.3,.1],source('bio-11-08',11,'8.5','8.5.3.1'),'cut'),
  make('ser','Smooth endoplasmic reticulum','#c3a381','Endoplasmic reticulum without ribosomes on its surface is called smooth endoplasmic reticulum.',plant?[-.7,1.5,.1]:[-1.2,.8,.1],source('bio-11-08',11,'8.5','8.5.3.1'),'cut'),
  make('golgi','Golgi apparatus','#c68776','The Golgi apparatus consists of flattened, disc-shaped sacs called cisternae, stacked parallel to each other.',plant?[1.85,.2,.1]:[0,1.1,.1],source('bio-11-08',11,'8.6','8.5.3.2'),'cut'),
  make('ribosomes','Ribosomes','#d6b76b','Ribosomes are shown on rough ER and in the cytoplasm in the supplied cell diagrams.',plant?[-1.4,.8,.2]:[1,-.8,.2],cell,'cut'),
  make('mitochondria','Mitochondria','#c77f60','Mitochondria are identified in both the plant and animal cell diagrams.',plant?[-1.7,1.4,.1]:[1.25,-1.2,.1],cell,'cut'),
  make('lysosome','Lysosome','#b66b65','Lysosomes are membrane-bound vesicular structures containing hydrolytic enzymes.',plant?[-.2,1.85,.1]:[1.2,.55,.1],source('bio-11-08',12,'8.3','8.5.3.3'),'cut'),
  make('peroxisome','Peroxisome','#c7c56f','A peroxisome is labelled in each supplied cell diagram. No additional metabolic pathway is simulated here.',plant?[-1.65,-1.65,.1]:[-1.25,.5,.1],cell,'cut'),
 ];
 const plant=[...common(true),
  make('wall','Cell wall','#789460','The cell wall forms the outer covering of the plant cell; it is outside the plasma membrane.',[-2.7,.3,0]),
  make('middle-lamella','Middle lamella','#af9771','The middle lamella holds neighbouring cells together. It is shown outside the cell wall in Figure 8.3.',[2.9,-.2,0],source('bio-11-08',11,'8.3','8.5.2')),
  make('vacuole','Large central vacuole','#e4d18a','A large central vacuole is a characteristic feature of the illustrated plant cell.',[-.75,-.7,.15],cell,'cut'),
  make('chloroplasts','Chloroplasts','#719a65','Chloroplasts are labelled in the plant cell of Figure 8.3(a).',[1.4,-1.5,.15],cell,'cut'),
  make('plasmodesmata','Plasmodesmata','#b6986e','Plasmodesmata connect the cytoplasm of neighbouring cells through their cell walls.',[2.8,.8,-.2],source('bio-11-08',11,'8.3','8.5.2')),
  make('microtubule','Microtubule','#94b5a2','A microtubule is labelled in the cytoplasm of the plant cell in Figure 8.3(a).',[-1.85,.2,.1],cell,'cut'),
 ];
 const animal=[...common(false),
  make('centriole','Centriole','#c9aa64','Animal cells possess centrioles, which are absent in almost all plant cells.',[.15,.65,.2],cell,'cut'),
  make('microvilli','Microvilli','#d4ae83','Microvilli are labelled on the surface of the illustrated animal cell. The source is a diagram of this cell, not a claim that every animal cell has this shape.',[.5,2.55,.1]),
 ];
 const skull=source('bio-11-17',8,'17.6','17.3'),spine=source('bio-11-17',9,'17.7','17.3'),ribs=source('bio-11-17',9,'17.8','17.3'),arm=source('bio-11-17',10,'17.9','17.3'),leg=source('bio-11-17',10,'17.10','17.3'),joint=source('bio-11-17',11,'17.9-17.10','17.4');
 const bone=(id:string,label:string,text:string,p:Vec3,ref:SourceRef,color='#d9c9a5')=>make(id,label,color,text,p.map(x=>x*.75) as Vec3,ref);
 const bones:Structure[]=[
  bone('skull','Skull (grouped)','The skull contains 8 cranial and 14 facial bones. This overview groups the skull rather than separating every cranial and facial bone.',[0,3.5,.3],skull),
  bone('mandible','Mandible','The mandible is labelled as the lower jaw bone in Figure 17.6.',[0,2.93,.45],skull),
  bone('hyoid','Hyoid','The hyoid is a single U-shaped bone at the base of the buccal cavity.',[0,2.7,.27],skull),
  bone('cervical','Cervical vertebrae','There are 7 cervical vertebrae. The first is the atlas and articulates with the occipital condyles.',[0,2.48,-.16],spine),
  bone('thoracic','Thoracic vertebrae','The thoracic region contains 12 vertebrae, which provide attachment for the ribs.',[0,1.38,-.28],spine),
  bone('lumbar','Lumbar vertebrae','The lumbar region contains 5 vertebrae.',[0,.15,-.1],spine),
  bone('sacrum','Sacrum','The adult sacral region is represented as one fused unit in the supplied text.',[0,-.45,-.17],spine),
  bone('coccyx','Coccyx','The coccygeal region is represented as one fused unit below the sacrum.',[0,-.83,-.05],spine),
  bone('sternum','Sternum','The sternum is a flat bone on the ventral midline of the thorax.',[0,1.5,.7],ribs),
  bone('true-ribs','True ribs (pairs 1-7)','The first 7 pairs attach dorsally to thoracic vertebrae and ventrally to the sternum through hyaline cartilage.',[.68,1.7,.5],ribs),
  bone('false-ribs','False ribs (pairs 8-10)','Pairs 8, 9 and 10 do not attach directly to the sternum; they join the seventh rib through hyaline cartilage.',[.91,.85,.43],ribs),
  bone('floating-ribs','Floating ribs (pairs 11-12)','The final 2 pairs are not connected ventrally.',[.65,.5,-.1],ribs),
  bone('clavicle','Clavicle','Each half of the pectoral girdle contains a clavicle and a scapula. The clavicle is a slender bone with two curvatures.',[.65,2.16,.32],arm),
  bone('scapula','Scapula','The scapula is a large triangular flat bone on the dorsal thorax. Its glenoid cavity articulates with the humeral head.',[.77,1.8,-.35],arm),
  bone('humerus','Humerus','The humerus is the upper-arm bone shown in Figure 17.9.',[1.22,1.4,0],arm),
  bone('radius','Radius','The radius is one of the two forearm bones labelled in Figure 17.9.',[1.53,.12,.07],arm),
  bone('ulna','Ulna','The ulna is the other forearm bone labelled in Figure 17.9.',[1.36,.12,.01],arm),
  bone('carpals','Carpals','Each wrist contains 8 carpals.',[1.61,-.65,.03],arm),
  bone('metacarpals','Metacarpals','Each palm contains 5 metacarpals.',[1.68,-.94,.04],arm),
  bone('hand-phalanges','Hand phalanges','Each hand has 14 phalanges.',[1.7,-1.4,.06],arm),
  bone('coxal','Coxal bones','The pelvic girdle consists of two coxal bones. Each forms from fusion of the ilium, ischium and pubis; the acetabulum articulates with the femur.',[.57,-.35,.12],leg),
  bone('femur','Femur','The femur is the thigh bone and is the longest bone.',[.48,-1.5,.05],leg),
  bone('patella','Patella','The cup-shaped patella covers the knee ventrally.',[.4,-2.25,.24],leg),
  bone('tibia','Tibia','The tibia is labelled in the lower leg in Figure 17.10.',[.38,-2.95,.05],leg),
  bone('fibula','Fibula','The fibula is the slender bone alongside the tibia in Figure 17.10.',[.59,-2.95,0],leg),
  bone('tarsals','Tarsals','Each ankle contains 7 tarsals.',[.43,-3.75,.13],leg),
  bone('metatarsals','Metatarsals','Each foot contains 5 metatarsals.',[.43,-3.87,.45],leg),
  bone('foot-phalanges','Foot phalanges','Each foot has 14 phalanges.',[.43,-3.9,.8],leg),
  bone('shoulder-joint','Shoulder: ball and socket','The joint between humerus and pectoral girdle is a ball-and-socket joint. Joint markers identify the example; they do not simulate measured ranges of movement.',[1.16,2.05,.03],joint,'#91ada5'),
  bone('knee-joint','Knee: hinge joint','The knee is NCERT\'s example of a hinge joint. Synovial joints have a fluid-filled cavity between the articulating surfaces.',[.4,-2.25,.05],joint,'#91ada5'),
 ];
 const sarco=source('bio-11-17',4,'17.2','17.2'),slide=source('bio-11-17',7,'17.5','17.2.2');
 const filaments=[
  make('z-lines','Z lines','#8a7599','Thin filaments attach to the Z lines. The region between successive Z lines is a sarcomere.',[-2.7,0,0],sarco),
  make('thin','Thin (actin) filaments','#c77b70','Thin filaments slide towards the centre during contraction; the filaments themselves do not shorten.',[-1.7,.6,.3],slide),
  make('thick','Thick (myosin) filaments','#7799b4','The thick filaments form the A band. Its length remains unchanged during contraction.',[0,0,.3],sarco),
  make('m-line','M line','#aa9a7b','The M line holds thick filaments together in the middle of the A band.',[0,.5,0],sarco),
  make('a-band','A band','#8ca6bb','The A band retains its length while thin filaments move inward.',[0,-.95,-.65],slide),
  make('i-band','I bands','#dec17c','The I bands become shorter as thin filaments slide over thick filaments.',[-2,-.95,-.65],slide),
  make('h-zone','H zone','#b7a2c2','The H zone is the central region of thick filament not overlapped by thin filaments. It narrows during contraction.',[0,-1.12,-.65],sarco),
 ];
 return [
  {id:'plant-cell',title:'Inside a plant cell',subtitle:'Every labelled structure of Figure 8.3(a).',source:cell,relatedPages:[7,8],structures:plant,guides:guides(plant),camera:[.8,1.1,12],cutaway:true,scope:'Sectional interpretation of the supplied plant-cell diagram. Organelle number, positions, colours and depth are illustrative. Wall, plastids and large central vacuole distinguish this view from the animal cell; no transport or metabolic process is invented.'},
  {id:'animal-cell',title:'Inside an animal cell',subtitle:'Explore Figure 8.3(b), including centrioles and surface microvilli.',source:cell,relatedPages:[7,8],structures:animal,guides:guides(animal),camera:[.7,.7,12],cutaway:true,scope:'Sectional interpretation of the particular animal cell shown in Figure 8.3(b). Shape, microvilli and organelle counts are illustrative, not universal features of all animal cells. No cell wall, chloroplast or large plant-type central vacuole is added.'},
  {id:'skeleton',title:'The human skeletal framework',subtitle:'Axial and appendicular skeleton from Figures 17.6-17.10.',source:skull,relatedPages:[8,9,10,11],structures:bones,guides:guides(bones),camera:[.2,.1,11.5],scope:'An original overview assembled from the supplied skull, spine, rib-cage and limb figures. Cranial/facial bones are grouped; ear ossicles are described in the source but not individually modelled. This is not a 206-part dissection atlas. Bone proportions and joint markers are illustrative; no extra clinical landmarks or joint-angle simulation.'},
  {id:'sarcomere',title:'Sarcomere: sliding filaments',subtitle:'See the Z lines approach while the A band stays the same length.',source:sarco,relatedPages:[4,5,6,7],structures:filaments,camera:[2.7,2,7.5],process:'Sliding-filament theory',guides:[
   {title:'Relaxed sarcomere',description:'Thin and thick filaments partially overlap. Z lines mark the ends of the sarcomere.',parts:['z-lines','thin','thick'],source:sarco},
   {title:'Thin filaments slide inward',description:'Thin filaments move towards the centre, bringing the Z lines closer together. Filament lengths remain unchanged.',parts:['thin','z-lines'],source:slide},
   {title:'Contracted sarcomere',description:'I bands and the H zone are reduced. The A band retains its length.',parts:['a-band','i-band','h-zone'],source:slide},
   {title:'Return to the relaxed state',description:'NCERT describes return of the Z lines to their original positions during relaxation.',parts:['z-lines','thin'],source:slide},
  ],scope:'Qualitative 3D extension of Figures 17.2 and 17.5. Coloured strips mark optical regions, not additional physical structures. Filament numbers, spacing and playback timing are illustrative. Cross-bridge/ATP chemistry is not simulated.'},
 ];
}
