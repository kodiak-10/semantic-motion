import fs from 'node:fs';
import path from 'node:path';
const assets=new Set(['light-source','rocky-sphere','ocean-sphere','parcel-cutaway','market','milk','bread','apple','bag-back','bag-front','coin','wallet','receipt','house','bus','clock','price-tag','paper-desk','parcel','envelope','decision-dial','probability-column','review-lens','document-scroll','route-switch','inbox','inbox-front']);
export function validateFlat(f){
 if(!['studio','ink','midnight','tech','tech-light'].includes(f.style_profile))throw Error('Unsupported style profile');
 if(f.mode!=='flat2d'||f.width!==1920||f.height!==1080||![30,60].includes(f.fps)||!Number.isFinite(f.duration)||f.duration<=0)throw Error('Expected 16:9 1080p flat2d plan');
 if(f.timeMap){
  if(!Number.isFinite(f.sourceDuration)||f.sourceDuration<=0||f.timeMap.length<2)throw Error('Audio timeline needs authored duration and anchors');
  let source=-1,target=-1;
  for(const a of f.timeMap){if(!Number.isFinite(a.source)||!Number.isFinite(a.target)||a.source<=source||a.target<=target)throw Error('Audio timeline must increase strictly');source=a.source;target=a.target;}
  if(f.timeMap[0].source!==0||f.timeMap[0].target!==0||source!==f.sourceDuration||Math.abs(target-f.duration)>1e-8)throw Error('Audio timeline endpoints must match film');
 }else if(f.sourceDuration!==undefined)throw Error('Source duration requires an audio timeline');
 if(f.audio){
  const root=path.resolve('public'),file=path.resolve(root,f.audio);
  if(!file.startsWith(root+path.sep)||!['.mp3','.wav','.m4a'].includes(path.extname(file).toLowerCase())||!fs.existsSync(file))throw Error('Audio requires an existing local public file');
 }
 let end=0,nodes=0;
 for(const s of f.shots){
  if(s.start!==end||s.end<=s.start)throw Error('Shots must cover the timeline without gaps or overlaps');end=s.end;
  const ids=new Set();
  for(const n of s.nodes){
   nodes++;if(ids.has(n.id))throw Error('Duplicate node identity');ids.add(n.id);
   if(!['solid','image','asset','text','rect','surface','path','dots'].includes(n.kind)||n.kind==='asset'&&!assets.has(n.asset))throw Error('Unsupported illustration asset');
   if(['image','rect','surface'].includes(n.kind)&&(!Number.isFinite(n.width)||!Number.isFinite(n.height)||n.width<=0||n.height<=0))throw Error('Invalid surface size');
   if(n.kind==='solid'){
    if(!['box','sphere'].includes(n.geometry)||![n.width,n.height,n.depth].every(v=>Number.isFinite(v)&&v>0)||!/^#[0-9a-fA-F]{6}$/.test(n.color||''))throw Error('3D solid requires geometry, positive dimensions and hex color');
    const camera=n.cameraDistance??1600;
    if(!Number.isFinite(camera)||camera<=Math.hypot(n.width,n.height,n.depth)/2+1)throw Error('3D camera must stay outside the bounding sphere');
   }
   if(n.kind==='image'){
    const root=path.resolve('public');const file=path.resolve(root,n.src||'');
    if(!n.src||!file.startsWith(root+path.sep)||!['.png','.jpg','.jpeg','.webp'].includes(path.extname(file).toLowerCase())||!fs.existsSync(file))throw Error('Image requires an existing local public raster asset');
   }
   if(n.kind==='path'&&(!n.path||!Array.isArray(n.bounds)||n.bounds.length!==4||n.bounds.some(v=>!Number.isFinite(v))))throw Error('Path requires explicit artwork bounds');
   if(n.printedOn&&n.kind!=='text')throw Error('Only text may bind to a print surface');
   if(n.printedOn&&!s.nodes.some(x=>x.id===n.printedOn&&x.kind==='surface'))throw Error('Printing requires an actual surface');
   if(n.kind==='dots'){
    if(!Array.isArray(n.states)||!n.states.length||n.states[0].t!==0)throw Error('Dot states need initial time');
    const count=n.states[0].points.length;let previous=-1;if(!count||count>5000)throw Error('Invalid dot count');
    for(const state of n.states){if(!Number.isFinite(state.t)||state.t<=previous||state.t>s.end-s.start)throw Error('Invalid dot state time');previous=state.t;
     if(state.points.length!==count)throw Error('Dot identities must persist');
     for(const d of state.points)if(![d.x,d.y,d.r].every(Number.isFinite)||d.r<=0||!/^#[a-fA-F0-9]{6}$/.test(d.color))throw Error('Invalid dot geometry or color');
    }
   }
   if(!n.keys.length||n.keys[0].t!==0)throw Error('Each node needs an initial pose');
   let last=-1;for(const k of n.keys){if(k.t<last||k.t>s.end-s.start)throw Error('Unordered or out-of-shot keyframe');last=k.t;for(const v of Object.values(k))if(!Number.isFinite(v))throw Error('Non-finite keyframe');}
  }
 }
 if(end!==(f.sourceDuration??f.duration))throw Error('Incomplete shot timeline');
 end=0;for(const c of f.captions){if(c.start<end||c.end<=c.start||c.end>f.duration||c.text.length>42)throw Error('Invalid or overly long semantic caption');if(c.keyword&&!c.text.includes(c.keyword))throw Error('Unknown caption keyword');end=c.end;}
 return {passed:true,shots:f.shots.length,nodes,captions:f.captions.length,audio_aligned:!!f.timeMap};
}
if(process.argv[1]?.endsWith('validate.mjs'))console.log(JSON.stringify(validateFlat(JSON.parse(fs.readFileSync(process.argv[2])))));
