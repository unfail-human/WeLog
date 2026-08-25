(function(){
'use strict';
var VERSION='34',STATE_KEY='welog-pair-sheet-v4',MAX_PIXELS=16777216;
function frame(){return new Promise(function(resolve){requestAnimationFrame(function(){requestAnimationFrame(resolve)})})}
function filename(){try{return((JSON.parse(localStorage.getItem(STATE_KEY)||'{}').pairName||'WeLog').trim()||'WeLog')+'.png'}catch(e){return'WeLog.png'}}
function download(url){var a=document.createElement('a');a.href=url;a.download=filename();document.body.appendChild(a);a.click();a.remove()}
async function ready(root){
 if(document.fonts){try{await document.fonts.ready}catch(e){}}
 await Promise.all([].slice.call(root.querySelectorAll('img')).map(function(img){
  if(img.complete)return Promise.resolve();
  return new Promise(function(resolve){img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});setTimeout(resolve,2000)})
 }));
 await frame();
}
function makeClone(sheet){
 var width=sheet.offsetWidth,height=sheet.scrollHeight,clone=sheet.cloneNode(true),wrapper=document.createElement('div');
 clone.removeAttribute('id');
 clone.setAttribute('data-welog-export','');
 clone.style.setProperty('transform','none','important');
 clone.style.setProperty('transform-origin','top left','important');
 clone.style.setProperty('margin','0','important');
 clone.style.setProperty('width',width+'px','important');
 clone.style.setProperty('min-width',width+'px','important');
 clone.style.setProperty('max-width',width+'px','important');
 clone.style.setProperty('height','auto','important');
 clone.style.setProperty('min-height',height+'px','important');
 wrapper.style.position='fixed';wrapper.style.left='0';wrapper.style.top='0';wrapper.style.width='0';wrapper.style.height='0';wrapper.style.overflow='hidden';wrapper.style.pointerEvents='none';wrapper.style.zIndex='-2147483647';
 wrapper.appendChild(clone);document.body.appendChild(wrapper);
 return{wrapper:wrapper,clone:clone};
}
function ignore(node){return !(node&&node.classList&&node.matches('.direct-bounds-overlay-fixed,.welog-layout-overlay-fixed,.welog-layout-hud,.st-toolbar,.st-resize,.st-rotate,.st-v2-lock,.st-v2-del,.st-v2-resize,.direct-crop-ui,.guide-line'))}
async function renderSheet(sheet){
 if(!window.htmlToImage||!window.htmlToImage.toPng)throw new Error('PNG renderer unavailable');
 var made=makeClone(sheet);
 try{
  await ready(made.clone);
  var rect=made.clone.getBoundingClientRect(),width=Math.max(1,Math.round(rect.width)),height=Math.max(1,Math.ceil(made.clone.scrollHeight)),ratio=Math.min(2,Math.sqrt(MAX_PIXELS/(width*height)))||1,fontCss='';
  if(window.htmlToImage.getFontEmbedCSS)fontCss=await window.htmlToImage.getFontEmbedCSS(sheet);
  return await window.htmlToImage.toPng(made.clone,{width:width,height:height,canvasWidth:width,canvasHeight:height,pixelRatio:ratio,cacheBust:true,skipAutoScale:true,backgroundColor:getComputedStyle(sheet).backgroundColor||'#fff',fontEmbedCSS:fontCss,filter:ignore});
 }finally{made.wrapper.remove()}
}
async function exportPng(){
 var sheet=document.getElementById('sheet'),button=document.getElementById('printBtn');if(!sheet||!button)return;
 var label=button.textContent;button.disabled=true;button.textContent='저장 중…';
 try{if(window.WeLogApplyFont)await window.WeLogApplyFont();await ready(sheet);download(await renderSheet(sheet))}
 catch(error){console.error('WeLog export v'+VERSION,error);alert('PNG 저장에 실패했습니다. 새로고침 후 다시 시도해 주세요.')}
 finally{button.disabled=false;button.textContent=label}
}
function install(){var old=document.getElementById('printBtn');if(!old)return;var button=old.cloneNode(true);old.replaceWith(button);button.dataset.exportVersion=VERSION;button.addEventListener('click',function(event){event.preventDefault();event.stopImmediatePropagation();exportPng()},true)}
function notice(){var key='welog-update-v'+VERSION;try{if(localStorage.getItem(key))return;localStorage.setItem(key,'1')}catch(e){}setTimeout(function(){alert('업데이트 되었습니다.')},300)}
function start(){install();notice();setTimeout(install,700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
