import {execFileSync} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';
import {bundle} from '@remotion/bundler';import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
import {validateFlatContent} from './content-gate.mjs';
import {validateFlat} from './validate.mjs';
const [input,output,frame]=process.argv.slice(2).filter(x=>x!=='--study');if(!input||!output)throw Error('Usage: render.mjs film.json video.mp4 [frame]');
const film=JSON.parse(fs.readFileSync(input));const qc=validateFlat(film);if(!process.argv.includes('--study'))qc.content=validateFlatContent(film);qc.study=process.argv.includes('--study');fs.mkdirSync(path.dirname(output),{recursive:true});
execFileSync(process.execPath,['scripts/flat/audit.mjs',input,output+'.layout-qc.json'],{stdio:'inherit'});
if(!qc.study)execFileSync(process.execPath,['scripts/flat/object-audit.mjs',input,output+'.object-qc.json'],{stdio:'inherit'});
const serveUrl=await bundle({entryPoint:path.resolve('src/cartoon/index.tsx')});const browserExecutable=process.env.CHROME_EXECUTABLE;
const inputProps={film};const composition=await selectComposition({serveUrl,id:'FlatExplainer',inputProps,browserExecutable});
if(frame!==undefined){for(const f of frame.split(','))await renderStill({serveUrl,composition,inputProps,output:frame.includes(',')?`${output}-${f}.png`:output,frame:Number(f),browserExecutable});}
else{let last=-1;await renderMedia({serveUrl,composition,inputProps,outputLocation:output,codec:'h264',crf:18,concurrency:3,browserExecutable,onProgress:({progress})=>{const p=Math.floor(progress*10);if(p!==last){console.log(p*10+'%');last=p}}});fs.writeFileSync(output+'.plan-qc.json',JSON.stringify(qc,null,2));}
console.log(output);
