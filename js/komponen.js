/* ==========================================================================
   komponen.js · KOMPONEN BERSAMA
   Dipakai oleh semua tab. Tidak berisi logika khusus satu tab.
   - PL.U        : utilitas kecil (pilih elemen, format angka)
   - PL.Bidang   : bidang koordinat; satu instans per tab (tiap tab punya <svg> sendiri)
   - PL.Plus     : maskot Plus (berbicara, menunjuk elemen atau titik bidang)
   - PL.Math     : perender rumus KaTeX dengan teks cadangan
   - PL.Langkah  : penampil langkah soal; dipakai Latihan Mandiri dan Kuis dengan opsi berbeda
   ========================================================================== */
(function(PL){
'use strict';
var U=PL.U={};
var $=U.$=function(s,r){return (r||document).querySelector(s);};
U.$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s));};
U.esc=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
U.nm=CORE.nm;U.rp=CORE.rp;U.ptS=CORE.ptS;U.ineqS=CORE.ineqS;U.eqS=CORE.eqS;U.lin=CORE.lin;U.Lq=CORE.L;
U.frac=function(v){var w=Math.floor(v+1e-9),r=v-w;if(Math.abs(r)<1e-9)return CORE.nm(w);var f={'0.333':'⅓','0.667':'⅔','0.5':'½','0.25':'¼','0.75':'¾'}[(Math.round(r*1000)/1000).toString()];return f?(w?CORE.nm(w):'')+f:CORE.nm(Math.round(v*100)/100);};
U.seed=function(){return Math.floor(Math.random()*2147483646)+1;};
var esc=U.esc,nm=U.nm,ptS=U.ptS,lin=U.lin,Lq=U.Lq,frac=U.frac;
var COL=PL.COL=['#1d4ed8','#c2410c','#7e22ce','#0f766e'];
var MKC={k:'#1b2a41',g:'#15803d',r:'#b91c1c',b:'#c2410c',o:'#b45309',c:'#92400e'};
function modeNow(){return document.body.dataset.mode||'belajar';}
PL.mode=modeNow;

/* ---------- PL.Bidang: bidang koordinat berskala ----------
   var b=PL.Bidang(svgEl, capEl);  b.gambar(V);  b.klik(e) → {mx,my,vx,vy};  b.tempel(c) → titik kisi
   V = {B, lines:[{q,ty:1 tipis|2 sesuai tanda,col,lbl}], shade:sys, ar, mk:[{x,y,c,l,h}], cross, dots, cd, sel, pick, gs:{p,q,k}, cap} */
PL.Bidang=function(svg,cap){
  var N=460,MG=30,PB=CORE.FULL,PK=(N-2*MG)/20;
  function setBox(B){PB=B;PK=(N-2*MG)/(B.x1-B.x0);}
  function sx(x){return MG+(x-PB.x0)*PK;}
  function sy(y){return N-MG-(y-PB.y0)*PK;}
  function isQ1(B){return B.x0===-B.g;}
  function lineEnds(q,B){
    var pts=[],u=[],e=1e-9;
    if(q.b!==0)[B.x0,B.x1].forEach(function(x){var y=(q.c-q.a*x)/q.b;if(y>=B.y0-e&&y<=B.y1+e)pts.push([x,y]);});
    if(q.a!==0)[B.y0,B.y1].forEach(function(y){var x=(q.c-q.b*y)/q.a;if(x>=B.x0-e&&x<=B.x1+e)pts.push([x,y]);});
    pts.forEach(function(p){if(!u.some(function(r){return Math.abs(r[0]-p[0])<1e-6&&Math.abs(r[1]-p[1])<1e-6;}))u.push(p);});
    return u.length>=2?[u[0],u[1]]:null;
  }
  function isAxisLine(q){return q.c===0&&((q.a!==0&&q.b===0)||(q.a===0&&q.b!==0));}
  function polyS(poly){return poly.map(function(p){return sx(p[0]).toFixed(1)+','+sy(p[1]).toFixed(1);}).join(' ');}
  function ptLbl(p,t,col){var X=sx(p.x),Y=sy(p.y),rt=X>350,up=Y>40;return '<text class="lbl" x="'+(rt?X-10:X+10)+'" y="'+(up?Y-10:Y+20)+'" text-anchor="'+(rt?'end':'start')+'" style="fill:'+col+'">'+esc(t)+'</text>';}
  function gambar(V){
    V=V||{B:CORE.FULL};setBox(V.B);
    var B=V.B,s='',i,g=B.g,q1=isQ1(B);
    s+='<defs><pattern id="hg-'+svg.id+'" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="9" stroke="#15803d" stroke-width="2" opacity=".5"/></pattern>'
      +'<marker id="arr-'+svg.id+'" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#1b2a41"/></marker></defs>';
    s+='<rect width="'+N+'" height="'+N+'" fill="#fff"/><g stroke="#dbe4f3" stroke-width="1">';
    for(i=Math.ceil(B.x0/g)*g;i<=B.x1+1e-9;i+=g)s+='<line x1="'+sx(i)+'" y1="'+sy(B.y0)+'" x2="'+sx(i)+'" y2="'+sy(B.y1)+'"/>';
    for(i=Math.ceil(B.y0/g)*g;i<=B.y1+1e-9;i+=g)s+='<line x1="'+sx(B.x0)+'" y1="'+sy(i)+'" x2="'+sx(B.x1)+'" y2="'+sy(i)+'"/>';
    s+='</g>';
    if(V.shade){var dp=CORE.region(V.shade,B);if(dp.length>2)s+='<polygon points="'+polyS(dp)+'" fill="#15803d" fill-opacity=".20"/><polygon points="'+polyS(dp)+'" fill="url(#hg-'+svg.id+')"/>';}
    s+='<line x1="'+(sx(B.x0)-4)+'" y1="'+sy(0)+'" x2="'+(sx(B.x1)+14)+'" y2="'+sy(0)+'" stroke="#1b2a41" stroke-width="2" marker-end="url(#arr-'+svg.id+')"/>';
    s+='<line x1="'+sx(0)+'" y1="'+(sy(B.y0)+4)+'" x2="'+sx(0)+'" y2="'+(sy(B.y1)-14)+'" stroke="#1b2a41" stroke-width="2" marker-end="url(#arr-'+svg.id+')"/>';
    s+='<text class="lbl" x="'+(sx(B.x1)+10)+'" y="'+(sy(0)+20)+'" style="font-style:italic">x</text><text class="lbl" x="'+(sx(0)+9)+'" y="'+(sy(B.y1)-4)+'" style="font-style:italic">y</text>';
    for(i=Math.ceil(B.x0/B.lb)*B.lb;i<=B.x1-1e-9;i+=B.lb){if(i===0||(q1&&i<0))continue;s+='<text class="tick" x="'+sx(i)+'" y="'+(sy(0)+16)+'" text-anchor="middle">'+nm(i)+'</text>';}
    for(i=Math.ceil(B.y0/B.lb)*B.lb;i<=B.y1-1e-9;i+=B.lb){if(i===0||(q1&&i<0))continue;s+='<text class="tick" x="'+(sx(0)-6)+'" y="'+(sy(i)+4)+'" text-anchor="end">'+nm(i)+'</text>';}
    s+='<text class="tick" x="'+(sx(0)-6)+'" y="'+(sy(0)+16)+'" text-anchor="end">0</text>';
    (V.dots||[]).forEach(function(p){s+='<circle cx="'+sx(p.x)+'" cy="'+sy(p.y)+'" r="4" fill="#92400e"/>';});
    (V.lines||[]).forEach(function(Ln,k){
      var q=Ln.q;if(q1&&isAxisLine(q))return;
      var e=lineEnds(q,B);if(!e)return;
      var col=Ln.ty===1?'#94a3b8':(Ln.col||COL[k%COL.length]),solid=Ln.ty===1||q.op==='='||CORE.isSolid(q.op);
      s+='<line x1="'+sx(e[0][0])+'" y1="'+sy(e[0][1])+'" x2="'+sx(e[1][0])+'" y2="'+sy(e[1][1])+'" stroke="'+col+'" stroke-width="'+(Ln.ty===1?2.5:3.5)+'" stroke-linecap="'+(solid?'round':'butt')+'"'+(solid?'':' stroke-dasharray="11 8"')+'/>';
      var E=e[0][1]>e[1][1]||(e[0][1]===e[1][1]&&e[0][0]>e[1][0])?e[0]:e[1],O=E===e[0]?e[1]:e[0];
      var lx=sx(E[0]+0.07*(O[0]-E[0])),ly=sy(E[1]+0.07*(O[1]-E[1])),rt=lx>360;
      if(Ln.lbl!=='')s+='<text class="lbl" x="'+(rt?lx-6:lx+7)+'" y="'+(ly+(ly<30?16:-6))+'" text-anchor="'+(rt?'end':'start')+'" style="fill:'+col+'">'+esc(Ln.lbl===undefined?'('+(k+1)+')':Ln.lbl)+'</text>';
      if(V.ar&&q.op!=='='){
        var mx=(e[0][0]+e[1][0])/2,my=(e[0][1]+e[1][1])/2,sd=CORE.sideOf(q.op),dx=sd*q.a,dy=sd*q.b,len=Math.sqrt(dx*dx+dy*dy)||1;
        var X=sx(mx),Y=sy(my),ux=dx/len,uy=-dy/len,TX=X+ux*32,TY=Y+uy*32;
        s+='<line x1="'+X+'" y1="'+Y+'" x2="'+(X+ux*24)+'" y2="'+(Y+uy*24)+'" stroke="'+col+'" stroke-width="3"/>'
          +'<polygon points="'+TX+','+TY+' '+(TX-ux*11-uy*6)+','+(TY-uy*11+ux*6)+' '+(TX-ux*11+uy*6)+','+(TY-uy*11-ux*6)+'" fill="'+col+'"/>';
      }
    });
    if(V.gs){
      var gq=Lq(V.gs.p,V.gs.q,V.gs.k,'='),ge=lineEnds(gq,B);
      if(ge){s+='<line x1="'+sx(ge[0][0])+'" y1="'+sy(ge[0][1])+'" x2="'+sx(ge[1][0])+'" y2="'+sy(ge[1][1])+'" stroke="#f59e0b" stroke-width="3.5" stroke-dasharray="4 6" stroke-linecap="round"/>';
        var GE=ge[0][0]>ge[1][0]?ge[0]:ge[1],gx=sx(GE[0]),gy=sy(GE[1]);
        s+='<text class="lbl" x="'+Math.min(gx,N-8)+'" y="'+Math.max(16,Math.min(gy-8,N-40))+'" text-anchor="end" style="fill:#b45309">'+esc(lin(V.gs.p,V.gs.q))+' = '+nm(V.gs.k)+'</text>';}
    }
    (V.cd||[]).forEach(function(p){
      var sel=(V.sel||[]).some(function(q){return q.x===p.x&&q.y===p.y;});
      s+='<circle cx="'+sx(p.x)+'" cy="'+sy(p.y)+'" r="13" fill="'+(sel?'rgba(29,78,216,.18)':'rgba(245,158,11,.14)')+'" stroke="'+(sel?'#1d4ed8':'#f59e0b')+'" stroke-width="'+(sel?3:2)+'"/>'
        +'<circle cx="'+sx(p.x)+'" cy="'+sy(p.y)+'" r="5" fill="'+(sel?'#1d4ed8':'#fff')+'" stroke="'+(sel?'#1d4ed8':'#b45309')+'" stroke-width="2.5"/>';
      if(sel)s+=ptLbl(p,ptS(p),'#1d4ed8');
    });
    (V.mk||[]).forEach(function(m){
      var col=MKC[m.c]||MKC.k,X=sx(m.x),Y=sy(m.y);
      if(m.c==='g')s+='<rect x="'+(X-7)+'" y="'+(Y-7)+'" width="14" height="14" fill="#15803d" stroke="#fff" stroke-width="2" transform="rotate(45 '+X+' '+Y+')"/>';
      else s+='<circle cx="'+X+'" cy="'+Y+'" r="'+(m.h?6:5.5)+'" fill="'+(m.h?'#fff':col)+'" stroke="'+(m.h?col:'#fff')+'" stroke-width="'+(m.h?3:2)+'"/>';
      if(m.l!=='')s+=ptLbl(m,m.l===undefined?'('+frac(m.x)+', '+frac(m.y)+')':m.l,col);
    });
    (V.cross||[]).forEach(function(p){var X=sx(p.x),Y=sy(p.y);s+='<path d="M'+(X-9)+' '+(Y-9)+'L'+(X+9)+' '+(Y+9)+'M'+(X+9)+' '+(Y-9)+'L'+(X-9)+' '+(Y+9)+'" stroke="#b91c1c" stroke-width="3.5" stroke-linecap="round"/>'+ptLbl(p,'('+nm(p.x)+', '+nm(p.y)+') dibuang','#b91c1c');});
    if(V.pick){var P=V.pick,X2=sx(P.x),Y2=sy(P.y);s+='<circle cx="'+X2+'" cy="'+Y2+'" r="14" fill="rgba(245,158,11,.25)" stroke="#f59e0b" stroke-width="3"/><circle cx="'+X2+'" cy="'+Y2+'" r="5.5" fill="#c2410c" stroke="#fff" stroke-width="2"/>'+ptLbl(P,ptS(P),'#c2410c');}
    svg.innerHTML=s;
    svg.classList.toggle('pickable',!!V.click);
    if(cap)cap.innerHTML=V.cap||'Daerah hijau = daerah penyelesaian (DP).';
  }
  return {
    gambar:gambar,
    /* posisi klik → koordinat bidang */
    klik:function(e){var r=svg.getBoundingClientRect();var vx=(e.clientX-r.left)/r.width*N,vy=(e.clientY-r.top)/r.height*N;return {vx:vx,vy:vy,mx:PB.x0+(vx-MG)/PK,my:PB.y0+(N-MG-vy)/PK};},
    /* titik kisi terdekat */
    tempel:function(c){var g=PB.g,x=Math.round(c.mx/g)*g,y=Math.round(c.my/g)*g;return {x:Math.max(PB.x0,Math.min(PB.x1,x)),y:Math.max(PB.y0,Math.min(PB.y1,y))};},
    /* koordinat bidang → piksel di layar (untuk penunjuk Plus) */
    layar:function(x,y){var mm=svg.getScreenCTM();if(!mm)return null;var p=svg.createSVGPoint();p.x=sx(x);p.y=sy(y);p=p.matrixTransform(mm);return {x:p.x,y:p.y};},
    vx:sx,vy:sy,svg:svg
  };
};
/* ---------- Maskot "Plus" ---------- */
var PLUS={
  benar:['Hebat! Kamu benar!','Mantap, lanjut terus!','Tepat sekali! Keren!','Yeay, jawabanmu benar!','Pintar! Pertahankan ya!'],
  salah:['Belum tepat, coba lagi ya!','Tenang, kamu pasti bisa!','Hampir! Ayo coba sekali lagi!','Salah itu bagian belajar!','Jangan menyerah, semangat!'],
  sapaL:['Halo! Aku Plus, ayo belajar!','Hai! Pilih soal, lalu mulai ya!'],
  sapaP:['Siap kuis? Semangat ya!','Ayo, kamu pasti bisa!'],
  petunjuk:['Baca petunjuk di panel ya!','Petunjuknya ada di sini, lho!'],
  selesai:['Yeay, soal ini selesai!','Kerja bagus! Kamu hebat!','Keren! Satu soal tuntas!']
};
var plusTb=null,plusTa=null;
function plusReduced(){return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}
function plusPick(a){return a[Math.floor(Math.random()*a.length)];}
/* pesan pengarah (hanya Latihan Mandiri): sejalan dengan petunjuk yang sudah ada, tanpa membocorkan jawaban */
/* pesan pengarah: disediakan oleh tab yang aktif (PL.Plus.panduan) */
function plusGuide(){return PL.Plus.panduan?PL.Plus.panduan():plusPick(PLUS.salah);}
function plusSay(text){
  var b=$('#plusBubble');if(!b)return;
  b.textContent=text;b.classList.add('show');
  clearTimeout(plusTb);plusTb=setTimeout(function(){b.classList.remove('show');},4800);
}
function plusState(mood,act,ms){
  var w=$('#plusWrap');if(!w)return;
  w.removeAttribute('data-act');void w.offsetWidth;
  w.setAttribute('data-mood',mood);
  if(act)w.setAttribute('data-act',act);
  clearTimeout(plusTa);
  plusTa=setTimeout(function(){w.removeAttribute('data-act');w.setAttribute('data-mood','normal');},ms);
}
function plusConfetti(){
  if(plusReduced())return;
  var box=$('#plusConf');if(!box)return;
  var cols=['#f59e0b','#15803d','#c2410c','#7e22ce','#1d4ed8','#ec4899'];
  for(var i=0;i<16;i++){
    var p=document.createElement('i'),a=-Math.PI*(0.12+0.76*Math.random()),r=50+Math.random()*45;
    p.style.setProperty('--dx',Math.round(Math.cos(a)*r)+'px');
    p.style.setProperty('--dy',Math.round(Math.sin(a)*r)+'px');
    p.style.setProperty('--rot',Math.round(Math.random()*540-270)+'deg');
    p.style.background=cols[i%cols.length];
    p.style.animationDelay=(Math.random()*.15)+'s';
    box.appendChild(p);
    (function(el){setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},1800);})(p);
  }
}
/* jenis: 'sapa' | 'benar' | 'salah' | 'petunjuk' | 'selesai' | 'skor' (extra = persen) */
function mascotSay(kind,extra){
  if(!$('#plusWrap')||document.body.classList.contains('plus-off'))return;
  var learn=modeNow()==='latihan',msg,mood='normal',act='',ms=1500;
  if(kind==='benar'){msg=plusPick(PLUS.benar);mood='happy';act='cheer';ms=1500;}
  else if(kind==='salah'){msg=(learn&&Math.random()<.6)?plusGuide():plusPick(PLUS.salah);mood='sad';act='shake';ms=1200;}
  else if(kind==='petunjuk'){msg=plusPick(PLUS.petunjuk);act='point';ms=1900;}
  else if(kind==='selesai'){msg=plusPick(PLUS.selesai);mood='happy';act='spin';ms=1700;plusConfetti();}
  else if(kind==='skor'){
    if(extra>=70){msg='Luar biasa! Skor kamu tinggi!';mood='happy';act='spin';ms=1700;plusConfetti();}
    else{msg='Tidak apa-apa, ayo coba lagi!';act='wave';ms=2300;}
  }else{msg=plusPick(modeNow()!=='kuis'?PLUS.sapaL:PLUS.sapaP);act='wave';ms=2300;}
  plusSay(msg);plusState(mood,act,ms);
}
function setPlusOff(off,save){
  var t=$('#plusToggle');
  document.body.classList.toggle('plus-off',off);
  t.textContent=off?'👋 Plus':'✕';
  t.title=off?'Munculkan Plus':'Sembunyikan Plus';
  t.setAttribute('aria-label',off?'Munculkan Plus':'Sembunyikan Plus');
  if(off){var b=$('#plusBubble');if(b)b.classList.remove('show');}
  if(save){try{localStorage.setItem('plusOff',off?'1':'0');}catch(_){}}
}
$('#plusToggle').onclick=function(){
  var off=!document.body.classList.contains('plus-off');
  setPlusOff(off,true);
  if(!off)mascotSay('sapa');
};
try{setPlusOff(localStorage.getItem('plusOff')==='1',false);}catch(_){}


/* ---------- Plus berpindah dan menunjuk ---------- */
var plusAt=null,plusTf=null,plusTh=null;
function fxEnsure(){
  var f=$('#plusFx');if(f)return f;
  f=document.createElementNS('http://www.w3.org/2000/svg','svg');f.id='plusFx';f.setAttribute('aria-hidden','true');
  f.innerHTML='<defs><marker id="fxArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#f59e0b"/></marker></defs>'
    +'<rect class="ring" id="fxRing" x="0" y="0" width="0" height="0"/><path class="beam" id="fxBeam" d=""/>';
  document.body.appendChild(f);return f;
}
function exBarH(){return parseFloat(document.documentElement.style.getPropertyValue('--exbar-h'))||0;}
/* gulir otomatis: hanya sebagai respons atas aksi navigasi (plusGo), seminimal mungkin, dan di atas bar */
var plusTouch=false;
['touchstart'].forEach(function(n){document.addEventListener(n,function(){plusTouch=true;},{passive:true});});
['touchend','touchcancel'].forEach(function(n){document.addEventListener(n,function(){plusTouch=false;},{passive:true});});
function plusReveal(b){
  if(plusTouch)return;
  var m=12,vh=window.innerHeight-exBarH(),dy;
  if(b.top>=m&&b.bottom<=vh-m)return;
  dy=(b.height>vh-2*m||b.top<m)?b.top-m:b.bottom-(vh-m);
  if(dy)window.scrollBy(0,dy);
}
/* mengubah target (titik bidang, garis, DP, atau elemen) menjadi kotak pada layar */
function plusRect(t,reveal){
  if(!t)return null;
  var rad=16,e;
  if(t.pt){
    var bd=PL.Plus.bidang;if(!bd)return null;
    rad=t.r||16;
    var scr=function(){var s2=bd.layar(t.pt[0],t.pt[1]);return s2?{x:s2.x-rad,y:s2.y-rad,w:rad*2,h:rad*2,round:true}:null;};
    var rr=scr();if(rr&&reveal){plusReveal({top:rr.y,bottom:rr.y+rr.h,height:rr.h});rr=scr();}
    return rr;
  }
  if(t.el){
    e=typeof t.el==='string'?document.querySelector(t.el):t.el;if(!e)return null;
    var r0=e.getBoundingClientRect();
    if(!r0.width&&!r0.height)return null;
    if(reveal){plusReveal({top:r0.top,bottom:r0.bottom,height:r0.height});r0=e.getBoundingClientRect();}
    return {x:r0.left-4,y:r0.top-3,w:r0.width+8,h:r0.height+6,round:false};
  }
  return null;
}
function plusFxClear(){
  var rg=$('#fxRing'),bm=$('#fxBeam');
  if(rg){rg.setAttribute('width',0);rg.setAttribute('height',0);}
  if(bm)bm.setAttribute('d','');
}
function plusPlace(reveal){
  var a=plusAt;if(!a)return;
  fxEnsure();
  var r=plusRect(a.t,reveal);
  if(!r){plusFxClear();return;}
  var rg=$('#fxRing'),bm=$('#fxBeam');
  rg.setAttribute('x',r.x);rg.setAttribute('y',r.y);rg.setAttribute('width',r.w);rg.setAttribute('height',r.h);rg.setAttribute('rx',r.round?r.w/2:10);
  bm.setAttribute('d','');
  var w=$('#plusWrap');
  if(!w||document.body.classList.contains('plus-off'))return;
  var vw=document.documentElement.clientWidth,vh=window.innerHeight-exBarH();
  var bw=$('#plusBody').offsetWidth,bh=$('#plusBody').offsetHeight,ww=w.offsetWidth,wh=w.offsetHeight;
  var hx=vw-8-ww,hy=vh-8-wh,m=16,tcx=r.x+r.w/2,tcy=r.y+r.h/2;
  var yMid=tcy-(wh-bh/2);
  var right={side:'r',X:r.x+r.w+m,Y:yMid},left={side:'l',X:r.x-m-ww,Y:yMid};
  var vc=function(side,Y){var X=side==='r'?tcx-bw/2:tcx-(ww-bw/2);X=Math.min(Math.max(4,X),vw-4-ww);return {side:side,X:X,Y:Y,cx:X+(side==='r'?bw/2:ww-bw/2)};};
  var vb=[vc('r',r.y+r.h+m),vc('l',r.y+r.h+m)],va=[vc('r',r.y-m-wh),vc('l',r.y-m-wh)];
  var byC=function(p,q){return Math.abs(p.cx-tcx)-Math.abs(q.cx-tcx);};vb.sort(byC);va.sort(byC);
  var cs=(tcx>vw/2?[left,right]:[right,left]).concat(tcy>vh/2?va.concat(vb):vb.concat(va));
  var fits=function(c){return c.X>=4&&c.Y>=4&&c.X+ww<=vw-4&&c.Y+wh<=vh-4;};
  var ex0=r.x-4,ey0=r.y-4,ew=r.w+8,eh=r.h+8;
  var clash=function(c){return !(c.X+ww<=ex0||c.X>=ex0+ew||c.Y+wh<=ey0||c.Y>=ey0+eh);};
  var pk=null,i;
  for(i=0;i<cs.length;i++)if(fits(cs[i])&&!clash(cs[i])){pk=cs[i];break;}
  if(!pk)for(i=0;i<cs.length;i++)if(fits(cs[i])){pk=cs[i];break;}
  if(!pk){pk={side:cs[0].side,X:Math.min(Math.max(4,cs[0].X),vw-4-ww),Y:Math.min(Math.max(4,cs[0].Y),vh-4-wh)};}
  w.setAttribute('data-side',pk.side);w.classList.add('go');
  w.style.transform='translate('+Math.round(pk.X-hx)+'px,'+Math.round(pk.Y-hy)+'px)';
  var S={x:pk.X+(pk.side==='r'?bw/2:ww-bw/2),y:pk.Y+wh-bh/2},C={x:tcx,y:tcy};
  clearTimeout(plusTf);
  plusTf=setTimeout(function(){
    if(!plusAt)return;
    var dx=C.x-S.x,dy=C.y-S.y,L=Math.sqrt(dx*dx+dy*dy)||1,ux=dx/L,uy=dy/L;
    var t1=Math.min((r.w/2+6)/(Math.abs(ux)||1e-6),(r.h/2+6)/(Math.abs(uy)||1e-6));
    var s0=bw*.42;if(L<=s0+t1+8){bm.setAttribute('d','');return;}
    bm.setAttribute('d','M'+(S.x+ux*s0)+' '+(S.y+uy*s0)+' L'+(C.x-ux*t1)+' '+(C.y-uy*t1));
  },plusReduced()?0:680);
}
function plusGo(t,text,auto){
  plusAt={t:t};clearTimeout(plusTh);
  if(text){var b=$('#plusBubble');if(b){b.textContent=text;b.classList.add('show');clearTimeout(plusTb);}}
  plusPlace(true);
  if(!document.body.classList.contains('plus-off'))plusState('normal','point',1900);
  if(auto)plusTh=setTimeout(plusHome,auto);
}
function plusHome(){
  plusAt=null;clearTimeout(plusTf);clearTimeout(plusTh);
  var w=$('#plusWrap');if(w){w.style.transform='';w.removeAttribute('data-side');}
  plusFxClear();
  var b=$('#plusBubble');if(b)b.classList.remove('show');
}
var plusRaf=0;
function plusRefresh(){if(!plusAt||plusRaf)return;plusRaf=requestAnimationFrame(function(){plusRaf=0;plusPlace();});}
var MQ_SMALL=window.matchMedia?window.matchMedia('not all and (min-width:860px) and (min-height:500px)'):null;
function barSync(){if(PL.barSync)PL.barSync();}
window.addEventListener('resize',barSync);
window.addEventListener('resize',plusRefresh);
if(MQ_SMALL&&MQ_SMALL.addEventListener)MQ_SMALL.addEventListener('change',function(){barSync();plusRefresh();});
window.addEventListener('scroll',plusRefresh,{passive:true});
document.addEventListener('scroll',plusRefresh,{passive:true,capture:true});
document.addEventListener('keydown',function(e){if(e.key==='Escape')plusHome();});

var MATH_FB=(typeof WeakMap==='function')?new WeakMap():null;
var MATH_OPT={throwOnError:false,displayMode:false,output:'htmlAndMathml',strict:'ignore',trust:false};
var MATH_CSS_OK=false;
function mathCss(){
  var l=document.getElementById('katexCss'),okc=MATH_CSS_OK;
  if(!l||!l.sheet)return false;
  try{okc=l.sheet.cssRules.length>0;}catch(e){}
  if(!okc)return false;
  if(l.media!=='all')l.media='all';
  return true;
}
function mathReady(){return !!(MATH_FB&&window.katex&&typeof window.katex.render==='function'&&mathCss());}
function renderMath(root){
  if(!root||!mathReady())return 0;
  var list=[].slice.call(root.querySelectorAll?root.querySelectorAll('[data-tex]'):[]);
  if(root.nodeType===1&&root.hasAttribute('data-tex'))list.unshift(root);
  var c=0;
  list.forEach(function(el){
    if(el.querySelector('.katex'))return;
    var tex=el.getAttribute('data-tex'),tmp;
    try{
      tmp=document.createElement('span');
      window.katex.render(tex,tmp,MATH_OPT);
      if(!tmp.querySelector('.katex')||tmp.querySelector('.katex-error'))return;
    }catch(e){return;}
    MATH_FB.set(el,el.innerHTML);
    el.innerHTML='';
    while(tmp.firstChild)el.appendChild(tmp.firstChild);
    c++;
  });
  if(c){plusRefresh();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(plusRefresh);}
  return c;
}
function mathBoot(){if(mathReady())renderMath(document);}
['katexJs','katexCss'].forEach(function(id){var e=document.getElementById(id);if(e)e.addEventListener('load',function(){if(id==='katexCss')MATH_CSS_OK=true;mathBoot();});});
window.addEventListener('load',mathBoot);
if(document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',plusRefresh);

PL.Plus={panduan:null,bidang:null,say:mascotSay,ucap:plusSay,go:plusGo,home:plusHome,refresh:plusRefresh,aktif:function(){return !!plusAt;}};
PL.Math={render:renderMath};

/* ---------- PL.Langkah: penampil langkah soal ----------
   var L=PL.Langkah(sectionEl,{petunjuk:bool, diManaSalah:bool, periksa:fn(a,r), aksi:fn(nama,tombol), meta:fn(),
                               pratinjau:bool, ubahPetunjuk:fn(teks)})
   pratinjau    : tampilkan "Persamaanmu" (rumus KaTeX) di samping isian a, b, c
   ubahPetunjuk : mengubah teks petunjuk sebelum ditampilkan (CORE tidak ikut berubah)
   Wadah di dalam section: .meta .ask (kartu soal), .prog .steptext (progres), .panel, svg.bidang, .cap
   Semua tombol memakai data-aksi; satu pendengar klik per panel (event delegation). */
PL.Langkah=function(sec,opsi){
  var q=function(s){return sec.querySelector(s);};
  var el={meta:q('.meta'),ask:q('.ask'),prog:q('.prog'),stepText:q('.steptext'),panel:q('.panel'),svg:q('svg.bidang'),cap:q('.cap')};
  var bidang=PL.Bidang(el.svg,el.cap);
  var S={Q:null,s:0,ans:[],lock:[],pt:null,sel:[],tries:0,solved:false,hints:0,lw:null,gsK:0,tahap:'kerja',selesai:false};
  var pq=function(s){return el.panel.querySelector(s);};
  function curS(){return S.Q&&S.Q.st[S.s];}
  function reset(){
    var St=curS();S.ans=[];S.lock=[];S.pt=null;S.sel=[];S.tries=0;S.solved=false;S.hints=0;S.lw=null;
    if(St&&St.k==='form')St.it.forEach(function(it){S.ans.push(it.t==='eq'?['','','']:it.t==='ineq'?['','','',null]:it.t==='num'?'':null);S.lock.push(false);});
    if(St&&St.v&&St.v.gs)S.gsK=0;
  }
  function muat(Q,s){S.Q=Q;S.s=s||0;reset();}

  /* ---- membaca jawaban ---- */
  function parseNum(s,isRp){
    s=String(s==null?'':s).trim().replace(/−/g,'-').replace(/\s/g,'');
    if(isRp)s=s.replace(/^rp/i,'');
    if(isRp||/^-?\d{1,3}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');
    s=s.replace(',','.');
    if(!/^-?\d+(\.\d+)?$/.test(s))return NaN;
    return +s;
  }
  function collect(){
    var St=curS();
    if(St.k==='pt')return S.pt?{x:S.pt.x,y:S.pt.y}:null;
    if(St.k==='pts')return S.sel.length?S.sel.map(function(p){return {x:p.x,y:p.y};}):null;
    var out=[],bad=false;
    St.it.forEach(function(it,i){
      var a=S.ans[i];
      if(it.t==='pg'){if(a===null)bad=true;out.push(a);}
      else if(it.t==='num'){var v=parseNum(a,it.u==='rp');if(isNaN(v))bad=true;out.push(v);}
      else{var arr=a.slice(0,3).map(function(x){return parseNum(x,false);});if(arr.some(isNaN))bad=true;if(it.t==='ineq'){if(!a[3])bad=true;arr.push(a[3]);}out.push(arr);}
    });
    return bad?null:out;
  }

  /* ---- tampilan langkah ---- */
  function optKind(o){var m=Math.max.apply(null,o.map(function(x){return x.length;}));return m<=3?'op':m<=24?'seg':'sol';}
  function itemHTML(it,i,St){
    var lk=S.lock[i],dis=lk||S.solved?' disabled':'',a=S.ans[i];
    if(it.t==='pg'){
      var kind=optKind(it.o),b='';
      it.o.forEach(function(o,j){
        var on=a===j;
        if(kind==='op')b+='<button class="btn relb opb'+(on?' sel':'')+'" data-i="'+i+'" data-j="'+j+'"'+dis+' aria-label="tanda '+esc(o)+'">'+esc(o)+'</button> ';
        else if(kind==='seg')b+='<button class="segb'+(on?' on':'')+'" data-i="'+i+'" data-j="'+j+'"'+dis+'>'+esc(o)+'</button>';
        else b+='<button class="sol'+(on?' on':'')+'" data-i="'+i+'" data-j="'+j+'"'+dis+'>'+o+'</button>';
      });
      return '<div class="trow'+(lk?' ok':'')+'" data-i="'+i+'"><p>'+it.lab+'</p><div class="'+(kind==='sol'?'sols':'seg')+'">'+b+'</div></div>';
    }
    if(it.t==='num'){
      var inpN='<input class="num vin'+(it.u==='rp'?' rpin':'')+'" data-i="'+i+'" inputmode="decimal" autocomplete="off" value="'+esc(a)+'"'+dis+' aria-label="'+esc(it.lab)+'">';
      if(St.lay==='tbl')return '<tr class="'+(lk?'ok':'')+'" data-i="'+i+'"><td>'+esc(it.lab.replace(/ =$/,''))+'</td><td>'+(it.u==='rp'?'Rp ':'')+inpN+'</td></tr>';
      return '<div class="trow'+(lk?' ok':'')+'" data-i="'+i+'"><label class="nrow"><span>'+it.lab+'</span> <span class="nin">'+(it.u==='rp'?'Rp ':'')+inpN+'</span></label></div>';
    }
    var inp=function(j,ph){return '<input class="num" data-i="'+i+'" data-j="'+j+'" inputmode="numeric" autocomplete="off" value="'+esc(a[j])+'" placeholder="'+ph+'"'+dis+' aria-label="'+ph+'">';};
    var mid=it.t==='ineq'?CORE.OPS.map(function(o){return '<button class="btn relb opb'+(a[3]===o?' sel':'')+'" data-i="'+i+'" data-op="'+esc(o)+'"'+dis+'>'+esc(o)+'</button>';}).join(' '):'<b>=</b>';
    var baris='<div class="eqin">'+inp(0,'a')+'<i>x</i> + '+inp(1,'b')+'<i>y</i> '+mid+' '+inp(2,'c')+'</div>';
    if(opsi.pratinjau)baris='<div class="eqwrap">'+baris+'<div class="pratinjau" data-pr="'+i+'"><small>'+(it.t==='ineq'?'Pertidaksamaanmu':'Persamaanmu')+'</small><span class="pr-isi"></span></div></div>';
    return '<div class="trow'+(lk?' ok':'')+'" data-i="'+i+'"><p>'+it.lab+'</p>'+baris+'</div>';
  }
  /* tabel x | y (item 0 = y saat x = 0, item 1 = x saat y = 0) */
  function xyTable(){
    var inp=function(i){var lk=S.lock[i],dis=lk||S.solved?' disabled':'';return '<input class="num vin'+(lk?' ok':'')+'" data-i="'+i+'" inputmode="decimal" autocomplete="off" value="'+esc(S.ans[i])+'"'+dis+' aria-label="'+esc(curS().it[i].lab)+'">';};
    var v=function(i){var a=S.ans[i];return a===''||a==null?'…':esc(a);};
    return '<table class="tbl txy"><tr><th>x</th><td>0</td><td>'+inp(1)+'</td></tr><tr><th>y</th><td>'+inp(0)+'</td><td>0</td></tr>'
      +'<tr><th>(x, y)</th><td class="xyP0">(0, '+v(0)+')</td><td class="xyP1">('+v(1)+', 0)</td></tr></table>';
  }
  function gsMax(Q){var m=0;Q.st.forEach(function(St){(St.v.mk||[]).forEach(function(p){var g=St.v.gs;if(g)m=Math.max(m,g.p*p.x+g.q*p.y);});});return Math.ceil(m*1.25)+1;}
  function selText(){return S.sel.length?'Titik yang dipilih <b>'+S.sel.map(ptS).join(', ')+'</b>':'<span class="muted">Belum ada titik yang dipilih.</span>';}
  /* ---- pratinjau "Persamaanmu": isian a, b, c ditampilkan sebagai rumus (aktif bila opsi.pratinjau) ---- */
  var REL_TEX={'=':'=','<':'<','≤':'\\le','>':'>','≥':'\\ge'};
  function bentukPratinjau(a,rel){
    var bag=[0,1,2].map(function(j){var s=String(a[j]==null?'':a[j]).trim();if(s==='')return {k:'kosong'};var v=parseNum(s,false);return isNaN(v)?{k:'salah'}:{k:'ok',v:v};});
    var angT=function(v){return String(Math.abs(v)).replace('.','{,}');},angP=function(v){return String(Math.abs(v)).replace('.',',');};
    var KOSONG_T='\\square',SALAH_T='{\\color{#b91c1c}?}';
    var tex='',teks='',ada=false;
    function suku(p,vr){
      if(p.k==='ok'&&p.v===0)return;                      /* koefisien 0 → suku tidak ditulis */
      var neg=p.k==='ok'&&p.v<0,satu=p.k==='ok'&&Math.abs(p.v)===1;
      var kT=p.k==='kosong'?KOSONG_T+' ':p.k==='salah'?SALAH_T:satu?'':angT(p.v);
      var kP=p.k==='kosong'?'□':p.k==='salah'?'?':satu?'':angP(p.v);
      if(!ada){tex+=(neg?'-':'')+kT+vr;teks+=(neg?'−':'')+kP+vr;}
      else{tex+=(neg?' - ':' + ')+kT+vr;teks+=(neg?' − ':' + ')+kP+vr;}
      ada=true;
    }
    suku(bag[0],'x');suku(bag[1],'y');
    if(!ada){tex='0';teks='0';}
    var c=bag[2];
    var cT=c.k==='kosong'?KOSONG_T:c.k==='salah'?SALAH_T:(c.v<0?'-':'')+angT(c.v);
    var cP=c.k==='kosong'?'□':c.k==='salah'?'?':(c.v<0?'−':'')+angP(c.v);
    return {tex:tex+' '+(rel?REL_TEX[rel]:KOSONG_T)+' '+cT,teks:teks+' '+(rel||'□')+' '+cP};
  }
  function pratinjau(i){
    if(!opsi.pratinjau)return;
    var St=curS(),it=St&&St.it&&St.it[i],box=pq('.pratinjau[data-pr="'+i+'"] .pr-isi');
    if(!box||!it||(it.t!=='eq'&&it.t!=='ineq'))return;
    var a=S.ans[i],b=bentukPratinjau(a,it.t==='ineq'?a[3]:'=');
    box.textContent=b.teks;                                /* teks biasa bila KaTeX belum siap */
    box.setAttribute('data-tex',b.tex);
    PL.Math.render(box);
  }
  function pratinjauSemua(){var St=curS();if(!opsi.pratinjau||!St||St.k!=='form')return;St.it.forEach(function(it,i){pratinjau(i);});}
  function panelLangkah(){
    var Q=S.Q,St=curS(),h='';
    h+='<h2>Langkah '+(S.s+1)+' · '+esc(St.nm)+'</h2><p>'+St.q+'</p>';
    if(St.k==='form'){
      if(St.lay==='tbl')h+='<table class="tbl ftbl"><tr><th>Titik sudut</th><th>Nilai f</th></tr>'+St.it.map(function(it,i){return itemHTML(it,i,St);}).join('')+'</table>';
      else if(St.lay==='xy')h+=xyTable();
      else h+=St.it.map(function(it,i){return itemHTML(it,i,St);}).join('');
      if(St.it.some(function(it){return it.t==='eq'||it.t==='ineq';}))h+='<p class="muted">Tulis koefisien negatif dengan tanda minus, misalnya −7. Bentuk yang dikalikan atau disederhanakan juga diterima.</p>';
    }else if(St.k==='pt')h+='<p class="state ptstate">Titik pilihanmu '+(S.pt?'<b>'+ptS(S.pt)+'</b>':'<span class="muted">belum ada</span>')+'</p><p class="muted">Ketuk satu titik kisi pada bidang koordinat.</p>';
    else h+='<p class="state selstate">'+selText()+'</p><p class="muted">Ketuk titik yang ditandai jingga pada bidang untuk memilih atau membatalkan.</p>';
    if(St.v&&St.v.gs)h+='<div class="gsbox"><label><b>Garis selidik</b>, k = <span class="gsV">'+nm(S.gsK)+'</span><input type="range" class="gsr" min="0" max="'+gsMax(Q)+'" step="1" value="'+S.gsK+'"></label></div>';
    h+='<ul class="hints" hidden></ul><div class="fb" hidden></div><div class="actions row">'+(opsi.petunjuk?'<button class="btn ghost" data-aksi="petunjuk">💡 Petunjuk</button>':'')+'<button class="btn primary" data-aksi="periksa">Periksa</button></div>';
    el.panel.innerHTML=h;
    renderHints();
    pratinjauSemua();
  }

  /* ---- satu pendengar untuk seluruh panel ---- */
  el.panel.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||b.disabled||!el.panel.contains(b))return;
    if(b.dataset.j!==undefined){
      var i=+b.dataset.i;if(S.lock[i]||S.solved)return;S.ans[i]=+b.dataset.j;
      var row=b.closest('.trow');row.classList.remove('bad');
      row.querySelectorAll('[data-j]').forEach(function(x){var o=+x.dataset.j===S.ans[i];x.classList.toggle('on',o);x.classList.toggle('sel',o);});
      return;
    }
    if(b.dataset.op!==undefined){
      var k=+b.dataset.i;if(S.lock[k]||S.solved)return;S.ans[k][3]=b.dataset.op;
      var r2=b.closest('.trow');r2.classList.remove('bad');
      r2.querySelectorAll('[data-op]').forEach(function(x){x.classList.toggle('sel',x.dataset.op===S.ans[k][3]);});
      pratinjau(k);
      return;
    }
    var a=b.dataset.aksi;if(!a)return;
    if(a==='periksa')periksa();
    else if(a==='petunjuk')tambahPetunjuk(true);
    else if(a==='dimana')diMana();
    else if(opsi.aksi)opsi.aksi(a,b);
  });
  el.panel.addEventListener('input',function(e){
    var inp=e.target;
    if(inp.classList.contains('gsr')){S.gsK=+inp.value;var gv=pq('.gsV');if(gv)gv.textContent=nm(S.gsK);renderBidang();return;}
    if(!inp.classList.contains('num')||inp.dataset.i===undefined)return;
    var i=+inp.dataset.i;
    if(inp.dataset.j!==undefined){S.ans[i][+inp.dataset.j]=inp.value;pratinjau(i);}else S.ans[i]=inp.value;
    var r=inp.closest('.trow,tr');if(r)r.classList.remove('bad');inp.classList.remove('bad');
    var z=function(k){var v=S.ans[k];return v===''||v==null?'…':String(v);},p0=pq('.xyP0'),p1=pq('.xyP1');
    if(p0)p0.textContent='(0, '+z(0)+')';if(p1)p1.textContent='('+z(1)+', 0)';
  });
  el.panel.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.classList.contains('num'))periksa();});
  el.svg.addEventListener('click',function(e){
    if(!S.Q||S.tahap!=='kerja'||S.solved||S.selesai)return;
    if(opsi.bolehKlik&&!opsi.bolehKlik())return;
    var St=curS(),c=bidang.klik(e);
    if(St.k==='pt'){S.pt=bidang.tempel(c);var ps=pq('.ptstate');if(ps)ps.innerHTML='Titik pilihanmu <b>'+ptS(S.pt)+'</b>';renderBidang();}
    else if(St.k==='pts'){
      var best=null,bd=1e9;(St.v.cd||[]).forEach(function(p){var d=Math.hypot(c.vx-bidang.vx(p.x),c.vy-bidang.vy(p.y));if(d<bd){bd=d;best=p;}});
      if(!best||bd>24)return;
      var ix=-1;S.sel.forEach(function(p,i){if(p.x===best.x&&p.y===best.y)ix=i;});
      if(ix>=0)S.sel.splice(ix,1);else S.sel.push({x:best.x,y:best.y});
      var ss=pq('.selstate');if(ss)ss.innerHTML=selText();renderBidang();
    }
  });

  /* ---- umpan balik ---- */
  function fb(kind,html){var e=pq('.fb');if(!e)return;e.hidden=false;e.className='fb '+kind;e.innerHTML=html;}
  function tambahPetunjuk(sapa){var l=curS().h;if(!l.length)return;S.hints=Math.min(l.length,S.hints+1);renderHints();if(sapa)PL.Plus.say('petunjuk');}
  function renderHints(){
    var box=pq('.hints');if(!box)return;var l=curS()?curS().h:[];
    box.innerHTML=l.slice(0,S.hints).map(function(h){return '<li>'+(opsi.ubahPetunjuk?opsi.ubahPetunjuk(h):h)+'</li>';}).join('');
    box.hidden=!S.hints||!opsi.petunjuk;
  }
  function tandai(r){
    var St=curS();if(St.k!=='form')return;
    r.items.forEach(function(ok,i){
      var row=el.panel.querySelector('.trow[data-i="'+i+'"], tr[data-i="'+i+'"]');
      if(ok){S.lock[i]=true;if(row){row.classList.add('ok');row.classList.remove('bad');row.querySelectorAll('button,input').forEach(function(x){x.disabled=true;});}}
      else if(row)row.classList.add('bad');
      if(St.lay==='xy'){var inp=el.panel.querySelector('input.num[data-i="'+i+'"]');if(inp){inp.classList.toggle('ok',ok);inp.classList.toggle('bad',!ok);if(ok)inp.disabled=true;}}
    });
  }
  function kunciSemua(){el.panel.querySelectorAll('.trow button, .trow input, tr input').forEach(function(x){x.disabled=true;});var b=pq('[data-aksi="periksa"]');if(b)b.disabled=true;}
  function isiKunci(){
    var St=curS(),k=CORE.keyAns(S.Q,S.s);
    if(St.k==='pt')S.pt=k;
    else if(St.k==='pts')S.sel=k;
    else St.it.forEach(function(it,i){S.ans[i]=it.t==='pg'?k[i]:it.t==='num'?(it.u==='rp'?nm(k[i]):String(k[i])):k[i].slice(0,3).map(String).concat(it.t==='ineq'?[k[i][3]]:[]);S.lock[i]=true;});
  }
  function teksKunci(){
    var St=curS(),k=CORE.keyAns(S.Q,S.s);
    if(St.k==='pt')return St.cond.k==='at'?ptS(k):'titik di dalam DP, misalnya '+ptS(k);
    if(St.k==='pts')return k.map(ptS).join(', ');
    return St.it.map(function(it,i){var a=k[i];
      if(it.t==='pg')return it.o[a];
      if(it.t==='num')return it.u==='rp'?U.rp(a):nm(a);
      if(it.t==='eq')return U.eqS(Lq(a[0],a[1],a[2],'='));
      return U.ineqS(Lq(a[0],a[1],a[2],a[3]));}).join(' ; ');
  }
  function tombol(html){var a=pq('.actions');if(a){a.innerHTML=html;var b=a.querySelector('.btn.primary');if(b&&b.focus)b.focus({preventScroll:true});}}
  function tambahTombol(html){var a=pq('.actions');if(a)a.insertAdjacentHTML('beforeend',html);}
  function periksa(){
    if(S.solved)return;
    var a=collect(),St=curS();
    if(a===null||!CORE.valid(S.Q,S.s,a)){fb('info',St.k==='pt'?'Ketuk satu titik pada bidang dulu.':St.k==='pts'?'Pilih titik pada bidang dulu.':'Lengkapi semua isian dulu (isi 0 bila koefisiennya nol).');return;}
    opsi.periksa(a,CORE.judge(S.Q,S.s,a));
  }

  /* ---- "Di mana salahku?" ---- */
  function tombolDiMana(){
    if(!opsi.diManaSalah||!S.lw)return;
    var e=pq('.fb');if(!e||e.hidden)return;
    e.insertAdjacentHTML('beforeend','<div class="whereBox"><button class="btn ghost" data-aksi="dimana" type="button">📍 Di mana salahku?</button> <span class="whereTxt" role="status"></span></div>');
  }
  function violated(sys,p){for(var k=0;k<sys.length;k++){var c=sys[k];if(!CORE.holds(c.a*p.x+c.b*p.y,c.c,c.op))return k;}return -1;}
  function onLineIdx(sys,p){for(var k=0;k<sys.length;k++){var c=sys[k];if(c.a*p.x+c.b*p.y===c.c)return k;}return -1;}
  function diMana(){
    var w=S.lw;if(!w)return;
    var St=curS(),Q=S.Q,t=null,msg='';
    if(St.k==='form'){
      var i=w.r.items.indexOf(false),it=St.it[i],a=w.a[i];
      t={el:el.panel.querySelector('[data-i="'+i+'"]')};
      if(it.t==='eq'&&it.pts&&it.pts.length){
        var bad=it.pts.filter(function(P){return a[0]*P.x+a[1]*P.y!==a[2];})[0];
        msg=bad?'Substitusikan '+ptS(bad)+' ke persamaanmu. Hasilnya '+nm(a[0]*bad.x+a[1]*bad.y)+', bukan '+nm(a[2])+'. Persamaan harus dipenuhi kedua titik.':'Persamaanmu belum menggambarkan garis yang dimaksud. Periksa a, b, dan c.';
      }else if(it.t==='ineq'){
        var k=it.key,prop=a[0]*k.b-a[1]*k.a===0&&a[0]*k.c-a[2]*k.a===0&&a[1]*k.c-a[2]*k.b===0&&(a[0]||a[1]);
        msg=prop?'Koefisien dan ruas kanannya sudah sebanding, tetapi tandanya belum tepat. Perhatikan kata kunci pada kalimat.':'Koefisien atau ruas kanan belum sesuai kalimat soal. Kalikan kebutuhan per benda dengan banyak benda.';
      }else if(it.t==='num')msg=St.lay==='xy'?'Nilai pada tabel ini belum tepat. Substitusikan nilai yang sudah diketahui (x = 0 atau y = 0), lalu hitung.':'Nilai pada isian ini belum tepat. Hitung ulang pelan-pelan.';
      else msg='Pilihan pada baris ini belum tepat. Baca lagi soalnya.';
    }else if(St.k==='pt'){
      var p=w.a;t={pt:[p.x,p.y]};
      if(St.cond.k==='at')msg='Titik '+ptS(p)+' bukan titik yang dimaksud. Hitung nilai f di setiap titik sudut, lalu bandingkan.';
      else{var Li=onLineIdx(St.cond.s,p);if(Li>=0)msg='Titik '+ptS(p)+' terletak tepat pada garis '+U.ineqS(St.cond.s[Li])+'. Pilih titik yang tidak terletak pada garis.';
        else{var v=violated(St.cond.s,p);msg='Titik '+ptS(p)+' tidak memenuhi '+U.ineqS(St.cond.s[v])+'. Pilih titik di sisi yang benar.';}}
    }else{
      if(w.r.lebih.length){var ex=w.r.lebih[0],vv=violated(Q.sys,ex);t={pt:[ex.x,ex.y]};msg='Titik '+ptS(ex)+' bukan titik sudut DP'+(vv>=0?' karena tidak memenuhi '+U.ineqS(Q.sys[vv])+'.':' karena bukan pojok DP.');}
      else{var m=w.r.kurang[0];t={pt:[m.x,m.y],r:26};msg='Masih ada titik sudut yang belum dipilih. Periksa pojok DP di sekitar sini.';}
    }
    var wt=pq('.whereTxt');if(wt)wt.textContent=msg;
    if(t)PL.Plus.go(t,msg,9000);
  }

  /* ---- kartu soal, progres, bidang ---- */
  function renderKartu(){
    if(!S.Q)return;
    el.ask.innerHTML=S.Q.soal;
    el.meta.innerHTML=opsi.meta?opsi.meta():esc(S.Q.jd+' · '+S.Q.lv);
  }
  function renderProgres(intro){
    if(!S.Q)return;
    var items=[{l:'Soal',d:!intro,c:!!intro}];
    S.Q.st.forEach(function(St,i){var done=S.selesai||(!intro&&(i<S.s||(i===S.s&&S.solved)));items.push({l:St.nm,d:done,c:!intro&&!S.selesai&&i===S.s&&!S.solved});});
    el.prog.innerHTML=items.map(function(it,i){return '<li class="'+(it.d?'done':it.c?'cur':'')+'"><span>'+(it.d?'✓':i+1)+'</span><em>'+esc(it.l)+'</em></li>';}).join('');
    el.stepText.textContent=intro?'Baca soal, lalu mulai':S.selesai?'Selesai 🎉':'Langkah '+(S.s+1)+' dari 3 · '+S.Q.st[S.s].nm;
  }
  function qView(spec,extra){
    var Q=S.Q;spec=spec||{};
    var V={B:Q.pl,lines:[],mk:(spec.mk||[]).slice(),cap:'Daerah hijau = daerah penyelesaian (DP).'+(Q.pl.g>1?' Satu kotak kisi = '+Q.pl.g+' satuan.':'')};
    if(spec.ln)V.lines=Q.sys.map(function(c,k){return {q:c,ty:spec.ln,col:COL[k%COL.length]};});
    if(spec.sh)V.shade=Q.sys;
    if(spec.ar)V.ar=true;
    if(spec.cd)V.cd=spec.cd;
    if(spec.gs)V.gs={p:spec.gs.p,q:spec.gs.q,k:S.gsK};
    if(extra)for(var k in extra)V[k]=extra[k];
    return V;
  }
  function renderBidang(mode){
    if(!S.Q)return bidang.gambar({B:CORE.boxQ1(10,1),cap:'Bidang koordinat akan menampilkan soal.'});
    if(mode==='akhir'||S.selesai)return bidang.gambar(qView(S.Q.vz));
    if(mode==='awal')return bidang.gambar(qView(S.Q.st[0].v));
    var St=curS(),ex={};
    if(St.k==='pt'){ex.pick=S.pt;ex.click=!S.solved;}
    if(St.k==='pts'){ex.sel=S.sel;ex.click=!S.solved;}
    bidang.gambar(qView(St.v,ex));
  }
  function kosong(cap){bidang.gambar({B:CORE.boxQ1(10,1),cap:cap||'Bidang koordinat akan menampilkan soal.'});}

  return {S:S,el:el,bidang:bidang,curS:curS,muat:muat,reset:reset,collect:collect,
    panelLangkah:panelLangkah,renderKartu:renderKartu,renderProgres:renderProgres,renderBidang:renderBidang,kosong:kosong,
    fb:fb,tandai:tandai,kunciSemua:kunciSemua,isiKunci:isiKunci,teksKunci:teksKunci,tombol:tombol,tambahTombol:tambahTombol,
    tambahPetunjuk:tambahPetunjuk,tombolDiMana:tombolDiMana,periksa:periksa,
    panduan:function(){var St=curS();if(!St)return null;return St.k==='pt'?'Titiknya harus di sisi yang benar, ya':St.k==='pts'?'Periksa lagi pojok-pojok DP, ya':'Periksa isian yang berwarna merah, ya';}};
};
})(window.PL=window.PL||{});
