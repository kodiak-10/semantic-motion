import test from 'node:test';import assert from 'node:assert/strict';
import {projectSolid,rotate3d} from '../src/cartoon/solid3d.ts';
import {samplePose} from '../src/cartoon/flatEngine.ts';
import {objectAudit} from '../scripts/flat/object-audit.mjs';
import {validateFlat} from '../scripts/flat/validate.mjs';
const node={id:'solid',kind:'solid',geometry:'box',width:240,height:180,depth:160,color:'#79c8c1',keys:[{t:0,x:700,y:500,rx:20,ry:35}]};
const zero={rx:0,ry:0,rz:0};
test('rotation preserves 3D distances',()=>{const v=rotate3d([30,40,20],{rx:37,ry:81,rz:9});assert.ok(Math.abs(Math.hypot(...v)-Math.hypot(30,40,20))<1e-9)});
test('box shows front only head-on and three faces when tilted',()=>{assert.equal(projectSolid(node,zero).faces.length,1);assert.equal(projectSolid(node,{rx:20,ry:35,rz:0}).faces.length,3)});
test('projected vertices stay inside audit bounds across a full rotation',()=>{for(const geometry of ['box','sphere'])for(let ry=0;ry<360;ry+=15){const r=projectSolid({...node,geometry},{rx:25,ry,rz:10});assert.ok(r.faces.length>0);for(const f of r.faces)for(const [x,y] of f.points){assert.ok(x>=r.bounds[0]&&x<=r.bounds[2]&&y>=r.bounds[1]&&y<=r.bounds[3]);assert.ok(Number.isFinite(x)&&Number.isFinite(y));}}});
test('3D keyframes seek deterministically with independent axes',()=>{const k=[{t:0,rx:0,ry:0},{t:1,rx:90},{t:2,ry:180}];const a=samplePose(k,.5);samplePose(k,2);assert.deepEqual(samplePose(k,.5),a);assert.equal(a.rx,45);assert.equal(samplePose(k,1).ry,90)});
test('a rotating solid participates in collision checks',()=>{const f={duration:1,fps:30,shots:[{id:'s',start:0,end:1,nodes:[node,{id:'b',kind:'rect',width:50,height:50,keys:[{t:0,x:700,y:500}]}]}]};assert.equal(objectAudit(f).passed,false);f.shots[0].nodes[1].keys[0].x=1300;assert.equal(objectAudit(f).passed,true)});
test('camera inside mesh is rejected',()=>{const f={mode:'flat2d',width:1920,height:1080,fps:30,duration:1,style_profile:'studio',captions:[],shots:[{start:0,end:1,nodes:[{...node,cameraDistance:50}]}]};assert.throws(()=>validateFlat(f),/camera/)});

test('solid nodes compile through the same formal non-AI knowledge pipeline',async()=>{
 const {readFileSync}=await import('node:fs');const {compileFlat}=await import('../scripts/flat/compile.mjs');
 const p=JSON.parse(readFileSync('examples/flat/general-sky/knowledge-plan.json'));
 const s=JSON.parse(readFileSync('examples/flat/general-sky/staging.json'));
 const sun=s.shots[0].nodes.find(n=>n.id==='sun');const point=sun.states[0].points[0];
 sun.kind='solid';sun.geometry='sphere';sun.width=sun.height=sun.depth=point.r*2;sun.color=point.color;
 sun.keys=sun.keys.map(k=>({...k,...(k.x!==undefined?{x:k.x+point.x}:{}),...(k.y!==undefined?{y:k.y+point.y}:{})}));delete sun.states;
 const f=compileFlat(p,s);assert.equal(f.shots[0].nodes.find(n=>n.id==='sun').kind,'solid');assert.equal(objectAudit(f).passed,true);
});
