(function(){
'use strict';
var STATE_KEY='welog-pair-sheet-v4';
var EDITOR_UI='.direct-bounds-overlay-fixed,.welog-layout-overlay-fixed,.welog-layout-hud,.st-toolbar,.st-resize,.st-rotate,.st-v2-lock,.st-v2-del,.st-v2-resize,.direct-crop-ui,.guide-line';
function readState(){try{return JSON.parse(localStorage.getItem(STATE_KEY)||'{}')||{}}catch(e){return{}}}
async function waitReady(sheet){
  if(document.fonts){try{await document.fonts.ready}catch(e){}}
  var imgs=[].slice.call(sheet.querySelectorAll('img'));
  await Promise.all(imgs.map(function(im){if(im.complete)return Promise.resolve();return new Promise(function(r){im.addEventListener('load',r,{once:true});im.addEventListener('error',r,{once:true});setTimeout(r,3000)})}));
  await new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})});
}
function measure(sheet){\n  var r=sheet.getBoundingClientRect();\n  return{width:Math.round(sheet.offsetWidth||r.width),height:Math.round(sheet.offsetHeight||r.height)};\n}
function downloadBlob(blob,name){var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name+'.png';document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(u)},1500)}
function canvasBlob(canvas){return new Promise(function(res,rej){try{canvas.toBlob(function(b){b?res(b):rej(new Error('PNG blob creation failed'))},'image/png')}catch(e){rej(e)}})}
async function captureWithCanvas(sheet,size){
  if(!window.html2canvas)throw new Error('html2canvas unavailable');
  return window.html2canvas(sheet,{
    scale:Math.max(2,Math.min(3,window.devicePixelRatio||1)),
    useCORS:true,
    allowTaint:false,
    backgroundColor:null,
    logging:false,
    imageTimeout:30000,
    foreignObjectRendering:false,
    removeContainer:true,
    width:size.width,
    height:size.height,
    windowWidth:document.documentElement.clientWidth,
    windowHeight:document.documentElement.clientHeight,
    onclone:function(doc){
      var clone=doc.getElementById('sheet');if(!clone)return;
      clone.style.setProperty('width',size.width+'px','important');
      clone.style.setProperty('min-width',size.width+'px','important');
      clone.style.setProperty('max-width',size.width+'px','important');
      clone.style.setProperty('height',size.height+'px','important');
      clone.style.setProperty('min-height',size.height+'px','important');
      clone.style.setProperty('max-height','none','important');
      clone.style.setProperty('overflow','visible','important');
      clone.style.setProperty('transform','none','important');
      clone.style.setProperty('zoom','1','important');
      clone.querySelectorAll(EDITOR_UI).forEach(function(el){el.style.setProperty('display','none','important')});
      clone.querySelectorAll('.sheet-grid,.profile,.center').forEach(function(el){el.style.setProperty('max-height','none','important');el.style.setProperty('overflow','visible','important')});
    }
  });
}
async function captureFallback(sheet,size){
  if(!window.htmlToImage||!window.htmlToImage.toPng)throw new Error('html-to-image unavailable');
  var url=await window.htmlToImage.toPng(sheet,{
    pixelRatio:2,
    cacheBust:true,
    backgroundColor:null,
    width:size.width,
    height:size.height,
    skipAutoScale:false,
    filter:function(node){return !(node.matches&&node.matches(EDITOR_UI));},
    style:{width:size.width+'px',minWidth:size.width+'px',maxWidth:size.width+'px',height:size.height+'px',minHeight:size.height+'px',maxHeight:'none',overflow:'visible',transform:'none'}
  });
  var resp=await fetch(url);if(!resp.ok)throw new Error('fallback conversion failed');return resp.blob();
}
async function saveLive(){
  var sheet=document.getElementById('sheet'),btn=document.getElementById('printBtn');if(!sheet||!btn)return;
  var old=btn.textContent;btn.disabled=true;btn.textContent='저장 중…';
  try{
    await waitReady(sheet);
    var size=measure(sheet),blob;
    try{blob=await canvasBlob(await captureWithCanvas(sheet,size));}
    catch(first){console.warn('html2canvas failed, using fallback',first);blob=await captureFallback(sheet,size);}
    var name=((readState().pairName||'WeLog').trim()||'WeLog');downloadBlob(blob,name);
  }catch(e){console.error('WeLog PNG save failed',e);alert('PNG 저장에 실패했습니다. 새로고침 후 다시 시도해 주세요.');}
  finally{btn.disabled=false;btn.textContent=old;}
}
function install(){var old=document.getElementById('printBtn');if(!old)return;var b=old.cloneNode(true);old.replaceWith(b);b.dataset.liveSaveReady='7';b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();saveLive()},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();setTimeout(install,500);
})();