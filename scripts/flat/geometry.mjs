// Conservative local illustration bounds, including strokes. Background scenery is
// not a foreground obstacle; receipt/tag interiors are intentional text surfaces.
export function assetBounds(name,v=1){
 const fixed={'parcel-cutaway':[-282,-365,282,126],parcel:[-177,-130,177,143],envelope:[-170,-107,170,107],'decision-dial':[-170,-170,170,170],'probability-column':[-70,-313,87,4],'review-lens':[-110,-110,181,181],'document-scroll':[-146,-183,153,195],'route-switch':[-170,-70,170,70],inbox:[-170,-97,170,102],'inbox-front':[-170,-5,170,102],milk:[-71,-241,79,5],bread:[-135,-229,108,5],apple:[-118,-181,122,33],'bag-back':[-211,-311,211,38],'bag-front':[-211,-182,211,58],coin:[-50,-50,50,50],house:[-120,-240,120,5],bus:[-150,-155,150,8],clock:[-95,-95,95,95],'price-tag':[-125,-91,125,73]};
 if(name==='market'||name==='paper-desk')return null;
 if(name==='receipt')return [-173,-325,173,-310+Math.max(0,v)*420+5];
 if(name==='wallet'){
  const angle=-v*36*Math.PI/180;
  const flap=[[-190,-199],[153,-199],[-190,-95],[153,-95]].map(([x,y])=>[-190+(x+190)*Math.cos(angle)-(y+95)*Math.sin(angle),-95+(x+190)*Math.sin(angle)+(y+95)*Math.cos(angle)]);
  return [Math.min(-195,...flap.map(p=>p[0]-5)),Math.min(-100,...flap.map(p=>p[1]-5)),Math.max(184,...flap.map(p=>p[0]+5)),55];
 }
 if(!fixed[name])throw Error('Missing illustration bounds: '+name);
 return fixed[name];
}
export function transformBounds(bounds,p){
 const [l,t,r,b]=bounds,a=p.rotation*Math.PI/180;
 const points=[[l,t],[r,t],[l,b],[r,b]].map(([x,y])=>[p.x+p.scale*(x*Math.cos(a)-y*Math.sin(a)),p.y+p.scale*(x*Math.sin(a)+y*Math.cos(a))]);
 return {x:Math.min(...points.map(p=>p[0])),y:Math.min(...points.map(p=>p[1])),right:Math.max(...points.map(p=>p[0])),bottom:Math.max(...points.map(p=>p[1]))};
}
export function intersects(a,b,gap=0){return Math.min(a.right,b.right)+gap>Math.max(a.x,b.x)&&Math.min(a.bottom,b.bottom)+gap>Math.max(a.y,b.y);}
export function contains(a,b,gap=0){return b.x>=a.x+gap&&b.y>=a.y+gap&&b.right<=a.right-gap&&b.bottom<=a.bottom-gap;}
