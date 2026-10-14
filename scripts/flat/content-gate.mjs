import {compile} from '../content-planner.mjs';
export function validateFlatContent(f){
 if(!f.knowledgePlan)throw Error('正式视频缺少经过验证的知识计划；历史动作实验只能用 --study 导出');
 const p=f.knowledgePlan,c=compile(p),foundation=p.foundation;
 if(!foundation?.concept||!foundation?.category||!foundation?.plain_definition||!foundation?.definition_cue_id)throw Error('缺少基本概念、类别和通俗定义');
 const cue=c.captions.find(x=>x.id===foundation.definition_cue_id);
 const definition=c.scenes.find(x=>x.cues.some(y=>y.id===foundation.definition_cue_id));
 if(!cue||definition.dimension!=='definition'||!cue.text.includes(foundation.plain_definition)||!cue.text.includes(foundation.category))throw Error('基本定义必须真正出现在定义场景的讲稿里');
 const firstMechanism=c.scenes.find(x=>['mechanism','example'].includes(x.dimension));
 if(firstMechanism&&definition.start>firstMechanism.start)throw Error('必须先解释基本概念再讲机制');
 if(f.topic!==p.input.topic||(f.sourceDuration??f.duration)!==c.duration||f.fps!==c.fps)throw Error('画面与知识计划主题/时长/帧率不一致');
 if(f.shots.length!==c.scenes.length)throw Error('每个知识场景须有对应分镜');
 for(let i=0;i<c.scenes.length;i++){
  const a=c.scenes[i],b=f.shots[i];
  if(b.id!==a.id||Math.abs(b.start-a.start)>1e-8||Math.abs(b.end-a.end)>1e-8)throw Error('知识与分镜时刻不一致');
  if(!b.visualEvidence?.trigger||!b.visualEvidence?.change||!b.visualEvidence?.result||!b.visualEvidence?.nodes?.length||b.visualEvidence.nodes.some(id=>!b.nodes.some(n=>n.id===id)))throw Error('缺少绑定真实对象的画面证据：'+b.id);
 }
 if(f.captions.length!==c.captions.length)throw Error('画面漏掉讲稿短句');
 for(let i=0;i<c.captions.length;i++){
  const a=c.captions[i],b=f.captions[i];
  if(a.text!==b.text||(!f.timeMap&&(a.start!==b.start||a.end!==b.end)))throw Error('画面字幕与知识计划不一致');
 }
 if(f.timeMap){
  const expected=[{source:0,target:0},...c.captions.slice(1).map((x,i)=>({source:x.start,target:f.captions[i+1].start})),{source:c.duration,target:f.duration}];
  if(JSON.stringify(f.timeMap)!==JSON.stringify(expected))throw Error('配音时间映射必须与原讲稿及真实字幕锚点一致');
 }
 return {passed:true,definition:foundation.plain_definition,scenes:c.scenes.length,scope:'Checks source references, prerequisites, glossary, required dimensions, timing and exact script binding; not a factual or aesthetic certification'};
}
