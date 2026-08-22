(function(){
  var STORAGE_KEY="welog-pair-sheet-v4";
  var controls=document.querySelector("#controls");
  var sheet=document.querySelector("#sheet");

  function readState(){
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")||{}}
    catch(e){return{}}
  }

  function sideState(side){
    var state=readState();
    return state[side]||{};
  }

  function currentSide(){
    var active=controls&&controls.querySelector("[data-character-side].on");
    return active&&active.dataset.characterSide||"left";
  }

  function subtitleSize(value){
    var n=Number(value);
    return isFinite(n)&&n>=7&&n<=20?n:10;
  }

  function ensureCharacterControls(){
    if(!controls)return;
    var switcher=controls.querySelector(".character-switch");
    if(!switcher)return;

    var side=currentSide();
    var existing=controls.querySelector(".subtitle-editor");
    if(existing&&existing.dataset.side===side)return;
    if(existing)existing.remove();

    var firstRich=controls.querySelector(".rich-control");
    if(!firstRich)return;

    var data=sideState(side);
    var value=data.subtitle||"";
    var size=subtitleSize(data.subtitleSize);
    var color=data.subtitleColor||"#918980";

    var box=document.createElement("section");
    box.className="subtitle-editor";
    box.dataset.side=side;
    box.innerHTML='\
      <label>\
        <span>이름 아래 작은 글씨</span>\
        <input type="text" data-path="'+side+'.subtitle" value="'+escapeAttr(value)+'" placeholder="작은 글씨를 입력해 주세요.">\
      </label>\
      <div class="subtitle-style-row">\
        <label class="subtitle-color-control">\
          <span>글자색</span>\
          <input type="color" data-path="'+side+'.subtitleColor" value="'+color+'">\
        </label>\
        <label class="subtitle-size-control">\
          <span class="subtitle-size-head"><span>글씨 크기</span><b data-subtitle-size-value>'+size+'px</b></span>\
          <input type="range" min="7" max="20" step="1" data-path="'+side+'.subtitleSize" value="'+size+'">\
        </label>\
      </div>';

    firstRich.insertAdjacentElement("afterend",box);
  }

  function escapeAttr(value){
    return String(value||"").replace(/[&<>\"]/g,function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[c];
    });
  }

  function enhanceProfile(side){
    if(!sheet)return;
    var title=sheet.querySelector(".profile."+side+" .profile-title");
    if(!title)return;

    var data=sideState(side);
    var value=data.subtitle||"";
    var size=subtitleSize(data.subtitleSize);
    var color=data.subtitleColor||"#918980";
    var stack=title.querySelector(".profile-name-stack");

    if(!stack){
      var name=title.querySelector(":scope > b");
      if(!name)return;
      stack=document.createElement("div");
      stack.className="profile-name-stack";
      name.replaceWith(stack);
      stack.appendChild(name);
    }

    var small=stack.querySelector(".profile-subtitle");
    if(!small){
      small=document.createElement("small");
      small.className="profile-subtitle";
      stack.appendChild(small);
    }

    small.textContent=value;
    small.style.fontSize=size+"px";
    small.style.color=color;
    small.hidden=!value;
  }

  function enhanceSheet(){
    enhanceProfile("left");
    enhanceProfile("right");
  }

  if(controls){
    controls.addEventListener("input",function(e){
      var path=e.target.dataset&&e.target.dataset.path||"";
      if(!/\.(subtitle|subtitleSize|subtitleColor)$/.test(path))return;
      if(/\.subtitleSize$/.test(path)){
        var label=controls.querySelector("[data-subtitle-size-value]");
        if(label)label.textContent=e.target.value+"px";
      }
      setTimeout(enhanceSheet,0);
    });
  }

  var controlsObserver=controls&&new MutationObserver(function(){ensureCharacterControls()});
  if(controlsObserver)controlsObserver.observe(controls,{childList:true,subtree:true});

  var sheetObserver=sheet&&new MutationObserver(function(){enhanceSheet()});
  if(sheetObserver)sheetObserver.observe(sheet,{childList:true,subtree:true});

  ensureCharacterControls();
  enhanceSheet();
})();
