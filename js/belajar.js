/* ==========================================================================
   belajar.js · TAB BELAJAR
   Wadah: <section id="tab-belajar">. Tidak menyentuh skor, jejak, atau server.
   ========================================================================== */
(function(PL){
'use strict';
var U=PL.U,$=U.$,esc=U.esc,nm=U.nm,rp=U.rp,frac=U.frac,pt=PL.belajarAlat.pt,V2=PL.belajarAlat.V2,BQ=PL.belajarAlat.BQ;
var EX=PL.EX,EX1=PL.EX1,EX2=PL.EX2;
var sec,panel,bidang,ex={i:0,b:0,mark:null},gsK=0;
var MQ=window.matchMedia?window.matchMedia('not all and (min-width:860px) and (min-height:500px)'):null;

function gsFmt(v,u){return u==='rp'?rp(v):nm(v);}
function gsStatus(g,k){
  if(!g||!g.cs)return '';
  var vals=g.cs.map(function(P){return {P:P,v:g.p*P[0]+g.q*P[1]};}),mn=Math.min.apply(null,vals.map(function(o){return o.v;})),mx=Math.max.apply(null,vals.map(function(o){return o.v;}));
  var at=function(v){return vals.filter(function(o){return o.v===v;}).map(function(o){return '('+o.P[0]+', '+o.P[1]+')';}).join(' dan ');};
  if(k<mn)return 'Garis belum menyentuh DP.';
  if(k===mn)return 'Garis menyentuh DP pertama kali di '+at(mn)+' → nilai minimum '+gsFmt(mn,g.u)+'.';
  if(g.open||k<mx)return 'Garis masih memotong DP.';
  if(k===mx)return 'Garis menyentuh DP terakhir kali di '+at(mx)+' → nilai maksimum '+gsFmt(mx,g.u)+'.';
  return 'Garis sudah meninggalkan DP.';
}
function beatNow(){var bs=EX[ex.i].beats;return bs[Math.min(ex.b,bs.length-1)];}
function tampilan(){
  var V=V2(beatNow().v||{B:BQ(10)},{});
  if(V.gs)V.gs={p:V.gs.p,q:V.gs.q,k:gsK,cs:V.gs.cs,open:V.gs.open,u:V.gs.u};
  if(ex.mark)V.mk=(V.mk||[]).concat([pt(ex.mark.x,ex.mark.y,ex.mark.ok?'g':'r',ex.mark.l)]);
  return V;
}
function q(s){return panel.querySelector(s);}
function renderLayar(){
  var sc=EX[ex.i],h='';
  var opt=function(list,lab){return '<optgroup label="'+lab+'">'+list.map(function(s){var i=EX.indexOf(s);return '<option value="'+i+'"'+(i===ex.i?' selected':'')+'>'+esc(s.jd)+'</option>';}).join('')+'</optgroup>';};
  h+='<div class="exhd"><select class="exTopic" aria-label="Pilih topik">'+opt(EX1,'Bagian 1 · Contoh kontekstual')+opt(EX2,'Bagian 2 · Fungsi tujuan dan nilai optimum')+'</select><small class="exPos"></small></div>';
  h+='<h2>'+esc(sc.jd)+'</h2>'+sc.parts.map(function(p,i){return '<div class="expart" data-part="'+i+'" hidden>'+p+'</div>';}).join('')+'<small class="exsrc">Sumber: '+esc(sc.src)+'</small>';
  h+='<div class="row'+(sc.go?'':' exempty')+'" id="exNav"><div id="exFloat"><span class="exfpos" aria-hidden="true"></span><button class="btn" data-aksi="sebelum" type="button">◀ Sebelumnya</button><button class="btn primary" data-aksi="berikut" type="button">Berikutnya ▶</button><button class="btn ghost" data-aksi="ulangi" type="button" aria-label="Ulangi">↺ <span class="lb">Ulangi</span></button></div>'+(sc.go?'<button class="btn primary" data-aksi="ke-latihan" type="button">Latihan Mandiri ➜</button>':'')+'</div>';
  panel.innerHTML=h;
  PL.Math.render(panel);
  if(PL.kuis)PL.kuis.pendNotice(panel);
  langkah();
}
function gsLabel(){
  var g=q('#exGs');if(!g)return;
  var gv=(beatNow().v||{}).gs,lab=q('#exGsV'),t=q('#exGsT');
  if(lab)lab.textContent=gsFmt(gsK,g.dataset.u||'');
  if(t)t.textContent=gv?' '+gsStatus(gv,gsK):'';
}
function langkah(){
  var sc=EX[ex.i],bs=sc.beats,bt=beatNow();
  panel.querySelectorAll('.hit').forEach(function(e){e.classList.remove('hit');});
  panel.querySelectorAll('[data-part]').forEach(function(e){e.hidden=+e.dataset.part>bt.show;});
  if(bt.k!==undefined){gsK=bt.k;var g=q('#exGs');if(g)g.value=bt.k;}
  gsLabel();
  var pos=q('.exPos'),fp=q('.exfpos'),txt='Layar '+(ex.i+1)+' dari '+EX.length+(bs.length>1?' · langkah '+(Math.min(ex.b,bs.length-1)+1)+' dari '+bs.length:'');
  if(pos)pos.textContent=txt;if(fp)fp.textContent=txt;
  var pv=q('[data-aksi="sebelum"]'),nx=q('[data-aksi="berikut"]'),gb=q('[data-aksi="ke-latihan"]');
  if(pv)pv.disabled=(ex.i===0&&ex.b===0);
  if(nx)nx.disabled=(ex.i===EX.length-1&&ex.b>=bs.length-1);
  if(gb)gb.hidden=ex.b<bs.length-1;
  bidang.gambar(tampilan());
  var part=q('[data-part="'+bt.show+'"]'),tgt=bt.at?{el:bt.at.el?panel.querySelector(bt.at.el):null}:{el:part};
  if(part&&!bt.at)part.classList.add('hit');
  if(part&&part.scrollIntoView)try{part.scrollIntoView({block:'nearest'});}catch(_){}
  PL.barSync();
  PL.Plus.go(tgt,bt.say);
}
function berikut(){var nb=EX[ex.i].beats.length;ex.mark=null;if(ex.b<nb-1){ex.b++;langkah();return;}if(ex.i<EX.length-1){ex.i++;ex.b=0;renderLayar();}}
function sebelum(){ex.mark=null;if(ex.b>0){ex.b--;langkah();return;}if(ex.i>0){ex.i--;ex.b=EX[ex.i].beats.length-1;renderLayar();}}
function tandaiBaris(r){
  panel.querySelectorAll('tr.tpt').forEach(function(x){x.classList.remove('hit');});r.classList.add('hit');
  var x=+r.dataset.x,y=+r.dataset.y,ok=r.dataset.ok==='1';ex.mark={x:x,y:y,ok:ok,l:'('+frac(x)+', '+frac(y)+')'};
  bidang.gambar(tampilan());
  PL.Plus.go({pt:[x,y]},ok?'Titik ini ada di DP, semua pertidaksamaan benar.':'Titik ini di luar DP, sedikitnya satu pertidaksamaan salah.',4000);
}

PL.TAB=PL.TAB||{};
PL.TAB.belajar={
  init:function(){
    sec=$('#tab-belajar');panel=sec.querySelector('.panel');
    bidang=PL.Bidang(sec.querySelector('svg.bidang'),sec.querySelector('.cap'));
    this.bidang=bidang;
    panel.addEventListener('click',function(e){
      var r=e.target.closest('tr.tpt');if(r){tandaiBaris(r);return;}
      var b=e.target.closest('[data-aksi]');if(!b||b.disabled)return;
      var a=b.dataset.aksi;
      if(a==='berikut')berikut();else if(a==='sebelum')sebelum();
      else if(a==='ulangi'){ex.b=0;ex.mark=null;langkah();}
      else if(a==='ke-latihan')PL.pindahTab('latihan');
    });
    panel.addEventListener('keydown',function(e){var r=e.target.closest('tr.tpt');if(r&&(e.key==='Enter'||e.key===' ')){e.preventDefault();tandaiBaris(r);}});
    panel.addEventListener('change',function(e){if(e.target.classList.contains('exTopic')){ex.i=+e.target.value;ex.b=0;ex.mark=null;renderLayar();}});
    panel.addEventListener('input',function(e){if(e.target.id==='exGs'){gsK=+e.target.value;gsLabel();bidang.gambar(tampilan());}});
    document.addEventListener('keydown',function(e){
      if(PL.mode()!=='belajar')return;
      var tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA'||tg==='SELECT')return;
      if(e.key==='ArrowRight')berikut();else if(e.key==='ArrowLeft')sebelum();
    });
  },
  tampil:function(){renderLayar();},
  sembunyi:function(){return true;},
  buka:function(i){ex.i=i||0;ex.b=0;ex.mark=null;renderLayar();}
};
/* bar navigasi melayang di layar kecil (hanya tab Belajar) */
PL.barSync=function(){
  var f=document.getElementById('exFloat'),on=PL.mode()==='belajar'&&!!MQ&&MQ.matches&&!!f;
  document.body.classList.toggle('ex-bar',on);
  document.documentElement.style.setProperty('--exbar-h',(on?f.offsetHeight:0)+'px');
};
})(window.PL);
