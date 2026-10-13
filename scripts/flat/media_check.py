import cv2,json,sys
from pathlib import Path
from PIL import Image,ImageDraw
video,plan_file,out=Path(sys.argv[1]),Path(sys.argv[2]),Path(sys.argv[3]);out.mkdir(parents=True,exist_ok=True)
plan=json.loads(plan_file.read_text());expected=round(plan['duration']*plan['fps'])
picks=[max(1,min(expected,round(expected*x/60))) for x in [1,6,10,15,20,26,31,35,40,45,50,58]]
cap=cv2.VideoCapture(str(video));fps=cap.get(cv2.CAP_PROP_FPS);count=bad=black=0;images={}
while True:
 ok,frame=cap.read()
 if not ok:break
 count+=1
 if frame.shape[:2]!=(plan['height'],plan['width']):bad+=1
 if frame.mean()<1:black+=1
 if count in picks:
  im=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB));im.save(out/f'frame-{count:04d}.jpg',quality=92);im.thumbnail((480,270));images[count]=im
cap.release();sheet=Image.new('RGB',(1440,1200),'#243c3a');draw=ImageDraw.Draw(sheet)
for i,n in enumerate(picks):
 if n not in images:continue
 x=i%3*480;y=i//3*300;sheet.paste(images[n],(x,y));draw.text((x+12,y+278),f'{n/plan["fps"]:.1f}s',fill='#fff5df')
sheet.save(out/'contact-sheet.jpg',quality=92)
report=dict(passed=count==expected and fps==plan['fps'] and bad==0 and black==0,frames=count,expected=expected,fps=fps,resolution=[plan['width'],plan['height']],bad_resolution_frames=bad,black_frames=black,keyframes=len(images),audio=('audio requested by plan; track verified separately' if plan.get('audio') else 'silent'))
(out/'media-qc.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
if not report['passed']:raise RuntimeError('Media validation failed')
