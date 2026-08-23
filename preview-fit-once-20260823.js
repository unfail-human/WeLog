(function(){
'use strict';
function close(){var m=document.querySelector('.welog-fit-preview');if(m)m.remove();document.body.style.overflow=''}
function open(){
  close();
  var source=document.getElementById('sheet');if(!source)return;
  var modal=document.createElement('div');modal.className='welog-fit-preview';
  modal.innerHTML='<section class="welog-fit-preview-dialog"><header class="welog-fit-preview-head"><div><b>미리보기</b><small>작업화면 전체 보기</small></div><button type="button" class="welog-fit-preview-close">×</button></header><div class="welog-fit-preview-viewport"><div class="welog-fit-preview-holder"></div></div></section>';
  document.body.appendChild(modal);document.body.style.overflow='hidden';
  var holder=modal.querySelector('.welog-fit-preview-holder'),viewport=modal.querySelector('.welog-fit-preview-viewport');
  var clone=source.cloneNode(true);
  /* Keep #sheet so every existing #sheet-scoped rule is applied exactly as in the editor. */
  clone.id='sheet';clone.classList.add('welog-fit-preview-sheet');
  clone.style.setProperty('transform','none','important');clone.style.setProperty('transform-origin','top left','important');clone.style.setProperty('margin','0','important');
  holder.appendChild(clone);
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    var naturalW=source.offsetWidth||source.scrollWidth||1060;
    var naturalH=Math.max(source.scrollHeight,source.offsetHeight||0);
    clone.style.setProperty('width',naturalW+'px','important');
    clone.style.setProperty('min-width',naturalW+'px','important');
    clone.style.setProperty('max-width','none','important');
    clone.style.setProperty('height',naturalH+'px','important');
    clone.style.setProperty('min-height',naturalH+'px','important');
    var cs=getComputedStyle(viewport),padX=parseFloat(cs.paddingLeft||0)+parseFloat(cs.paddingRight||0),padY=parseFloat(cs.paddingTop||0)+parseFloat(cs.paddingBottom||0);
    var availW=Math.max(100,viewport.clientWidth-padX),availH=Math.max(100,viewport.clientHeight-padY);
    var scale=Math.min(availW/naturalW,availH/naturalH,1);
    holder.style.width=(naturalW*scale)+'px';holder.style.height=(naturalH*scale)+'px';
    clone.style.setProperty('transform','scale('+scale+')','important');
  })});
  modal.querySelector('.welog-fit-preview-close').onclick=close;
  modal.addEventListener('click',function(e){if(e.target===modal)close()});
}
function install(){var old=document.getElementById('previewBtn');if(!old)return;var b=old.cloneNode(true);old.replaceWith(b);b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();open()},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();setTimeout(install,150);
window.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
})();