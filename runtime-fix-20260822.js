(function(){
  'use strict';
  var KEY='welog-pair-sheet-v4';
  var CONCEPT_KEY='welog-concept-sides-v1';
  var PADDING_KEY='welog-card-padding-v2';
  var controls=document.getElementById('controls');
  var sheet=document.getElementById('sheet');
  var saveBtn=document.getElementById('printBtn');

  function readState(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
  function writeState(s){try{localStorage.setItem(KEY,JSON.stringify(s));return true}catch(e){return false}}

  /* ---------- fonts: use the real family names loaded by @font-face ---------- */
  var fontStyle=document.createElement('style');
  fontStyle.id='welog-font-faces-stable';
  fontStyle.textContent='\
@font-face{font-family:"Pretendard";src:url("https://cdn.jsdelivr.net/gh/unfail-human/BackUp-X@main/webfonts/PretendardVariable.woff2") format("woff2");font-style:normal;font-weight:100 900;font-display:swap}\
@font-face{font-family:"Noto Sans KR";src:url("https://cdn.jsdelivr.net/gh/unfail-human/BackUp-X@main/webfonts/NotoSansKR-VariableFont_wght.woff2") format("woff2");font-style:normal;font-weight:100 900;font-display:swap}\
@font-face{font-family:"KoPub Dotum Medium";src:url("https://cdn.jsdelivr.net/gh/unfail-human/BackUp-X@main/webfonts/KoPubWorld%20Dotum%20Medium.ttf") format("truetype");font-style:normal;font-weight:500;font-display:swap}\
@font-face{font-family:"KoPub Batang Medium";src:url("https://cdn.jsdelivr.net/gh/unfail-human/BackUp-X@main/webfonts/KoPubWorld%20Batang%20Medium.ttf") format("truetype");font-style:normal;font-weight:500;font-display:swap}';
  var oldFontStyle=document.getElementById(fontStyle.id);if(oldFontStyle)oldFontStyle.remove();document.head.appendChild(fontStyle);

  var fontMap={
    'Pretendard':'"Pretendard","Noto Sans KR",sans-serif',
    'Noto Sans KR':'"Noto Sans KR",sans-serif',
    'KoPub Dotum Medium':'"KoPub Dotum Medium","Noto Sans KR",sans-serif',
    'KoPub Batang Medium':'"KoPub Batang Medium","Noto Sans KR",serif',
    '__system__':'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",sans-serif'
  };
  function normalizeFont(v){if(/^KoPub Dotum/.test(v||''))return 'KoPub Dotum Medium';if(/^KoPub Batang/.test(v||''))return 'KoPub Batang Medium';if(v==='__default__'||!v)return 'Pretendard';return v}
  function fontStack(name){return fontMap[name]||('"'+String(name).replace(/"/g,'')+'","Noto Sans KR",sans-serif')}
  async function applyFont(v){
    var name=normalizeFont(v||readState().font),stack=fontStack(name);
    document.documentElement.style.setProperty('--app-font',stack);
    try{if(document.fonts&&name!=='__system__')await document.fonts.load('500 16px '+stack.split(',')[0])}catch(e){}
    if(sheet){
      sheet.style.setProperty('font-family',stack,'important');
      sheet.querySelectorAll('*').forEach(function(el){el.style.setProperty('font-family',stack,'important')});
    }
  }
  function saveFont(v){var s=readState();s.font=normalizeFont(v);writeState(s);applyFont(s.font)}
  function simplifyFontSelect(){
    if(!controls)return;var sel=controls.querySelector('select[data-path="font"]');if(!sel)return;
    var current=normalizeFont(readState().font||sel.value),wanted=[['Pretendard','Pretendard'],['Noto Sans KR','Noto Sans KR'],['KoPub Dotum Medium','KoPubWorld 돋움'],['KoPub Batang Medium','KoPubWorld 바탕'],['__system__','시스템 폰트']];
    var signature=wanted.map(function(x){return x[0]}).join('|');
    if(sel.dataset.welogFonts!==signature){sel.innerHTML=wanted.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');sel.dataset.welogFonts=signature}
    if(Array.from(sel.options).some(function(o){return o.value===current}))sel.value=current;else sel.value='Pretendard';
  }

  /* ---------- independent concepts ---------- */
  function readConceptSides(){try{var a=JSON.parse(localStorage.getItem(CONCEPT_KEY)||'null');if(Array.isArray(a))return a.filter(function(x,i,z){return(x==='left'||x==='right')&&z.indexOf(x)===i})}catch(e){}var s=readState();return s.visible&&s.visible.concept&&s.conceptSide?[s.conceptSide]:[]}
  function writeConceptSides(a){localStorage.setItem(CONCEPT_KEY,JSON.stringify(a))}
  function setConceptSide(side,on){var a=readConceptSides(),i=a.indexOf(side);if(on&&i<0)a.push(side);if(!on&&i>=0)a.splice(i,1);writeConceptSides(a);syncConceptChecks();renderConceptBlocks()}
  function syncConceptChecks(){if(!controls)return;var a=readConceptSides();controls.querySelectorAll('input[data-concept-side]').forEach(function(c){c.checked=a.indexOf(c.dataset.conceptSide)>=0})}
  function esc(t){var d=document.createElement('div');d.textContent=t==null?'':String(t);return d.innerHTML}
  function renderConceptBlocks(){if(!sheet)return;var s=readState(),a=readConceptSides();sheet.querySelectorAll('.concept-block').forEach(function(n){n.remove()});a.forEach(function(side){var p=sheet.querySelector('.profile.'+side);if(!p)return;var value=s[side]&&s[side].concept||'',b=document.createElement('div');b.className='text-block concept-block';b.dataset.runtimeConcept=side;b.innerHTML='<h3>컨셉</h3><div class="formatted-lines">'+String(value).split('\n').filter(Boolean).map(function(x){return'<p>'+esc(x)+'</p>'}).join('')+'</div>';var c=p.querySelector('.commission-block');c?p.insertBefore(b,c):p.appendChild(b)})}

  /* ---------- equal whitespace on all four sides ---------- */
  function readPadding(){var n=Number(localStorage.getItem(PADDING_KEY));return isFinite(n)?Math.max(0,Math.min(140,n)):0}
  function applyPadding(n){n=Math.max(0,Math.min(140,Number(n)||0));document.documentElement.style.setProperty('--welog-card-padding',n+'px')}
  function ensurePaddingControl(){
    if(!controls)return;var anchor=controls.querySelector('.layout-ratio-controls');if(!anchor)return;
    var box=controls.querySelector('.welog-card-padding-control');
    if(!box){box=document.createElement('section');box.className='welog-card-padding-control';box.innerHTML='<div><b>카드 여백</b><span>현재 레이아웃 비율은 유지하고 상·하·좌·우 여백만 늘립니다.</span></div><label><input type="range" min="0" max="140" step="5" data-welog-card-padding><b data-welog-card-padding-value></b></label>';anchor.insertAdjacentElement('afterend',box)}
    var n=readPadding(),range=box.querySelector('[data-welog-card-padding]'),out=box.querySelector('[data-welog-card-padding-value]');range.value=n;out.textContent=n+'px';applyPadding(n);
  }

  /* ---------- exact current-layout PNG ---------- */
  async function exportPng(){
    if(!sheet||!window.html2canvas)return;saveBtn.disabled=true;saveBtn.textContent='저장 중…';
    try{await applyFont();renderConceptBlocks();if(document.fonts&&document.fonts.ready)await document.fonts.ready;await new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})});var canvas=await window.html2canvas(sheet,{scale:Math.max(1.5,window.devicePixelRatio||1),useCORS:true,allowTaint:false,backgroundColor:'#ffffff',logging:false,imageTimeout:15000,foreignObjectRendering:false});var a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download=((readState().pairName||'WeLog').trim()||'WeLog')+'.png';document.body.appendChild(a);a.click();a.remove()}catch(e){console.error('WeLog PNG export failed',e);alert('PNG 저장에 실패했습니다.')}finally{saveBtn.disabled=false;saveBtn.textContent='↓ PNG 저장'}
  }

  /* ---------- slot loading stays text/settings only ---------- */
  function loadTextOnlySlot(number){var item;try{item=JSON.parse(localStorage.getItem('welog-slot-'+number)||'null')}catch(e){}if(!item||!item.data)return false;var data=JSON.parse(JSON.stringify(item.data));data.pairImage='';data.pairImageLeft='';data.pairImageRight='';if(data.left)data.left.image='';if(data.right)data.right.image='';data.stickerAssets=[];data.stickers=[];if(!writeState(data))return false;location.reload();return true}

  if(controls){
    controls.addEventListener('input',function(e){var c=e.target.closest&&e.target.closest('input[data-concept-side]');if(c){e.preventDefault();e.stopImmediatePropagation();setConceptSide(c.dataset.conceptSide,c.checked);return}if(e.target.matches('select[data-path="font"]')){e.stopImmediatePropagation();saveFont(e.target.value);return}if(e.target.matches('[data-welog-card-padding]')){var n=Number(e.target.value)||0,box=e.target.closest('.welog-card-padding-control');applyPadding(n);if(box)box.querySelector('[data-welog-card-padding-value]').textContent=n+'px'}},true);
    controls.addEventListener('change',function(e){if(e.target.matches('select[data-path="font"]')){e.stopImmediatePropagation();saveFont(e.target.value);return}if(e.target.matches('[data-welog-card-padding]'))localStorage.setItem(PADDING_KEY,String(Number(e.target.value)||0))},true);
  }
  document.addEventListener('click',function(e){var load=e.target.closest&&e.target.closest('[data-slot-load]');if(load){e.preventDefault();e.stopImmediatePropagation();loadTextOnlySlot(load.dataset.slotLoad);return}},true);
  if(saveBtn)saveBtn.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();exportPng()},true);

  var pending=false;
  function refresh(){pending=false;simplifyFontSelect();ensurePaddingControl();syncConceptChecks();applyFont();renderConceptBlocks()}
  function schedule(){if(pending)return;pending=true;setTimeout(refresh,0)}
  if(controls)new MutationObserver(schedule).observe(controls,{childList:true,subtree:false});
  if(sheet)new MutationObserver(function(){setTimeout(function(){applyFont();renderConceptBlocks()},0)}).observe(sheet,{childList:true,subtree:false});
  applyPadding(readPadding());schedule();
})();