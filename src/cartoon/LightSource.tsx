import React from 'react';
export function LightSource(){
 const id='light'+React.useId().replaceAll(':','');
 return <g><defs><radialGradient id={id}><stop stopColor="#fff9d7"/><stop offset=".5" stopColor="#ffcb6e"/><stop offset=".83" stopColor="#ff9347"/><stop offset="1" stopColor="#e55a37"/></radialGradient><radialGradient id={id+'halo'}><stop offset=".65" stopColor="#ff914e" stopOpacity=".3"/><stop offset="1" stopColor="#ff914e" stopOpacity="0"/></radialGradient></defs><circle r="150" fill={`url(#${id}halo)`}/><circle r="106" fill={`url(#${id})`}/>{Array.from({length:20},(_,i)=><path key={i} d="M0-115L0-124" stroke="#ffba69" strokeWidth="2" opacity=".3" transform={`rotate(${i*18})`}/>)}</g>;
}
