(function(){'use strict';
var KEY='welog-direct-split-bounds-v4';
var sheet=document.getElementById('sheet'); if(!sheet)return;
function read(){try{var b=JSON.parse(localStorage.getItem(KEY)||'{}')||{};return{top:+b.top||0,right:+b.right||0,bottom:+b.bottom||0,left:+b.left||0}}catch(e){return{top:0,right:0,bottom:0,left:0}}}
function split(){return sheet.querySelector('.center .pair-split')}
function influenceRect(){var s=split();if(!s)return null;var r=s.getBoundingClientRect(),b=read();return{left:r.left+b.left,top:r.top+b.top,right:r.right-b.right,bottom:r.bottom-b.bottom}}
function ensureBg(){var s=split();if(!s)return;var center=s.closest('.center');if(!center)return;center.style.position='relative';var layer=center.querySelector('.welog-center-bound-bg');if(!layer){layer=document.createElement('div');layer.className='welog-center-bound-bg';layer.innerHTML='<i></i><i></i>';center.insertBefore(layer,s)}
var cr=center.getBoundingClientRect(),ir=influenceRect();if(!ir)return;layer.style.left=(ir.left-cr.left)+'px';layer.style.top=(ir.top-cr.top)+'px';layer.style.width=Math.max(1,ir.right-ir.left)+'px';layer.style.height=Math.max(1,ir.bottom-ir.top)+'px';
var cards=s.querySelectorAll(':scope > .pair-image');for(var i=0;i<2;i++){var c=cards[i],pane=layer.children[i];if(!pane)continue;if(c){var bg=c.dataset.welogOriginalBg||getComputedStyle(c).backgroundColor||'transparent';if(bg==='rgba(0, 0, 0, 0)'&&c.dataset.welogOriginalBg)bg=c.dataset.welogOriginalBg;if(!c.dataset.welogOriginalBg&&bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')c.dataset.welogOriginalBg=bg;pane.style.background=c.dataset.welogOriginalBg||bg;c.style.setProperty('background','transparent','important')}}
s.style.position='relative';s.style.zIndex='1';
}
function fixSelection(){var ir=influenceRect();if(!ir)return;document.querySelectorAll('.welog-layout-box-fixed').forEach(function(b){var label=b.querySelector('span');if(!label||label.textContent.indexOf('중앙 그림')<0)return;b.style.left=ir.left+'px';b.style.top=ir.top+'px';b.style.width=Math.max(1,ir.right-ir.left)+'px';b.style.height=Math.max(1,ir.bottom-ir.top)+'px'})}
function sync(){requestAnimationFrame(function(){ensureBg();fixSelection()})}
window.addEventListener('welog-influence-bounds-change',sync);window.addEventListener('resize',sync);window.addEventListener('scroll',sync,true);document.addEventListener('pointerup',sync,true);document.addEventListener('click',function(){setTimeout(sync,20)},true);new MutationObserver(function(){sync()}).observe(sheet,{childList:true,subtree:true});sync();
})();