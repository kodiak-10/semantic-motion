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

