(function(){
'use strict';
var VERSION='32',STATE_KEY='welog-pair-sheet-v4';
function frame(){return new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})})}
async function ready(sheet){if(document.fonts){try{await document.fonts.ready}catch(e){}}await Promise.all([].slice.call(sheet.querySelectorAll('img')).map(function(im){if(im.complete)return Promise.resolve();return new Promise(function(r){im.addEventListener('load',r,{once:true});im.addEventListener('error',r,{once:true});setTimeout(r,1800)})}));await frame()}
function filename(){try{return((JSON.parse(localStorage.getItem(STATE_KEY)||'{}').pairName||'WeLog').trim()||'WeLog')+'.png'}catch(e){return'WeLog.png'}}
function download(url){var a=document.createElement('a');a.href=url;a.download=filename();document.body.appendChild(a);a.click();a.remove()}
async function captureRealPixels(sheet){
 if(!navigator.mediaDevices||!navigator.mediaDevices.getDisplayMedia)throw new Error('screen capture unavailable');
 var stream=await navigator.mediaDevices.getDisplayMedia({video:{displaySurface:'browser',frameRate:{ideal:1,max:5}},audio:false,preferCurrentTab:true,selfBrowserSurface:'include',surfaceSwitching:'exclude'}),video=document.createElement('video');
 try{video.muted=true;video.srcObject=stream;await video.play();await new Promise(function(resolve){if(video.readyState>=2){requestAnimationFrame(resolve);return}video.onloadeddata=function(){requestAnimationFrame(resolve)}});var r=sheet.getBoundingClientRect(),sx=video.videoWidth/window.innerWidth,sy=video.videoHeight/window.innerHeight,x=Math.max(0,Math.round(r.left*sx)),y=Math.max(0,Math.round(r.top*sy)),w=Math.min(video.videoWidth-x,Math.round(r.width*sx)),h=Math.min(video.videoHeight-y,Math.round(r.height*sy)),canvas=document.createElement('canvas');canvas.width=Math.max(1,w);canvas.height=Math.max(1,h);canvas.getContext('2d').drawImage(video,x,y,w,h,0,0,w,h);return canvas.toDataURL('image/png')}
 finally{stream.getTracks().forEach(function(track){track.stop()});video.srcObject=null}
}
async function exportPng(){
 var sheet=document.getElementById('sheet'),button=document.getElementById('printBtn');if(!sheet||!button)return;
 var text=button.textContent;
 button.disabled=true;button.textContent='저장 중…';
 try{
  if(window.WeLogApplyFont)await window.WeLogApplyFont();await ready(sheet);
  try{var exactUrl=await captureRealPixels(sheet);download(exactUrl);return}catch(screenError){if(screenError&&screenError.name==='NotAllowedError')throw new Error('현재 탭 캡처가 취소되었습니다.');console.warn('real pixel capture unavailable; using renderer fallback',screenError)}
  if(!window.html2canvas)throw new Error('PNG renderer unavailable');
  var stage=sheet.closest('.stage')||sheet.parentElement,stageRect=stage.getBoundingClientRect(),sheetRect=sheet.getBoundingClientRect(),hidden=[];
  sheet.querySelectorAll('.direct-bounds-overlay-fixed,.welog-layout-overlay-fixed,.welog-layout-hud,.st-toolbar,.st-resize,.st-rotate,.st-v2-lock,.st-v2-del,.st-v2-resize,.direct-crop-ui,.guide-line').forEach(function(el){hidden.push([el,el.style.visibility]);el.style.visibility='hidden'});
  await frame();
  var scene,stageBg=getComputedStyle(stage).backgroundColor||'#fff';try{
   try{if(!window.htmlToImage||!window.htmlToImage.toCanvas)throw new Error('html-to-image unavailable');var fontCss='';if(window.htmlToImage.getFontEmbedCSS){try{fontCss=await window.htmlToImage.getFontEmbedCSS(stage)}catch(fontError){console.warn('font embedding skipped',fontError)}}scene=await window.htmlToImage.toCanvas(stage,{pixelRatio:1,backgroundColor:stageBg,cacheBust:false,skipAutoScale:true,fontEmbedCSS:fontCss,width:Math.ceil(stageRect.width),height:Math.ceil(stageRect.height)})}
   catch(primary){console.warn('work-screen clone failed; using canvas fallback',primary);scene=await window.html2canvas(stage,{scale:1,useCORS:true,allowTaint:false,backgroundColor:stageBg,logging:false,imageTimeout:8000,width:Math.ceil(stageRect.width),height:Math.ceil(stageRect.height),scrollX:0,scrollY:0,onclone:function(doc){if(!doc.fonts)return;return doc.fonts.ready}})}
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
