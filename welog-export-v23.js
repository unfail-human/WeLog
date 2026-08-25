(function(){
'use strict';
var VERSION='30',STATE_KEY='welog-pair-sheet-v4';
function frame(){return new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})})}
async function ready(sheet){if(document.fonts){try{await document.fonts.ready}catch(e){}}await Promise.all([].slice.call(sheet.querySelectorAll('img')).map(function(im){if(im.complete)return Promise.resolve();return new Promise(function(r){im.addEventListener('load',r,{once:true});im.addEventListener('error',r,{once:true});setTimeout(r,1800)})}));await frame()}
function filename(){try{return((JSON.parse(localStorage.getItem(STATE_KEY)||'{}').pairName||'WeLog').trim()||'WeLog')+'.png'}catch(e){return'WeLog.png'}}
function download(url){var a=document.createElement('a');a.href=url;a.download=filename();document.body.appendChild(a);a.click();a.remove()}
async function exportPng(){
 var sheet=document.getElementById('sheet'),button=document.getElementById('printBtn');if(!sheet||!button)return;
 var text=button.textContent;
 button.disabled=true;button.textContent='저장 중…';
 try{
  if(window.WeLogApplyFont)await window.WeLogApplyFont();await ready(sheet);
  if(!window.html2canvas)throw new Error('PNG renderer unavailable');
  var stage=sheet.closest('.stage')||sheet.parentElement,stageRect=stage.getBoundingClientRect(),sheetRect=sheet.getBoundingClientRect(),hidden=[];
  sheet.querySelectorAll('.direct-bounds-overlay-fixed,.welog-layout-overlay-fixed,.welog-layout-hud,.st-toolbar,.st-resize,.st-rotate,.st-v2-lock,.st-v2-del,.st-v2-resize,.direct-crop-ui,.guide-line').forEach(function(el){hidden.push([el,el.style.visibility]);el.style.visibility='hidden'});
  await frame();
  var scene,stageBg=getComputedStyle(stage).backgroundColor||'#fff';try{
   try{scene=await window.html2canvas(stage,{scale:1,useCORS:true,allowTaint:false,backgroundColor:stageBg,logging:false,imageTimeout:8000,width:Math.ceil(stageRect.width),height:Math.ceil(stageRect.height),scrollX:0,scrollY:0,onclone:function(doc){if(!doc.fonts)return;return doc.fonts.ready.then(function(){var jobs=[];doc.querySelectorAll('#sheet *').forEach(function(el){var c=doc.defaultView.getComputedStyle(el),t=(el.textContent||'').trim();if(t)jobs.push(doc.fonts.load(c.fontWeight+' '+c.fontSize+' '+c.fontFamily,t.slice(0,24)))});return Promise.all(jobs)})}})}
   catch(primary){if(!window.htmlToImage||!window.htmlToImage.toCanvas)throw primary;console.warn('html2canvas stage capture failed; using html-to-image',primary);var fontCss='';if(window.htmlToImage.getFontEmbedCSS){try{fontCss=await window.htmlToImage.getFontEmbedCSS(sheet)}catch(fontError){console.warn('font embedding failed',fontError)}}scene=await window.htmlToImage.toCanvas(stage,{pixelRatio:1,backgroundColor:stageBg,cacheBust:false,skipAutoScale:true,fontEmbedCSS:fontCss,width:Math.ceil(stageRect.width),height:Math.ceil(stageRect.height)})}
  }finally{hidden.forEach(function(x){x[0].style.visibility=x[1]})}
  var ratioX=scene.width/stageRect.width,ratioY=scene.height/stageRect.height,sx=Math.max(0,Math.round((sheetRect.left-stageRect.left)*ratioX)),sy=Math.max(0,Math.round((sheetRect.top-stageRect.top)*ratioY)),sw=Math.min(scene.width-sx,Math.round(sheetRect.width*ratioX)),sh=Math.min(scene.height-sy,Math.round(sheetRect.height*ratioY));
  var output=document.createElement('canvas');output.width=Math.max(1,sw);output.height=Math.max(1,sh);output.getContext('2d').drawImage(scene,sx,sy,sw,sh,0,0,sw,sh);var url=output.toDataURL('image/png');
  download(url);
 }catch(e){console.error('WeLog export v'+VERSION,e);alert('PNG 저장에 실패했습니다.');}
 finally{button.disabled=false;button.textContent=text}
}
function install(){var old=document.getElementById('printBtn');if(!old)return;var b=old.cloneNode(true);old.replaceWith(b);b.dataset.exportVersion=VERSION;b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();exportPng()},true)}
function notice(){var key='welog-update-v'+VERSION;try{if(localStorage.getItem(key))return;localStorage.setItem(key,'1')}catch(e){}setTimeout(function(){alert('업데이트 되었습니다.')},300)}
function start(){install();notice();setTimeout(install,700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
