// Small deterministic 3D mesh projector. Shared by rendering and collision checks.
export type Vec3 = [number, number, number];
export type Solid = {geometry?: 'box'|'sphere'; width?:number; height?:number; depth?:number; cameraDistance?:number; color?:string};
export type Orientation = {rx:number;ry:number;rz:number};
const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const sub=(a:Vec3,b:Vec3):Vec3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export function solidMesh(s:Solid){
 const w=s.width!/2,h=s.height!/2,d=s.depth!/2;
 if(s.geometry==='box')return {vertices:[[-w,-h,-d],[w,-h,-d],[w,h,-d],[-w,h,-d],[-w,-h,d],[w,-h,d],[w,h,d],[-w,h,d]] as Vec3[],faces:[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[0,1,5,4],[3,7,6,2]]};
 if(s.geometry!=='sphere')throw Error('Unknown 3D geometry');
 const vertices:Vec3[]=[],faces:number[][]=[],rows=16,cols=32;
 for(let i=0;i<=rows;i++)for(let j=0;j<cols;j++){const a=i*Math.PI/rows,b=j*2*Math.PI/cols;vertices.push([w*Math.sin(a)*Math.cos(b),h*Math.cos(a),d*Math.sin(a)*Math.sin(b)]);}
 for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const k=(j+1)%cols;faces.push(i===0?[j,cols+j,cols+k]:i===rows-1?[i*cols+j,(i+1)*cols+j,i*cols+k]:[i*cols+j,(i+1)*cols+j,(i+1)*cols+k,i*cols+k]);}
 // Orient all ellipsoid faces outward, including polar triangles.
 for(const face of faces){const n=cross(sub(vertices[face[1]],vertices[face[0]]),sub(vertices[face[2]],vertices[face[0]]));if(n.reduce((sum,v,i)=>sum+v*vertices[face[0]][i],0)<0)face.reverse();}
 return {vertices,faces};
}
export function rotate3d([x,y,z]:Vec3,p:Orientation):Vec3{
 const [a,b,c]=[p.rx,p.ry,p.rz].map(n=>n*Math.PI/180);
 const y1=y*Math.cos(a)-z*Math.sin(a),z1=y*Math.sin(a)+z*Math.cos(a);
 const x2=x*Math.cos(b)+z1*Math.sin(b),z2=-x*Math.sin(b)+z1*Math.cos(b);
 return [x2*Math.cos(c)-y1*Math.sin(c),x2*Math.sin(c)+y1*Math.cos(c),z2];
}
export function projectSolid(s:Solid,p:Orientation){
 const mesh=solidMesh(s),camera=s.cameraDistance??1600;
 const v=mesh.vertices.map(point=>rotate3d(point,p));
 if(v.some(point=>point[2]>=camera))throw Error('3D mesh crosses camera plane');
 const points=v.map(([x,y,z])=>[x*camera/(camera-z),y*camera/(camera-z)] as [number,number]);
 const rgb=[1,3,5].map(i=>parseInt((s.color??'#79c8c1').slice(i,i+2),16));
 const faces=mesh.faces.flatMap((indices,index)=>{
  const a=v[indices[0]],normal=cross(sub(v[indices[1]],a),sub(v[indices[2]],a)),len=Math.hypot(...normal);
  if(len<1e-8)return [];
  const n=normal.map(x=>x/len),view=[-a[0],-a[1],camera-a[2]];
  if(n.reduce((sum,x,i)=>sum+x*view[i],0)<=0)return [];
  const brightness=.52+.48*Math.max(0,n[0]*-.424+n[1]*-.707+n[2]*.566);
  const fill='#'+rgb.map(c=>Math.round(c*brightness).toString(16).padStart(2,'0')).join('');
  return [{index,points:indices.map(i=>points[i]),z:indices.reduce((sum,i)=>sum+v[i][2],0)/indices.length,fill}];
 }).sort((a,b)=>a.z-b.z);
 const bounds:[number,number,number,number]=[Math.min(...points.map(v=>v[0]))-1,Math.min(...points.map(v=>v[1]))-1,Math.max(...points.map(v=>v[0]))+1,Math.max(...points.map(v=>v[1]))+1];
 return {faces,bounds};
}
