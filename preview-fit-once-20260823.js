(function(){
'use strict';
var btn=document.getElementById('previewBtn'),sheet=document.getElementById('sheet');
if(!btn||!sheet)return;
function close(){var m=document.querySelector('.welog-fit-preview');if(m)m.hidden=true;document.body.style.overflow=''}
function open(){
  var old=document.querySelector('.welog-fit-preview');if(old)old.remove();
  var modal=document.createElement('div');modal.className='welog-fit-preview';
  modal.innerHTML='<section class="welog-fit-preview-dialog"><header class="welog-fit-preview-head"><div><b>미리보기</b><small>작업화면 전체 보기</small></div><button type="button" class="welog-fit-preview-close">×</button></header><div class="welog-fit-preview-viewport"><div class="welog-fit-preview-holder"></div></div></section>';
  document.body.appendChild(modal);
  var holder=modal.querySelector('.welog-fit-preview-holder'),viewport=modal.querySelector('.welog-fit-preview-viewport');
  var clone=sheet.cloneNode(true);clone.removeAttribute('id');clone.classList.add('welog-fit-preview-sheet');clone.style.transform='none';clone.style.margin='0';
  holder.appendChild(clone);document.body.style.overflow='hidden';
  requestAnimationFrame(function(){
    var sourceRect=sheet.getBoundingClientRect();
    var naturalW=Math.max(sheet.scrollWidth,sourceRect.width),naturalH=Math.max(sheet.scrollHeight,sourceRect.height);
    clone.style.width=naturalW+'px';clone.style.minHeight=naturalH+'px';
    var vw=Math.max(1,viewport.clientWidth-36),vh=Math.max(1,viewport.clientHeight-36);
    var scale=Math.min(vw/naturalW,vh/naturalH,1);
    holder.style.width=Math.round(naturalW*scale)+'px';holder.style.height=Math.round(naturalH*scale)+'px';
    clone.style.transform='scale('+scale+')';
  });
  modal.querySelector('.welog-fit-preview-close').onclick=close;
  modal.addEventListener('click',function(e){if(e.target===modal)close()});
}
var replacement=btn.cloneNode(true);btn.parentNode.replaceChild(replacement,btn);replacement.onclick=function(e){e.preventDefault();e.stopImmediatePropagation();open()};
window.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
})();