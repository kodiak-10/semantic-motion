import {projectSolid} from '../../src/cartoon/solid3d.ts';
import {assetBounds,transformBounds,intersects,contains} from './geometry.mjs';
import fs from 'node:fs';import {openBrowser} from '@remotion/renderer';import {sampleNodePose,sampleFilmTime,displayText,sampleDots,dotBounds} from '../../src/cartoon/flatEngine.ts';import {validateFlat} from './validate.mjs';
const [input,output]=process.argv.slice(2);const f=JSON.parse(fs.readFileSync(input));validateFlat(f);
const requests=new Map();const key=(text,size,weight)=>JSON.stringify([text,size,weight]);const add=(text,size,weight)=>{const id=key(text,size,weight);requests.set(id,{id,text,size,weight});return id};
const textAt=displayText;
for(let frame=0;frame<f.duration*f.fps;frame++){const t=sampleFilmTime(f,frame/f.fps),s=f.shots.find(s=>t>=s.start&&t<s.end);for(const n of s.nodes.filter(n=>n.kind==='text')){const p=sampleNodePose(n,s.nodes,t-s.start);if(p.opacity>.03)add(textAt(n,p,s.nodes,t-s.start),n.size||44,750)}}
for(const c of f.captions){add(c.text,36,600);if(c.keyword){add(c.keyword,36,600);add(c.keyword,36,900)}}
const browser=await openBrowser('chrome',{browserExecutable:process.env.CHROME_EXECUTABLE});let metrics;
try{const page=await browser.newPage({context:{},logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
 await page.evaluate(async data=>{const font=new FontFace('Semantic Noto',`url(data:font/ttf;base64,${data})`,{weight:'100 900'});await font.load();document.fonts.add(font);document.body.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" id="svg"></svg>';},fs.readFileSync('public/fonts/NotoSansSC.ttf').toString('base64'));
 metrics=await page.evaluate(items=>Object.fromEntries(items.map(i=>{const e=document.createElementNS('http://www.w3.org/2000/svg','text');e.setAttribute('font-family','Semantic Noto');e.setAttribute('font-size',i.size);e.setAttribute('font-weight',i.weight);e.textContent=i.text;document.getElementById('svg').append(e);const b=e.getBBox(),v={x:b.x,y:b.y,width:b.width,height:b.height,advance:e.getComputedTextLength()};e.remove();return [i.id,v]})),[...requests.values()]);
}finally{await browser.close({silent:true})}
const failures=[];let checked=0;
for(let frame=0;frame<f.duration*f.fps;frame++){
 const t=sampleFilmTime(f,frame/f.fps),s=f.shots.find(s=>t>=s.start&&t<s.end),boxes=[];
 for(const n of s.nodes.filter(n=>n.kind==='text')){const p=sampleNodePose(n,s.nodes,t-s.start);if(p.opacity<=.03)continue;const m=metrics[key(textAt(n,p,s.nodes,t-s.start),n.size||44,750)],offset=n.align==='start'?0:n.align==='end'?-m.advance:-m.advance/2;
  const r=p.rotation*Math.PI/180;const corners=[[m.x+offset,m.y],[m.x+offset+m.width,m.y],[m.x+offset,m.y+m.height],[m.x+offset+m.width,m.y+m.height]].map(([x,y])=>({x:p.x+p.scale*(x*Math.cos(r)-y*Math.sin(r)),y:p.y+p.scale*(x*Math.sin(r)+y*Math.cos(r))}));
  const b={id:n.id,x:Math.min(...corners.map(c=>c.x)),y:Math.min(...corners.map(c=>c.y)),right:Math.max(...corners.map(c=>c.x)),bottom:Math.max(...corners.map(c=>c.y))};checked++;if(b.x<64||b.right>1856||b.y<165||b.bottom>905)failures.push({frame,type:'text-safe-area',...b});boxes.push(b);
 }
 for(const n of s.nodes.filter(n=>['solid','image','asset','rect','surface','path','dots'].includes(n.kind))){
  const p=sampleNodePose(n,s.nodes,t-s.start);if(p.opacity<=.03)continue;
  const bounds=n.kind==='solid'?projectSolid(n,p).bounds:['image','rect','surface'].includes(n.kind)?[0,0,n.width,n.height]:n.kind==='dots'?dotBounds(sampleDots(n.states,t-s.start)):n.kind==='path'?n.bounds:assetBounds(n.asset,p.v);if(!bounds)continue;
  const obstacle=transformBounds(bounds,p);
  for(const b of boxes){
   // Only fully contained printing on a receipt or price tag is intentional.
   if((['receipt','price-tag'].includes(n.asset)||n.kind==='surface'&&s.nodes.find(x=>x.id===b.id)?.printedOn===n.id)&&contains(obstacle,b,12))continue;
   if(intersects(b,obstacle,12))failures.push({frame,type:'text-object-overlap',a:b.id,b:n.id});
  }
 }
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];if(Math.min(a.right,b.right)>Math.max(a.x,b.x)&&Math.min(a.bottom,b.bottom)>Math.max(a.y,b.y))failures.push({frame,type:'text-overlap',a:a.id,b:b.id})}
}
for(const c of f.captions){let width=metrics[key(c.text,36,600)].advance;if(c.keyword)width+=(c.text.split(c.keyword).length-1)*(metrics[key(c.keyword,36,900)].advance-metrics[key(c.keyword,36,600)].advance);if(width>1496)failures.push({type:'caption-width',text:c.text,width});}
const report={passed:!failures.length,checkedFrames:f.duration*f.fps,checkedTextBoxes:checked,method:'Actual shipped variable font, Chromium SVG getBBox, all animated text frames, foreground illustration bounds with 12px clearance, and highlighted caption widths',limitations:['Conservative foreground bounds; background scenery excluded. Bound text fully inside its declared surface (or receipt/price tag) is allowed; shadows excluded. Bounds must be maintained when artwork changes.'],failureCount:failures.length,failures:[...new Map(failures.map(f=>[JSON.stringify([f.type,f.id,f.a,f.b,f.text]),f])).values()].slice(0,25)};fs.writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(!report.passed)process.exitCode=1;
