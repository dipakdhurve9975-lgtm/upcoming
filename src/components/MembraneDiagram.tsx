import type {PartId} from '../content/types';
export default function MembraneDiagram({onSelect}:{onSelect?:(id:PartId)=>void}) {
 return <svg viewBox="0 0 640 320" role="img" aria-label="Schematic phospholipid bilayer. Two rows of polar heads face outward, tails inward; proteins, sugar and cholesterol are shown. Based on NCERT Figure 8.4." className="membrane-diagram">
 <defs><linearGradient id="lipid" x2="0" y2="1"><stop stopColor="#acd5dc"/><stop offset="1" stopColor="#5c9fad"/></linearGradient><linearGradient id="protein"><stop stopColor="#dfaa96"/><stop offset="1" stopColor="#b56760"/></linearGradient></defs>
 <g transform="translate(50 35)">{Array.from({length:25},(_,i)=>{const x=i*22;return <g key={i}><g stroke="#b6a17b" strokeWidth="4" fill="none"><path d={`M${x-3} 75q-7 18 0 32t-3 25 M${x+3} 75q8 18 0 32t4 25 M${x-3} 192q-7-18 0-32t-3-25 M${x+3} 192q8-18 0-32t4-25`}/></g><g fill="url(#lipid)" stroke="#e2f0f1" strokeWidth="1.5"><circle cx={x} cy="72" r="10"/><circle cx={x} cy="195" r="10"/></g></g>})}
 <path d="M157 58C137 45 122 65 129 94C133 117 122 133 131 163C124 188 139 220 164 218C197 217 204 194 197 166C189 143 205 123 193 97C189 70 179 53 157 58Z" fill="url(#protein)" stroke="#ab655e" onClick={()=>onSelect?.('integral')}/>
 <ellipse cx="379" cy="65" rx="36" ry="17" fill="#a18cb9" onClick={()=>onSelect?.('peripheral')}/>
 <g fill="#ddba68" stroke="#c6a04a" strokeWidth="3"><path d="M164 59l-5-24 15-12-9-16m-6 28-17-11" fill="none"/>{[[159,35],[174,23],[165,7],[142,24]].map(([x,y])=><circle key={x} cx={x} cy={y} r="5"/>)}</g>
 <g fill="#82a680"><rect x="285" y="90" width="9" height="36" rx="4"/><rect x="300" y="145" width="9" height="36" rx="4"/></g>
 </g><g fontSize="13" fill="currentColor" fontFamily="system-ui"><text x="48" y="82">Polar heads</text><text x="460" y="185">Tails inward</text><text x="162" y="290">Integral protein</text><text x="382" y="74">Peripheral protein</text><text x="206" y="22">Sugar</text><text x="325" y="293">Cholesterol</text></g><g stroke="currentColor" opacity=".45"><path d="M83 86v15M212 258v15M345 216v60M467 173h-35"/></g>
 </svg>;
}
