// Task receipt verification, not a repository census test.
import {readFileSync,writeFileSync} from 'node:fs';
const dir=process.argv[2];
const before=JSON.parse(readFileSync(`${dir}/before.json`,'utf8')),after=JSON.parse(readFileSync(`${dir}/after.json`,'utf8'));
const id=r=>[r.theme,r.mode,r.surface,r.name].join('/'),baseline=new Map(before.rows.map(r=>[id(r),r]));
const changed=new Set(['dir-a/dark','dir-e/light','sysop-p4-white/dark','p4-white/dark']);
const failures=[],pointerDifferences=[],decorativeDifferences=[],nativeClickDifferences=[];
const visible=['shadow','outlineStyle','outlineColor','outlineWidth','border','background','color'];
const focusRows=after.rows.filter(r=>r.name!=='Drag');
const contrast=r=>r.name==='Composer'?r.keyboard.tokenRatio:r.keyboard.indicatorRatio;
// Composer paints a border, not a shadow/outline. Confirm the recorded border
// is the token color before using its already-composited token contrast.
const rgba=s=>s.startsWith('#')?((s=s.slice(1)),(s.length===3?s.split('').map(x=>x+x).join(''):s).match(/../g).map(x=>parseInt(x,16)).map((x,i)=>i===3?x/255:x)):s.match(/[\d.]+/g).map(Number);
for(const r of [...before.rows,...after.rows].filter(r=>r.name==='Composer')){
 const a=rgba(r.keyboard.border),b=rgba(r.keyboard.token);a[3]??=1;b[3]??=1;
 if(a.some((x,i)=>Math.abs(x-b[i])>.005))failures.push('composer border does not match ring '+id(r));
}
if(after.errors.length||before.errors.length)failures.push('page errors');
if(after.rows.length!==baseline.size||after.rows.some(r=>!baseline.has(id(r))))failures.push('incomplete before/after coverage');
const cells=[...new Set(before.rows.map(r=>r.theme+'/'+r.mode))];
if(cells.length!==28||new Set(after.rows.map(r=>r.theme+'/'+r.mode)).size!==28)failures.push('incomplete 14-theme / two-mode matrix');
for(const row of focusRows){if(contrast(row)<3)failures.push(`${id(row)}: ${contrast(row)}`);}
for(const row of after.rows){
 const old=baseline.get(id(row));if(!old)continue;
 if(row.name==='Drag'){
  const fields=visible.filter(key=>old.resting[key]!==row.resting[key]);
  if(fields.length)decorativeDifferences.push({case:id(row),kind:'chat drag',fields,before:old.resting,after:row.resting});
  if(fields.length&&!changed.has(row.theme+'/'+row.mode))failures.push('unplanned drag change '+id(row));
  continue;
 }
 const fields=visible.filter(key=>old.pointer[key]!==row.pointer[key]);
 if(row.targetPointerFocusVisible){if(fields.length)nativeClickDifferences.push({case:id(row),fields});continue;}
 const painted=fields.filter(key=>key!=='outlineColor'||![old.pointer.outlineStyle,row.pointer.outlineStyle].every(v=>v==='none'||v==='hidden'));
 if(painted.length)failures.push('pointer painting changed '+id(row)+': '+painted.join(','));
 if(fields.length)pointerDifferences.push({case:id(row),fields,note:'unpainted general outline-color deliberately follows ring'});
 if(fields.length&&!changed.has(row.theme+'/'+row.mode))failures.push('unplanned pointer style difference '+id(row));
}
const nonfocus=new Map(before.nonfocus.map(r=>[[r.theme,r.mode,r.selector].join('/'),r]));
for(const row of after.nonfocus){
 const key=[row.theme,row.mode,row.selector].join('/'),old=nonfocus.get(key);if(!old){failures.push('missing nonfocus baseline '+key);continue;}
 const fields=Object.keys(row.styles).filter(k=>old.styles[k]!==row.styles[k]);
 if(fields.length)decorativeDifferences.push({case:key,kind:'workflow',fields,before:old.styles,after:row.styles});
 if(fields.length&&!changed.has(row.theme+'/'+row.mode))failures.push('unplanned decorative change '+key);
}
const names=[...new Set(focusRows.map(r=>r.name))];
const min=(rows,name)=>Math.min(...rows.filter(r=>r.name===name).map(r=>contrast(r)));
const matrix=['| Theme | Mode | Button | Input | Select | Checkbox | Tabs | Worst indicator (all controls) | Worst case after |','| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |'];
const detailed=['| Theme / mode | Control | Before | After | Worst surrounding surface after |','| --- | --- | ---: | ---: | --- |'];
for(const cell of cells){
 const [theme,mode]=cell.split('/'),a=focusRows.filter(r=>r.theme===theme&&r.mode===mode),b=before.rows.filter(r=>r.theme===theme&&r.mode===mode&&r.keyboard&&r.name!=='Drag');
 const pair=name=>`${min(b,name).toFixed(3)} → ${min(a,name).toFixed(3)}`;
 const worst=a.slice().sort((x,y)=>contrast(x)-contrast(y))[0];
 matrix.push(`| ${theme} | ${mode} | ${['Button','Input','Select','Checkbox','Tabs'].map(pair).join(' | ')} | ${Math.min(...b.map(r=>contrast(r))).toFixed(3)} → ${Math.min(...a.map(r=>contrast(r))).toFixed(3)} | ${worst.name} / ${worst.surface} |`);
 for(const name of names){const worst=a.filter(r=>r.name===name).sort((x,y)=>contrast(x)-contrast(y))[0];detailed.push(`| ${cell} | ${name} | ${min(b,name).toFixed(3)} | ${contrast(worst).toFixed(3)} | ${worst.surface} |`);}
}
const compact=['theme,mode,control,surround,before_contrast,after_contrast'];
for(const row of focusRows){const old=baseline.get(id(row));compact.push([row.theme,row.mode,row.name,row.surface,contrast(old).toFixed(6),contrast(row).toFixed(6)].join(','));}
writeFileSync(`${dir}/contrast.csv`,compact.join('\n')+'\n');
writeFileSync(`${dir}/matrix.md`,matrix.join('\n')+'\n');writeFileSync(`${dir}/controls.md`,detailed.join('\n')+'\n');
const summary={status:failures.length?'FAIL':'PASS',minimumContrast:Math.min(...focusRows.map(r=>contrast(r))),themeModes:cells,controls:names,surfaces:[...new Set(after.rows.map(r=>r.surface))],pointerPaintDifferences:failures.filter(v=>v.startsWith('pointer painting')),unpaintedPointerOutlineDifferences:pointerDifferences,nativeClickDifferences,decorativeDifferences,failures};
writeFileSync(`${dir}/verification.json`,JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({status:summary.status,minimumContrast:summary.minimumContrast,themeModes:cells.length,measuredControls:names.length,measuredSurfaces:summary.surfaces.length,pointerPaintDifferences:summary.pointerPaintDifferences.length,decorativeChangedThemeModes:[...new Set(decorativeDifferences.map(r=>r.case.split('/').slice(0,2).join('/')))],failures},null,2));
if(failures.length)process.exitCode=1;
