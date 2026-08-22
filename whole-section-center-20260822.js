(function(){
  'use strict';
  var KEY='welog-section-layout-v2';
  var sheet=document.getElementById('sheet');
  if(!sheet)return;

  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
  function write(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}}
  function scaleInfo(){var r=sheet.getBoundingClientRect();return{x:r.width/(sheet.offsetWidth||r.width||1),y:r.height/(sheet.offsetHeight||r.height||1)}}
  function cleanCrop(c){c=c||{};return{top:Number(c.top)||0,right:Number(c.right)||0,bottom:Number(c.bottom)||0,left:Number(c.left)||0}}
  function targets(){return{
    pair:[sheet.querySelector('.pair-title-display')].filter(Boolean),
    characters:[sheet.querySelector('.profile.left'),sheet.querySelector('.profile.right')].filter(Boolean),
    center:[sheet.querySelector('.center')].filter(Boolean),
    ok:[sheet.querySelector('.welog-ok-zone')].filter(Boolean),
    credit:[sheet.querySelector('.welog-credit-zone')].filter(Boolean)
  }}
  function rectFor(key,nodes,state){
    var rs=nodes.map(function(n){return n.getBoundingClientRect()}).filter(function(r){return r.width&&r.height});
    if(!rs.length)return null;
    var r={left:Math.min.apply(null,rs.map(function(x){return x.left})),right:Math.max.apply(null,rs.map(function(x){return x.right})),top:Math.min.apply(null,rs.map(function(x){return x.top})),bottom:Math.max.apply(null,rs.map(function(x){return x.bottom}))};
    if(key==='center'){
      var c=cleanCrop(state.center&&state.center.crop),w=r.right-r.left,h=r.bottom-r.top;
      r={left:r.left+w*c.left/100,right:r.right-w*c.right/100,top:r.top+h*c.top/100,bottom:r.bottom-h*c.bottom/100};
    }
    return r;
  }
  function applyState(state){
    var map=targets();
    Object.keys(map).forEach(function(k){
      var d=state[k]||{},sc=Math.max(55,Math.min(170,Number(d.scale)||100)),x=Number(d.x)||0,y=Number(d.y)||0;
      map[k].forEach(function(el){el.style.setProperty('transform','translate('+x+'px,'+y+'px) scale('+(sc/100)+')','important')});
    });
    window.dispatchEvent(new CustomEvent('welog-layout-state-changed'));
  }
  function centerAll(){
    var state=read(),map=targets(),rs=[];
    Object.keys(map).forEach(function(k){var r=rectFor(k,map[k],state);if(r)rs.push(r)});
    if(!rs.length)return;
    var allLeft=Math.min.apply(null,rs.map(function(r){return r.left})),allRight=Math.max.apply(null,rs.map(function(r){return r.right}));
    var sr=sheet.getBoundingClientRect(),sc=scaleInfo().x,current=(allLeft+allRight)/2,target=(sr.left+sr.right)/2;
    var delta=Math.round((target-current)/Math.max(sc,.001));
    ['pair','characters','center','ok','credit'].forEach(function(k){state[k]=state[k]||{};state[k].x=Math.max(-420,Math.min(420,(Number(state[k].x)||0)+delta))});
    write(state);applyState(state);
    requestAnimationFrame(function(){
      var check=[],fresh=read(),freshMap=targets();Object.keys(freshMap).forEach(function(k){var r=rectFor(k,freshMap[k],fresh);if(r)check.push(r)});
      if(check.length){var l=Math.min.apply(null,check.map(function(r){return r.left})),rr=Math.max.apply(null,check.map(function(r){return r.right})),err=((sr.left+sr.right)/2)-((l+rr)/2);if(Math.abs(err)>1){var fix=Math.round(err/Math.max(sc,.001));['pair','characters','center','ok','credit'].forEach(function(k){fresh[k]=fresh[k]||{};fresh[k].x=Math.max(-420,Math.min(420,(Number(fresh[k].x)||0)+fix))});write(fresh);applyState(fresh)}}
    });
  }
  function inject(){
    var hud=document.querySelector('.welog-layout-hud');if(!hud)return;
    var actions=hud.querySelector('.welog-layout-hud-actions');if(!actions||actions.querySelector('[data-layout-center-all]'))return;
    var b=document.createElement('button');b.type='button';b.dataset.layoutCenterAll='';b.textContent='전체 중앙 정렬';b.title='현재 배치를 유지한 채 전체 섹션을 카드의 가로 정중앙에 맞춥니다.';
    b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();centerAll()});actions.insertBefore(b,actions.firstChild);
  }
  new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});setTimeout(inject,0);
})();