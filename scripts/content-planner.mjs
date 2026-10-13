import fs from 'node:fs';
import Ajv from 'ajv';
const schema=JSON.parse(fs.readFileSync(new URL('../schemas/knowledge-plan.schema.json',import.meta.url)));
const validateSchema=new Ajv({allErrors:true}).compile(schema);
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const relations=['compare','process','cause-effect','probability','timeline','hierarchy','classification','transformation','scale','composition','decomposition','filter'];
export const dimensions=['definition','motivation','mechanism','example','comparison','use-cases','limitations','misconceptions','takeaway'];
export function normalize(input){
 const i={audience_level:'普通大众',duration:96,explanation_depth:'standard',aspect_ratio:'16:9',language:'zh-CN',audio_mode:'silent',style_profile:'editorial-notes',...input};
 if(!i.topic?.trim())throw Error('topic 必填');
 if(i.aspect_ratio!=='16:9')throw Error('当前渲染器仅支持 16:9；9:16 尚未实现');
 if(!['青少年','普通大众','AI 产品','工程师'].includes(i.audience_level))throw Error('未知受众');
 if(!['quick','standard','deep'].includes(i.explanation_depth))throw Error('未知解释深度');
 if(i.language!=='zh-CN'||i.style_profile!=='editorial-notes')throw Error('当前版本只实现 zh-CN / editorial-notes');
 if(!['silent','external','tts'].includes(i.audio_mode))throw Error('未知音频模式');
 if(!Number.isFinite(i.duration)||i.duration<20||i.duration>600)throw Error('duration 必须为 20–600 秒');
 return i;
}
export function brief(input){const i=normalize(input);return {input:i,task:'由调用 Skill 的智能体核对来源后填写 KnowledgePlan，不根据关键词拼装或虚构知识。',dimensions,depth:{quick:'定义、一个机制、具体例子、边界、记忆点；合并维度但保留因果链。',standard:'完整问题→定义→机制→例子→边界→记忆点链条；比较和误区按主题取舍。',deep:'标准链条外增加证据、反例、机制的条件和替代解释。'}[i.explanation_depth],jargon_per_minute:{'青少年':2,'普通大众':3,'AI 产品':5,'工程师':7}[i.audience_level],audience_guidance:{'青少年':'用日常物体与具体情境，先解释前置知识，不引入公式。','普通大众':'先具体例子再抽象定义，首次术语必须翻译成人话。','AI 产品':'解释产品决策、流程、可靠性和落地边界。','工程师':'可用类型、算法和量化模型；仍需说明假设。'}[i.audience_level],schema:'schemas/knowledge-plan.schema.json',stop_conditions:['来源无法支持核心主张','时长不足以容纳必需前置知识','知识关系无法映射已有语法时扩展语法，禁止退化成卡片墙']};}
export function validateEntities(s){const fail=m=>{throw Error(m)};
 if(s.visual){
  const ids=new Set();
  for(const l of s.visual.layers){
   if(ids.has(l.id))fail('视觉图层 ID 重复');ids.add(l.id);
   if(l.src&&(l.src.includes('..')||l.src.startsWith('/')))fail('素材路径必须在 public 内');
   let last=-1;for(const k of l.keyframes){if(k.at<=last)fail('图层关键帧必须严格递增');last=k.at;}
   if(l.keyframes[0].at!==0)fail('图层必须从0定义初始状态');
  }
 }

  if(s.entities.length<2||s.entities.length>5||new Set(s.entities.map(e=>e.id)).size!==s.entities.length)fail('对象数量或 ID 错误');
  if(s.relation==='probability'&&s.entities.length>4)fail('概率最多4项，更多项请拆场景');
  if(s.relation==='filter'&&s.entities.length>3)fail('筛选最多3个可见对象，请拆场景');
  if(s.entities.length>3&&s.entities.some(e=>e.label.length>8))fail('多对象场景词条最多8字，防止字体过小');
  if(s.relation==='classification'&&[0,1].some(g=>s.entities.filter(e=>e.group===g).length>2))fail('每类最多2个可见对象，请拆场景');
  if(s.relation==='probability'&&(s.entities.some(e=>e.value===undefined||e.value>100)||Math.abs(s.entities.reduce((n,e)=>n+e.value,0)-100)>.001))fail('互斥概率总和必须为100');
  if(s.relation==='classification'&&s.entities.some(e=>e.group===undefined))fail('归类需要明确 group');
  if(s.relation==='filter'&&(s.entities.some(e=>e.keep===undefined)||s.entities.every(e=>e.keep)||s.entities.every(e=>!e.keep)))fail('筛选需要明确保留和拒绝项');
  if(s.relation==='scale'&&!s.entities.some(e=>e.value!==undefined))fail('scale 缺少数值');
 if(['compare','transformation'].includes(s.relation)&&s.entities.length!==2)fail('比较与变换需要两个明确状态');
 if(s.relation==='scale'&&s.entities.some(e=>e.value!==undefined&&!e.unit))fail('数量变化必须写明单位');
}
export function validatePlan(p){
 if(!validateSchema(p))throw Error('知识计划 schema：'+JSON.stringify(validateSchema.errors));
 const i=normalize(p.input),fail=m=>{throw Error(m)};
 if(!p.learning_goal||!p.comprehension_check?.answer||!p.comprehension_check?.question)fail('缺少学习目标/理解检查');
 if(!Array.isArray(p.scenes)||!p.scenes.length)fail('缺少场景');
 const sourceIds=new Set(p.sources.map(s=>s.id)),claimIds=new Set(p.claims.map(c=>c.id));
 if(sourceIds.size!==p.sources.length||claimIds.size!==p.claims.length)fail('来源/主张 ID 重复');
 p.sources.forEach(s=>{if(!/^https?:\/\//.test(s.url)||!s.accessed||!s.title)fail('来源不完整')});
 p.claims.forEach(c=>{if(!c.text||!['fact','vendor-claim','illustration'].includes(c.kind))fail('主张不完整');if(c.kind!=='illustration'&&(!c.source_ids.length||c.source_ids.some(x=>!sourceIds.has(x))))fail('事实缺来源')});
 const taught=new Set(),ids=new Set(),cids=new Set();let terms=0;
 for(const s of p.scenes){
  if(ids.has(s.id))fail('场景 ID 重复');ids.add(s.id);
  if(!relations.includes(s.relation)||!dimensions.includes(s.dimension))fail('未知关系/维度');
  if(!s.visual_reason||!s.title||s.title.length>20||!s.note||s.note.length>42)fail('视觉解释/标题/注释不合规范');
  validateEntities(s);
  const entityIds=new Set(s.entities.map(e=>e.id));
  s.entities.forEach(e=>{if(!e.label||e.label.length>12||(e.detail?.length??0)>20)fail('对象文字过长');if(e.value!==undefined&&(!Number.isFinite(e.value)||e.value<0))fail('数值非法')});
  if(s.requires.some(x=>!taught.has(x)))fail(`前置知识未解释：${s.id}`);s.teaches.forEach(x=>taught.add(x));
  if(!s.claim_ids.length||s.claim_ids.some(x=>!claimIds.has(x)))fail('场景主张无对应来源记录');
  if(s.cues.length<2||s.cues.length>7)fail('每场 2–7 个语义短语');
  for(const c of s.cues){if(cids.has(c.id))fail('字幕 ID 重复');cids.add(c.id);if(!c.text||c.text.length>32||!c.text.includes(c.keyword)||!entityIds.has(c.target))fail('字幕短语/关键词/对象无效');if(!['draw-line','split','merge','scale-focus','slider','count-up','path-follow','track','morph'].includes(c.action))fail('未知动作')}
  terms+=s.terms.length;s.terms.forEach(t=>{if(!t.explanation||!s.cues.some(c=>c.text.includes(t.term))||!s.cues.some(c=>c.text.includes(t.explanation)))fail('首次术语缺少字幕中的解释')});
  if(s.analogy&&(!s.analogy.mapping||!s.analogy.boundary))fail('类比缺少边界');
 }
 const present=new Set(p.scenes.map(s=>s.dimension));
 for(const d of ['definition','mechanism','example','limitations','takeaway'])if(!present.has(d))fail(`认知链缺少 ${d}`);
 if(i.explanation_depth!=='quick'&&p.scenes.length<6)fail('standard/deep 内容过薄');
 if(i.explanation_depth==='deep'&&(!present.has('misconceptions')||p.scenes.length<9))fail('deep 缺少反例/条件');
 const omitted=p.scope.omitted.map(x=>x.dimension);for(const d of dimensions)if(!present.has(d)&&!omitted.includes(d))fail(`未解释维度取舍：${d}`);
 if(terms/(i.duration/60)>brief(i).jargon_per_minute)fail('超出术语预算');
 for(const k of ['accuracy','completeness','clarity','analogy_quality','jargon_control','visual_grounding'])if(!Number.isFinite(p.review[k])||p.review[k]<4||p.review[k]>5)fail(`内容人工审查未通过：${k}`);
 if(!p.review.notes?.length)fail('质量分数必须有审查依据，不能自动打满分');
 return i;
}
export function compile(p){
 const input=validatePlan(p),all=p.scenes.flatMap(s=>s.cues),weights=all.map(c=>Math.max(1.5,[...c.text].length/5.2));
 const total=weights.reduce((a,b)=>a+b,0);let frame=0,k=0;
 const frames=Math.round(input.duration*30);
 const scenes=p.scenes.map(s=>{const start=frame/30;const cues=s.cues.map(c=>{const begin=frame;frame=k===all.length-1?frames:Math.round((weights.slice(0,k+1).reduce((a,b)=>a+b,0)/total)*frames);k++;const duration=(frame-begin)/30;if(duration<1.5||duration>5||[...c.text].length/duration>7)throw Error('时长与内容不匹配：修改稿件或时长，不截断内容');return {...c,start:begin/30,end:frame/30,sceneId:s.id}});return {...s,start,end:frame/30,cues}});
 const budget=brief(input).jargon_per_minute;
 for(const s of scenes){const recent=scenes.filter(x=>x.start>=s.start&&x.start<s.start+60).reduce((n,x)=>n+x.terms.length,0);if(recent>budget)throw Error('任意60秒内术语预算超限');}
 return {version:'0.5.0',input,duration:frames/30,fps:30,width:1920,height:1080,scenes,captions:scenes.flatMap(s=>s.cues)};
}
export const stamp=t=>{const ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`};
export function writeFilm(f,dir){fs.mkdirSync(dir,{recursive:true});const put=(n,v)=>fs.writeFileSync(path.join(dir,n),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');put('motion-plan.json',f);put('narration.json',f.captions);put('timing-markers.json',{fps:f.fps,duration:f.duration,scenes:f.scenes.map(s=>({id:s.id,start:s.start,end:s.end})),markers:f.captions.map(c=>({id:c.id,start:c.start,end:c.end,keyword:c.keyword,action:c.action,target:c.target}))});put('subtitle.srt',f.captions.map((c,i)=>`${i+1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`).join('\n'));put('narration.md',`# ${f.input.topic}\n\n`+f.scenes.map(s=>`## ${s.title}\n\n${s.cues.map(c=>c.text).join('')}\n`).join('\n'));}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [mode,file,out]=process.argv.slice(2);const data=JSON.parse(fs.readFileSync(file,'utf8'));if(mode==='brief')console.log(JSON.stringify(brief(data),null,2));else if(mode==='build'){const f=compile(data);writeFilm(f,out);console.log(`${f.scenes.length} 场景 / ${f.duration}s`)}else throw Error('用法：brief input.json | build knowledge-plan.json output-directory');}
