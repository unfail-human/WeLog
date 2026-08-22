(function(){
  'use strict';
  var sheet=document.getElementById('sheet'),timer=0,busy=false;
  if(!sheet)return;

  function contentNodes(root){
    var sels=[
      '.pair-title-display',
      '.profile.left .profile-title','.profile.left .main-image','.profile.left .palette-bar','.profile.left .quote','.profile.left .facts','.profile.left .appearance-block','.profile.left .concept-block',
      '.profile.right .profile-title','.profile.right .main-image','.profile.right .palette-bar','.profile.right .quote','.profile.right .facts','.profile.right .appearance-block','.profile.right .concept-block',
      '.center .pair-image','.center .pair-split'
    ];
    var out=[];
    sels.forEach(function(sel){root.querySelectorAll(sel).forEach(function(el){if(out.indexOf(el)<0)out.push(el)})});
    return out;
  }

  function trim(root,second){
    if(!root||busy)return;
    busy=true;
    root.style.setProperty('--welog-safe-top','0px');
    root.style.setProperty('--welog-safe-bottom','0px');
    root.style.setProperty('min-height','0px','important');
    root.style.removeProperty('height');

    requestAnimationFrame(function(){
      var rr=root.getBoundingClientRect();
      var scale=rr.height/(root.offsetHeight||rr.height||1);
      scale=Math.max(scale,.001);
      var rs=contentNodes(root).map(function(n){return n.getBoundingClientRect()}).filter(function(r){return r.width>0&&r.height>0});
      if(!rs.length){busy=false;return}

      var bottom=Math.max.apply(null,rs.map(function(r){return r.bottom}));
      var contentBottom=(bottom-rr.top)/scale;
      var footer=root.querySelector('.sheet-commission-footer');
      var footerH=footer?footer.getBoundingClientRect().height/scale:0;
      var bottomGap=Math.max(12,Math.min(22,footerH?footerH*.35:16));
      var target=Math.ceil(contentBottom+bottomGap);

      root.style.setProperty('height',Math.max(260,target)+'px','important');
      root.style.setProperty('min-height','0px','important');
      busy=false;
      if(second!==false)setTimeout(function(){trim(root,false)},40);
    });
  }

  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(function(){
      trim(sheet,true);
      document.querySelectorAll('.welog-exact-preview-sheet').forEach(function(r){trim(r,true)});
    },32);
  }

  new MutationObserver(schedule).observe(sheet,{childList:true,subtree:true});
  window.addEventListener('resize',schedule);
  ['input','change','pointerup'].forEach(function(ev){document.addEventListener(ev,schedule,true)});
  setTimeout(schedule,100);
})();