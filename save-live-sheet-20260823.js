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
  var label=button.textContent,exportSheet=null;
  button.disabled=true;button.textContent='저장 중…';
  try{
    await Promise.all([waitImages(sheet),waitFonts()]);await nextFrame();
    var rect=sheet.getBoundingClientRect(),width=Math.ceil(Math.max(sheet.scrollWidth,rect.width)),height=Math.ceil(Math.max(sheet.scrollHeight,rect.height)),background=getComputedStyle(sheet).backgroundColor||'#ffffff';
    exportSheet=sheet.cloneNode(true);exportSheet.removeAttribute('id');exportSheet.classList.add('sheet-export-copy');freezeTypography(sheet,exportSheet);
    exportSheet.querySelectorAll(EDITOR_UI).forEach(function(el){el.remove()});
    exportSheet.style.cssText+=';position:fixed!important;left:0!important;top:0!important;margin:0!important;width:'+width+'px!important;min-width:'+width+'px!important;max-width:none!important;height:'+height+'px!important;min-height:'+height+'px!important;transform:none!important;transform-origin:top left!important;overflow:visible!important;z-index:-2147483647!important;pointer-events:none!important;background:'+background+'!important;';
    document.body.appendChild(exportSheet);await waitImages(exportSheet);await nextFrame();
    width=Math.ceil(Math.max(exportSheet.scrollWidth,exportSheet.getBoundingClientRect().width));height=Math.ceil(Math.max(exportSheet.scrollHeight,exportSheet.getBoundingClientRect().height));
    var options={width:width,height:height,scrollX:0,scrollY:0,scale:1,useCORS:true,allowTaint:false,backgroundColor:background,logging:false,imageTimeout:2500};
    var dataUrl;
    try{var canvas=await html2canvas(exportSheet,options);dataUrl=canvas.toDataURL('image/png')}
    catch(first){if(!window.htmlToImage||!window.htmlToImage.toPng)throw first;dataUrl=await window.htmlToImage.toPng(exportSheet,{width:width,height:height,pixelRatio:1,cacheBust:false,backgroundColor:background})}
    var a=document.createElement('a'),name=((state().pairName||'WeLog').trim()||'WeLog');
    a.href=dataUrl;a.download=name+'.png';document.body.appendChild(a);a.click();a.remove();
  }catch(error){console.error('WeLog PNG save failed',error);alert('PNG 저장에 실패했습니다. 새로고침 후 다시 시도해 주세요.')}
  finally{if(exportSheet)exportSheet.remove();button.disabled=false;button.textContent=label}
}
function install(){var old=document.getElementById('printBtn');if(!old)return;var button=old.cloneNode(true);old.replaceWith(button);button.dataset.liveSaveReady='19';button.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();save()},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();setTimeout(install,500);
})();
