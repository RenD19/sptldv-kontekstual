/* ==========================================================================
   latihan.js · TAB LATIHAN MANDIRI
   Wadah: <section id="tab-latihan">. Soal dibangkitkan acak oleh CORE,
   dinilai langsung di halaman, tidak dikirim ke server.
   Opsi khusus tab ini: petunjuk bertahap, "Di mana salahku?", percobaan tanpa batas,
   tombol "Lihat jawaban" setelah dua kali salah.
   ========================================================================== */
(function(PL){
'use strict';
var U=PL.U,$=U.$,esc=U.esc;
var sec,L,pick={t:'C',l:'C'},tahap='intro';

/* ---------- Nama rumus yang lebih eksplisit pada petunjuk ----------
   Teks petunjuk asli ada di CORE (core.js dan server/Code.gs). Mengubahnya di sana
   akan mengubah kode "cek", sehingga Apps Script harus diterbitkan ulang.
   Karena itu nama rumus diganti di sini, hanya saat petunjuk ditampilkan di tab Latihan.
   Setiap baris berisi [pola yang dicari, teks pengganti]. */
var RUMUS_2T='(y − y₁)/(y₂ − y₁) = (x − x₁)/(x₂ − x₁)';
var NAMA_RUMUS=[
  [/^Rumus dua titik adalah/,'Rumus persamaan garis melalui dua titik adalah'],
  [/^Pakai rumus dua titik\.$/,'Pakai rumus persamaan garis melalui dua titik, yaitu '+RUMUS_2T+'.'],
  [/^Dengan titik \(/,'Cara lain, pakai rumus persamaan garis yang memotong sumbu X di (a, 0) dan sumbu Y di (0, b), yaitu bx + ay = ab. Dengan titik ('],
  [/^Buat tabel x \| y untuk setiap garis: isi/,'Cari titik potong setiap garis dengan sumbu koordinat memakai tabel x | y. Isi'],
  [/^Titik itu adalah titik potong kedua garis\.$/,'Titik itu adalah titik potong kedua garis. Hitung dengan metode eliminasi dan substitusi pada sistem persamaan linear dua variabel (SPLDV).'],
  [/atau titik potong dua garis\.$/,'atau titik potong dua garis. Titik potong dua garis dihitung dengan metode eliminasi dan substitusi (SPLDV).'],
  [/^Substitusikan x dan y setiap titik ke f/,'Pakai metode uji titik pojok. Substitusikan x dan y setiap titik ke f'],
  [/^Hitung f di setiap titik sudut/,'Pakai metode uji titik pojok. Hitung f di setiap titik sudut'],
  [/^Garis bergeser ke kanan-atas/,'Pada metode garis selidik, garis digeser sejajar dengan mengubah k. Garis bergeser ke kanan-atas'],
  [/^Titik uji (\(.+?\)) tidak terletak/,'Ini metode uji titik untuk menentukan daerah penyelesaian. Titik uji $1 tidak terletak'],
  [/^Uji satu titik di dalam DP ke setiap pertidaksamaan/,'Pakai metode uji titik daerah penyelesaian. Uji satu titik di dalam DP ke setiap pertidaksamaan']
];
function namaRumus(h){
  for(var i=0;i<NAMA_RUMUS.length;i++)if(NAMA_RUMUS[i][0].test(h)){h=h.replace(NAMA_RUMUS[i][0],NAMA_RUMUS[i][1]);break;}
  return h.replace(/\+ −/g,'− '); /* "4x + −2y" ditulis "4x − 2y" */
}

/* ---------- Petunjuk lanjutan ----------
   Isinya ada di js/petunjuk.js (PL.Petunjuk). Petunjuk ke-3 dan seterusnya baru terbuka
   setelah siswa mencoba menjawab minimal sekali pada langkah itu (GERBANG_PETUNJUK). */
var GERBANG_PETUNJUK=2;
function petunjukLanjut(Q,s,St){return PL.Petunjuk?PL.Petunjuk.lanjut(Q,s,St):[];}

/* Tipe dan level yang dipakai di Latihan.
   Tipe 1 (Menggambar DP) dan Tipe 2 LOTS tidak dipakai. */
var TIPE_LATIHAN=[2,3,4];
var LEVEL_TIPE={2:'MH',3:'LMH',4:'LMH'};
function acakDari(a){return a[Math.floor(Math.random()*a.length)];}
function soalBaru(){
  var calon=(pick.t==='C'?TIPE_LATIHAN:[pick.t]).filter(function(t){return pick.l==='C'||LEVEL_TIPE[t].indexOf(pick.l)>=0;});
  if(!calon.length){pick.l='C';calon=pick.t==='C'?TIPE_LATIHAN:[pick.t];}
  var t=acakDari(calon),l=pick.l==='C'?acakDari(LEVEL_TIPE[t].split('')):pick.l;
  L.muat(CORE.gen(t,l,Math.random,true),0);L.S.selesai=false;tahap='intro';render();
}
function render(){
  L.S.tahap=tahap==='kerja'?'kerja':'lain';
  sec.dataset.tahap=tahap;
  L.renderKartu();
  if(tahap==='intro'){L.renderProgres(true);panelIntro();L.renderBidang('awal');}
  else if(tahap==='selesai'){L.S.selesai=true;L.renderProgres();panelSelesai();L.renderBidang('akhir');}
  else{L.renderProgres();L.panelLangkah();L.renderBidang();}
  if(PL.kuis)PL.kuis.pendNotice(L.el.panel);
}
function panelIntro(){
  var Q=L.S.Q,h='<h2>Pilih soal</h2><p class="muted">Pilih tipe dan level. Setiap tekan 🎲 menghasilkan soal baru.</p>';
  h+='<div class="lvl"><b>Tipe soal</b><div class="chips">'+[['2','2 · Sistem dari DP'],['3','3 · Kasus kontekstual'],['4','4 · Nilai maks/min'],['C','Campuran']].map(function(o){return '<button class="chip'+(String(pick.t)===o[0]?' on':'')+'" data-aksi="tipe" data-v="'+o[0]+'">'+o[1]+'</button>';}).join('')+'</div></div>';
  h+='<div class="lvl"><b>Level</b><div class="chips">'+[['L','LOTS'],['M','MOTS'],['H','HOTS'],['C','Campuran']].map(function(o){var mati=o[0]!=='C'&&pick.t!=='C'&&LEVEL_TIPE[pick.t].indexOf(o[0])<0;return '<button class="chip'+(pick.l===o[0]?' on':'')+'" data-aksi="level" data-v="'+o[0]+'"'+(mati?' disabled title="Level ini tidak tersedia untuk tipe yang dipilih"':'')+'>'+o[1]+'</button>';}).join('')+'</div></div>';
  h+='<div class="row"><button class="btn" data-aksi="acak">🎲 Soal acak</button></div>';
  h+='<div class="note"><p>Soal di atas termasuk <b>'+esc(Q.jd)+' · '+esc(Q.lv)+'</b> dengan kata kerja <i>'+esc(Q.kko)+'</i>.</p><p>Di Latihan kamu boleh mencoba berulang kali, membuka 💡 Petunjuk, dan memakai 📍 Di mana salahku?</p></div>';
  h+='<div class="row"><button class="btn primary" data-aksi="mulai">Mulai ➜</button></div>';
  L.el.panel.innerHTML=h;
}
function panelSelesai(){
  L.el.panel.innerHTML='<h2>🎉 Soal selesai</h2><h3>Pembahasan</h3><ol class="sum">'+L.S.Q.bahas.map(function(b){return '<li>'+b+'</li>';}).join('')+'</ol>'
    +'<div class="row"><button class="btn primary" data-aksi="acak">Soal berikutnya ➜</button><button class="btn" data-aksi="ulangi">↺ Ulangi soal ini</button><button class="btn ghost" data-aksi="ke-kuis">Kuis ➜</button></div>';
}
function periksa(a,r){
  var S=L.S;
  if(r.ok){
    S.solved=true;L.tandai(r);L.kunciSemua();
    var hh=L.el.panel.querySelector('.hints');if(hh)hh.hidden=true;
    L.fb('ok','Tepat! '+(S.s<S.Q.st.length-1?'Lanjut ke langkah berikutnya.':'Soal ini selesai.'));
    PL.Plus.say(S.s<S.Q.st.length-1?'benar':'selesai');
    L.tombol('<button class="btn primary" data-aksi="lanjut">'+(S.s<S.Q.st.length-1?'Langkah berikutnya ➜':'Lihat pembahasan ➜')+'</button>');
    L.renderBidang();L.renderProgres();
  }else{
    S.tries++;L.tandai(r);S.lw={a:a,r:r};
    L.fb('bad','Belum tepat. '+(L.curS().k==='form'&&r.items.some(Boolean)?'Bagian yang hijau sudah benar. ':'')+'Baca petunjuk, lalu coba lagi.');
    if(S.hints<2)L.tambahPetunjuk(false);else L.renderHints(); /* membuka gerbang petunjuk rinci */
    L.tombolDiMana();
    if(S.tries>=2&&!L.el.panel.querySelector('[data-aksi="kunci"]'))L.tambahTombol('<button class="btn ghost" data-aksi="kunci">🔑 Lihat jawaban</button>');
    PL.Plus.say('salah');
  }
}
function lihatKunci(){
  var S=L.S;L.isiKunci();S.solved=true;L.panelLangkah();L.kunciSemua();
  L.bukaSemuaPetunjuk(); /* semua petunjuk dibuka agar siswa bisa belajar dari kesalahan */
  L.fb('info','🔑 Jawaban yang benar adalah <b>'+L.teksKunci()+'</b>. Pelajari, lalu lanjutkan.');
  L.tombol('<button class="btn primary" data-aksi="lanjut">'+(S.s<S.Q.st.length-1?'Langkah berikutnya ➜':'Lihat pembahasan ➜')+'</button>');L.renderBidang();
}
function lanjut(){var S=L.S;if(S.s<S.Q.st.length-1){S.s++;L.reset();render();}else{tahap='selesai';render();PL.Plus.say('selesai');}}
function aksi(a,b){
  if(a==='tipe'){pick.t=b.dataset.v==='C'?'C':+b.dataset.v;if(pick.t!=='C'&&pick.l!=='C'&&LEVEL_TIPE[pick.t].indexOf(pick.l)<0)pick.l='C';soalBaru();}
  else if(a==='level'){pick.l=b.dataset.v;soalBaru();}
  else if(a==='acak')soalBaru();
  else if(a==='mulai'){tahap='kerja';L.S.s=0;L.reset();render();PL.Plus.say('sapa');}
  else if(a==='lanjut')lanjut();
  else if(a==='kunci')lihatKunci();
  else if(a==='ulangi'){tahap='kerja';L.S.selesai=false;L.S.s=0;L.reset();render();}
  else if(a==='ke-kuis')PL.pindahTab('kuis');
}
PL.TAB=PL.TAB||{};
PL.TAB.latihan={
  init:function(){
    sec=$('#tab-latihan');
    L=PL.Langkah(sec,{petunjuk:true,diManaSalah:true,pratinjau:true,ubahPetunjuk:namaRumus,petunjukLanjut:petunjukLanjut,gerbangPetunjuk:GERBANG_PETUNJUK,periksa:periksa,aksi:aksi,
      meta:function(){var Q=L.S.Q;return esc(Q.jd+' · '+Q.lv+(Q.ls?' · khusus Latihan':''));}});
    this.bidang=L.bidang;this.panduan=L.panduan;this.L=L;
    /* tombol di kartu soal (di luar panel) */
    sec.querySelector('.kartu').addEventListener('click',function(e){
      var b=e.target.closest('[data-aksi]');if(!b)return;
      if(b.dataset.aksi==='ulangi'&&tahap!=='intro')aksi('ulangi');
      else if(b.dataset.aksi==='acak')soalBaru();
    });
    soalBaru();
  },
  tampil:function(){render();},
  sembunyi:function(){return true;}
};
})(window.PL);
