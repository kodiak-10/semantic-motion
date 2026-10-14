import crypto from 'node:crypto';
import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';
const root=process.cwd();const require=createRequire(path.join(root,'package.json'));
const {RenderInternals}=require('@remotion/renderer');const {probeMedia}=await import(path.join(root,'scripts/media-probe.mjs'));
const bin=RenderInternals.getExecutablePath({type:'ffmpeg',indent:false,logLevel:'error',binariesDirectory:null});const env={...process.env,DYLD_LIBRARY_PATH:path.dirname(bin)};
const [voiced,silent,reportFile]=process.argv.slice(2);if(!reportFile)throw Error('Expected voiced.mp4 silent.mp4 report.json');fs.mkdirSync(path.dirname(silent),{recursive:true});fs.mkdirSync(path.dirname(reportFile),{recursive:true});
execFileSync(bin,['-y','-v','error','-i',voiced,'-map','0:v:0','-c:v','copy','-an',silent],{env});
const p=probeMedia(voiced),s=probeMedia(silent);const a=p.streams.find(s=>s.codec_type==='audio'),v=p.streams.find(s=>s.codec_type==='video');
if(!a||s.streams.some(s=>s.codec_type==='audio'))throw Error('Wrong audio streams');
const wav=execFileSync(bin,['-v','error','-i',voiced,'-vn','-ac','1','-ar','24000','-c:a','pcm_s16le','-f','wav','pipe:1'],{env,maxBuffer:20*1024*1024});
let start=12;while(wav.toString('ascii',start,start+4)!=='data'){const size=wav.readUInt32LE(start+4);start+=8+size+(size%2);if(start+8>wav.length)throw Error('Missing decoded WAV data');}
const raw=wav.subarray(start+8);let peak=0,sum=0,clipped=0;for(let i=0;i<raw.length;i+=2){const x=raw.readInt16LE(i)/32768;peak=Math.max(peak,Math.abs(x));sum+=x*x;if(Math.abs(x)>=.9999)clipped++;}
const hash=file=>crypto.createHash('sha256').update(execFileSync(bin,['-v','error','-i',file,'-map','0:v:0','-c:v','copy','-f','h264','pipe:1'],{env,maxBuffer:50*1024*1024})).digest('hex');
const match=hash(voiced)===hash(silent);const delta=Math.abs(Number(a.duration)-Number(v.duration));
const report={audio_track:true,audio_codec:a.codec_name,audio_duration:Number(a.duration),video_duration:Number(v.duration),duration_delta:delta,peak,rms:Math.sqrt(sum/(raw.length/2)),clipped_samples:clipped,silent_copy_video_stream_identical:match,passed:delta<.1&&peak>0&&peak<1&&clipped===0&&match,listening_review:'pending; technical checks do not certify naturalness'};
fs.writeFileSync(reportFile,JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(!report.passed)throw Error('Audio QC failed');
