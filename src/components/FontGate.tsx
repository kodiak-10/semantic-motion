import React, { useEffect, useState } from 'react';
import { cancelRender, continueRender, delayRender, staticFile } from 'remotion';
let loaded: Promise<void> | undefined;
export const FontGate: React.FC = () => {
    const [handle] = useState(() => delayRender('加载随项目打包的中文字体'));
    useEffect(() => {
        loaded ??= new FontFace('Semantic Noto', `url("${staticFile('fonts/NotoSansSC.ttf')}")`, { weight: '100 900' }).load().then(font => { document.fonts.add(font); });
        loaded.then(() => { document.documentElement.dataset.semanticFontReady = 'true'; document.dispatchEvent(new Event('semantic-font-ready')); continueRender(handle); }).catch(cancelRender);
    }, [handle]);
    return null;
};
