/* ==========================================================================
   saran.js · TOMBOL KRITIK & SARAN (halaman materi, di samping tab Latihan Mandiri)
   Form berisi Nama (opsional, boleh kosong = anonim) dan Kritik/saran.
   Dikirim ke Web App Apps Script TERPISAH dari kuis (server/Saran.gs), alamatnya
   diisi di js/config.js → SARAN_ENDPOINT. Bila kosong = MODE UJI: form tampil,
   tetapi isinya tidak dikirim ke mana pun.
   Tidak bergantung pada CORE; cukup dimuat sebelum main.js.
   ========================================================================== */
(function(){
'use strict';
var CONFIG=window.OPTIMUM_CONFIG||{};
var ENDPOINT=CONFIG.SARAN_ENDPOINT||'';
var MAKS_NAMA=60,MAKS_ISI=1000,JEDA_MS=30000;   /* jeda minimal antarkiriman dari satu perangkat */
var tombol=document.getElementById('tombol-saran');
if(!tombol)return;

var html=''
  +'<dialog id="dlgSaran" class="dlg-saran" aria-labelledby="saranJudul">'
  +'<form method="dialog" class="saran-form" novalidate>'
  +'<h2 id="saranJudul">💬 Kritik &amp; Saran</h2>'
  +'<p class="muted">Tulis kritik atau saranmu tentang media ini. Nama boleh dikosongkan agar tetap anonim.</p>'
  +'<label for="saranNama"><b>Nama</b> <span class="muted">(opsional)</span></label>'
  +'<input id="saranNama" name="nama" type="text" maxlength="'+MAKS_NAMA+'" autocomplete="off" placeholder="Kosongkan bila ingin anonim">'
  +'<label for="saranIsi"><b>Kritik/saran</b></label>'
  +'<textarea id="saranIsi" name="isi" rows="6" maxlength="'+MAKS_ISI+'" required placeholder="Contoh: Petunjuk pada langkah 2 sulit dipahami karena …"></textarea>'
  +'<p class="saran-sisa muted" aria-live="polite"></p>'
  /* jebakan robot: disembunyikan dari manusia, hanya diisi oleh bot */
  +'<input class="saran-hp" name="situs" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">'
  +'<p class="saran-status" role="status" aria-live="polite" hidden></p>'
  +'<div class="row saran-aksi">'
  +'<button type="button" class="btn ghost" data-saran="tutup">Tutup</button>'
  +'<button type="button" class="btn primary" data-saran="kirim">Kirim</button>'
  +'</div>'
  +(ENDPOINT?'':'<p class="muted saran-uji">Mode uji: alamat penyimpanan belum diatur guru, jadi isian tidak dikirim.</p>')
  +'</form></dialog>';
document.body.insertAdjacentHTML('beforeend',html);

var dlg=document.getElementById('dlgSaran'),f=dlg.querySelector('form'),nama=f.nama,isi=f.isi,hp=f.situs;
var st=f.querySelector('.saran-status'),sisa=f.querySelector('.saran-sisa'),bKirim=f.querySelector('[data-saran="kirim"]');
var sibuk=false;

function status(kind,teks){st.hidden=!teks;st.className='saran-status '+(kind||'');st.textContent=teks||'';}
function hitung(){var n=isi.value.length;sisa.textContent=n?n+' / '+MAKS_ISI+' karakter':'';}
function buka(){
  status('','');hitung();
  if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');
  setTimeout(function(){(isi.value?isi:nama).focus();},30);
}
function tutup(){if(typeof dlg.close==='function')dlg.close();else dlg.removeAttribute('open');tombol.focus();}
function terakhir(){try{return +localStorage.getItem('optimum-saran-terakhir')||0;}catch(e){return 0;}}
function catatTerakhir(){try{localStorage.setItem('optimum-saran-terakhir',String(Date.now()));}catch(e){}}

function kirim(){
  if(sibuk)return;
  var n=nama.value.trim().slice(0,MAKS_NAMA),t=isi.value.trim().slice(0,MAKS_ISI);
  if(t.length<3){status('bad','Kritik/saran belum diisi.');isi.focus();return;}
  if(hp.value){status('ok','Terima kasih! Kritik dan saranmu sudah terkirim.');return;}   /* bot: pura-pura berhasil */
  var tunggu=JEDA_MS-(Date.now()-terakhir());
  if(tunggu>0){status('bad','Tunggu '+Math.ceil(tunggu/1000)+' detik sebelum mengirim lagi.');return;}
  if(!ENDPOINT){status('ok','Mode uji: isian sudah benar, tetapi tidak dikirim karena alamat penyimpanan belum diatur.');return;}
  sibuk=true;bKirim.disabled=true;status('','Mengirim …');
  var ctl=('AbortController' in window)?new AbortController():null,tm=ctl?setTimeout(function(){ctl.abort();},20000):null;
  fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify({action:'saran',nama:n,isi:t}),signal:ctl?ctl.signal:undefined})
    .then(function(r){return r.json();})
    .then(function(r){
      if(!r||!r.ok)throw new Error((r&&r.pesan)||'Gagal menyimpan.');
      catatTerakhir();isi.value='';hitung();
      status('ok','Terima kasih! Kritik dan saranmu sudah terkirim.');
    })
    .catch(function(err){
      status('bad',err&&err.name==='AbortError'?'Server tidak merespons. Coba lagi sebentar lagi.'
        :(err&&err.message&&!/fetch|network|json/i.test(err.message)?err.message:'Tidak dapat terhubung. Periksa internet, lalu coba lagi.'));
    })
    .then(function(){if(tm)clearTimeout(tm);sibuk=false;bKirim.disabled=false;});
}

tombol.addEventListener('click',buka);
isi.addEventListener('input',hitung);
f.addEventListener('click',function(e){
  var b=e.target.closest('[data-saran]');if(!b)return;
  if(b.dataset.saran==='tutup')tutup();else kirim();
});
f.addEventListener('submit',function(e){e.preventDefault();});
/* klik di luar kotak menutup dialog */
dlg.addEventListener('click',function(e){if(e.target===dlg)tutup();});
})();
