(function(){
'use strict';
var STATE_KEY='welog-pair-sheet-v4';
var EDITOR_UI='.direct-bounds-overlay-fixed,.welog-layout-overlay-fixed,.welog-layout-hud,.st-toolbar,.st-resize,.st-rotate,.st-v2-lock,.st-v2-del,.st-v2-resize,.direct-crop-ui,.guide-line';
function state(){try{return JSON.parse(localStorage.getItem(STATE_KEY)||'{}')||{}}catch(e){return{}}}
function nextFrame(){return new Promise(function(done){requestAnimationFrame(function(){requestAnimationFrame(done)})})}
function waitImages(sheet){return Promise.all([].slice.call(sheet.querySelectorAll('img')).map(function(im){if(im.complete)return Promise.resolve();return new Promise(function(done){im.addEventListener('load',done,{once:true});im.addEventListener('error',done,{once:true});setTimeout(done,1200)})}))}
async function waitFonts(){if(!document.fonts)return;try{await document.fonts.ready;var jobs=[];document.querySelectorAll('#sheet *').forEach(function(el){var c=getComputedStyle(el),text=(el.textContent||'').trim();if(text)jobs.push(document.fonts.load(c.fontWeight+' '+c.fontSize+' '+c.fontFamily,text.slice(0,24)))});await Promise.all(jobs)}catch(e){}}
function freezeTypography(source,copy){var from=[source].concat([].slice.call(source.querySelectorAll('*'))),to=[copy].concat([].slice.call(copy.querySelectorAll('*')));from.forEach(function(el,i){if(!to[i])return;var c=getComputedStyle(el);to[i].style.setProperty('font-family',c.fontFamily,'important');to[i].style.setProperty('font-size',c.fontSize,'important');to[i].style.setProperty('font-weight',c.fontWeight,'important');to[i].style.setProperty('font-style',c.fontStyle,'important');to[i].style.setProperty('line-height',c.lineHeight,'important');to[i].style.setProperty('letter-spacing',c.letterSpacing,'important')})}
async function save(){
  var sheet=document.getElementById('sheet'),button=document.getElementById('printBtn');if(!sheet||!button)return;
  var label=button.textContent,hidden=[],scrollState=[],oldTransform=sheet.style.transform,oldOrigin=sheet.style.transformOrigin;
  button.disabled=true;button.textContent='저장 중…';
  try{
    await Promise.all([waitImages(sheet),waitFonts()]);await nextFrame();
    sheet.querySelectorAll(EDITOR_UI).forEach(function(el){hidden.push([el,el.style.visibility]);el.style.visibility='hidden'});
    for(var node=sheet.parentElement;node&&node!==document.body;node=node.parentElement){scrollState.push([node,node.scrollLeft,node.scrollTop,node.style.overflow]);node.scrollLeft=0;node.scrollTop=0;if(node.classList.contains('stage')||node.classList.contains('welog-fit-preview-viewport'))node.style.overflow='visible'}
    sheet.style.transform='none';sheet.style.transformOrigin='top left';await nextFrame();
    var background=getComputedStyle(sheet).backgroundColor||'#ffffff';
    var options={scale:1,useCORS:true,allowTaint:false,backgroundColor:background,logging:false,imageTimeout:2500,removeContainer:true,onclone:function(doc){var copy=doc.getElementById('sheet');if(!copy)return;copy.style.setProperty('transform','none','important');copy.style.setProperty('transform-origin','top left','important');for(var p=copy.parentElement;p&&p!==doc.body;p=p.parentElement){p.scrollLeft=0;p.scrollTop=0;if(p.classList.contains('stage')||p.classList.contains('welog-fit-preview-viewport'))p.style.setProperty('overflow','visible','important')}}};
    var dataUrl;
    try{var canvas=await html2canvas(sheet,options);dataUrl=canvas.toDataURL('image/png')}
    catch(first){if(!window.htmlToImage||!window.htmlToImage.toPng)throw first;dataUrl=await window.htmlToImage.toPng(sheet,{pixelRatio:1,cacheBust:false,backgroundColor:background})}
    var a=document.createElement('a'),name=((state().pairName||'WeLog').trim()||'WeLog');
    a.href=dataUrl;a.download=name+'.png';document.body.appendChild(a);a.click();a.remove();
  }catch(error){console.error('WeLog PNG save failed',error);alert('PNG 저장에 실패했습니다. 새로고침 후 다시 시도해 주세요.')}
  finally{hidden.forEach(function(x){x[0].style.visibility=x[1]});scrollState.forEach(function(x){x[0].scrollLeft=x[1];x[0].scrollTop=x[2];x[0].style.overflow=x[3]});sheet.style.transform=oldTransform;sheet.style.transformOrigin=oldOrigin;button.disabled=false;button.textContent=label}
}
function install(){var old=document.getElementById('printBtn');if(!old)return;var button=old.cloneNode(true);old.replaceWith(button);button.dataset.liveSaveReady='21';button.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();save()},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();setTimeout(install,500);
})();
