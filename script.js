'use strict';
const sections = [...document.querySelectorAll('main > section')];
const chapterLinks = [...document.querySelectorAll('.chapter-nav a')];
const progress = document.getElementById('progress');
let chapter = -1, scheduled = false;
function updatePage(){
  scheduled = false;
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${scrollable > 0 ? Math.min(100,Math.max(0,scrollY/scrollable*100)) : 0}%`;
  const marker = innerHeight * .44;
  let next = 0;
  sections.forEach((section,index)=>{if(section.getBoundingClientRect().top <= marker) next=index;});
  if(scrollY+innerHeight >= document.documentElement.scrollHeight-3) next=sections.length-1;
  if(next === chapter) return;
  chapter = next;
  chapterLinks.forEach((link,index)=>{if(index===chapter)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
}
window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updatePage);}}, {passive:true});
window.addEventListener('resize',updatePage);
updatePage();
if('IntersectionObserver' in window){
  const revealObserver = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}});
  },{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
