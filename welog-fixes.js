(function(){
  var STORAGE_KEY="welog-pair-sheet-v4";
  var DB_NAME="welog-fonts-v1";
  var STORE="fonts";
  var controls=document.querySelector("#controls");
  var sheet=document.querySelector("#sheet");
  var uploadedFonts=[];
  var enhancing=false;
  var enhanceQueued=false;

  function readState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")||{}}catch(e){return{}}}
  function writeState(state){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){}}
  function updateState(path,value){var s=readState(),parts=path.split("."),o=s;parts.slice(0,-1).forEach(function(k){if(!o[k]||typeof o[k]!=="object")o[k]={};o=o[k]});o[parts[parts.length-1]]=value;writeState(s);queueEnhance()}
  function esc(v){return String(v||"").replace(/[&<>\"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[c]})}
  function currentSide(){var active=controls&&controls.querySelector("[data-character-side].on");return active&&active.dataset.characterSide||"left"}

  function fontStack(name){
    if(!name||name==="__default__"||name==="Pretendard")return 'Pretendard,"Noto Sans KR",sans-serif';
    if(name==="__system__")return 'system-ui,-apple-system,"Segoe UI","Noto Sans KR",sans-serif';
    return '"'+String(name).replace(/"/g,'')+'","Noto Sans KR",sans-serif';
  }
  function applyFont(){var s=readState();document.documentElement.style.setProperty("--app-font",fontStack(s.font))}

  function openDB(){return new Promise(function(resolve,reject){var r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=function(){if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:"name"})};r.onsuccess=function(){resolve(r.result)};r.onerror=function(){reject(r.error)}})}
  function dbPut(item){return openDB().then(function(db){return new Promise(function(resolve,reject){var tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(item);tx.oncomplete=function(){resolve()};tx.onerror=function(){reject(tx.error)}})})}
  function dbAll(){return openDB().then(function(db){return new Promise(function(resolve,reject){var r=db.transaction(STORE,"readonly").objectStore(STORE).getAll();r.onsuccess=function(){resolve(r.result||[])};r.onerror=function(){reject(r.error)}})}
  function loadFontRecord(rec){if(!rec||!rec.name||!rec.data)return Promise.resolve();var blob=new Blob([rec.data],{type:rec.type||"font/woff2"}),url=URL.createObjectURL(blob),face=new FontFace(rec.name,'url("'+url+'")');return face.load().then(function(f){document.fonts.add(f);return rec.name}).catch(function(){})}
  function refreshUploadedFonts(){return dbAll().then(function(list){uploadedFonts=list;return Promise.all(list.map(loadFontRecord))}).then(function(){ensureMainControls();applyFont()}).catch(function(){})}

  function ensureCharacterControls(){
    if(!controls)return;var switcher=controls.querySelector(".character-switch");if(!switcher)return;
    var side=currentSide(),existing=controls.querySelector(".subtitle-editor");if(existing&&existing.dataset.side===side)return;if(existing)existing.remove();
    var firstRich=controls.querySelector(".rich-control");if(!firstRich)return;var s=readState(),data=s[side]||{},value=data.subtitle||"",color=data.subtitleColor||"#918980";
    var box=document.createElement("section");box.className="subtitle-editor";box.dataset.side=side;
    box.innerHTML='<label><span>이름 외 별도 표기</span><input type="text" data-extra-path="'+side+'.subtitle" value="'+esc(value)+'" placeholder="이름과 함께 표시할 문구를 입력해 주세요."></label><label class="subtitle-color-control"><span>글자색</span><input type="color" data-extra-path="'+side+'.subtitleColor" value="'+color+'"></label>';
    firstRich.insertAdjacentElement("afterend",box);
  }

  function ensureMainControls(){
    if(!controls||!controls.querySelector(".layout-ratio-controls"))return;
    var s=readState(),pairBox=controls.querySelector(".pair-title-editor");
    if(!pairBox){pairBox=document.createElement("section");pairBox.className="pair-title-editor";pairBox.innerHTML='<div class="pair-title-editor-head"><b>페어명</b><span>시트 상단에 표시됩니다.</span></div><label><span>페어명</span><input type="text" data-extra-path="pairName" placeholder="페어명을 입력해 주세요."></label><label><span>페어명 별도 표기</span><input type="text" data-extra-path="catchphrase" placeholder="작게 표시할 문구를 입력해 주세요."></label>';controls.querySelector(".layout-ratio-controls").insertAdjacentElement("beforebegin",pairBox)}
    var pn=pairBox.querySelector('[data-extra-path="pairName"]'),cp=pairBox.querySelector('[data-extra-path="catchphrase"]');if(document.activeElement!==pn)pn.value=s.pairName||"";if(document.activeElement!==cp)cp.value=s.catchphrase||"";

    var global=controls.querySelector(".global-font-controls");if(!global)return;var select=global.querySelector('select[data-path="font"]');
    if(select){
      if(!select.querySelector('option[value="__default__"]'))select.insertAdjacentHTML("afterbegin",'<option value="__default__">기본 폰트 (Pretendard)</option><option value="__system__">시스템 폰트</option>');
      uploadedFonts.forEach(function(f){if(!Array.from(select.options).some(function(o){return o.value===f.name})){var op=document.createElement("option");op.value=f.name;op.textContent="업로드 · "+f.name;select.appendChild(op)}});
      if(Array.from(select.options).some(function(o){return o.value===(s.font||"Pretendard")}))select.value=s.font||"Pretendard";
    }
    if(!global.querySelector(".font-upload-control")){var up=document.createElement("label");up.className="font-upload-control";up.innerHTML='<span>폰트 업로드</span><input type="file" accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"><small>TTF · OTF · WOFF · WOFF2</small>';global.appendChild(up)}
  }

  function enhanceProfile(side){
    if(!sheet)return;var title=sheet.querySelector(".profile."+side+" .profile-title");if(!title)return;var s=readState(),data=s[side]||{},value=data.subtitle||"",color=data.subtitleColor||"#918980",stack=title.querySelector(".profile-name-stack");
    if(!stack){var name=title.querySelector(":scope > b");if(!name)return;stack=document.createElement("div");stack.className="profile-name-stack";name.replaceWith(stack);stack.appendChild(name)}
    var small=stack.querySelector(".profile-subtitle");if(!small){small=document.createElement("small");small.className="profile-subtitle";stack.appendChild(small)}
    if(small.textContent!==value)small.textContent=value;
    if(small.style.color!==color)small.style.color=color;
    small.hidden=!value;
  }

  function enhancePairTitle(){
    if(!sheet)return;var s=readState(),grid=sheet.querySelector(".sheet-grid");if(!grid)return;var head=sheet.querySelector(".pair-title-display");if(!head){head=document.createElement("header");head.className="pair-title-display";grid.insertAdjacentElement("beforebegin",head)}
    var name=s.pairName||"",sub=s.catchphrase||"",html='<b>'+esc(name)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':'');
    if(head.innerHTML!==html)head.innerHTML=html;
    head.hidden=!name&&!sub;
  }

  function enhanceAll(){
    if(enhancing)return;
    enhancing=true;
    try{applyFont();enhanceProfile("left");enhanceProfile("right");enhancePairTitle()}finally{enhancing=false}
  }
  function queueEnhance(){
    if(enhanceQueued)return;
    enhanceQueued=true;
    requestAnimationFrame(function(){enhanceQueued=false;enhanceAll()});
  }

  if(controls){
    controls.addEventListener("input",function(e){var path=e.target.dataset&&e.target.dataset.extraPath;if(path){updateState(path,e.target.value);return}if(e.target.matches('.font-upload-control input[type="file"]')){var file=e.target.files&&e.target.files[0];if(!file)return;var base=(file.name||"Custom Font").replace(/\.[^.]+$/,""),name=base,reader=new FileReader();reader.onload=function(){dbPut({name:name,type:file.type||"font/woff2",data:reader.result}).then(function(){return refreshUploadedFonts()}).then(function(){updateState("font",name);var sel=controls.querySelector('select[data-path="font"]');if(sel)sel.value=name}).catch(function(){alert("폰트를 저장하지 못했습니다.")})};reader.readAsArrayBuffer(file);e.target.value=""}},true);
    controls.addEventListener("change",function(e){if(e.target.matches('select[data-path="font"]'))setTimeout(applyFont,0)},true);
  }

  var controlsObserver=controls&&new MutationObserver(function(){if(enhancing)return;ensureCharacterControls();ensureMainControls()});if(controlsObserver)controlsObserver.observe(controls,{childList:true,subtree:true});
  var sheetObserver=sheet&&new MutationObserver(function(){if(enhancing)return;queueEnhance()});if(sheetObserver)sheetObserver.observe(sheet,{childList:true,subtree:true});
  ensureCharacterControls();ensureMainControls();enhanceAll();refreshUploadedFonts();
})();
