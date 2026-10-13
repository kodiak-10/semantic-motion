import {projectSolid} from '../../src/cartoon/solid3d.ts';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {assetBounds,transformBounds,intersects} from './geometry.mjs';
import {sampleNodePose,sampleFilmTime,sampleDots,dotBounds} from '../../src/cartoon/flatEngine.ts';
export function objectAudit(f){
 const failures=[];
 for(const s of f.shots){
  const ids=new Set(s.nodes.filter(n=>n.kind!=='text').map(n=>n.id));
  for(const c of s.contacts||[]){if(!Array.isArray(c.pair)||c.pair.length!==2||c.pair[0]===c.pair[1]||c.pair.some(x=>!ids.has(x))||!c.reason?.trim()||!Number.isFinite(c.start)||!Number.isFinite(c.end)||c.start<0||c.end<=c.start||c.end>s.end-s.start+1e-8)throw Error('无效接触声明：'+s.id);}
 }
 for(let frame=0;frame<Math.round(f.duration*f.fps);frame++){
  const t=sampleFilmTime(f,frame/f.fps),s=f.shots.find(s=>t>=s.start&&t<s.end),local=t-s.start;
  const boxes=s.nodes.filter(n=>n.kind!=='text').flatMap(n=>{
   const p=sampleNodePose(n,s.nodes,local);if(p.opacity<=.03)return [];
   const b=n.kind==='solid'?projectSolid(n,p).bounds:['rect','surface','image'].includes(n.kind)?[0,0,n.width,n.height]:n.kind==='path'?n.bounds:n.kind==='dots'?dotBounds(sampleDots(n.states,local)):assetBounds(n.asset,p.v);
   return b?[{id:n.id,...transformBounds(b,p)}]:[];
  });
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
   const a=boxes[i],b=boxes[j];if(!intersects(a,b))continue;
   const contact=(s.contacts||[]).find(c=>c.pair.includes(a.id)&&c.pair.includes(b.id)&&local>=c.start&&local<=c.end);
   if(!contact)failures.push({frame,shot:s.id,a:a.id,b:b.id});
  }
 }
 return {passed:!failures.length,checkedFrames:Math.round(f.duration*f.fps),failureCount:failures.length,failures:[...new Map(failures.map(x=>[x.shot+'/'+x.a+'/'+x.b,x])).values()],method:'Conservative foreground bounds for every frame; intentional contact requires an explicit timed pair and reason. Not pixel-perfect geometry; declared contacts still need visual review.'};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const r=objectAudit(JSON.parse(fs.readFileSync(process.argv[2])));fs.writeFileSync(process.argv[3],JSON.stringify(r,null,2));console.log(JSON.stringify(r));if(!r.passed)process.exitCode=1;}
