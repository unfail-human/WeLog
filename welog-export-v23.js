(function(){
'use strict';
var VERSION='23',STATE_KEY='welog-pair-sheet-v4';
function frame(){return new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})})}
async function ready(sheet){if(document.fonts){try{await document.fonts.ready}catch(e){}}await Promise.all([].slice.call(sheet.querySelectorAll('img')).map(function(im){if(im.complete)return Promise.resolve();return new Promise(function(r){im.addEventListener('load',r,{once:true});im.addEventListener('error',r,{once:true});setTimeout(r,1800)})}));await frame()}
function filename(){try{return((JSON.parse(localStorage.getItem(STATE_KEY)||'{}').pairName||'WeLog').trim()||'WeLog')+'.png'}catch(e){return'WeLog.png'}}
function download(url){var a=document.createElement('a');a.href=url;a.download=filename();document.body.appendChild(a);a.click();a.remove()}
async function exportPng(){
 var sheet=document.getElementById('sheet'),button=document.getElementById('printBtn');if(!sheet||!button)return;
 var text=button.textContent,old={transform:sheet.style.transform,origin:sheet.style.transformOrigin},parents=[];
 button.disabled=true;button.textContent='저장 중…';
 try{
  await ready(sheet);
  for(var p=sheet.parentElement;p&&p!==document.body;p=p.parentElement){parents.push([p,p.scrollLeft,p.scrollTop,p.style.overflow]);p.scrollLeft=0;p.scrollTop=0;if(p.classList.contains('stage')||p.classList.contains('welog-fit-preview-viewport'))p.style.overflow='visible'}
  sheet.style.transform='none';sheet.style.transformOrigin='top left';await frame();
  var width=Math.ceil(sheet.offsetWidth),height=Math.ceil(sheet.offsetHeight),bg=getComputedStyle(sheet).backgroundColor||'#fff',url;
  if(window.htmlToImage&&window.htmlToImage.toPng){
   url=await window.htmlToImage.toPng(sheet,{pixelRatio:1,width:width,height:height,backgroundColor:bg,cacheBust:true,skipAutoScale:true,style:{width:width+'px',height:height+'px',maxWidth:'none',transform:'none',transformOrigin:'top left',margin:'0'}});
  }else if(window.html2canvas){
   var canvas=await window.html2canvas(sheet,{scale:1,useCORS:true,backgroundColor:bg,logging:false,imageTimeout:4000,onclone:function(doc){var s=doc.getElementById('sheet');if(s){s.style.transform='none';s.style.width=width+'px';s.style.height=height+'px'}}});url=canvas.toDataURL('image/png');
  }else throw new Error('PNG renderer unavailable');
  download(url);
 }catch(e){console.error('WeLog export v'+VERSION,e);alert('PNG 저장에 실패했습니다.');}
 finally{sheet.style.transform=old.transform;sheet.style.transformOrigin=old.origin;parents.forEach(function(x){x[0].scrollLeft=x[1];x[0].scrollTop=x[2];x[0].style.overflow=x[3]});button.disabled=false;button.textContent=text}
}
function install(){var old=document.getElementById('printBtn');if(!old)return;var b=old.cloneNode(true);old.replaceWith(b);b.dataset.exportVersion=VERSION;b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();exportPng()},true)}
function notice(){var key='welog-update-v'+VERSION;try{if(localStorage.getItem(key))return;localStorage.setItem(key,'1')}catch(e){}setTimeout(function(){alert('업데이트 되었습니다.')},300)}
function start(){install();notice();setTimeout(install,700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
