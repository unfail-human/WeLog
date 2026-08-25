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
    var canvas;try{canvas=await html2canvas(sheet,{scale:2,useCORS:true,allowTaint:false,backgroundColor:getComputedStyle(sheet).backgroundColor||'#ffffff',logging:false,imageTimeout:30000});}catch(first){if(!window.htmlToImage||!window.htmlToImage.toCanvas)throw first;canvas=await window.htmlToImage.toCanvas(sheet,{pixelRatio:2,cacheBust:true,backgroundColor:getComputedStyle(sheet).backgroundColor||'#ffffff',filter:function(node){return !(node.matches&&node.matches(EDITOR_UI))}});}
    sheet.querySelectorAll(EDITOR_UI).forEach(function(el){el.style.display=el.dataset.exportDisplay||'';delete el.dataset.exportDisplay});
    var value=await blob(canvas),url=URL.createObjectURL(value),a=document.createElement('a'),name=((state().pairName||'WeLog').trim()||'WeLog');
    a.href=url;a.download=name+'.png';document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(url)},1500);
  }catch(error){console.error('WeLog PNG save failed',error);alert('PNG 저장에 실패했습니다. 새로고침 후 다시 시도해 주세요.')}
  finally{sheet.querySelectorAll(EDITOR_UI).forEach(function(el){el.style.display=el.dataset.exportDisplay||'';delete el.dataset.exportDisplay});button.disabled=false;button.textContent=label}
}

function installWardrobeSync(){
  var busy=false,wardrobeLiveSrc='';
  function read(){try{return JSON.parse(localStorage.getItem(STATE_KEY)||'{}')||{}}catch(e){return{}}}
  function sync(){
    if(busy)return;busy=true;
    try{
      var sheet=document.getElementById('sheet');if(!sheet)return;
      var s=read(),panelImage=document.querySelector('.wardrobe-combined-preview img'),panelCheck=document.querySelector('.wardrobe-combined-control [data-bool-path="wardrobeEnabled"]');
      var src=(panelImage&&panelImage.getAttribute('src'))||wardrobeLiveSrc||s.wardrobeImage||'';
      var enabled=panelCheck?panelCheck.checked:(s.wardrobeEnabled!==false&&!!src);
      enabled=enabled&&!!src;
      var grid=sheet.querySelector('.sheet-grid');if(!grid)return;
      var current=grid.querySelector(':scope > .sheet-wardrobe');
      if(!enabled){if(current)current.remove();return}
      if(current&&current.querySelector('.wardrobe-combined-card img')&&current.querySelector('.wardrobe-combined-card img').getAttribute('src')===src)return;
      if(current)current.remove();
      var section=document.createElement('section');section.className='sheet-wardrobe';
      section.innerHTML='<div class="wardrobe-section-title"><span></span><h2>옷장</h2><span></span></div><button type="button" class="wardrobe-combined-card" data-edit-image="wardrobeImage"><img alt="" src="'+src.replace(/"/g,'&quot;')+'"></button>';
      grid.appendChild(section);
    }finally{busy=false}
  }
  function renderPanel(src){
    var box=document.querySelector('.wardrobe-combined-control');if(!box)return;
    var check=box.querySelector('[data-bool-path="wardrobeEnabled"]');if(check)check.checked=true;
    var upload=box.querySelector('.wardrobe-combined-upload');
    if(upload){var preview=document.createElement('div');preview.className='wardrobe-combined-preview';preview.innerHTML='<button type="button" data-edit-image="wardrobeImage"><img src="'+src.replace(/"/g,'&quot;')+'" alt=""></button><button type="button" class="wardrobe-remove" data-wardrobe-remove>×</button>';upload.replaceWith(preview)}
  }
  function saveWardrobe(src){
    wardrobeLiveSrc=src;
    try{var s=read();s.wardrobeImage=src;s.wardrobeEnabled=true;s.wardrobeVersion=3;localStorage.setItem(STATE_KEY,JSON.stringify(s))}catch(e){}
    renderPanel(src);sync();
  }
  function process(file){
    var reader=new FileReader();reader.onload=function(){var im=new Image();im.onload=function(){var max=1600,ratio=Math.min(1,max/Math.max(im.width,im.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(im.width*ratio));canvas.height=Math.max(1,Math.round(im.height*ratio));canvas.getContext('2d').drawImage(im,0,0,canvas.width,canvas.height);saveWardrobe(canvas.toDataURL('image/webp',.88))};im.src=reader.result};reader.readAsDataURL(file)
  }
  document.addEventListener('change',function(e){var input=e.target.closest('[data-wardrobe-upload]');if(!input)return;var file=input.files&&input.files[0];if(!file)return;e.stopImmediatePropagation();process(file)},true);
  var observer=new MutationObserver(function(){requestAnimationFrame(sync)});
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['checked','src']});
  document.addEventListener('change',function(e){if(e.target.matches('[data-bool-path="wardrobeEnabled"],[data-wardrobe-upload]'))setTimeout(sync,80)},true);
  window.addEventListener('storage',sync);
  sync();setTimeout(sync,300);setTimeout(sync,1200);
}

function install(){var old=document.getElementById('printBtn');if(!old)return;var button=old.cloneNode(true);old.replaceWith(button);button.dataset.liveSaveReady='14';button.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();save()},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){install();installWardrobeSync()});else{install();installWardrobeSync()}setTimeout(install,500);
})();