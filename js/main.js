/* ==========================================================================
   main.js · PENGATUR TAB
   Setiap tab terdaftar di PL.TAB dengan siklus hidup yang sama:
     init()      sekali saat halaman dimuat
     tampil()    setiap kali tab dibuka
     sembunyi()  sebelum tab ditinggalkan; kembalikan false untuk membatalkan
     jaga()      (opsional) true = peringatkan sebelum halaman ditutup
   Mode aktif ditulis di <body data-mode="belajar|latihan|kuis"> sehingga
   perbedaan tampilan antarmode cukup diatur di CSS (lapisan "mode").
   ========================================================================== */
(function(PL){
'use strict';
var aktif=null;
PL.pindahTab=function(nama){
  if(nama===aktif)return;
  var lama=PL.TAB[aktif];
  if(lama&&lama.sembunyi()===false)return;
  PL.U.$$('.tab-view').forEach(function(v){v.hidden=v.dataset.tab!==nama;});
  PL.U.$$('[role="tab"]').forEach(function(t){var on=t.dataset.tab===nama;t.classList.toggle('on',on);t.setAttribute('aria-selected',on?'true':'false');});
  document.body.dataset.mode=nama;
  aktif=nama;
  PL.Plus.home();
  PL.Plus.bidang=PL.TAB[nama].bidang||null;
  PL.Plus.panduan=PL.TAB[nama].panduan||null;
  PL.TAB[nama].tampil();
  PL.barSync();
};
PL.U.$$('[role="tab"]').forEach(function(t){t.addEventListener('click',function(){PL.pindahTab(t.dataset.tab);});});
window.addEventListener('beforeunload',function(e){
  var j=Object.keys(PL.TAB).some(function(k){return PL.TAB[k].jaga&&PL.TAB[k].jaga();});
  if(j){e.preventDefault();e.returnValue='';}
});
Object.keys(PL.TAB).forEach(function(k){PL.TAB[k].init();});
window.__api={CORE:CORE,PL:PL};   /* untuk pemeriksaan di konsol: __api.CORE.cek() */
PL.pindahTab('belajar');
})(window.PL);
