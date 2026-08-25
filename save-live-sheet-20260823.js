(function(){
'use strict';
var STATE_KEY='welog-pair-sheet-v4';
var EDITOR_UI='.direct-bounds-overlay-fixed,.welog-layout-overlay-fixed,.welog-layout-hud,.st-toolbar,.st-resize,.st-rotate,.st-v2-lock,.st-v2-del,.st-v2-resize,.direct-crop-ui,.guide-line';
function state(){try{return JSON.parse(localStorage.getItem(STATE_KEY)||'{}')||{}}catch(e){return{}}}
function nextFrame(){return new Promise(function(done){requestAnimationFrame(function(){requestAnimationFrame(done)})})}
function waitImages(sheet){return Promise.all([].slice.call(sheet.querySelectorAll('img')).map(function(im){if(im.complete)return Promise.resolve();return new Promise(function(done){im.addEventListener('load',done,{once:true});im.addEventListener('error',done,{once:true});setTimeout(done,1200)})}))}
async function save(){
  var sheet=document.getElementById('sheet'),button=document.getElementById('printBtn');if(!sheet||!button)return;
  var label=button.textContent,oldTransform=sheet.style.transform,oldOrigin=sheet.style.transformOrigin,hidden=[];
  button.disabled=true;button.textContent='저장 중…';
  try{
    await waitImages(sheet);await nextFrame();
    sheet.querySelectorAll(EDITOR_UI).forEach(function(el){hidden.push([el,el.style.display]);el.style.display='none'});
    sheet.style.transform='none';sheet.style.transformOrigin='top left';
    var rect=sheet.getBoundingClientRect(),width=Math.ceil(Math.max(sheet.scrollWidth,rect.width)),height=Math.ceil(Math.max(sheet.scrollHeight,rect.height));
    var options={width:width,height:height,canvasWidth:width,canvasHeight:height,windowWidth:width,windowHeight:height,scrollX:0,scrollY:0,scale:1.5,useCORS:true,allowTaint:false,backgroundColor:getComputedStyle(sheet).backgroundColor||'#ffffff',logging:false,imageTimeout:5000};
    var canvas=await html2canvas(sheet,options);
    var url=canvas.toDataURL('image/png'),a=document.createElement('a'),name=((state().pairName||'WeLog').trim()||'WeLog');
    a.href=url;a.download=name+'.png';document.body.appendChild(a);a.click();a.remove();
  }catch(error){console.error('WeLog PNG save failed',error);alert('PNG 저장에 실패했습니다. 새로고침 후 다시 시도해 주세요.')}
  finally{hidden.forEach(function(x){x[0].style.display=x[1]});sheet.style.transform=oldTransform;sheet.style.transformOrigin=oldOrigin;button.disabled=false;button.textContent=label}
}
function install(){var old=document.getElementById('printBtn');if(!old)return;var button=old.cloneNode(true);old.replaceWith(button);button.dataset.liveSaveReady='15';button.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();save()},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();setTimeout(install,500);
})();
