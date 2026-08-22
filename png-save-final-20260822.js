(function(){
'use strict';
var sheet=document.getElementById('sheet');
function toast(msg){var t=document.createElement('div');t.textContent=msg;Object.assign(t.style,{position:'fixed',left:'50%',bottom:'28px',transform:'translateX(-50%)',zIndex:'999999',background:'#2d2924',color:'#fff',padding:'10px 16px',borderRadius:'8px',fontSize:'12px',boxShadow:'0 8px 28px #0003'});document.body.appendChild(t);setTimeout(function(){t.remove()},1800)}
function downloadCanvas(canvas){return new Promise(function(resolve,reject){try{canvas.toBlob(function(blob){if(!blob){reject(new Error('empty png blob'));return}var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;var title=(document.querySelector('[data-path="pairName"]')||{}).value||'WeLog';a.download=(String(title).trim()||'WeLog')+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},3000);resolve()},'image/png')}catch(e){reject(e)}})}
async function save(){var btn=document.getElementById('printBtn');if(!btn||!sheet||!window.html2canvas)return;var text=btn.textContent;btn.disabled=true;btn.textContent='저장 중…';try{
if(document.fonts&&document.fonts.ready)await document.fonts.ready;
await new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})});
/* Capture the real sheet, not a rebuilt clone. This preserves the exact layout the user sees. */
var rect=sheet.getBoundingClientRect(),w=Math.ceil(sheet.scrollWidth||rect.width),h=Math.ceil(sheet.scrollHeight||rect.height);
var canvas=await window.html2canvas(sheet,{scale:2,useCORS:true,allowTaint:false,backgroundColor:'#ffffff',logging:false,imageTimeout:30000,width:w,height:h,windowWidth:Math.max(document.documentElement.clientWidth,w),windowHeight:Math.max(document.documentElement.clientHeight,h),scrollX:-window.scrollX,scrollY:-window.scrollY,onclone:function(doc){var s=doc.getElementById('sheet');if(s){s.style.margin='0';s.style.zoom='1';s.style.visibility='visible';s.style.opacity='1'}var overlays=doc.querySelectorAll('.welog-layout-overlay,.layout-editor-toolbar,.layout-selection,.guide-line');overlays.forEach(function(el){el.style.display='none'})}});
await downloadCanvas(canvas);toast('PNG 저장이 완료되었습니다!')
}catch(err){console.error('WeLog final PNG export failed:',err);alert('PNG 저장에 실패했습니다. 새로고침 후 다시 시도해 주세요.')}finally{btn.disabled=false;btn.textContent=text}}
function install(){var old=document.getElementById('printBtn');if(!old)return;var b=old.cloneNode(true);old.replaceWith(b);b.id='printBtn';b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();save()},true)}
/* Install after all legacy save handlers have loaded. */
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
