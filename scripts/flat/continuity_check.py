"""Flag three-second static main-picture windows; this does not measure meaning."""
import cv2,json,sys
from pathlib import Path
video,plan_file,output=map(Path,sys.argv[1:4])
plan=json.loads(plan_file.read_text());fps=plan['fps'];step=round(fps/2)
c=cv2.VideoCapture(str(video));samples={};i=0
while True:
 ok,frame=c.read()
 if not ok:break
 if i%step==0:samples[i]=cv2.cvtColor(cv2.resize(frame[165:905,64:1856],(896,370)),cv2.COLOR_BGR2GRAY)
 i+=1
c.release()
assert i==round(plan['duration']*fps),'Incomplete decoding'
windows=[]
for a in range(0,i-3*fps,step):
 changed=max(int((cv2.absdiff(samples[a],samples[b])>12).sum()) for b in range(a+step,a+3*fps+1,step))
 windows.append(dict(start=a/fps,changed_pixels=changed))
failures=[w for w in windows if w['changed_pixels']<200]
r=dict(passed=not failures,checked_windows=len(windows),failure_count=len(failures),failures=failures,scope='Main picture crop excludes captions; pixel changes are not proof of semantic animation quality.')
output.write_text(json.dumps(r,indent=2));print(json.dumps(r))
if failures:raise SystemExit(1)
