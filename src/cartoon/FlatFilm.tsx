import React from 'react';
import {Solid3D} from './SolidView';
import {AbsoluteFill,Audio,Img,staticFile,useCurrentFrame} from 'remotion';
import {FontGate} from '../components/FontGate';
import {FlatArt} from './flatArt';
import {sampleNodePose,sampleFilmTime,displayText,sampleDots,type FlatFilmData} from './flatEngine';
export type {FlatFilmData} from './flatEngine';
export function FlatFilm({film}:{film:FlatFilmData}){
 const studio=film.style_profile==='studio';
 const textColor=(color?:string)=>studio?({'#f6f0e2':'#243238','#79c8c1':'#16786f','#de987d':'#ad5438','#70baff':'#245faa','#b4bcc6':'#596675'}[color||'']||color||'#243238'):(color||'#243c3a');
 const paper=film.style_profile==='paper';const ink=film.style_profile==='ink';
 const playback=useCurrentFrame()/film.fps;const t=sampleFilmTime(film,playback);const shot=film.shots.find(s=>t>=s.start&&t<s.end)!;const local=t-shot.start;
 const cap=film.captions.find(c=>playback>=c.start&&playback<c.end);const pieces=cap?.keyword?cap.text.split(cap.keyword):[];
 return <AbsoluteFill style={{background:studio?'#f3f1eb':ink?'#10282e':'#f5e9cf',fontFamily:'Semantic Noto, sans-serif'}}><FontGate/>
 {ink&&<AbsoluteFill style={{background:'radial-gradient(ellipse at 64% 45%, #24505a 0%, #132d34 42%, #0c1d24 100%)'}}/>}
 {studio&&<AbsoluteFill style={{pointerEvents:'none'}}>
  <div style={{position:'absolute',inset:'145px 64px 145px',backgroundImage:'radial-gradient(#bdc4bf 1px, transparent 1px)',backgroundSize:'40px 40px',opacity:.23}}/>
  <div style={{position:'absolute',left:80,right:80,top:82,height:1,background:'#d6dcd5'}}/>
  <div style={{position:'absolute',left:80,top:45,width:28,height:7,borderRadius:4,background:'#18796f'}}/>
  <div style={{position:'absolute',left:126,top:32,fontSize:24,letterSpacing:3,color:'#4b605b',fontWeight:650}}>知识图解</div>
  <div style={{position:'absolute',right:80,top:33,display:'flex',gap:9,alignItems:'center'}}>{film.shots.map((s,i)=><span key={s.id} style={{display:'block',width:s.id===shot.id?46:16,height:6,borderRadius:4,background:s.id===shot.id?'#18796f':'#d3d9d2'}}/>)}</div>
  <div style={{position:'absolute',left:80,right:80,bottom:144,height:1,background:'#d6dcd5'}}/>
 </AbsoluteFill>}
 <svg style={{position:'absolute',inset:0}} viewBox="0 0 1920 1080" width="1920" height="1080">
 <defs><filter id="surface-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#000" floodOpacity={studio?".08":".22"}/></filter></defs>
 {shot.nodes.map(node=>{const p=sampleNodePose(node,shot.nodes,local);return <g key={node.id} opacity={p.opacity} transform={`translate(${p.x} ${p.y}) rotate(${p.rotation}) scale(${p.scale})`}>
 {node.kind==='solid'?<Solid3D node={node} pose={p}/>:node.kind==='image'?<foreignObject width={node.width} height={node.height}><Img src={staticFile(node.src!)} style={{width:'100%',height:'100%',objectFit:'contain'}}/></foreignObject>:node.kind==='asset'?<FlatArt name={node.asset!} v={p.v} t={t}/>:node.kind==='rect'?<rect width={node.width} height={node.height} fill={node.color}/>:
 node.kind==='surface'?<g filter="url(#surface-shadow)"><rect width={node.width} height={node.height} rx={node.radius??16} fill={studio&&node.color==='#f6f0e2'?'#fffefa':node.color||'#f6f0e2'}/><path d={`M0 0H${node.width}V12H0Z`} fill={node.fill||'#c45d43'}/></g>:
 node.kind==='path'?<path d={node.path} fill={node.fill||'none'} stroke={studio?textColor(node.color):node.color} strokeWidth={node.strokeWidth||2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1-p.v}/>:
 node.kind==='dots'?<g>{sampleDots(node.states!,local).map((d,i)=><circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.color} stroke={studio?'#788780':undefined} strokeWidth={studio?.65:0}/>)}</g>:<text x="0" y="0" textAnchor={node.align||'middle'} fill={textColor(node.color)} fontSize={node.size||44} fontWeight="750">{displayText(node,p,shot.nodes,local)}</text>}
 </g>})}
 </svg>
 {!ink&&!studio&&<div style={{position:'absolute',top:29,left:80,color:paper?'#393c39':'#fffae9',fontSize:25,fontWeight:650,letterSpacing:2}}>{film.series}</div>}
 {!ink&&!studio&&<div style={{position:'absolute',top:29,right:80,color:paper?'#393c39':'#fffae9',fontSize:24}}>{shot.label}</div>}
 {cap&&<div style={{position:'absolute',left:180,right:180,bottom:44,textAlign:'center',fontSize:36,fontWeight:600,lineHeight:1.5,color:studio?'#243238':paper?'#393c39':'#fff9e9'}}><span style={{display:'inline-block',background:studio?'#fffefa':paper?'rgba(245,235,212,.94)':ink?'rgba(10,26,32,.88)':'#243c3a',padding:'16px 32px',borderRadius:studio?8:14,border:studio?'1px solid #dce1d9':undefined,boxShadow:studio?'0 5px 18px rgba(36,50,56,.04)':undefined}}>{pieces.length>1?pieces.map((p,i)=><React.Fragment key={i}>{i>0&&<strong style={{color:studio?'#16786f':paper?'#92523a':'#f5cd75'}}>{cap.keyword}</strong>}{p}</React.Fragment>):cap.text}</span></div>}
 {film.reviewOverlay===true&&film.footer&&<div style={{position:'absolute',left:80,bottom:14,fontSize:18,color:ink?'#9cb3b8':'#393c39'}}>{film.footer}</div>}
 {film.audio&&<Audio src={staticFile(film.audio)}/>}
 </AbsoluteFill>;
}
