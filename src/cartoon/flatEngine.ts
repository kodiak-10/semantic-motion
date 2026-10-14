export type Pose={t:number;rx?:number;ry?:number;rz?:number;x?:number;y?:number;scale?:number;rotation?:number;opacity?:number;v?:number};
export type FlatNode={id:string;kind:'solid'|'image'|'asset'|'text'|'rect'|'surface'|'path'|'dots';geometry?:'box'|'sphere';depth?:number;cameraDistance?:number;asset?:string;src?:string;text?:string;color?:string;size?:number;width?:number;height?:number;align?:'start'|'middle'|'end';keys:Pose[];prefix?:string;suffix?:string;decimals?:number;percentageGroup?:string;printedOn?:string;path?:string;bounds?:[number,number,number,number];strokeWidth?:number;fill?:string;radius?:number;states?:DotState[]};
export type FlatFilmData={mode:'flat2d';topic:string;duration:number;fps:number;width:number;height:number;audio?:string;sourceDuration?:number;timeMap?:{source:number;target:number}[];style_profile?:'paper'|'ink'|'studio'|'midnight'|'tech'|'tech-light';footer?:string;reviewOverlay?:boolean;series:string;shots:{id:string;start:number;end:number;label:string;nodes:FlatNode[];contacts?:{pair:[string,string];start:number;end:number;reason:string}[];visualEvidence?:{trigger:string;change:string;result:string;nodes:string[]}}[];captions:{start:number;end:number;text:string;keyword?:string}[]};
export function samplePose(keys:Pose[],t:number){
 const result={rx:0,ry:0,rz:0,x:0,y:0,scale:1,rotation:0,opacity:1,v:1};
 for(const prop of Object.keys(result) as (keyof typeof result)[]){
  const list=keys.filter(k=>k[prop]!==undefined);if(!list.length)continue;
  const before=[...list].reverse().find(k=>k.t<=t)||list[0];const after=list.find(k=>k.t>t)||before;
  let u=after.t===before.t?0:Math.max(0,Math.min(1,(t-before.t)/(after.t-before.t)));u=u*u*(3-2*u);
  result[prop]=before[prop]!+(after[prop]!-before[prop]!)*u;
 }
 return result;
}

// Preserve a total of 100 in rounded percentage labels. Geometry uses raw values.
export function displayText(node:FlatNode,p:ReturnType<typeof samplePose>,nodes:FlatNode[],time:number){
 if(node.text!==undefined)return node.text;
 let value=p.v;
 if(node.percentageGroup){
  const group=nodes.filter(n=>n.percentageGroup===node.percentageGroup).map((n,i)=>({id:n.id,i,v:samplePose(n.keys,time).v}));
  if(group.some(n=>n.v<0||!Number.isFinite(n.v))||Math.abs(group.reduce((s,n)=>s+n.v,0)-100)>1e-6)throw Error('Percentage group must sum to 100');
  const missing=100-group.reduce((s,n)=>s+Math.floor(n.v),0);
  const extra=new Set([...group].sort((a,b)=>(b.v-Math.floor(b.v))-(a.v-Math.floor(a.v))||a.i-b.i).slice(0,missing).map(n=>n.id));
  value=Math.floor(p.v)+(extra.has(node.id)?1:0);
 }
 return `${node.prefix||''}${value.toFixed(node.decimals||0)}${node.suffix||''}`;
}

export type Dot={x:number;y:number;r:number;color:string};
export type DotState={t:number;points:Dot[]};
const smooth=(u:number)=>u*u*u*(u*(u*6-15)+10);
// Persistent index identity; evaluate from time only, so backward seeks are deterministic.
export function sampleDots(states:DotState[],t:number):Dot[]{
 const a=[...states].reverse().find(s=>s.t<=t)||states[0];
 const b=states.find(s=>s.t>t)||a;
 const u=b===a?0:smooth(Math.max(0,Math.min(1,(t-a.t)/(b.t-a.t))));
 return a.points.map((v,i)=>{const w=b.points[i];return {x:v.x+(w.x-v.x)*u,y:v.y+(w.y-v.y)*u,r:v.r+(w.r-v.r)*u,color:mixColor(v.color,w.color,u)};});
}
function mixColor(a:string,b:string,u:number){
 const c=[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-u)+parseInt(b.slice(i,i+2),16)*u));
 return '#'+c.map(n=>n.toString(16).padStart(2,'0')).join('');
}
export function dotBounds(points:Dot[]):[number,number,number,number]{return [Math.min(...points.map(p=>p.x-p.r)),Math.min(...points.map(p=>p.y-p.r)),Math.max(...points.map(p=>p.x+p.r)),Math.max(...points.map(p=>p.y+p.r))];}

// Printed text is local to its declared surface, including rotation and visibility.
export function sampleNodePose(node:FlatNode,nodes:FlatNode[],t:number){
 const p=samplePose(node.keys,t);if(!node.printedOn)return p;
 const parent=nodes.find(n=>n.id===node.printedOn);if(!parent||parent.kind!=='surface')throw Error('Missing print surface');
 const a=samplePose(parent.keys,t),r=a.rotation*Math.PI/180;
 return {...p,x:a.x+a.scale*(p.x*Math.cos(r)-p.y*Math.sin(r)),y:a.y+a.scale*(p.x*Math.sin(r)+p.y*Math.cos(r)),scale:p.scale*a.scale,rotation:p.rotation+a.rotation,opacity:p.opacity*a.opacity};
}

// Map real audio time back into authored animation time without altering motion curves.
export function sampleFilmTime(f:FlatFilmData,time:number){
 if(!f.timeMap)return time;
 const m=f.timeMap;if(time<=m[0].target)return m[0].source;
 const i=m.findIndex(p=>p.target>time);if(i<0)return m[m.length-1].source;
 const a=m[i-1],b=m[i],u=(time-a.target)/(b.target-a.target);
 return a.source+(b.source-a.source)*u;
}
