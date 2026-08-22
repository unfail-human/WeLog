(function(){'use strict';
var stage=document.querySelector('.stage'),sheet=document.getElementById('sheet'),editor=document.getElementById('editor');
/* Keep the work area centered in the area excluding the inspector. */
function centerIfNeeded(){if(!stage||!sheet)return;var r=sheet.getBoundingClientRect(),s=stage.getBoundingClientRect();if(r.width<s.width-50) sheet.style.marginLeft=sheet.style.marginRight='auto';}
/* Alignment actions must reposition, never compound scale/size. Snapshot explicit dimensions before click and restore if an align control grows them. */
function isAlignButton(el){var t=(el.textContent||'').replace(/\s+/g,'');return /중앙|정렬/.test(t)&&!/크기|확대|축소/.test(t)}
document.addEventListener('pointerdown',function(e){var b=e.target.closest('button');if(!b||!editor||!editor.contains(b)||!isAlignButton(b)||!sheet)return;var nodes=[].slice.call(sheet.querySelectorAll('[data-layout-part],.profile,.center-part,.pair-title,.bottom-meta'));var snap=nodes.map(function(n){return[n,n.style.width,n.style.height,n.style.scale,n.style.zoom]});requestAnimationFrame(function(){requestAnimationFrame(function(){snap.forEach(function(x){x[0].style.width=x[1];x[0].style.height=x[2];x[0].style.scale=x[3];x[0].style.zoom=x[4]});centerIfNeeded()})})},true);
/* Prevent page scroll from dragging the inspector; only controls scroll. */
window.addEventListener('resize',centerIfNeeded,{passive:true});
/* Text re-renders should not visibly jump the stage. */
var lock=false,sy=0,sx=0;document.addEventListener('beforeinput',function(e){if(!sheet||!sheet.contains(e.target))return;lock=true;sy=stage.scrollTop;sx=stage.scrollLeft},true);document.addEventListener('input',function(e){if(!lock)return;requestAnimationFrame(function(){stage.scrollTop=sy;stage.scrollLeft=sx;lock=false})},true);
centerIfNeeded();
})();