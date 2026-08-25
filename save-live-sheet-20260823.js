(function(){
'use strict';
var STATE_KEY='welog-pair-sheet-v4';
var EDITOR_UI='.direct-bounds-overlay-fixed,.welog-layout-overlay-fixed,.welog-layout-hud,.st-toolbar,.st-resize,.st-rotate,.st-v2-lock,.st-v2-del,.st-v2-resize,.direct-crop-ui,.guide-line';
function state(){try{return JSON.parse(localStorage.getItem(STATE_KEY)||'{}')||{}}catch(e){return{}}}
async function ready(sheet){
  if(document.fonts){try{await document.fonts.ready}catch(e){}}
  await Promise.all([].slice.call(sheet.querySelectorAll('img')).map(function(im){if(im.complete)return Promise.resolve();return new Promise(function(done){im.addEventListener('load',done,{once:true});im.addEventListener('error',done,{once:true});setTimeout(done,3000)})}));
  await new Promise(function(done){requestAnimationFrame(function(){requestAnimationFrame(done)})});
}
function blob(canvas){return new Promise(function(resolve,reject){canvas.toBlob(function(value){value?resolve(value):reject(new Error('PNG 변환 실패'))},'image/png')})}
async function save(){
  var sheet=document.getElementById('sheet'),button=document.getElementById('printBtn');if(!sheet||!button)return;
  var label=button.textContent;button.disabled=true;button.textContent='저장 중…';
  try{
    await ready(sheet);
    sheet.querySelectorAll(EDITOR_UI).forEach(function(el){el.dataset.exportDisplay=el.style.display;el.style.display='none'});
    var canvas=await html2canvas(sheet,{scale:2,useCORS:true,allowTaint:false,backgroundColor:null,logging:false,imageTimeout:30000,scrollX:-window.scrollX,scrollY:-window.scrollY});
    sheet.querySelectorAll(EDITOR_UI).forEach(function(el){el.style.display=el.dataset.exportDisplay||'';delete el.dataset.exportDisplay});
    var value=await blob(canvas),url=URL.createObjectURL(value),a=document.createElement('a'),name=((state().pairName||'WeLog').trim()||'WeLog');
    a.href=url;a.download=name+'.png';document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(url)},1500);
  }catch(error){console.error('WeLog PNG save failed',error);alert('PNG 저장에 실패했습니다. 새로고침 후 다시 시도해 주세요.')}
  finally{sheet.querySelectorAll(EDITOR_UI).forEach(function(el){el.style.display=el.dataset.exportDisplay||'';delete el.dataset.exportDisplay});button.disabled=false;button.textContent=label}
}
function install(){var old=document.getElementById('printBtn');if(!old)return;var button=old.cloneNode(true);old.replaceWith(button);button.dataset.liveSaveReady='9';button.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();save()},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();setTimeout(install,500);
})();