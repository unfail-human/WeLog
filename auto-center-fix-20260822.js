(function(){
  'use strict';
  var sheet=document.getElementById('sheet'),timer=0,busy=false;
  if(!sheet)return;
  function nodes(root){return['.pair-title-display','.profile.left','.center','.profile.right'].map(function(s){return root.querySelector(s)}).filter(Boolean)}
  function trim(root,second){
    if(!root||busy)return;busy=true;
    root.style.setProperty('--welog-safe-top','0px');root.style.setProperty('--welog-safe-bottom','0px');
    root.style.setProperty('min-height','0px','important');root.style.removeProperty('height');
    requestAnimationFrame(function(){
      var rr=root.getBoundingClientRect(),scale=rr.height/(root.offsetHeight||rr.height||1),rs=nodes(root).map(function(n){return n.getBoundingClientRect()}).filter(function(r){return r.width&&r.height});
      if(!rs.length){busy=false;return}
      var bottom=Math.max.apply(null,rs.map(function(r){return r.bottom}));
      var footer=root.querySelector('.sheet-commission-footer'),footerH=footer?footer.getBoundingClientRect().height/Math.max(scale,.001):0;
      var target=Math.ceil((bottom-rr.top)/Math.max(scale,.001)+Math.max(24,footerH+20));
      target=Math.max(260,target);
      root.style.setProperty('height',target+'px','important');
      busy=false;
      if(second!==false)setTimeout(function(){trim(root,false)},24);
    });
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(function(){trim(sheet,true);document.querySelectorAll('.welog-exact-preview-sheet').forEach(function(r){trim(r,true)})},28)}
  new MutationObserver(schedule).observe(sheet,{childList:true,subtree:true});
  window.addEventListener('resize',schedule);
  ['input','change','pointerup'].forEach(function(ev){document.addEventListener(ev,schedule,true)});
  setTimeout(schedule,90);
})();