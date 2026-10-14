import test from 'node:test';import assert from 'node:assert/strict';
import {illuminatedFraction,illuminatedPath} from '../src/cartoon/phaseGeometry.ts';
test('projected illuminated area matches spherical phase across a cycle',()=>{
 for(let i=0;i<=40;i++){
  const a=i*Math.PI/20,points=illuminatedPath(a,1).slice(1,-1).split('L').map(x=>x.split(',').map(Number));
  const area=Math.abs(points.reduce((s,p,j)=>{const q=points[(j+1)%points.length];return s+p[0]*q[1]-q[0]*p[1];},0)/2);
  assert.ok(Math.abs(area/Math.PI-illuminatedFraction(a))<.002);
  assert.ok(points.every(([x,y])=>x*x+y*y<=1+1e-9));
 }
});
test('opposite viewing angles preserve fraction and mirror illuminated side',()=>{
 for(const a of [.3,1.1,2.6]){
  assert.equal(illuminatedFraction(a),illuminatedFraction(-a));
  const parse=s=>s.slice(1,-1).split('L').map(x=>x.split(',').map(Number));
  const p=parse(illuminatedPath(a)),q=parse(illuminatedPath(-a));
  p.forEach(([x,y],i)=>{assert.ok(Math.abs(x+q[i][0])<1e-10);assert.equal(y,q[i][1]);});
 }
});

import fs from 'node:fs';
import {samplePose} from '../src/cartoon/flatEngine.ts';
test('moon example ties observed phase to the same orbital position',()=>{
 const shot=JSON.parse(fs.readFileSync(new URL('../examples/flat/general-moon/staging.json',import.meta.url))).shots[2];
 const nodes=Object.fromEntries(shot.nodes.map(n=>[n.id,n]));
 for(let i=0;i<=240;i++){
  const t=i/240,earth=samplePose(nodes.earth.keys,t),moon=samplePose(nodes.orbitmoon.keys,t),view=samplePose(nodes.moon.keys,t);
  const dx=moon.x-earth.x,dy=moon.y-earth.y;
  // Sun is at the left; observer is at Earth, so cos(phase)=dx/orbit radius.
  assert.ok(Math.abs(Math.cos(view.v)-dx/Math.hypot(dx,dy))<.001);
 }
});
