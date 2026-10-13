import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {compile,stamp} from '../content-planner.mjs';
import {validateFlatContent} from './content-gate.mjs';import {validateFlat} from './validate.mjs';import {objectAudit} from './object-audit.mjs';
export function compileFlat(p,staging){
 if(p.input.audio_mode && p.input.audio_mode!=='silent')throw Error('This release supports silent compilation only; add narration in an editor');
 const content=compile(p);
 if(staging.shots.length!==content.scenes.length)throw Error('分镜数量与内容不同');
 const shots=content.scenes.map((scene,i)=>{
  const stage=staging.shots[i],duration=scene.end-scene.start;if(stage.id!==scene.id)throw Error('分镜顺序与内容不同');
  const at=x=>{if(!Number.isFinite(x)||x<0||x>1)throw Error('分镜时间必须在0–1范围');return x*duration;};
  return {...stage,start:scene.start,end:scene.end,label:'',nodes:stage.nodes.map(n=>({...n,keys:n.keys.map(k=>({...k,t:at(k.t)})),...(n.states?{states:n.states.map(s=>({...s,t:at(s.t)}))}:{})})),contacts:(stage.contacts||[]).map(c=>({...c,start:at(c.start),end:at(c.end)}))};
 });
 const f={mode:'flat2d',topic:p.input.topic,width:1920,height:1080,fps:content.fps,duration:content.duration,series:'',style_profile:staging.style_profile||'studio',reviewOverlay:false,knowledgePlan:p,shots,captions:content.captions};
 validateFlat(f);validateFlatContent(f);const objects=objectAudit(f);if(!objects.passed)throw Error('物体碰撞：'+JSON.stringify(objects.failures));return f;
}
export function writeFlat(f,dir){
 fs.mkdirSync(dir,{recursive:true});const put=(name,value)=>fs.writeFileSync(path.join(dir,name),typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');
 put('film.json',f);put('narration.json',f.captions);put('narration.md','# '+f.topic+'\n\n'+f.captions.map(c=>c.text).join('\n\n')+'\n');put('subtitle.srt',f.captions.map((c,i)=>`${i+1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`).join('\n'));put('timing.json',{fps:f.fps,duration:f.duration,audio_aligned:false,markers:f.captions});put('content-qc.json',validateFlatContent(f));
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [knowledge,stage,output]=process.argv.slice(2);const f=compileFlat(JSON.parse(fs.readFileSync(knowledge)),JSON.parse(fs.readFileSync(stage)));writeFlat(f,output);console.log(`${f.shots.length} scenes / ${f.duration}s`);}
