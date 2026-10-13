import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {validateFlatContent} from '../scripts/flat/content-gate.mjs';import {objectAudit} from '../scripts/flat/object-audit.mjs';import {compileFlat} from '../scripts/flat/compile.mjs';
const load=p=>JSON.parse(fs.readFileSync(p));
const film=name=>load(`examples/flat/general-${name}/generated/film.json`);
for(const name of ['jev','sky'])test(`${name}: same compiler binds complete explanation and different storyboard`,()=>{
 const p=load(`examples/flat/general-${name}/knowledge-plan.json`),s=load(`examples/flat/general-${name}/staging.json`),f=compileFlat(p,s);
 assert.equal(validateFlatContent(f).passed,true);assert.equal(objectAudit(f).passed,true);assert.equal(f.captions.length,24);assert.equal(f.shots.length,6);
});
test('old footage cannot pass formal content review by having valid geometry',()=>assert.throws(()=>validateFlatContent(({...film('jev'),knowledgePlan:undefined})),/知识计划/));
test('definition text must be spoken/shown, not hidden in metadata',()=>{const f=film('jev');f.knowledgePlan.foundation.plain_definition='仅写在备注中的定义';assert.throws(()=>validateFlatContent(f),/讲稿/)});
test('changing or dropping captions cannot bypass planned concepts',()=>{for(const change of [f=>f.captions.splice(0,1),f=>f.captions[0].text='直接进入概率']){const f=film('jev');change(f);assert.throws(()=>validateFlatContent(f),/讲稿|字幕/);}});
test('unknown prerequisites stop production',()=>{const f=film('sky');f.knowledgePlan.scenes[2].requires.push('未讲解的光学');assert.throws(()=>validateFlatContent(f),/前置/)});
test('missing limitations cannot pass by shortening footage',()=>{const f=film('jev');f.knowledgePlan.scenes[4].dimension='comparison';assert.throws(()=>validateFlatContent(f),/认知链/)});
test('knowledge evidence must point to an actual on-screen object',()=>{const f=film('jev');f.shots[0].visualEvidence.nodes=['not-present'];assert.throws(()=>validateFlatContent(f),/画面证据/)});
test('declared contact applies only to the specified pair and interval',()=>{
 const base={fps:30,duration:2,shots:[{id:'s',start:0,end:2,nodes:['a','b'].map(id=>({id,kind:'rect',width:100,height:100,keys:[{t:0,x:300,y:300}]})),contacts:[]}]};
 assert.equal(objectAudit(base).passed,false);
 base.shots[0].contacts=[{pair:['a','b'],start:0,end:2,reason:'stacked cards in this fixture'}];assert.equal(objectAudit(base).passed,true);
 base.shots[0].contacts[0].end=1;assert.equal(objectAudit(base).passed,false);
 base.shots[0].contacts[0].pair=['a','missing'];assert.throws(()=>objectAudit(base),/声明/);
});

test('unsupported audio request fails instead of silently producing silent output',()=>{const p=load('examples/flat/general-jev/knowledge-plan.json'),s=load('examples/flat/general-jev/staging.json');p.input.audio_mode='tts';assert.throws(()=>compileFlat(p,s),/silent compilation/);});
