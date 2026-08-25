(function(){
'use strict';
var KEY='welog-pair-sheet-v4',sheet=document.getElementById('sheet'),controls=document.getElementById('controls'),loaded={};
var defs={
 'Pretendard':{family:'Pretendard',url:'https://cdn.jsdelivr.net/gh/unfail-human/BackUp-X@main/webfonts/PretendardVariable.woff2',weight:'100 900'},
 'Noto Sans KR':{family:'Noto Sans KR',url:'./fonts/NotoSansKR-VariableFont_wght.ttf',weight:'100 900'},
 'KoPub Dotum Light':{family:'KoPub Dotum Light',url:'./fonts/KoPubWorld Dotum Light.ttf',weight:'300'},
 'KoPub Dotum Medium':{family:'KoPub Dotum Medium',url:'./fonts/KoPubWorld Dotum Medium.ttf',weight:'500'},
 'KoPub Dotum Bold':{family:'KoPub Dotum Bold',url:'./fonts/KoPubWorld Dotum Bold.ttf',weight:'700'},
 'KoPub Batang Light':{family:'KoPub Batang Light',url:'./fonts/KoPubWorld Batang Light.ttf',weight:'300'},
 'KoPub Batang Medium':{family:'KoPub Batang Medium',url:'./fonts/KoPubWorld Batang Medium.ttf',weight:'500'},
 'KoPub Batang Bold':{family:'KoPub Batang Bold',url:'./fonts/KoPubWorld Batang Bold.ttf',weight:'700'}
};
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
function current(){var v=read().font||'Pretendard';return v==='__default__'?'Pretendard':v}
function stack(name){if(name==='__system__')return'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';return'"'+String((defs[name]&&defs[name].family)||name).replace(/"/g,'')+'","Noto Sans KR",sans-serif'}
function load(name){var d=defs[name];if(!d||!window.FontFace)return Promise.resolve();if(loaded[name])return loaded[name];loaded[name]=new FontFace(d.family,'url("'+d.url+'")',{style:'normal',weight:d.weight}).load().then(function(face){document.fonts.add(face);return face});return loaded[name]}
async function apply(){if(!sheet)return;var name=current(),family=stack(name);try{await load(name)}catch(e){console.error('WeLog local font load failed',name,e)}document.documentElement.style.setProperty('--app-font',family,'important');sheet.style.setProperty('--welog-sheet-font',family,'important');sheet.style.setProperty('font-family',family,'important');sheet.querySelectorAll('*').forEach(function(el){if(!el.classList.contains('profile-symbol'))el.style.setProperty('font-family',family,'important')});if(document.fonts){try{await document.fonts.load('16px '+family,'가나다라마바사아자차카타파하')}catch(e){}}}
function save(value){var s=read();s.font=value;try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}return apply()}
window.WeLogApplyFont=apply;
if(controls){['input','change'].forEach(function(type){controls.addEventListener(type,function(e){if(!e.target.matches('select[data-path="font"]'))return;save(e.target.value);setTimeout(apply,100);setTimeout(apply,350)},true)})}
new MutationObserver(function(){requestAnimationFrame(apply)}).observe(sheet,{childList:true,subtree:false});
document.addEventListener('click',function(e){if(e.target.closest('#tabs,.controls'))setTimeout(apply,450)},true);
window.addEventListener('pageshow',apply);setTimeout(apply,0);setTimeout(apply,500);setTimeout(apply,1200);
})();
