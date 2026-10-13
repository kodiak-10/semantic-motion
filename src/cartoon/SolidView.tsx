import React from 'react';
import {projectSolid,type Solid,type Orientation} from './solid3d';
export function Solid3D({node,pose}:{node:Solid;pose:Orientation}){
 const {faces}=projectSolid(node,pose);
 return <g>{faces.map(face=><polygon key={face.index} points={face.points.map(p=>p.join(',')).join(' ')} fill={face.fill} stroke={face.fill} strokeWidth={.7} strokeLinejoin="round"/>)}</g>;
}
