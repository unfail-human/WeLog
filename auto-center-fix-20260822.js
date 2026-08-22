(function(){
  'use strict';
  var sheet=document.getElementById('sheet'), timer=0, running=false;
  if(!sheet)return;
  function majorRects(root){
    var sels=['.pair-title-display','.profile.left','.center','.profile.right','.sheet-commission-footer'];
    return sels.map(function(s){return root.querySelector(s)}).filter(Boolean).map(function(el){return el.getBoundingClientRect()}).filter(function(r){return r.width&&r.height});
  }
  function balance(root){
    if(!root||running)return;
    running=true;
    root.style.setProperty('--welog-safe-top','0px');
    root.style.setProperty('--welog-safe-bottom','0px');
    requestAnimationFrame(function(){
      var sr=root.getBoundingClientRect(), rs=majorRects(root);
      if(!rs.length){running=false;return}
      var top=Math.min.apply(null,rs.map(function(r){return r.top}));
      var bottom=Math.max.apply(null,rs.map(function(r){return r.bottom}));
      var pad=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--welog-pad-y'))||0;
      var needTop=Math.max(0,Math.ceil((sr.top+pad)-top));
      var needBottom=Math.max(0,Math.ceil(bottom-(sr.bottom-pad)));
      var safe=Math.max(needTop,needBottom);
      root.style.setProperty('--welog-safe-top',safe+'px');
      root.style.setProperty('--welog-safe-bottom',safe+'px');
      running=false;
    });
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(function(){balance(sheet);document.querySelectorAll('.welog-exact-preview-sheet').forEach(balance)},30)}
  new MutationObserver(schedule).observe(sheet,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  window.addEventListener('resize',schedule);
  document.addEventListener('input',schedule,true);
  document.addEventListener('change',schedule,true);
  setTimeout(schedule,80);
})();
