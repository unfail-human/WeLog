(function(){
  var KEY="welog-pair-sheet-v4";
  var controls=document.querySelector("#controls"),sheet=document.querySelector("#sheet"),printBtn=document.querySelector("#printBtn");

  function read(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){return{}}}
  function write(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  function esc(v){return String(v==null?"":v).replace(/[&<>\"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[c]})}
  function conceptSides(s){
    if(Array.isArray(s.conceptSides))return s.conceptSides.filter(function(x){return x==="left"||x==="right"});
    if(s.visible&&s.visible.concept&&s.conceptSide)return [s.conceptSide];
    return [];
  }
  function styleFor(s,path){
    var st=(s.textStyles&&s.textStyles[path])||{};
    return "font-weight:"+(st.bold?700:400)+";font-style:"+(st.italic?"italic":"normal")+";text-decoration:"+(st.underline?"underline":"none")+";color:"+(st.color||"#24211d")+";font-size:13px;text-align:"+(st.align||"left")+";white-space:pre-wrap";
  }
  function conceptBlock(s,side){
    var value=s[side]&&s[side].concept||"";
    var ps=String(value).split("\n").filter(Boolean).map(function(x){return "<p>"+esc(x)+"</p>"}).join("");
    var wrap=document.createElement("div");
    wrap.className="text-block concept-block";
    wrap.dataset.hotfixConcept=side;
    wrap.innerHTML='<h3>컨셉</h3><div class="formatted-lines" style="'+styleFor(s,side+".concept")+'">'+ps+'</div>';
    return wrap;
  }
  function applyConceptSheet(){
    if(!sheet)return;
    var s=read(),selected=conceptSides(s);
    sheet.querySelectorAll(".concept-block").forEach(function(el){el.remove()});
    selected.forEach(function(side){
      var profile=sheet.querySelector(".profile."+side);
      if(!profile)return;
      var block=conceptBlock(s,side),commission=profile.querySelector(".commission-block");
      if(commission)profile.insertBefore(block,commission);else profile.appendChild(block);
    });
  }
  function applyConceptControls(){
    if(!controls)return;
    var s=read(),selected=conceptSides(s);
    controls.querySelectorAll("input[data-concept-side]").forEach(function(cb){
      cb.checked=selected.indexOf(cb.dataset.conceptSide)>=0;
    });
    controls.querySelectorAll(".character-meta-editor .meta-color-row").forEach(function(el){el.remove()});
  }
  function syncConceptState(side,checked){
    var s=read(),selected=conceptSides(s),i=selected.indexOf(side);
    if(checked&&i<0)selected.push(side);
    if(!checked&&i>=0)selected.splice(i,1);
    s.conceptSides=selected;
    s.conceptSide=selected[0]||"";
    s.visible=s.visible||{};
    s.visible.concept=selected.length>0;
    write(s);
    applyConceptControls();
    applyConceptSheet();
  }

  function afterRender(){setTimeout(function(){applyConceptControls();applyConceptSheet()},0)}

  if(controls){
    controls.addEventListener("input",function(e){
      var cb=e.target.closest&&e.target.closest("input[data-concept-side]");
      if(!cb)return;
      e.stopImmediatePropagation();
      syncConceptState(cb.dataset.conceptSide,cb.checked);
    },true);
    controls.addEventListener("change",function(e){
      var cb=e.target.closest&&e.target.closest("input[data-concept-side]");
      if(cb)e.stopImmediatePropagation();
    },true);
    controls.addEventListener("input",function(e){if(!(e.target.closest&&e.target.closest("input[data-concept-side]")))afterRender()},false);
    controls.addEventListener("change",function(e){if(!(e.target.closest&&e.target.closest("input[data-concept-side]")))afterRender()},false);
    new MutationObserver(afterRender).observe(controls,{childList:true,subtree:true});
  }
  document.addEventListener("click",afterRender,true);

  async function waitForImages(root){
    var imgs=Array.from(root.querySelectorAll("img"));
    await Promise.all(imgs.map(function(img){
      if(img.complete)return Promise.resolve();
      return new Promise(function(resolve){var done=function(){resolve()};img.addEventListener("load",done,{once:true});img.addEventListener("error",done,{once:true});setTimeout(done,5000)});
    }));
  }
  async function savePng(){
    if(!sheet||!window.html2canvas){alert("PNG 저장 기능을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.");return}
    var oldTransform=sheet.style.transform,oldOrigin=sheet.style.transformOrigin;
    printBtn.disabled=true;printBtn.textContent="저장 중…";
    try{
      applyConceptSheet();
      if(document.fonts&&document.fonts.ready)await document.fonts.ready;
      await waitForImages(sheet);
      sheet.style.transform="none";sheet.style.transformOrigin="top left";
      await new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})});
      var w=Math.max(sheet.scrollWidth,sheet.offsetWidth),h=Math.max(sheet.scrollHeight,sheet.offsetHeight);
      var maxPixels=18000000,scale=Math.min(2,Math.max(1,Math.sqrt(maxPixels/Math.max(1,w*h))));
      var canvas=await window.html2canvas(sheet,{scale:scale,useCORS:true,allowTaint:false,backgroundColor:"#ffffff",logging:false,imageTimeout:15000,foreignObjectRendering:false,removeContainer:true,width:w,height:h,scrollX:0,scrollY:0});
      var blob=await new Promise(function(resolve){canvas.toBlob(resolve,"image/png",1)});
      if(!blob)throw new Error("PNG blob creation failed");
      var url=URL.createObjectURL(blob),a=document.createElement("a");
      a.href=url;a.download=((read().pairName||"WeLog").trim()||"WeLog")+".png";a.style.display="none";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},1500);
    }catch(err){console.error("WeLog PNG export failed",err);alert("PNG 저장에 실패했습니다. 이미지를 다시 불러오거나 새로고침한 뒤 다시 시도해 주세요.")}
    finally{sheet.style.transform=oldTransform;sheet.style.transformOrigin=oldOrigin;printBtn.disabled=false;printBtn.textContent="↓ PNG 저장"}
  }
  if(printBtn)printBtn.onclick=savePng;

  var s=read();
  if(!Array.isArray(s.conceptSides)){s.conceptSides=conceptSides(s);write(s)}
  afterRender();
})();
