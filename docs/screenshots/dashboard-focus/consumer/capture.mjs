import {chromium} from 'playwright';
import {mkdirSync, writeFileSync} from 'node:fs';
const [phase,out,base='http://127.0.0.1:4176']=process.argv.slice(2);
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH});
const results=[], errors=[];
function assert(value,message){if(!value)throw Error(message);}
async function style(locator){return locator.evaluate(e=>{const s=getComputedStyle(e);return {text:e.textContent,focusVisible:e.matches(':focus-visible'),focused:e===document.activeElement,shadow:s.boxShadow,outlineStyle:s.outlineStyle,outlineColor:s.outlineColor,outlineWidth:s.outlineWidth,background:s.backgroundColor,color:s.color,border:s.borderColor,highlighted:e.hasAttribute('data-highlighted')};});}
async function contrast(locator){return locator.evaluate(el=>{
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});canvas.width=canvas.height=1;
 const color=s=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=s;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].map((x,i)=>i===3?x/255:x);};
 const over=(a,b)=>{const alpha=a[3]+b[3]*(1-a[3]);return [0,1,2].map(i=>alpha?(a[i]*a[3]+b[i]*b[3]*(1-a[3]))/alpha:0).concat(alpha);};
 const lum=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
 const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
 if(Math.abs(ratio([0,0,0,1],[255,255,255,1])-21)>.001||Math.abs(ratio([128,128,128,1],[128,128,128,1])-1)>.001)throw Error('Contrast controls failed');
 let bg=color(getComputedStyle(el).backgroundColor),fg=over(color(getComputedStyle(el).color),bg);
 for(let e=el;e;e=e.parentElement){if(e!==el){const parent=color(getComputedStyle(e).backgroundColor);fg=over(fg,parent);bg=over(bg,parent);}const opacity=Number(getComputedStyle(e).opacity);fg[3]*=opacity;bg[3]*=opacity;}
 fg=over(fg,[255,255,255,1]);bg=over(bg,[255,255,255,1]);
 return {text:el.textContent,className:el.className,foreground:fg.slice(0,3).map(Math.round),background:bg.slice(0,3).map(Math.round),ratio:Number(ratio(fg,bg).toFixed(3))};
 });}
const visibleRing=s=>s.shadow!=='none'&& !s.shadow.match(/^rgba\(0, 0, 0, 0\) 0px 0px 0px 0px(?:, rgba\(0, 0, 0, 0\) 0px 0px 0px 0px)*$/)||s.outlineStyle!=='none'&&s.outlineColor!=='rgba(0, 0, 0, 0)'&&parseFloat(s.outlineWidth)>0;
for(const theme of ['p4-white','p1-green-phosphor','p3-amber-phosphor','hi-contrast'])for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:1000},locale:'en-US',timezoneId:'UTC'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`${base}/?theme=${theme}`);await page.getByRole('button',{name:'Refresh',exact:true}).waitFor();await page.waitForTimeout(400);
 const row={theme,width,buttons:[],glyphs:[]};
 const names=['Refresh','Actions','Retry Diagnostics','Copy Diagnostics data'];
 for(const name of names){
  const locator=page.getByRole('button',{name,exact:true});
  // Follow the actual Tab order, with no programmatic .focus().
  for(let n=0;n<12;n++){await page.keyboard.press('Tab');if(await locator.evaluate(e=>e===document.activeElement))break;}
  await page.waitForTimeout(300);const keyboard=await style(locator);assert(keyboard.focused&&keyboard.focusVisible,`${name} not reached with Tab`);
  if(phase==='after')assert(visibleRing(keyboard),`${theme} ${name} missing keyboard ring`);
  if(name!=='Actions')await page.screenshot({path:`${out}/${theme}-${width}-${phase}-${name==='Refresh'?'focus':name.startsWith('Retry')?'retry':'copy'}.png`});
  row.buttons.push({name,keyboard});
 }
 await page.reload();await page.getByRole('button',{name:'Refresh',exact:true}).waitFor();await page.waitForTimeout(350);
 for(const name of names){const locator=page.getByRole('button',{name,exact:true});await locator.click();await page.waitForTimeout(300);const mouse=await style(locator);if(name==='Actions'){await page.getByRole('menuitem',{name:'Inspect',exact:true}).click();await page.waitForTimeout(250);}assert(!mouse.focusVisible,`${name} pointer matches focus-visible`);assert(!visibleRing(mouse),`${name} pointer ring`);row.buttons.find(x=>x.name===name).mouse=mouse;}
 await page.reload();await page.getByRole('button',{name:'Refresh',exact:true}).waitFor();await page.waitForTimeout(350);
 await page.keyboard.press('Tab');await page.keyboard.press('Tab');await page.keyboard.press('ArrowDown');
 const item=page.getByRole('menuitem',{name:'Inspect',exact:true});await item.waitFor();await page.waitForTimeout(250);
 const menuKeyboard=await style(item), sibling=await style(page.getByRole('menuitem',{name:'Export',exact:true}));
 assert(menuKeyboard.focused&&menuKeyboard.highlighted,'Menu item not keyboard highlighted');
 assert(menuKeyboard.background!==sibling.background,'Menu keyboard highlight invisible');
 if(phase==='after')assert(visibleRing(menuKeyboard),'Menu keyboard outline missing');
 await page.screenshot({path:`${out}/${theme}-${width}-${phase}-menu.png`});
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'Actions',exact:true}).click();await item.click();await page.waitForTimeout(200);
 // Menu closes on selection; inspect its pointer state before selecting on a fresh open.
 await page.getByRole('button',{name:'Actions',exact:true}).click();await item.hover();await page.waitForTimeout(200);const menuPointer=await style(item);assert(!menuPointer.focusVisible,'Pointer menu focus-visible');assert(!visibleRing(menuPointer),'Pointer menu ring');
 // Observe a real click before Base UI unmounts the selected item.
 await item.evaluate(el=>{el.addEventListener('click',()=>{const s=getComputedStyle(el);window.menuClick={text:el.textContent,focused:el===document.activeElement,focusVisible:el.matches(':focus-visible'),shadow:s.boxShadow,outlineStyle:s.outlineStyle,outlineColor:s.outlineColor,outlineWidth:s.outlineWidth,background:s.backgroundColor,highlighted:el.hasAttribute('data-highlighted')};},{capture:true,once:true});});
 await item.click();const menuClick=await page.evaluate(()=>window.menuClick);assert(!menuClick.focusVisible&&!visibleRing(menuClick),'Clicked menu ring');await item.waitFor({state:'hidden'});
 row.menu={keyboard:menuKeyboard,unfocused:sibling,pointer:menuPointer,mouseClick:menuClick};
 const glyph=page.locator('th[aria-sort="none"] button span').first();row.glyphs.push({state:'unsorted',...await contrast(glyph)});
 if(phase==='after')assert(row.glyphs[0].ratio>=3,'Unsorted contrast <3');
 await page.screenshot({path:`${out}/${theme}-${width}-${phase}-sort.png`});
 await page.getByRole('button',{name:'Service',exact:false}).click();await page.waitForTimeout(250);
 row.glyphs.push({state:'sorted',...await contrast(page.locator('th[aria-sort="ascending"] button span'))});
 assert(row.glyphs[1].ratio>row.glyphs[0].ratio,'Sorted glyph is not stronger');
 await page.screenshot({path:`${out}/${theme}-${width}-${phase}-sorted.png`});
 results.push(row);await context.close();
}
await browser.close();assert(errors.length===0,errors.join('\n'));writeFileSync(`${out}/${phase}.json`,JSON.stringify({phase,browser:'headless Chromium',results,errors},null,2));
console.log(JSON.stringify({phase,cases:results.length,ratios:results.map(x=>({theme:x.theme,width:x.width,glyphs:x.glyphs.map(g=>({state:g.state,ratio:g.ratio}))}))}));
