// Orthographic sphere: a=0 is fully lit, a=pi is dark; positive a lights the right.
export function illuminatedFraction(a:number){return (1+Math.cos(a))/2;}
export function illuminatedPath(a:number,r=200){
 const side=Math.sin(a)>=0?1:-1,c=Math.cos(a),points:number[][]=[];
 for(let i=0;i<=100;i++){const y=-1+2*i/100;points.push([side*Math.sqrt(Math.max(0,1-y*y))*r,y*r]);}
 for(let i=100;i>=0;i--){const y=-1+2*i/100;points.push([-side*c*Math.sqrt(Math.max(0,1-y*y))*r,y*r]);}
 return 'M'+points.map(p=>p.join(',')).join('L')+'Z';
}
