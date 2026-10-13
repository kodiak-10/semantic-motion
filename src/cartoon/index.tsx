import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {FlatFilm, type FlatFilmData} from './FlatFilm';
import flat from '../../examples/spatial/film.json';
const Root: React.FC = () => <Composition id="FlatExplainer" component={FlatFilm} defaultProps={{film:flat as FlatFilmData}} width={1920} height={1080} fps={30} durationInFrames={360} calculateMetadata={({props})=>({durationInFrames:Math.round(props.film.duration*props.film.fps),fps:props.film.fps,width:props.film.width,height:props.film.height})}/>;
registerRoot(Root);
