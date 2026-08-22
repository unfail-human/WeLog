(function(){
  'use strict';
  var KEY='welog-pair-sheet-v4';
  var sheet=document.getElementById('sheet');
  var controls=document.getElementById('controls');
  if(!sheet||!controls)return;

  var UI_FONT='Pretendard,"Noto Sans KR",Arial,sans-serif';
  var defs={
    'Pretendard':{family:'WeLog-Sheet-Pretendard',url:'https://raw.githubusercontent.com/unfail-human/BackUp-X/main/webfonts/PretendardVariable.woff2',weight:'100 900'},
    'Noto Sans KR':{family:'WeLog-Sheet-Noto',url:'https://raw.githubusercontent.com/unfail-human/BackUp-X/main/webfonts/NotoSansKR-VariableFont_wght.woff2',weight:'100 900'},
    'KoPub Dotum Medium':{family:'WeLog-Sheet-KoPubDotum',url:'https://raw.githubusercontent.com/unfail-human/BackUp-X/main/webfonts/KoPubWorld%20Dotum%20Medium.ttf',weight:'500'},
    'KoPub Batang Medium':{family:'WeLog-Sheet-KoPubBatang',url:'https://raw.githubusercontent.com/unfail-human/BackUp-X/main/webfonts/KoPubWorld%20Batang%20Medium.ttf',weight:'500'}
  };
  var loading={};

  function normalize(v){
    if(/^KoPub Dotum/.test(v||''))return 'KoPub Dotum Medium';
    if(/^KoPub Batang/.test(v||''))return 'KoPub Batang Medium';
    if(v==='__default__'||!v)return 'Pretendard';
    return v;
  }
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
  function saveFont(v){var s=read();s.font=normalize(v);try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  function current(){var sel=controls.querySelector('select[data-path="font"]');return normalize((sel&&sel.value)||read().font||'Pretendard')}
  function stack(name){
    if(name==='__system__')return 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
    if(defs[name])return '"'+defs[name].family+'",sans-serif';
    return '"'+String(name).replace(/"/g,'')+'","Noto Sans KR",sans-serif';
  }
  function load(name){
    if(name==='__system__'||!defs[name]||!window.FontFace)return Promise.resolve();
    if(loading[name])return loading[name];
    var d=defs[name];
    loading[name]=new FontFace(d.family,'url("'+d.url+'")',{style:'normal',weight:d.weight}).load().then(function(face){document.fonts.add(face);return face}).catch(function(err){console.error('WeLog sheet font load failed',name,err);return null});
    return loading[name];
  }
  function resetUi(){
    document.documentElement.style.setProperty('--app-font',UI_FONT);
    document.body.style.fontFamily=UI_FONT;
    var inspector=document.getElementById('editor');
    if(inspector)inspector.style.fontFamily=UI_FONT;
  }
  function paint(root,family){
    if(!root)return;
    /* Keep the selected family as a sheet-scoped CSS variable so newly rendered nodes
       (especially the pair-name block) inherit it even after renderSheet replaces them. */
    root.style.setProperty('--welog-sheet-font',family);
    root.style.setProperty('font-family',family,'important');
    root.querySelectorAll('*').forEach(function(el){
      if(el.classList&&el.classList.contains('welog-layout-overlay-fixed'))return;
      el.style.setProperty('font-family',family,'important');
    });
    /* Pair title used to be recreated after font application. Force the current nodes too. */
    root.querySelectorAll('.pair-title-display,.pair-title-display b,.pair-title-display small').forEach(function(el){
      el.style.setProperty('font-family',family,'important');
    });
  }
  async function apply(v){
    var name=normalize(v||current());
    await load(name);
    var family=stack(name);
    resetUi();
    paint(sheet,family);
    document.querySelectorAll('.welog-preview-sheet,.welog-exact-preview-sheet,.welog-export-host #sheet').forEach(function(root){paint(root,family)});
    requestAnimationFrame(resetUi);
  }

  function handle(e){
    var t=e.target;
    if(!t||!t.matches||!t.matches('select[data-path="font"]'))return;
    var v=t.value;
    saveFont(v);
    setTimeout(function(){apply(v)},0);
    setTimeout(function(){apply(v)},80);
    setTimeout(function(){apply(v)},250);
  }
  controls.addEventListener('input',handle,true);
  controls.addEventListener('change',handle,true);
  document.addEventListener('click',function(){setTimeout(resetUi,0)},true);
  /* Main controls can replace parts of #sheet. Reapply only after genuine form edits,
     without observing the DOM (which previously caused editor loops). */
  document.addEventListener('input',function(e){if(sheet.contains(e.target))return;setTimeout(function(){apply()},0)},false);
  document.addEventListener('change',function(e){if(sheet.contains(e.target))return;setTimeout(function(){apply()},0)},false);
  window.addEventListener('resize',function(){resetUi();apply()},false);
  Object.keys(defs).forEach(load);
  resetUi();
  setTimeout(function(){apply()},30);
  setTimeout(function(){apply()},300);
})();