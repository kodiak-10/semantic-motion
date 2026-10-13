import React,{useId} from 'react';
// A reusable 2D cutaway prop. v controls the hinged opening, not topic logic.
export function ParcelCutaway({v}:{v:number}){
 const id='parcel'+useId().replaceAll(':','');const q=Math.max(0,Math.min(1,v));
 return <g>
 <defs><linearGradient id={id+'f'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e9c48d"/><stop offset="1" stopColor="#c49160"/></linearGradient><linearGradient id={id+'s'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#bd8757"/><stop offset="1" stopColor="#906442"/></linearGradient></defs>
 <ellipse cy="95" rx="203" ry="30" fill="#05171b" opacity=".38"/>
 <path d="M-175-185 L0-268 L181-185 L0-96Z" fill="#735238"/>
 <path d={`M-175 -185L0 -268L${-16-q*62} ${-270-q*93}L${-183-q*98} ${-188-q*64}Z`} fill="#d0a374"/>
 <path d={`M0 -268L181 -185L${190+q*88} ${-199-q*52}L${14+q*59} ${-277-q*83}Z`} fill="#e8c38c"/>
 <path d="M-175-185L0-96V91L-175 5Z" fill={`url(#${id+'f'})`}/>
 <path d="M0-96L181-185V5L0 91Z" fill={`url(#${id+'s'})`}/>
 <path d="M-163-170L-163-4L-14 72M13 71L169-4V-167" fill="none" stroke="#e7c99e" strokeOpacity=".28" strokeWidth="2"/>
 <path d="M-78-135L-51-122V65L-78 51Z" fill="#e8d4aa" opacity=".55"/>
 <g transform="matrix(1 .49 0 1 -144 -107)"><rect width="67" height="71" rx="3" fill="#f0e3c9"/><path d="M9 13H58M9 19H44" stroke="#948267" strokeWidth="3"/>{[0,1,2,3,4,5,6,7,8].map(i=><path key={i} d={`M${10+i*5.6} 30V59`} stroke="#4b4a3c" strokeWidth={i%3===0?3:1.3}/>)}</g>
 <path d="M65-36L77-65L89-48M77-64V-14M105-56L117-85L129-68M117-84V-34M57 0L139-40" fill="none" stroke="#e3c39a" strokeWidth="5"/>
 <path d={`M-175 -185L0 -96L${-q*55} ${-96+q*84}L${-175-q*85} ${-185+q*103}Z`} fill="#f0d3a3"/>
 <path d={`M0 -96L181 -185L${181+q*72} ${-185+q*96}L${q*57} ${-96+q*86}Z`} fill="#ddb782"/>
 </g>;
}
