import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {RenderInternals} from '@remotion/renderer';
// This helper is tied to the pinned Remotion version; use its platform resolver.
export function probeMedia(file){const bin=process.env.FFPROBE??RenderInternals.getExecutablePath({type:'ffprobe',indent:false,logLevel:'error',binariesDirectory:null});return JSON.parse(execFileSync(bin,['-v','error','-show_format','-show_streams','-of','json',path.resolve(file)],{encoding:'utf8',env:{...process.env,...(process.platform==='darwin'?{DYLD_LIBRARY_PATH:path.dirname(bin)}:{})}}));}
