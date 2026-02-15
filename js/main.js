/* ══════════════════════════════════
   TyT Software — Premium Interactions
══════════════════════════════════ */

/* CURSOR */
const cur=document.getElementById('cur'),cr=document.getElementById('cur-r');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx-5+'px';cur.style.top=my-5+'px';});
(function aR(){rx+=(mx-rx)*.08;ry+=(my-ry)*.08;cr.style.left=rx-18+'px';cr.style.top=ry-18+'px';requestAnimationFrame(aR)})();
document.querySelectorAll('a,button,.sc,.proj-card,.ic-card,.ms,.logo-cell,.f-social-link,.stat-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cur.style.transform='scale(2.5)';cr.style.width='56px';cr.style.height='56px';cr.style.borderColor='rgba(47,111,239,.8)';});
  el.addEventListener('mouseleave',()=>{cur.style.transform='scale(1)';cr.style.width='36px';cr.style.height='36px';cr.style.borderColor='rgba(47,111,239,.5)';});
});

/* CANVAS PARTICLES */
const cv=document.getElementById('bg'),ctx=cv.getContext('2d');
let W,H,ps=[];
function rsz(){W=cv.width=innerWidth;H=cv.height=innerHeight;}
rsz();addEventListener('resize',rsz);
class P{constructor(){this.r()}r(){this.x=Math.random()*W;this.y=Math.random()*H;this.s=Math.random()*1.5+.3;this.vx=(Math.random()-.5)*.2;this.vy=(Math.random()-.5)*.2;this.o=Math.random()*.35+.05;this.c=Math.random()>.6?'47,111,239':'168,180,200';}u(){this.x+=this.vx;this.y+=this.vy;if(this.x<0||this.x>W||this.y<0||this.y>H)this.r();}d(){ctx.beginPath();ctx.arc(this.x,this.y,this.s,0,Math.PI*2);ctx.fillStyle=`rgba(${this.c},${this.o})`;ctx.fill();}}
for(let i=0;i<100;i++)ps.push(new P());
(function an(){ctx.clearRect(0,0,W,H);ps.forEach(p=>{p.u();p.d()});for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const dx=ps[i].x-ps[j].x,dy=ps[i].y-ps[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<100){ctx.beginPath();ctx.moveTo(ps[i].x,ps[i].y);ctx.lineTo(ps[j].x,ps[j].y);ctx.strokeStyle=`rgba(47,111,239,${.035*(1-d/100)})`;ctx.lineWidth=.5;ctx.stroke();}}requestAnimationFrame(an);})();

/* TYPED TEXT */
const phrases={
  es:['digitales que escalan.','tecnología que crece.','automatización real.'],
  en:['digital assets that scale.','technology that grows.','real automation.']
};
let lng='es',pi=0,ci=0,del=false,tel=document.getElementById('typed');
function type(){const w=phrases[lng][pi];if(!del){tel.textContent=w.substring(0,ci+1);ci++;if(ci===w.length){setTimeout(()=>{del=true;type()},2200);return;}}else{tel.textContent=w.substring(0,ci-1);ci--;if(ci===0){del=false;pi=(pi+1)%phrases[lng].length;}}setTimeout(type,del?55:90);}
setTimeout(type,1200);

/* NAVBAR */
addEventListener('scroll',()=>document.getElementById('nav').classList.toggle('s',scrollY>30));

/* REVEAL */
const obs=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in')}}),{threshold:.08,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

/* SERVICE GLOW + 3D TILT */
document.querySelectorAll('.sc').forEach(c=>{
  c.addEventListener('mousemove',e=>{
    const r=c.getBoundingClientRect();
    const x=e.clientX-r.left;
    const y=e.clientY-r.top;
    const cx=r.width/2;
    const cy=r.height/2;
    const rotY=((x-cx)/cx)*6;
    const rotX=((cy-y)/cy)*6;
    c.style.transform=`perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    const glow=c.querySelector('.sc-glow');
    if(glow)glow.style.background=`radial-gradient(circle at ${x}px ${y}px,rgba(47,111,239,.12),transparent 60%)`;
  });
  c.addEventListener('mouseleave',()=>{
    c.style.transform='perspective(800px) rotateX(0) rotateY(0) scale(1)';
  });
});

/* LANG */
function setLang(l){
  lng=l;pi=0;ci=0;del=false;
  document.querySelectorAll('.l-btn').forEach(b=>b.classList.remove('on'));
  document.querySelector(`.l-btn:${l==='es'?'first':'last'}-child`).classList.add('on');
  document.querySelectorAll('[data-es]').forEach(el=>{const t=el.getAttribute('data-'+l);if(t)el.innerHTML=t;});
}

/* SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    e.preventDefault();
    const t=document.querySelector(a.getAttribute('href'));
    if(t){
      t.scrollIntoView({behavior:'smooth',block:'start'});
      // Close mobile menu if open
      const mob=document.querySelector('.mobile-menu');
      const tog=document.querySelector('.menu-toggle');
      if(mob&&mob.classList.contains('open')){
        mob.classList.remove('open');
        tog.classList.remove('active');
        document.body.style.overflow='';
      }
    }
  });
});

/* MOBILE MENU */
const menuToggle=document.querySelector('.menu-toggle');
const mobileMenu=document.querySelector('.mobile-menu');
if(menuToggle&&mobileMenu){
  menuToggle.addEventListener('click',()=>{
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow=mobileMenu.classList.contains('open')?'hidden':'';
  });
}

/* SCROLL PROGRESS BAR */
const scrollBar=document.createElement('div');
scrollBar.className='scroll-progress';
document.body.appendChild(scrollBar);
addEventListener('scroll',()=>{
  const h=document.documentElement.scrollHeight-innerHeight;
  const p=h>0?(scrollY/h)*100:0;
  scrollBar.style.width=p+'%';
},{passive:true});

/* MAGNETIC BUTTONS */
document.querySelectorAll('.magnetic').forEach(btn=>{
  btn.addEventListener('mousemove',e=>{
    const r=btn.getBoundingClientRect();
    const x=e.clientX-r.left-r.width/2;
    const y=e.clientY-r.top-r.height/2;
    btn.style.transform=`translate(${x*.2}px,${y*.2}px)`;
  });
  btn.addEventListener('mouseleave',()=>{
    btn.style.transform='';
    btn.style.transition='transform .5s cubic-bezier(.34,1.56,.64,1)';
    setTimeout(()=>{btn.style.transition=''},500);
  });
});

/* PARALLAX ORBS ON SCROLL */
const orbs=document.querySelectorAll('.orb');
addEventListener('scroll',()=>{
  const s=scrollY;
  orbs.forEach((orb,i)=>{
    const speed=[.03,.02,.015][i]||.02;
    orb.style.transform=`translateY(${s*speed}px)`;
  });
},{passive:true});

/* IC-CARD GLOW FOLLOW */
document.querySelectorAll('.ic-card').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const glow=card.querySelector('.ic-card-glow');
    if(glow){
      glow.style.top=(e.clientY-r.top-125)+'px';
      glow.style.left=(e.clientX-r.left-125)+'px';
    }
  });
});

/* METHODOLOGY LINE ANIMATION */
const methObs=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in');
    }
  });
},{threshold:.2});
const methWrap=document.querySelector('.meth-wrap');
if(methWrap)methObs.observe(methWrap);
