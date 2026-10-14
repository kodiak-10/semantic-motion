"""Optional keyless Edge speech, with strict service-word boundary caption mapping."""
import argparse,asyncio,json,re,hashlib
from pathlib import Path
import edge_tts

def normalize(s):return re.sub(r'[^\w]','',s.casefold()).replace('_','')
def align(captions,spoken,boundaries):
 expected=''.join(normalize(s) for s in spoken);actual=''.join(normalize(b['text']) for b in boundaries)
 if actual!=expected:raise ValueError('Speech boundary text differs from requested narration; no estimated timestamps substituted')
 positions=[];at=0
 for b in boundaries:
  n=len(normalize(b['text']))
  if n:positions.append((at,at+n,b['offset']/1e7,(b['offset']+b['duration'])/1e7));at+=n
 result=[];cursor=0
 for c,text in zip(captions,spoken):
  end=cursor+len(normalize(text));hits=[b for b in positions if b[0]<end and b[1]>cursor]
  if not hits or hits[0][0]!=cursor or hits[-1][1]!=end:raise ValueError('Caption cuts across a service word; rephrase instead of guessing')
  result.append({**c,'start':hits[0][2],'end':hits[-1][3]});cursor=end
 return result
async def run(a):
 source=json.loads(Path(a.input).read_text());caps=source['captions'];spoken=[c['text'] for c in caps]
 out=Path(a.output);out.mkdir(parents=True,exist_ok=True)
 request={'voice':a.voice,'rate':a.rate,'pitch':'+0Hz','text':'\n'.join(spoken),'boundary':'WordBoundary'}
 signature=hashlib.sha256(json.dumps(request,ensure_ascii=False,sort_keys=True).encode()).hexdigest()
 # Always generate a fresh request; do not label partial or stale media as complete.
 temp=out/'narration.partial.mp3';boundaries=[]
 with temp.open('wb') as f:
  async for chunk in edge_tts.Communicate(**request).stream():
   if chunk['type']=='audio':f.write(chunk['data'])
   elif chunk['type']=='WordBoundary':boundaries.append(chunk)
 if temp.stat().st_size==0:raise ValueError('Speech service returned no audio')
 (out/'word-boundaries.json').write_text(json.dumps(boundaries,ensure_ascii=False,indent=2))
 aligned=align(caps,spoken,boundaries)
 temp.replace(out/'narration.mp3')
 (out/'aligned-captions.json').write_text(json.dumps(aligned,ensure_ascii=False,indent=2))
 (out/'voice-provenance.json').write_text(json.dumps({'engine':'Microsoft Edge online speech via edge-tts','client_version':edge_tts.__version__,'voice':a.voice,'rate':a.rate,'synthetic_voice':True,'request_sha256':signature,'spoken_phrases':spoken,'alignment':'service WordBoundary; strict normalized text match','listening_review':'pending','emotion_control':'not supported; no custom style SSML','complete':True},ensure_ascii=False,indent=2))
 print(json.dumps({'audio':str(out/'narration.mp3'),'captions':len(aligned),'speech_end':aligned[-1]['end']},ensure_ascii=False))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('input');p.add_argument('output');p.add_argument('--voice',default='zh-CN-YunxiNeural');p.add_argument('--rate',default='+5%');asyncio.run(run(p.parse_args()))
