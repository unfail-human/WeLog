(function(){
'use strict';
var STATE_KEY='welog-pair-sheet-v4';
function readState(){try{return JSON.parse(localStorage.getItem(STATE_KEY)||'{}')||{}}catch(e){return{}}}
async function waitReady(sheet){if(document.fonts){try{await document.fonts.ready}catch(e){}}var imgs=[].slice.call(sheet.querySelectorAll('img'));await Promise.all(imgs.map(function(im){if(im.complete)return Promise.resolve();return new Promise(function(r){im.addEventListener('load',r,{once:true});im.addEventListener('error',r,{once:true});setTimeout(r,2500)})}));await new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})})}
function hideEditorOverlays(sheet){var list=[].slice.call(sheet.querySelectorAll('.direct-bounds-overlay-fixed,.welog-layout-overlay-fixed,.welog-layout-hud,.st-toolbar,.st-resize,.st-rotate,.st-v2-lock,.st-v2-del,.st-v2-resize,.direct-crop-ui,.guide-line'));var prev=list.map(function(el){return{el:el,visibility:el.style.visibility}});list.forEach(function(el){el.style.setProperty('visibility','hidden','important')});return function(){prev.forEach(function(x){x.el.style.visibility=x.visibility})}}
function prepareFullHeight(sheet){var grid=sheet.querySelector('.sheet-grid');var old={sheetHeight:sheet.style.height,sheetMinHeight:sheet.style.minHeight,sheetMaxHeight:sheet.style.maxHeight,sheetOverflow:sheet.style.overflow,gridHeight:grid&&grid.style.height,gridMinHeight:grid&&grid.style.minHeight,gridMaxHeight:grid&&grid.style.maxHeight,gridOverflow:grid&&grid.style.overflow};
  var fixedWidth=sheet.offsetWidth;
  sheet.style.setProperty('width',fixedWidth+'px','important');
  sheet.style.setProperty('min-width',fixedWidth+'px','important');
  sheet.style.setProperty('max-width',fixedWidth+'px','important');
  sheet.style.setProperty('height','auto','important');
  sheet.style.setProperty('max-height','none','important');
  sheet.style.setProperty('overflow','hidden','important');
  if(grid){grid.style.setProperty('height','auto','important');grid.style.setProperty('max-height','none','important');grid.style.setProperty('overflow','visible','important')}
  var sr=sheet.getBoundingClientRect(),bottom=sr.top;
  sheet.querySelectorAll('.profile,.text-block,.commission-block,.center,.pair-block,.sheet-grid').forEach(function(el){var r=el.getBoundingClientRect();if(r.bottom>bottom)bottom=r.bottom});
  var needed=Math.max(sheet.scrollHeight,Math.ceil(bottom-sr.top),sheet.offsetHeight);
  sheet.style.setProperty('min-height',needed+'px','important');
  sheet.style.setProperty('height',needed+'px','important');
  return {width:fixedWidth,height:needed,restore:function(){sheet.style.height=old.sheetHeight;sheet.style.minHeight=old.sheetMinHeight;sheet.style.maxHeight=old.sheetMaxHeight;sheet.style.overflow=old.sheetOverflow;sheet.style.removeProperty('width');sheet.style.removeProperty('min-width');sheet.style.removeProperty('max-width');if(grid){grid.style.height=old.gridHeight||'';grid.style.minHeight=old.gridMinHeight||'';grid.style.maxHeight=old.gridMaxHeight||'';grid.style.overflow=old.gridOverflow||''}}}
}
function downloadBlob(blob,name){var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name+'.png';document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(u)},1500)}
async function canvasBlob(canvas){return await new Promise(function(res,rej){canvas.toBlob(function(b){b?res(b):rej(new Error('PNG blob creation failed'))},'image/png')})}
async function capture(sheet,w,h){if(!window.html2canvas)throw new Error('html2canvas unavailable');return await window.html2canvas(sheet,{scale:2,useCORS:true,allowTaint:false,backgroundColor:null,logging:false,imageTimeout:30000,foreignObjectRendering:false,removeContainer:true,width:w,height:h,windowWidth:Math.max(window.innerWidth,w+80),windowHeight:Math.max(window.innerHeight,h+80),scrollX:0,scrollY:0})}
async function saveLive(){var sheet=document.getElementById('sheet'),btn=document.getElementById('printBtn');if(!sheet||!btn)return;var old=btn.textContent,restoreOverlay=function(){},prepared=null;btn.disabled=true;btn.textContent='저장 중…';try{await waitReady(sheet);restoreOverlay=hideEditorOverlays(sheet);prepared=prepareFullHeight(sheet);await new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})});var canvas=await capture(sheet,prepared.width,prepared.height),blob=await canvasBlob(canvas),name=((readState().pairName||'WeLog').trim()||'WeLog');downloadBlob(blob,name)}catch(e){console.error('full-height live sheet save failed',e);alert('PNG 저장에 실패했습니다. 다시 시도해 주세요.')}finally{try{if(prepared)prepared.restore()}catch(e){}try{restoreOverlay()}catch(e){}btn.disabled=false;btn.textContent=old}}
function install(){var old=document.getElementById('printBtn');if(!old)return;var b=old.cloneNode(true);b.dataset.liveSaveReady='6';old.replaceWith(b);b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();saveLive()},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();setTimeout(install,500);
})();