/* ==========================================================================
   main.js · PENGATUR TAB
   Dipakai oleh DUA halaman:
     index.html  → tab Belajar + Latihan Mandiri
     kuis.html   → tab Kuis saja
   Setiap tab terdaftar di PL.TAB dengan siklus hidup yang sama:
     init()      sekali saat halaman dimuat
     tampil()    setiap kali tab dibuka
     sembunyi()  sebelum tab ditinggalkan; kembalikan false untuk membatalkan
     jaga()      (opsional) true = peringatkan sebelum halaman ditutup
   Mode aktif ditulis di <body data-mode="belajar|latihan|kuis"> sehingga
   perbedaan tampilan antarmode cukup diatur di CSS (lapisan "mode").
   Bila tombol meminta tab yang tidak ada di halaman ini, peramban
   diarahkan ke halaman yang memuatnya (lihat HALAMAN).
   ========================================================================== */
(function(PL){
'use strict';
var HALAMAN={belajar:'index.html',latihan:'index.html#latihan',kuis:'kuis.html'};
var aktif=null,pergi=false;
PL.TAB=PL.TAB||{};
PL.pindahTab=function(nama){
  if(nama===aktif)return;
  var lama=PL.TAB[aktif];
  if(lama&&lama.sembunyi()===false)return;
  if(!PL.TAB[nama]){                       /* tab ada di halaman lain */
    if(HALAMAN[nama]){pergi=true;location.href=HALAMAN[nama];}
    return;
  }
  PL.U.$$('.tab-view').forEach(function(v){v.hidden=v.dataset.tab!==nama;});
  PL.U.$$('[role="tab"]').forEach(function(t){var on=t.dataset.tab===nama;t.classList.toggle('on',on);t.setAttribute('aria-selected',on?'true':'false');});
  document.body.dataset.mode=nama;
  aktif=nama;
  try{history.replaceState(null,'',nama===awal?location.pathname+location.search:'#'+nama);}catch(_){}
  PL.Plus.home();
  PL.Plus.bidang=PL.TAB[nama].bidang||null;
  PL.Plus.panduan=PL.TAB[nama].panduan||null;
  PL.TAB[nama].tampil();
  if(PL.barSync)PL.barSync();
};
PL.U.$$('[role="tab"]').forEach(function(t){t.addEventListener('click',function(){PL.pindahTab(t.dataset.tab);});});
window.addEventListener('beforeunload',function(e){
  if(pergi){pergi=false;return;}           /* sudah dikonfirmasi lewat sembunyi() */
  var j=Object.keys(PL.TAB).some(function(k){return PL.TAB[k].jaga&&PL.TAB[k].jaga();});
  if(j){e.preventDefault();e.returnValue='';}
});
Object.keys(PL.TAB).forEach(function(k){PL.TAB[k].init();});
window.__api={CORE:CORE,PL:PL};   /* untuk pemeriksaan di konsol: __api.CORE.cek() */
/* tab pertama yang terdaftar di halaman ini; index.html#latihan membuka Latihan Mandiri */
var awal=Object.keys(PL.TAB)[0],minta=(location.hash||'').slice(1);
PL.pindahTab(PL.TAB[minta]?minta:awal);
})(window.PL);
