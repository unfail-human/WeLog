(function(){
'use strict';
var sheet=document.getElementById('sheet'),stage=document.querySelector('.stage'),controls=document.getElementById('controls');if(!sheet||!stage||!controls)return;
var STATE_KEY='welog-pair-sheet-v4',typingUntil=0,lastScroll={left:0,top:0};
function read(){try{return JSON.parse(localStorage.getItem(STATE_KEY)||'{}')||{}}catch(e){return{}}}
function transform(ed){ed=ed||{};var x=ed.x==null?50:+ed.x,y=ed.y==null?50:+ed.y,scale=ed.scale==null?100:+ed.scale;return'translate('+((x-50)*2)+'%,'+((y-50)*2)+'%) scale('+(scale/100)+')'}
function applySplitEdits(root){var s=read(),edits=s.imageEdits||{};['pairImageLeft','pairImageRight'].forEach(function(path){var box=root.querySelector('[data-edit-image="'+path+'"]');if(!box)return;var ed=edits[path]||{scale:100,x:50,y:50,bg:'#fbfaf8'};box.style.setProperty('background',ed.bg||'#fbfaf8','important');box.style.setProperty('overflow','hidden','important');var im=box.querySelector('img');if(im){im.style.setProperty('transform',transform(ed),'important');im.style.setProperty('transform-origin','center center','important');im.style.setProperty('width','100%','important');im.style.setProperty('height','100%','important');im.style.setProperty('object-fit','contain','important')}})}
function markTyping(e){var t=e.target;if(!t||!t.matches('input[type="text"],input:not([type]),textarea'))return;lastScroll.left=stage.scrollLeft;lastScroll.top=stage.scrollTop;typingUntil=Date.now()+450}
controls.addEventListener('beforeinput',markTyping,true);controls.addEventListener('input',markTyping,true);
function restoreScroll(){if(Date.now()>typingUntil)return;stage.scrollLeft=lastScroll.left;stage.scrollTop=lastScroll.top;requestAnimationFrame(function(){stage.scrollLeft=lastScroll.left;stage.scrollTop=lastScroll.top})}
var raf=0;new MutationObserver(function(muts){if(!muts.some(function(m){return m.type==='childList'}))return;if(raf)return;raf=requestAnimationFrame(function(){raf=0;applySplitEdits(sheet);restoreScroll()})}).observe(sheet,{childList:true,subtree:false});
window.addEventListener('pageshow',function(){applySplitEdits(sheet)});document.addEventListener('visibilitychange',function(){if(!document.hidden)applySplitEdits(sheet)});
/* Image editor Apply triggers a sheet rebuild; reapply saved background/position after it completes. */
var applyBtn=document.getElementById('imageEditorApply');if(applyBtn)applyBtn.addEventListener('click',function(){setTimeout(function(){applySplitEdits(sheet)},0);setTimeout(function(){applySplitEdits(sheet)},60)},true);
applySplitEdits(sheet);
})();
