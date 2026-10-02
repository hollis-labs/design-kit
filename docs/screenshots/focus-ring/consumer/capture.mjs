import {chromium} from 'playwright';
import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
const [phase,out,base='http://127.0.0.1:4179']=process.argv.slice(2);
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});
const themes=['nanite-default','dir-a','dir-b','dir-d','dir-e','dir-f','sysop-p4-white','sysop-green-phosphor','sysop-amber-phosphor','sysop-hi-contrast','p4-white','p1-green-phosphor','p3-amber-phosphor','hi-contrast'];
const previous=process.env.RESUME&&existsSync(`${out}/${phase}.json`)?JSON.parse(readFileSync(`${out}/${phase}.json`,'utf8')):{};
const rows=previous.rows||[],nonfocus=previous.nonfocus||[],errors=[];
async function detail(locator,surfaces){return locator.evaluate((el,surfaces)=>{
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d',{willReadFrequently:true});
 const color=value=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=value;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].map((v,i)=>i===3?v/255:v);};
 const over=(a,b)=>{const alpha=a[3]+b[3]*(1-a[3]);return [0,1,2].map(i=>alpha?(a[i]*a[3]+b[i]*b[3]*(1-a[3]))/alpha:0).concat(alpha);};
 const lum=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
 if(ratio([0,0,0,1],[255,255,255,1])!==21||ratio([128,128,128,1],[128,128,128,1])!==1)throw Error('contrast controls');
 const background=node=>{let result=[0,0,0,0];for(let e=node;e;e=e.parentElement){result=over(result,color(getComputedStyle(e).backgroundColor));result[3]*=Number(getComputedStyle(e).opacity);}return over(result,[255,255,255,1]);};
 const read=()=>{const s=getComputedStyle(el);
 const bg=background(el.parentElement), shadowColors=s.boxShadow.match(/(?:rgba?|oklab|oklch|color)\([^)]*\)/g)||[];
 const painted=shadowColors.map(color).filter(c=>c[3]>0);
 const ringRatio=painted.length?Math.max(...painted.map(c=>ratio(over(c,bg),bg))):null;
 const outlineRatio=s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0&&color(s.outlineColor)[3]>0?ratio(over(color(s.outlineColor),bg),bg):null;
 const token=color(s.getPropertyValue('--hl-ring')), opaque=[...token.slice(0,3),1];
 return {focusVisible:el.matches(':focus-visible'),shadow:s.boxShadow,outlineStyle:s.outlineStyle,outlineColor:s.outlineColor,outlineWidth:s.outlineWidth,border:s.borderColor,background:s.backgroundColor,color:s.color,surrounding:bg,ringRatio,outlineRatio,indicatorRatio:Math.max(ringRatio||0,outlineRatio||0),token:s.getPropertyValue('--hl-ring').trim(),opaqueTokenRatio:ratio(opaque,bg),tokenRatio:ratio(over(token,bg),bg),foregroundRatio:ratio(color(s.getPropertyValue('--hl-fg')),bg)};
 };
 const section=el.closest('[data-surface]');return Object.fromEntries(surfaces.map(surface=>{section.className=surface+' p-6 flex flex-wrap gap-6 items-start';section.dataset.surface=surface;return [surface,read()];}));
 },surfaces);}
try{
const page=await browser.newPage({viewport:{width:1440,height:1200},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
for(const theme of themes)for(const mode of ['dark','light']){
 if(rows.some(r=>r.theme===theme&&r.mode===mode))continue;
 await page.goto(`${base}/?theme=${theme}&mode=${mode}`);await page.locator('[data-probe=Button]').first().waitFor();await page.addStyleTag({content:'*{transition:none!important;animation:none!important}'});
 await page.locator('select').evaluateAll(els=>els.forEach(el=>el.dataset.probe='ThemePicker'));
 await page.locator('[data-slot=scroll-area-viewport]').evaluateAll(els=>els.forEach(el=>el.dataset.probe='ScrollArea'));
 const section=page.locator('[data-surface]').first();
 await section.evaluate(active=>document.querySelectorAll('[data-surface]').forEach(el=>el.inert=el!==active));
 const surfaces=['bg-bg','bg-bg-elevated','bg-surface','bg-surface-hover','bg-surface-active','bg-selection','bg-popover'];
 async function styles(el){return detail(el,surfaces);}
 for(const el of await section.locator('[data-probe]').all()){
 const name=await el.getAttribute('data-probe');
 if(process.env.PROBES&&!process.env.PROBES.split(',').includes(name))continue;
 const target=['InputGroup','InputGroupInvalid','Composer'].includes(name)?el.locator('[data-focus]'):el;
 await page.locator('[data-reset]').click();if(name==='Drag'){await el.dispatchEvent('dragover',{dataTransfer:await page.evaluateHandle(()=>{const d=new DataTransfer();d.items.add(new File(['a'],'a.txt'));return d;})});await page.locator('[data-probe=Drag][data-dragging]').waitFor();}
 const resting=await styles(el);
 if(name==='Drag'){for(const surface of surfaces)rows.push({theme,mode,surface,name,resting:resting[surface]});continue;}
 // Isolate the probe in this measurement fixture; each focus is still reached by a real Tab.
 await target.evaluate(target=>{document.querySelectorAll('button,input,textarea,select,a,[tabindex]').forEach(el=>el.tabIndex=-1);target.tabIndex=0;document.querySelector('[data-reset]').tabIndex=0;});
 await page.locator('[data-reset]').click();await page.keyboard.press('Tab');
 if(!await target.evaluate(e=>e===document.activeElement))throw Error(`Tab unreachable: ${theme}/${mode}/${name}`);
 const keyboard=await styles(el);
 await page.locator('[data-reset]').click();await target.click();if(name.startsWith('Select')){await page.getByRole('listbox').waitFor();await page.waitForTimeout(100);}
 const pointer=await styles(el);
 const targetPointerFocusVisible=await target.evaluate(e=>e.matches(':focus-visible'));
 if(name.startsWith('Select')||name==='ThemePicker'){await page.keyboard.press('Escape');if(name.startsWith('Select'))await page.getByRole('listbox').waitFor({state:'hidden'});}
 for(const surface of surfaces)rows.push({theme,mode,surface,name,resting:resting[surface],keyboard:keyboard[surface],pointer:pointer[surface],targetPointerFocusVisible});
 }
 await page.locator('[data-reset]').click();
 await page.waitForSelector('.react-flow__edge-path');
 const selectors=['.react-flow__edge.selected .react-flow__edge-path','.react-flow__node.selected .node-container','.react-flow__node-default.selected','.react-flow__selection','.wf-connection path','.wf-connection circle','.wf-edge-temporary'];
 for(const selector of selectors){const locator=page.locator(selector).first();if(!await locator.count())throw Error('Missing nonfocus probe '+selector);nonfocus.push({theme,mode,selector,styles:await locator.evaluate(el=>{const s=getComputedStyle(el);return {stroke:s.stroke,strokeWidth:s.strokeWidth,border:s.border,outline:s.outline,background:s.backgroundColor,boxShadow:s.boxShadow};})});}
 nonfocus.push({theme,mode,selector:'workflow CSS mappings',styles:await page.locator('.kit-workflow').evaluate(el=>{const s=getComputedStyle(el);return Object.fromEntries(['--xy-edge-stroke-selected','--xy-connectionline-stroke','--xy-node-border-selected','--xy-selection-border'].map(key=>[key,s.getPropertyValue(key).trim()]));})});
 console.log(`${phase}: ${theme}/${mode}`);
 writeFileSync(`${out}/${phase}.json`,JSON.stringify({phase,rows,nonfocus,errors})+'\n');
}
if(errors.length)throw Error(errors.join('\n'));
writeFileSync(`${out}/${phase}.json`,'{"phase":'+JSON.stringify(phase)+',"rows":[\n'+rows.map(row=>JSON.stringify(row)).join(',\n')+'],"nonfocus":[\n'+nonfocus.map(row=>JSON.stringify(row)).join(',\n')+'],"errors":'+JSON.stringify(errors)+'}\n');
}finally{await browser.close();}
