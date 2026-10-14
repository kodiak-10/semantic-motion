import React from 'react';
import {illuminatedPath} from './phaseGeometry';
// Reusable illustrated spherical surface, not a photographic or astronomical map.
export function LitSphere({angle=0,ocean=false}:{angle?:number;ocean?:boolean}){
 const id='sphere'+React.useId().replaceAll(':','');
 return <g><defs>
 <radialGradient id={id+'body'} cx="34%" cy="27%" r="80%"><stop stopColor={ocean?'#b5d7ff':'#f1f4ff'}/><stop offset=".52" stopColor={ocean?'#4277e2':'#a3adc5'}/><stop offset="1" stopColor={ocean?'#172c66':'#4c5973'}/></radialGradient>
 <radialGradient id={id+'crater'} cx="38%" cy="28%"><stop stopColor="#41454a"/><stop offset=".75" stopColor="#7d7d7b"/><stop offset="1" stopColor="#d4cdbd"/></radialGradient>
 <clipPath id={id+'disk'}><circle r="200"/></clipPath>
 <clipPath id={id+'lit'}><path d={illuminatedPath(angle)}/></clipPath>
 </defs>
 <circle r="200" fill="#111b35"/>
 <g clipPath={`url(#${id}lit)`}><circle r="200" fill={`url(#${id}body)`}/><g clipPath={`url(#${id}disk)`}>
 {ocean?<g fill="#a6c6ff" opacity=".85"><path d="M-182-81L-143-146-97-163-53-130-68-82-31-43-70-3-132-19Z"/><path d="M-65 9L-14 34-16 88-54 154-80 91-96 40Z"/><path d="M22-132L83-160 158-115 179-69 113-47 80-66 57-26 14-44Z"/><path d="M21-21L90 5 107 54 65 108 18 76-5 28Z"/><path d="M109 118L173 104 187 147 134 168Z"/></g>:<g><path d="M-145-60Q-175-115-95-145Q-44-128-50-80Q10-72-8-18Q-48 10-81-20Q-136 8-145-60ZM18-105Q55-155 110-98Q151-62 98-28Q52-6 24-47Z" fill="#394869" opacity=".22"/>{Array.from({length:90},(_,i)=>{const a=i*2.39996,rr=Math.sqrt((i+.5)/90)*183,x=Math.cos(a)*rr,y=Math.sin(a)*rr,s=3+(i*13%9);return <g key={i} transform={`translate(${x} ${y})`}><ellipse rx={s} ry={s*.76} fill={`url(#${id}crater)`} opacity=".25"/><path d={`M${-s} 0Q0 ${s*1.15} ${s} 0`} stroke="#f3e5cb" opacity=".2" strokeWidth="1" fill="none"/></g>;})}</g>}
 </g></g><circle r="200" fill="none" stroke={ocean?'#b5e8ed':'#e7dfca'} strokeOpacity=".18" strokeWidth="1.5"/>
 </g>;
}
