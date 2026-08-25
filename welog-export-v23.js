(function(){
'use strict';
var VERSION='25',STATE_KEY='welog-pair-sheet-v4';
function frame(){return new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})})}
async function ready(sheet){if(document.fonts){try{await document.fonts.ready}catch(e){}}await Promise.all([].slice.call(sheet.querySelectorAll('img')).map(function(im){if(im.complete)return Promise.resolve();return new Promise(function(r){im.addEventListener('load',r,{once:true});im.addEventListener('error',r,{once:true});setTimeout(r,1800)})}));await frame()}
function filename(){try{return((JSON.parse(localStorage.getItem(STATE_KEY)||'{}').pairName||'WeLog').trim()||'WeLog')+'.png'}catch(e){return'WeLog.png'}}
function download(url){var a=document.createElement('a');a.href=url;a.download=filename();document.body.appendChild(a);a.click();a.remove()}
async function exportPng(){
 var sheet=document.getElementById('sheet'),button=document.getElementById('printBtn');if(!sheet||!button)return;
 var text=button.textContent;
 button.disabled=true;button.textContent='저장 중…';
 try{
  await ready(sheet);
  var bg=getComputedStyle(sheet).backgroundColor||'#fff',url,embed='';
  if(window.htmlToImage&&window.htmlToImage.toPng){
   if(window.htmlToImage.getFontEmbedCSS){try{embed=await window.htmlToImage.getFontEmbedCSS(sheet)}catch(fontError){console.warn('font embed skipped',fontError)}}
   url=await window.htmlToImage.toPng(sheet,{pixelRatio:1,backgroundColor:bg,cacheBust:false,skipAutoScale:true,fontEmbedCSS:embed,filter:function(node){return !(node.matches&&node.matches('.direct-bounds-overlay-fixed,.welog-layout-overlay-fixed,.welog-layout-hud,.st-toolbar,.st-resize,.st-rotate,.st-v2-lock,.st-v2-del,.st-v2-resize,.direct-crop-ui,.guide-line'))}});
  }else if(window.html2canvas){
   var canvas=await window.html2canvas(sheet,{scale:1,useCORS:true,backgroundColor:bg,logging:false,imageTimeout:4000});url=canvas.toDataURL('image/png');
  }else throw new Error('PNG renderer unavailable');
  download(url);
 }catch(e){console.error('WeLog export v'+VERSION,e);alert('PNG 저장에 실패했습니다.');}
 finally{button.disabled=false;button.textContent=text}
}
function install(){var old=document.getElementById('printBtn');if(!old)return;var b=old.cloneNode(true);old.replaceWith(b);b.dataset.exportVersion=VERSION;b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();exportPng()},true)}
function notice(){var key='welog-update-v'+VERSION;try{if(localStorage.getItem(key))return;localStorage.setItem(key,'1')}catch(e){}setTimeout(function(){alert('업데이트 되었습니다.')},300)}
function start(){install();notice();setTimeout(install,700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
