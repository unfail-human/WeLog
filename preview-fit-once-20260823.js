(function(){
'use strict';
var placeholder=null,parent=null,next=null,oldStyle=null,active=false;
function restore(){
  if(!active)return;
  var sheet=document.getElementById('sheet');
  if(sheet&&parent){
    if(next&&next.parentNode===parent)parent.insertBefore(sheet,next);else parent.appendChild(sheet);
    if(oldStyle===null)sheet.removeAttribute('style');else sheet.setAttribute('style',oldStyle);
  }
  if(placeholder&&placeholder.parentNode)placeholder.remove();
  var m=document.querySelector('.welog-fit-preview');if(m)m.remove();
  document.body.style.overflow='';
  placeholder=parent=next=null;oldStyle=null;active=false;
}
function open(){
  restore();
  var sheet=document.getElementById('sheet');if(!sheet)return;
  parent=sheet.parentNode;next=sheet.nextSibling;oldStyle=sheet.getAttribute('style');
  placeholder=document.createComment('welog-sheet-home');parent.insertBefore(placeholder,sheet);
  var modal=document.createElement('div');modal.className='welog-fit-preview';
  modal.innerHTML='<section class="welog-fit-preview-dialog"><header class="welog-fit-preview-head"><div><b>미리보기</b><small>현재 작업화면 그대로</small></div><button type="button" class="welog-fit-preview-close">×</button></header><div class="welog-fit-preview-viewport"><div class="welog-fit-preview-holder"></div></div></section>';
  document.body.appendChild(modal);document.body.style.overflow='hidden';active=true;
  var holder=modal.querySelector('.welog-fit-preview-holder'),viewport=modal.querySelector('.welog-fit-preview-viewport');
  var naturalW=sheet.offsetWidth||sheet.getBoundingClientRect().width;
  var naturalH=Math.round(sheet.offsetHeight||sheet.getBoundingClientRect().height);
  holder.appendChild(sheet);
  sheet.style.setProperty('margin','0','important');
  sheet.style.setProperty('transform-origin','top left','important');
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    var cs=getComputedStyle(viewport),px=parseFloat(cs.paddingLeft||0)+parseFloat(cs.paddingRight||0),py=parseFloat(cs.paddingTop||0)+parseFloat(cs.paddingBottom||0);
    var aw=Math.max(100,viewport.clientWidth-px),ah=Math.max(100,viewport.clientHeight-py);
    var scale=Math.min(aw/naturalW,ah/naturalH,1);
    holder.style.width=Math.round(naturalW*scale)+'px';
    holder.style.height=Math.round(naturalH*scale)+'px';
    holder.style.margin='auto';
    sheet.style.setProperty('width',naturalW+'px','important');
    sheet.style.setProperty('min-width',naturalW+'px','important');
    sheet.style.setProperty('max-width',naturalW+'px','important');
    sheet.style.setProperty('transform','scale('+scale+')','important');
  })});
  modal.querySelector('.welog-fit-preview-close').onclick=restore;
  modal.addEventListener('click',function(e){if(e.target===modal)restore()});
}
function install(){var old=document.getElementById('previewBtn');if(!old)return;var b=old.cloneNode(true);old.replaceWith(b);b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();open()},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();setTimeout(install,150);
window.addEventListener('keydown',function(e){if(e.key==='Escape')restore()});
})();