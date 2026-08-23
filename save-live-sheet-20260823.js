(function(){
'use strict';
var STATE_KEY='welog-pair-sheet-v4';
function readState(){try{return JSON.parse(localStorage.getItem(STATE_KEY)||'{}')||{}}catch(e){return{}}}
async function waitReady(sheet){if(document.fonts){try{await document.fonts.ready}catch(e){}}var imgs=[].slice.call(sheet.querySelectorAll('img'));await Promise.all(imgs.map(function(im){if(im.complete)return Promise.resolve();return new Promise(function(r){im.addEventListener('load',r,{once:true});im.addEventListener('error',r,{once:true});setTimeout(r,2500)})}));await new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})})}
function hideEditorOverlays(sheet){var list=[].slice.call(sheet.querySelectorAll('.direct-bounds-overlay-fixed,.welog-layout-overlay-fixed,.welog-layout-hud,.st-toolbar,.st-resize,.st-rotate,.st-v2-lock,.st-v2-del,.st-v2-resize,.direct-crop-ui,.guide-line'));var prev=list.map(function(el){return{el:el,display:el.style.display,visibility:el.style.visibility}});list.forEach(function(el){el.style.setProperty('visibility','hidden','important')});return function(){prev.forEach(function(x){x.el.style.display=x.display;x.el.style.visibility=x.visibility})}}
async function saveLive(){var sheet=document.getElementById('sheet'),btn=document.getElementById('printBtn');if(!sheet||!btn||!window.html2canvas)return;var old=btn.textContent,restore=function(){};btn.disabled=true;btn.textContent='저장 중…';try{
  await waitReady(sheet);
  restore=hideEditorOverlays(sheet);
  await new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})});
  /* Important: do not clone, resize, reposition, or provide width/height/windowWidth. html2canvas reads the live rendered #sheet exactly as it is on screen. */
  var canvas=await window.html2canvas(sheet,{scale:Math.max(2,window.devicePixelRatio||1),useCORS:true,allowTaint:false,backgroundColor:null,logging:false,imageTimeout:30000,scrollX:-window.scrollX,scrollY:-window.scrollY});
  var blob=await new Promise(function(res,rej){canvas.toBlob(function(b){b?res(b):rej(new Error('blob'))},'image/png')});
  var u=URL.createObjectURL(blob),a=document.createElement('a'),name=((readState().pairName||'WeLog').trim()||'WeLog');a.href=u;a.download=name+'.png';document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(u)},1200);
}catch(e){console.error('live sheet save failed',e);alert('PNG 저장에 실패했습니다. 다시 시도해 주세요.')}finally{try{restore()}catch(e){}btn.disabled=false;btn.textContent=old}}
function install(){var old=document.getElementById('printBtn');if(!old)return;var b=old.cloneNode(true);b.dataset.liveSaveReady='2';old.replaceWith(b);b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();saveLive()},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();setTimeout(install,350);
})();