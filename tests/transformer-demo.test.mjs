import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {compileFlat} from '../scripts/flat/compile.mjs';
import {samplePose} from '../src/cartoon/flatEngine.ts';
const read=n=>JSON.parse(fs.readFileSync(new URL('../examples/flat/general-transformer/'+n,import.meta.url)));
const staging=read('staging.json');
test('Transformer example compiles through the general content and layout gates',()=>{
 const f=compileFlat(read('knowledge-plan.json'),staging);assert.equal(f.duration,96);assert.equal(f.shots.length,8);
});
test('displayed attention mixture equals the weighted sum of displayed values',()=>{
 const nodes=staging.shots[3].nodes;const get=id=>nodes.find(n=>n.id===id).text;
 const result=[0,0];let sum=0;
 for(let i=0;i<3;i++){
  const w=Number(get('weight-'+i).match(/(\d+)%/)[1])/100;
  const v=JSON.parse(get('value-'+i+'-text'));sum+=w;v.forEach((x,j)=>result[j]+=x*w);
 }
 assert.ok(Math.abs(sum-1)<1e-10);
 JSON.parse(get('result-text')).forEach((x,j)=>assert.ok(Math.abs(x-result[j])<1e-10));
});
test('selected output lands exactly in the persistent sentence at next scene',()=>{
 const a=staging.shots[5].nodes.find(n=>n.id==='selected'),b=staging.shots[6].nodes.find(n=>n.id==='token-4');
 const pa=samplePose(a.keys,1),pb=samplePose(b.keys,0);
 for(const k of ['x','y','scale','opacity'])assert.equal(pa[k],pb[k]);
 for(const k of ['width','height','color','fill'])assert.equal(a[k],b[k]);
 assert.equal(staging.shots[5].nodes.find(n=>n.id==='selected-text').text,staging.shots[6].nodes.find(n=>n.id==='token-4-text').text);
});
