(function(){
  'use strict';
  var KEY='welog-pair-sheet-v4';
  var controls=document.getElementById('controls');
  var sheet=document.getElementById('sheet');
  var saveBtn=document.getElementById('printBtn');

  function rawRead(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
  function rawWrite(v){try{localStorage.setItem(KEY,JSON.stringify(v));return true}catch(e){return false}}

  /* Preserve the independent A/B concept flags whenever the original app writes its older single-side state. */
  var nativeSetItem=Storage.prototype.setItem;
  if(!Storage.prototype.__welogPatched){
    Storage.prototype.setItem=function(k,v){
      if(k===KEY){
        try{
          var incoming=JSON.parse(v),previous=JSON.parse(this.getItem(k)||'{}');
          if(!Array.isArray(incoming.conceptSides)&&Array.isArray(previous.conceptSides)) incoming.conceptSides=previous.conceptSides.slice();
          if(Array.isArray(incoming.conceptSides)){
            incoming.conceptSides=incoming.conceptSides.filter(function(x,i,a){return (x==='left'||x==='right')&&a.indexOf(x)===i});
            incoming.conceptSide=incoming.conceptSides[0]||'';
            incoming.visible=incoming.visible||{};
            incoming.visible.concept=incoming.conceptSides.length>0;
          }
          v=JSON.stringify(incoming);
        }catch(e){}
      }
      return nativeSetItem.call(this,k,v);
    };
    Storage.prototype.__welogPatched=true;
  }

  function conceptSides(s){
    if(Array.isArray(s.conceptSides)) return s.conceptSides.filter(function(x){return x==='left'||x==='right'});
    return s.visible&&s.visible.concept&&s.conceptSide?[s.conceptSide]:[];
  }
  function setConcept(side,on){
    var s=rawRead(),arr=conceptSides(s),i=arr.indexOf(side);
    if(on&&i<0)arr.push(side);
    if(!on&&i>=0)arr.splice(i,1);
    s.conceptSides=arr;
    s.conceptSide=arr[0]||'';
    s.visible=s.visible||{};s.visible.concept=arr.length>0;
    rawWrite(s);renderConcepts();syncConceptChecks();
  }
  function escapeHtml(t){var d=document.createElement('div');d.textContent=t==null?'':String(t);return d.innerHTML}
  function renderConcepts(){
    if(!sheet)return;
    var s=rawRead(),arr=conceptSides(s);
    sheet.querySelectorAll('.concept-block').forEach(function(n){n.remove()});
    arr.forEach(function(side){
      var profile=sheet.querySelector('.profile.'+side);if(!profile)return;
      var value=s[side]&&s[side].concept||'';
      var block=document.createElement('div');block.className='text-block concept-block';block.dataset.independentConcept=side;
      block.innerHTML='<h3>컨셉</h3><div class="formatted-lines">'+String(value).split('\n').filter(Boolean).map(function(x){return '<p>'+escapeHtml(x)+'</p>'}).join('')+'</div>';
      var commission=profile.querySelector('.commission-block');commission?profile.insertBefore(block,commission):profile.appendChild(block);
    });
  }
  function syncConceptChecks(){
    if(!controls)return;var arr=conceptSides(rawRead());
    controls.querySelectorAll('input[data-concept-side]').forEach(function(c){c.checked=arr.indexOf(c.dataset.conceptSide)>=0});
  }

  /* Reliable font faces, independent of the missing local /fonts directory. */
  var fontCss=document.createElement('style');
  fontCss.id='welog-runtime-fonts';
  fontCss.textContent='\
@font-face{font-family:Pretendard;src:url("https://cdn.jsdelivr.net/gh/unfail-human/BackUp-X@main/webfonts/PretendardVariable.woff2") format("woff2");font-weight:100 900;font-display:swap}\
@font-face{font-family:"Noto Sans KR";src:url("https://cdn.jsdelivr.net/gh/unfail-human/BackUp-X@main/webfonts/NotoSansKR-VariableFont_wght.woff2") format("woff2");font-weight:100 900;font-display:swap}\
@font-face{font-family:"KoPub Dotum Light";src:url("https://cdn.jsdelivr.net/gh/unfail-human/BackUp-X@main/webfonts/KoPubWorld%20Dotum%20Light.ttf") format("truetype");font-weight:300;font-display:swap}\
@font-face{font-family:"KoPub Dotum Medium";src:url("https://cdn.jsdelivr.net/gh/unfail-human/BackUp-X@main/webfonts/KoPubWorld%20Dotum%20Medium.ttf") format("truetype");font-weight:500;font-display:swap}\
@font-face{font-family:"KoPub Dotum Bold";src:url("https://cdn.jsdelivr.net/gh/unfail-human/BackUp-X@main/webfonts/KoPubWorld%20Dotum%20Bold.ttf") format("truetype");font-weight:700;font-display:swap}\
@font-face{font-family:"KoPub Batang Light";src:url("https://cdn.jsdelivr.net/gh/unfail-human/BackUp-X@main/webfonts/KoPubWorld%20Batang%20Light.ttf") format("truetype");font-weight:300;font-display:swap}\
@font-face{font-family:"KoPub Batang Medium";src:url("https://cdn.jsdelivr.net/gh/unfail-human/BackUp-X@main/webfonts/KoPubWorld%20Batang%20Medium.ttf") format("truetype");font-weight:500;font-display:swap}\
@font-face{font-family:"KoPub Batang Bold";src:url("https://cdn.jsdelivr.net/gh/unfail-human/BackUp-X@main/webfonts/KoPubWorld%20Batang%20Bold.ttf") format("truetype");font-weight:700;font-display:swap}';
  document.head.appendChild(fontCss);
  var fontStacks={
    Pretendard:'Pretendard,"Noto Sans KR",sans-serif',
    'Noto Sans KR':'"Noto Sans KR",sans-serif',
    'KoPub Dotum Light':'"KoPub Dotum Light",sans-serif','KoPub Dotum Medium':'"KoPub Dotum Medium",sans-serif','KoPub Dotum Bold':'"KoPub Dotum Bold",sans-serif',
    'KoPub Batang Light':'"KoPub Batang Light",serif','KoPub Batang Medium':'"KoPub Batang Medium",serif','KoPub Batang Bold':'"KoPub Batang Bold",serif',
    __system__:'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",sans-serif'
  };
  function normalizedFont(v){return v==='__default__'?'Pretendard':(v||'Pretendard')}
  function applyFont(v){
    var name=normalizedFont(v||rawRead().font),stack=fontStacks[name]||('"'+String(name).replace(/"/g,'')+'","Noto Sans KR",sans-serif');
    document.documentElement.style.setProperty('--app-font',stack);
    if(sheet){sheet.style.setProperty('font-family',stack,'important');sheet.querySelectorAll('*').forEach(function(n){n.style.setProperty('font-family',stack,'important')})}
  }
  function saveFont(v){var s=rawRead();s.font=normalizedFont(v);rawWrite(s);applyFont(s.font)}

  function groupFontList(){
    if(!controls)return;var sel=controls.querySelector('select[data-path="font"]');if(!sel||sel.dataset.grouped==='1')return;
    var current=sel.value,opts=Array.from(sel.options),groups={basic:[],dotum:[],batang:[],upload:[]};
    opts.forEach(function(o){
      if(o.value==='Pretendard'&&opts.some(function(x){return x.value==='__default__'}))return;
      if(o.value==='__default__'||o.value==='Noto Sans KR'||o.value==='__system__')groups.basic.push(o);
      else if(/^KoPub Dotum/.test(o.value))groups.dotum.push(o);
      else if(/^KoPub Batang/.test(o.value))groups.batang.push(o);
      else groups.upload.push(o);
    });
    sel.innerHTML='';
    [['기본',groups.basic],['KoPubWorld 돋움',groups.dotum],['KoPubWorld 바탕',groups.batang],['업로드 폰트',groups.upload]].forEach(function(g){if(!g[1].length)return;var og=document.createElement('optgroup');og.label=g[0];g[1].forEach(function(o){og.appendChild(o)});sel.appendChild(og)});
    var wanted=rawRead().font||normalizedFont(current);if(wanted==='Pretendard'&&sel.querySelector('option[value="__default__"]'))sel.value='__default__';else if(sel.querySelector('option[value="'+CSS.escape(wanted)+'"]'))sel.value=wanted;
    sel.dataset.grouped='1';
  }

  if(controls){
    controls.addEventListener('input',function(e){
      var c=e.target.closest&&e.target.closest('input[data-concept-side]');if(c){e.stopImmediatePropagation();setConcept(c.dataset.conceptSide,c.checked);return}
      if(e.target.matches('select[data-path="font"]')){e.stopPropagation();saveFont(e.target.value)}
    },true);
    controls.addEventListener('change',function(e){if(e.target.matches('select[data-path="font"]')){e.stopPropagation();saveFont(e.target.value)}},true);
  }

  function prepareUi(){
    if(controls){controls.querySelectorAll('.character-meta-editor .meta-color-row').forEach(function(n){n.remove()});groupFontList();syncConceptChecks()}
    renderConcepts();applyFont();
  }
  if(controls)new MutationObserver(function(){setTimeout(prepareUi,0)}).observe(controls,{childList:true,subtree:true});
  if(sheet)new MutationObserver(function(){setTimeout(function(){renderConcepts();applyFont()},0)}).observe(sheet,{childList:true,subtree:true});

  function downloadDataUrl(dataUrl,name){
    var a=document.createElement('a');a.href=dataUrl;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();a.remove();
  }
  async function exportPng(){
    if(!sheet)return;var name=((rawRead().pairName||'WeLog').trim()||'WeLog')+'.png';var oldTransform=sheet.style.transform,oldOrigin=sheet.style.transformOrigin;
    saveBtn.disabled=true;saveBtn.textContent='저장 중…';
    try{
      renderConcepts();applyFont();if(document.fonts&&document.fonts.ready)await document.fonts.ready;
      sheet.style.transform='none';sheet.style.transformOrigin='top left';await new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})});
      var area=Math.max(1,sheet.scrollWidth*sheet.scrollHeight),ratio=area>9000000?1:Math.min(2,window.devicePixelRatio||1.5),dataUrl=null,lastErr=null;
      if(window.htmlToImage){try{dataUrl=await window.htmlToImage.toPng(sheet,{backgroundColor:'#fff',pixelRatio:ratio,cacheBust:true,quality:1})}catch(e){lastErr=e}}
      if(!dataUrl&&window.html2canvas){
        try{var c=await window.html2canvas(sheet,{scale:ratio,useCORS:true,allowTaint:false,backgroundColor:'#fff',logging:false,imageTimeout:15000,foreignObjectRendering:true,scrollX:0,scrollY:0});dataUrl=c.toDataURL('image/png')}catch(e1){lastErr=e1}
        if(!dataUrl)try{var c2=await window.html2canvas(sheet,{scale:ratio,useCORS:true,allowTaint:true,backgroundColor:'#fff',logging:false,imageTimeout:15000,foreignObjectRendering:false,scrollX:0,scrollY:0});dataUrl=c2.toDataURL('image/png')}catch(e2){lastErr=e2}
      }
      if(!dataUrl||dataUrl.length<1000)throw lastErr||new Error('PNG data was empty');downloadDataUrl(dataUrl,name);
    }catch(err){console.error('WeLog PNG export failed',err);alert('PNG 저장에 실패했습니다. 오류를 다시 수정할 수 있도록 브라우저 콘솔의 WeLog PNG export failed 항목을 알려주세요.');}
    finally{sheet.style.transform=oldTransform;sheet.style.transformOrigin=oldOrigin;applyFont();saveBtn.disabled=false;saveBtn.textContent='↓ PNG 저장'}
  }
  if(saveBtn)saveBtn.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();exportPng()},true);

  var s=rawRead();if(!Array.isArray(s.conceptSides)){s.conceptSides=conceptSides(s);rawWrite(s)}
  setTimeout(prepareUi,0);
})();