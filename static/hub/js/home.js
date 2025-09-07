// Fallback safety: if links are broken, try alternate paths relative to current file
document.addEventListener('DOMContentLoaded', () => {
  const links = [
    {id:'play-chess', paths:['simplechess/simplechess.html','simplechess.html','templates/simplechess/simplechess.html']},
    {id:'play-platformer', paths:['simpleplatformer/platformer.html','platformer.html','templates/simpleplatformer/platformer.html']},
    {id:'play-fps', paths:['simplefps/fps.html','fps.html','templates/simplefps/fps.html']},
  ];
  links.forEach(item => {
    const el = document.getElementById(item.id);
    if(!el) return;
    (async ()=>{
      for(const p of item.paths){
        try{
          const res = await fetch(p, {method:'HEAD'});
          if(res.ok){ el.setAttribute('href', p); return; }
        }catch(e){ /* ignore */ }
      }
    })();
  });
});
