(function(){
  'use strict';
  var KEY='welog-section-layout-v2';
  var sheet=document.getElementById('sheet');
  if(!sheet)return;

  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
  function write(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}}
  function localScale(){var r=sheet.getBoundingClientRect();return r.width/(sheet.offsetWidth||r.width||1)}
  function parts(){
    var selectors=['.pair-title-display','.profile.left','.profile.right','.center','.welog-ok-zone','.welog-credit-zone'];
    return selectors.map(function(s){return sheet.querySelector(s)}).filter(Boolean);
  }
  function union(nodes){
    var rs=nodes.map(function(n){return n.getBoundingClientRect()}).filter(function(r){return r.width&&r.height});
    if(!rs.length)return null;
    return {left:Math.min.apply(null,rs.map(function(r){return r.left})),right:Math.max.apply(null,rs.map(function(r){return r.right}))};
  }
  function centerAll(){
    var r=union(parts());if(!r)return;
    var sr=sheet.getBoundingClientRect(), sc=localScale();
    var current=(r.left+r.right)/2, target=(sr.left+sr.right)/2;
    var delta=Math.round((target-current)/Math.max(sc,.001));
    if(Math.abs(delta)<1)return;
    var state=read();
    ['pair','characters','center','ok','credit'].forEach(function(k){
      state[k]=state[k]||{};
      state[k].x=Math.max(-420,Math.min(420,(Number(state[k].x)||0)+delta));
    });
    write(state);
    window.dispatchEvent(new Event('resize'));
    setTimeout(function(){window.dispatchEvent(new Event('resize'))},40);
  }
  function inject(){
    var hud=document.querySelector('.welog-layout-hud');
    if(!hud)return;
    var actions=hud.querySelector('.welog-layout-hud-actions');
    if(!actions||actions.querySelector('[data-layout-center-all]'))return;
    var b=document.createElement('button');
    b.type='button';b.dataset.layoutCenterAll='';b.textContent='전체 중앙 정렬';
    b.title='현재 배치를 유지한 채 전체 섹션을 카드의 가로 정중앙에 맞춥니다.';
    b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();centerAll()});
    actions.insertBefore(b,actions.firstChild);
  }
  new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});
  setTimeout(inject,0);
})();