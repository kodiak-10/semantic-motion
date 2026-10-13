import React from 'react';
import {ParcelCutaway} from './ParcelCutaway';
import {OfficeArt,officeAssets} from './officeArt';
const ink='#243c3a';
export const flatAssets=['market','milk','bread','apple','bag-back','bag-front','coin','wallet','receipt','house','bus','clock','price-tag'] as const;
export function FlatArt({name,v=1,t=0}:{name:string;v?:number;t?:number}){
 const paperId='paper'+React.useId().replaceAll(':','');
 const stroke={stroke:ink,strokeWidth:6,strokeLinejoin:'round' as const,strokeLinecap:'round' as const};
 if((officeAssets as readonly string[]).includes(name))return <OfficeArt name={name} v={v} t={t}/>;
 if(name==='parcel-cutaway')return <ParcelCutaway v={v}/>;
 switch(name){
 case 'market':return <g><rect width="1920" height="1080" fill="#f5e9cf"/><path d="M0 765H1920V1080H0Z" fill="#dccbaa"/><path d="M0 807H1920M0 976H1920M200 765L65 1080M700 765L670 1080M1200 765L1280 1080M1700 765L1850 1080" stroke="#c8b68f" strokeWidth="3"/>
 <rect x="118" y="137" width="450" height="477" rx="110" fill="#3a7873"/><rect x="137" y="155" width="413" height="438" rx="94" fill="#abd7d0"/>
 <g transform={`translate(${Math.sin(t*.18)*25} 0)`} fill="#fff9e9"><path d="M162 282q-12-46 34-43q14-43 49-15q41-12 45 34q50 30-2 46H166Z"/><path d="M363 445q-12-46 34-43q14-43 49-15q41-12 45 34q50 30-2 46H367Z"/></g>
 <path d="M344 156V594M135 388H550" stroke="#3a7873" strokeWidth="16"/>
 <rect x="0" y="0" width="1920" height="98" fill="#326960"/>{Array.from({length:16},(_,i)=><path key={i} d={`M${i*120} 70h120v64q-60 47-120 0Z`} fill={i%2?'#f5e9cf':'#de7759'}/>)}
 <path d="M0 710H1920V784H0Z" fill="#c78653"/><path d="M0 705H1920" stroke={ink} strokeWidth="9"/><g opacity=".16"><rect x="1170" y="181" width="614" height="386" rx="13" fill="#31625d"/>
 <path d="M1230 518H1725M1230 330H1725" stroke="#dbb881" strokeWidth="14"/>{Array.from({length:10},(_,i)=><g key={i} transform={`translate(${1250+i%5*96} ${i<5?248:436})`}><rect width="53" height="66" rx="9" fill={['#edb464','#f1e8c9','#cf7664'][i%3]}/><rect x="-3" y="-12" width="59" height="17" rx="4" fill="#e4d8b2"/><rect x="13" y="21" width="28" height="20" rx="2" fill="#3c6e64"/></g>)}
 </g><path d="M49 681Q6 577 64 526Q91 564 54 610Q99 568 115 610Q109 669 65 681" fill="#547c52" stroke={ink} strokeWidth="4"/><path d="M24 662H106L90 710H40Z" fill="#d77957"/></g>;
 case 'milk':return <g {...stroke}><path d="M-66-200H45L74-166V0H-66Z" fill="#fff8df"/><path d="M-66-200L-43-236H23L45-200Z" fill="#61a8a4"/><path d="M45-200L74-166V0H45Z" fill="#a7cec1"/><path d="M-66-153H45V-32H-66Z" fill="#4d9490" stroke="none"/><path d="M-4-133Q-51-75-4-64Q43-75-4-133Z" fill="#ffefb8" stroke="none"/><path d="M-43-236H23" strokeWidth="10"/></g>;
 case 'bread':return <g {...stroke}><path d="M-102 0V-114Q-132-154-91-183Q-67-219-27-198Q13-226 49-196Q99-203 103-157V0Z" fill="#e9ab5f"/><path d="M-72-15V-102Q-83-142-61-147Q-45-177-18-158Q8-183 34-162Q69-162 71-126V-15Z" fill="#f5d696" stroke="none"/><path d="M-48-123L-29-81M-1-128L18-86M42-122L54-88" stroke="#c88e4c" strokeWidth="9"/></g>;
 case 'apple':return <g {...stroke}><path d="M0-121C-70-166-113-98-88-35Q-67 23-8-4Q58 28 90-39C117-111 55-150 0-121Z" fill="#d96954"/><path d="M-2-122Q-7-155 17-169" fill="none"/><path d="M5-146Q44-178 69-150Q44-126 5-146Z" fill="#69985b"/><path d="M-61-91Q-80-67-65-43" stroke="#f8b994" strokeWidth="12" fill="none"/></g>;
 case 'bag-back':return <g {...stroke}><path d="M-145-176Q-142-300 0-301Q142-300 145-176" fill="none" stroke="#c99555" strokeWidth="20"/><path d="M-205-189H205L174 32H-174Z" fill="#bc8a4d"/><ellipse cy="-185" rx="205" ry="29" fill="#624c35"/></g>;
 case 'bag-front':return <g {...stroke}><path d="M-205-176Q0-142 205-176L174 32Q0 52-174 32Z" fill="#e7b977"/><path d="M-139-133Q-136-25 0-25Q136-25 139-133" stroke="#9c6b38" strokeWidth="17" fill="none"/><path d="M-168-125L-149-7" stroke="#f8d79e" strokeWidth="12"/></g>;
 case 'coin':return <g {...stroke}><circle r="46" fill="#e9b54d"/><circle r="33" fill="none" stroke="#b78334" strokeWidth="4"/><path d="M-13-18L0-4L13-18M0-3V20M-15 3H15M-15 12H15" fill="none" strokeWidth="4"/></g>;
 case 'wallet':return <g {...stroke}><path d="M-190-95H163V48H-190Z" fill="#8d5143"/><g transform={`rotate(${-v*36} -190 -95)`}><path d="M-190-95H153V-199H-160Q-190-192-190-160Z" fill="#b67558"/><path d="M-165-168H124" stroke="#e8b391" strokeWidth="3"/></g><path d="M-190-75H165V50H-190Z" fill="#b67558"/><path d="M93-54H179V5H93Z" fill="#e1a76e"/><circle cx="140" cy="-25" r="9" fill={ink}/></g>;
 case 'receipt':return <g {...stroke}><path d={`M-168-320H168V${-310+Math.max(0,v)*420}l-24-13-24 13-24-13-24 13-24-13-24 13-24-13-24 13-24-13-24 13-24-13-24 13-24-13-24 13Z`} fill="#fffaf0"/><defs><clipPath id={paperId}><rect x="-168" y="-320" width="336" height={Math.max(0,v)*420}/></clipPath></defs><path clipPath={`url(#${paperId})`} d="M-115-271H115" stroke="#d6cab6" strokeWidth="9"/></g>;
 case 'house':return <g {...stroke}><path d="M-115-130L0-235L115-130" fill="#cf6d53"/><path d="M-91-137H91V0H-91Z" fill="#f3dbab"/><rect x="-20" y="-73" width="48" height="73" fill="#4e8c85"/><path d="M-69-109H-41V-76H-69ZM45-109H72V-76H45Z" fill="#83b6ae"/></g>;
 case 'bus':return <g {...stroke}><rect x="-145" y="-150" width="290" height="122" rx="24" fill="#e0a444"/>{[-95,-30,35,100].map(x=><rect key={x} x={x-23} y="-132" width="45" height="57" rx="7" fill="#acd1c9"/>)}<circle cx="-88" cy="-23" r="26" fill={ink}/><circle cx="87" cy="-23" r="26" fill={ink}/><path d="M-132-60H133" stroke="#f8cf78"/></g>;
 case 'clock':return <g {...stroke}><circle r="90" fill="#fff7df"/>{Array.from({length:12},(_,i)=><path key={i} d="M0-72V-62" transform={`rotate(${i*30})`}/>)}<path d="M0 0V-47" transform={`rotate(${v*360})`}/><path d="M0 0L30 15"/><circle r="7" fill={ink}/></g>;
 case 'price-tag':return <g {...stroke}><path d="M-120-68H120V68H-120Z" fill="#fff3cf"/><path d="M-100-83H100" stroke="#d37855" strokeWidth="13"/></g>;
 default:throw Error(`Unknown illustration asset: ${name}`);
 }
}
