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
  function measure(state){
    var map=targets(),rs=[];
    Object.keys(map).forEach(function(k){var r=rectFor(k,map[k],state);if(r)rs.push(r)});
    if(!rs.length)return null;
    return{left:Math.min.apply(null,rs.map(function(r){return r.left})),right:Math.max.apply(null,rs.map(function(r){return r.right})),top:Math.min.apply(null,rs.map(function(r){return r.top})),bottom:Math.max.apply(null,rs.map(function(r){return r.bottom}))};
  }
  function nudge(state,dx,dy){
    ['pair','characters','center','ok','credit'].forEach(function(k){
      state[k]=state[k]||{};
      state[k].x=Math.max(-420,Math.min(420,(Number(state[k].x)||0)+dx));
      state[k].y=Math.max(-420,Math.min(420,(Number(state[k].y)||0)+dy));
    });
  }
  function centerAll(){
    var state=read(),box=measure(state);if(!box)return;
    var sr=sheet.getBoundingClientRect(),sc=scaleInfo();
    var dx=Math.round((((sr.left+sr.right)/2)-((box.left+box.right)/2))/Math.max(sc.x,.001));
    var dy=Math.round((((sr.top+sr.bottom)/2)-((box.top+box.bottom)/2))/Math.max(sc.y,.001));
    nudge(state,dx,dy);write(state);applyState(state);
    requestAnimationFrame(function(){
      var fresh=read(),check=measure(fresh);if(!check)return;
      var sr2=sheet.getBoundingClientRect(),sc2=scaleInfo();
      var fixX=Math.round((((sr2.left+sr2.right)/2)-((check.left+check.right)/2))/Math.max(sc2.x,.001));
      var fixY=Math.round((((sr2.top+sr2.bottom)/2)-((check.top+check.bottom)/2))/Math.max(sc2.y,.001));
      if(Math.abs(fixX)>0||Math.abs(fixY)>0){nudge(fresh,fixX,fixY);write(fresh);applyState(fresh)}
    });
  }
  function inject(){
    var hud=document.querySelector('.welog-layout-hud');if(!hud)return;
    var actions=hud.querySelector('.welog-layout-hud-actions');if(!actions)return;
    var b=actions.querySelector('[data-layout-center-all]');
    if(!b){b=document.createElement('button');b.type='button';b.dataset.layoutCenterAll='';b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();centerAll()});actions.insertBefore(b,actions.firstChild)}
    b.textContent='전체 중앙 정렬';
    b.title='현재 배치를 유지한 채 전체 섹션을 카드의 상하좌우 정중앙에 맞춥니다.';
  }
  new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});setTimeout(inject,0);
})();