import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {validateFlatContent} from '../scripts/flat/content-gate.mjs';
import {validateFlat} from '../scripts/flat/validate.mjs';
import {sampleFilmTime} from '../src/cartoon/flatEngine.ts';
const source=JSON.parse(fs.readFileSync(new URL('../examples/flat/general-transformer/generated/film.json',import.meta.url)));
function retime(){const f=structuredClone(source);f.sourceDuration=f.duration;f.duration*=1.2;f.captions=f.captions.map(c=>({...c,start:c.start*1.2,end:c.end*1.2}));f.timeMap=[{source:0,target:0},...source.captions.slice(1).map((c,i)=>({source:c.start,target:f.captions[i+1].start})),{source:source.duration,target:f.duration}];return f;}
test('speech retiming keeps each original animation cue at its new speech start',()=>{const f=retime();validateFlat(f);validateFlatContent(f);for(let i=0;i<f.captions.length;i++)assert.ok(Math.abs(sampleFilmTime(f,f.captions[i].start)-source.captions[i].start)<1e-8);});
test('retiming cannot conceal changed narration or a shifted animation anchor',()=>{let f=retime();f.captions[3].text='偷换内容';assert.throws(()=>validateFlatContent(f));f=retime();f.timeMap[2].target+=.1;assert.throws(()=>validateFlatContent(f));});
