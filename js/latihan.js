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
var nm=U.nm,ptS=U.ptS,ineqS=U.ineqS,eqS=U.eqS,lin=U.lin,rp=U.rp;
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

/* ---------- Petunjuk lanjutan (makin ditekan, makin rinci) ----------
   CORE hanya memberi petunjuk umum (St.h). Tombol 💡 membuka petunjuk satu per satu:
   mula-mula petunjuk CORE, lalu petunjuk lanjutan dari bagian ini.
   Semua angka dihitung dari data soal (Q), jadi core.js dan server/Code.gs TIDAK berubah
   dan Apps Script tidak perlu diterbitkan ulang.
   LANJUT['3Ha'] = petunjuk untuk Tipe 3, level HOTS, varian a. Isinya fungsi(Q) yang
   mengembalikan [[petunjuk langkah 1], [petunjuk langkah 2], [petunjuk langkah 3]],
   urut dari yang paling umum ke yang paling rinci.
   Langkah "klik semua titik sudut" pada tipe lain memakai petunjuk umum lanjutTitikSudut(). */
function angka(v){v=Math.round(v*100)/100;if(v===Math.floor(v))return nm(v);return (v<0?'−':'')+String(Math.abs(v)).replace('.',',');}
function titik(x,y){return '('+angka(x)+', '+angka(y)+')';}
function isSumbu(q){return q.c===0&&(q.a===0||q.b===0);}
function garisBatas(Q){return (Q.sys||[]).filter(function(q){return !isSumbu(q);});}
function noGaris(Q,q){return Q.sys.indexOf(q)+1;} /* sama dengan label (1), (2) pada bidang */
function tandaTitik(St,lbl){var m=((St&&St.v&&St.v.mk)||[]).filter(function(p){return p.l===lbl;})[0];return m?{x:m.x,y:m.y}:null;}
function ambil(re,s,cadangan){var m=re.exec(String(s||''));return m?m[1]:cadangan;}
function subst(a,b,x,y){return CORE.subS(a,b,x,y);}

/* tabel x | y titik potong satu garis dengan sumbu */
function tabelXY(q,no){
  var kepala='Garis ('+no+') '+eqS(q);
  if(q.a===0)return '<div class="xy-hint">'+kepala+' adalah garis mendatar, setiap titiknya memiliki y = '+angka(q.c/q.b)+'.</div>';
  if(q.b===0)return '<div class="xy-hint">'+kepala+' adalah garis tegak, setiap titiknya memiliki x = '+angka(q.c/q.a)+'.</div>';
  return '<div class="xy-hint">'+kepala+'<table class="tbl xy-mini"><tr><th>x</th><td>0</td><td>'+angka(q.c/q.a)+'</td></tr>'
    +'<tr><th>y</th><td>'+angka(q.c/q.b)+'</td><td>0</td></tr></table></div>';
}

/* langkah eliminasi x untuk titik potong dua garis; cariX=false bila hanya y yang diperlukan */
function eliminasi(q1,n1,q2,n2,cariX){
  if(q1.a*q2.b-q2.a*q1.b===0)return null;
  var awal='Persamaan ('+n1+') adalah '+eqS(q1)+' dan persamaan ('+n2+') adalah '+eqS(q2)+'. ';
  var akhir=cariX===false?'':' Lalu substitusikan nilai y ke salah satu persamaan untuk mendapat x.';
  if(q1.a===0||q2.a===0){
    var h=q1.a===0?q1:q2,nh=q1.a===0?n1:n2,no=q1.a===0?n2:n1;
    return awal+'Dari persamaan ('+nh+') langsung diperoleh y = '+angka(h.c/h.b)+'.'+(cariX===false?'':' Substitusikan nilai y itu ke persamaan ('+no+') untuk mendapat x.');
  }
  var g=CORE.gcd(q1.a,q2.a)||1,m1=q2.a/g,m2=q1.a/g,ky=q1.b*m1-q2.b*m2,kc=q1.c*m1-q2.c*m2,kali=[];
  if(ky<0){ky=-ky;kc=-kc;}
  if(m1!==1)kali.push('persamaan ('+n1+') dengan '+nm(m1));
  if(m2!==1)kali.push('persamaan ('+n2+') dengan '+nm(m2));
  return awal+(kali.length?'Kalikan '+kali.join(' dan ')+' agar koefisien x sama. ':'')
    +'Kurangkan kedua persamaan supaya x hilang, sehingga diperoleh '+lin(0,ky)+' = '+nm(kc)+'.'
    +(ky!==1?' Bagi kedua ruas dengan '+nm(ky)+' untuk mendapat y.':'')+akhir;
}

/* petunjuk umum untuk langkah "klik semua titik sudut DP" */
function lanjutTitikSudut(Q){
  var g=garisBatas(Q),h=[],i,j;
  if(!g.length)return h;
  h.push('Titik potong setiap garis dengan sumbu dapat dibaca dari tabel x | y berikut.'+g.map(function(q){return tabelXY(q,noGaris(Q,q));}).join(''));
  for(i=0;i<g.length;i++)for(j=i+1;j<g.length;j++){
    var P=CORE.inter(g[i],g[j]);
    if(!P||P.x<0||P.y<0||P.x>Q.pl.x1||P.y>Q.pl.y1)continue;
    var e=eliminasi(g[i],noGaris(Q,g[i]),g[j],noGaris(Q,g[j]),true);
    if(e)h.push('Titik potong garis ('+noGaris(Q,g[i])+') dan garis ('+noGaris(Q,g[j])+'). '+e);
  }
  h.push('Kumpulkan semua calon titik, termasuk (0, 0). Substitusikan setiap calon titik ke semua kendala. Hanya titik yang memenuhi semua kendala yang menjadi titik sudut DP.');
  return h;
}

/* ---------- kata kunci kalimat → arti tanda ----------
   [kata kunci, arah ('k' batas atas, 'b' batas bawah, '=' tepat), boleh sama dengan?]
   Urutan penting: frasa panjang ("tidak lebih dari") diletakkan sebelum frasa pendek ("lebih dari"). */
var KATA=[
  ['tidak boleh melebihi','k',1],['tidak lebih dari','k',1],['tidak kurang dari','b',1],['sekurang-kurangnya','b',1],
  ['paling banyak','k',1],['paling sedikit','b',1],['maksimal','k',1],['minimal','b',1],
  ['kurang dari','k',0],['lebih dari','b',0],['menghabiskan seluruh','=',1],['tepat','=',1]
];
var RE_KATA=new RegExp(KATA.map(function(k){return k[0].replace(/-/g,'\\-');}).join('|'),'i');
function kataKunci(teks){
  var m=RE_KATA.exec(String(teks||''));if(!m)return null;
  var w=m[0].toLowerCase();
  for(var i=0;i<KATA.length;i++)if(KATA[i][0]===w)return {kata:KATA[i][0],arah:KATA[i][1],sama:!!KATA[i][2]};
  return null;
}
function artiKata(e){
  if(e.arah==='=')return 'nilainya harus tepat sama dengan batas, tidak lebih dan tidak kurang';
  if(e.arah==='k')return e.sama?'nilainya tidak boleh melebihi batas, tetapi boleh tepat sama dengan batas':'nilainya harus lebih kecil daripada batas dan tidak boleh tepat sama';
  return e.sama?'nilainya tidak boleh di bawah batas, tetapi boleh tepat sama dengan batas':'nilainya harus lebih besar daripada batas dan tidak boleh tepat sama';
}
var TIP_TANDA='Tanda bergaris bawah (≤ dan ≥) berarti boleh sama dengan, tanda tanpa garis bawah (&lt; dan &gt;) berarti tidak boleh sama, dan = berarti harus tepat sama. Ujung lancip tanda menunjuk ke ruas yang lebih kecil.';
/* tiga petunjuk bertahap untuk menerjemahkan satu kalimat menjadi tanda */
function petunjukKata(kal){
  var e=kataKunci(kal);if(!e)return [];
  return ['Kata kuncinya adalah “'+e.kata+'”.',
    '“'+e.kata+'” berarti '+artiKata(e)+'.',
    TIP_TANDA+' Bayangkan kalimatnya ditulis sebagai “nilai … batas”, lalu pilih tanda yang cocok.'];
}
/* kalimat cerita yang memuat kata kunci kendala, urut sesuai kendala (1), (2).
   Kalimat sebelumnya ikut diambil bila berisi angka per benda (tanpa kata kunci). */
function kalimatKendala(Q){
  var teks=String(Q.soal||'').split('<i>')[0].replace(/<[^>]+>/g,'').trim();
  var ks=teks.split(/\.\s+/).map(function(k){return k.replace(/\.$/,'').trim();}).filter(Boolean),out=[];
  ks.forEach(function(k,i){
    if(!kataKunci(k))return;
    var sb=i>0?ks[i-1]:'',info=sb&&!kataKunci(sb)&&/\d/.test(sb)?sb+'. ':'';
    out.push({kal:k+'.',lengkap:info+k+'.'});
  });
  return out;
}
function namaVariabel(teks){
  return {X:ambil(/x = banyak (.+?) \(/,teks,'benda jenis x'),Y:ambil(/y = banyak (.+?) \(/,teks,'benda jenis y')};
}

var LANJUT={
  /* Tipe 3 LOTS a · kata kunci → tanda, lalu memilih variabel */
  '3La':function(Q){
    var St=Q.st,it2=St[2].it[0],V=namaVariabel(it2.o[it2.key]);
    return [
      petunjukKata(St[0].it[0].lab),
      petunjukKata(St[1].it[0].lab),
      ['Variabel menyatakan sesuatu yang banyaknya belum diketahui dan dapat diatur. Harga, kebutuhan per benda, dan batas sudah diketahui dari soal, jadi bukan variabel.',
       'Pada cerita ini yang diatur adalah banyak '+V.X+' dan banyak '+V.Y+'. Pilih variabel yang menyatakan banyak kedua benda itu beserta satuannya.']
    ];
  },
  /* Tipe 3 MOTS a · memodelkan dua kendala; langkah titik sudut memakai lanjutTitikSudut() */
  '3Ma':function(Q){
    var V=namaVariabel(Q.soal),kk=kalimatKendala(Q);
    function satu(i){
      var it=Q.st[i].it[0],k=it.key,nama=ambil(/Kendala (.+)$/,it.lab,'('+(i+1)+')'),K=kk[i],h=[];
      h.push((K?'Kalimat tentang '+nama+' adalah “'+K.lengkap+'” ':'')
        +'Susun ruas kiri dengan bentuk (angka untuk satu '+V.X+') × x + (angka untuk satu '+V.Y+') × y. Ruas kanan adalah batas pada kalimat itu.');
      var e=K&&kataKunci(K.kal);
      if(e)h.push('Kata kuncinya “'+e.kata+'”, artinya '+artiKata(e)+'. '+TIP_TANDA);
      h.push('Jika semua angka dibagi faktor persekutuannya, ruas kiri menjadi '+lin(k.a,k.b)+' dan ruas kanan menjadi '+nm(k.c)+'. Tinggal pilih tandanya. Bentuk kelipatannya juga diterima.');
      return h;
    }
    return [satu(0),satu(1)];
  },
  /* Tipe 3 HOTS a · rencana penjualan tiket/kaos dievaluasi */
  '3Ha':function(Q){
    var St=Q.st,R=tandaTitik(St[0],'rencana'),k1=Q.sys[0],k2=Q.sys[1];
    if(!R)return null;
    var hasil=St[1].it[0].key,dasar=k1.a*R.x+k1.b*R.y;if(!dasar)return null;
    var per=hasil/dasar,p=per*k1.a,q=per*k1.b,T=per*k1.c; /* harga asli dan target dalam rupiah */
    var nama1=ambil(/^Hitung (.+) dari rencana itu\.$/,St[1].q,'pendapatan');
    var namaY=ambil(/paling sedikit berapa (.+) harus terjual/,St[2].q,'barang jenis y');
    var v1=p*R.x+q*R.y,v2=k2.a*R.x+k2.b*R.y;
    return [
      ['Rencana panitia ditulis sebagai titik '+ptS(R)+', artinya x = '+nm(R.x)+' dan y = '+nm(R.y)+'. '
        +'Kendala (1) tentang '+nama1+' adalah '+lin(p,q)+' '+k1.op+' '+nm(T)+' (bentuk sederhananya '+ineqS(k1)+'). '
        +'Kendala (2) adalah '+ineqS(k2)+'.',
       'Rencana memenuhi semua syarat hanya jika <b>kedua</b> kendala bernilai benar. Cukup satu kendala bernilai salah, rencana itu tidak memenuhi syarat.',
       'Kendala (1) → '+subst(p,q,R.x,R.y)+' = '+nm(v1)+'. Apakah '+nm(v1)+' '+k1.op+' '+nm(T)+'? '
        +'Kendala (2) → '+subst(k2.a,k2.b,R.x,R.y)+' = '+nm(v2)+'. Apakah '+nm(v2)+' '+k2.op+' '+nm(k2.c)+'?'],
      ['Kerjakan perkalian lebih dulu, baru penjumlahan. '+rp(p)+' × '+nm(R.x)+' = '+rp(p*R.x)+' dan '+rp(q)+' × '+nm(R.y)+' = '+rp(q*R.y)+'. Jumlahkan kedua hasil itu.'],
      ['Garis (1) adalah '+eqS(k1)+' dan garis (2) adalah '+eqS(k2)+'. Titik DP yang paling rendah adalah perpotongan kedua garis itu.',
       (eliminasi(k1,1,k2,2,false)||'')+' Nilai y itulah banyak '+namaY+' paling sedikit.']
    ];
  },
  /* Tipe 3 HOTS b · batas satu kendala diubah sehingga kendala itu tidak lagi membatasi */
  '3Hb':function(Q){
    var g=garisBatas(Q);if(g.length<2)return null;
    var pot=g.map(function(q){return {X:q.c/q.a,Y:q.c/q.b};});
    var dlm=(pot[0].X<=pot[1].X&&pot[0].Y<=pot[1].Y)?0:(pot[1].X<=pot[0].X&&pot[1].Y<=pot[0].Y)?1:-1;
    if(dlm<0)return null;
    var D=pot[dlm],nD=noGaris(Q,g[dlm]),nL=noGaris(Q,g[1-dlm]);
    var namaD=ambil(/hanya kendala (.+?) yang membatasi/,Q.bahas&&Q.bahas[1],'');
    return [
      ['Titik potong kedua garis dengan sumbu dapat dibaca dari tabel x | y berikut.'+g.map(function(q){return tabelXY(q,noGaris(Q,q));}).join(''),
       'Kedua kendala bertanda ≤, jadi DP berada di bawah kedua garis (ke arah titik O). Garis yang titik potongnya lebih dekat ke O menjadi batas DP. Garis yang lebih jauh berada di luar, jadi tidak lagi membatasi.',
       'Garis ('+nD+') memotong sumbu di '+titik(D.X,0)+' dan '+titik(0,D.Y)+'. Keduanya lebih dekat ke O daripada titik potong garis ('+nL+').'
        +(namaD?' Garis ('+nD+') adalah garis kendala '+namaD+'.':'')],
      ['DP hanya dibatasi garis ('+nD+'), sumbu X, dan sumbu Y.',
       'Titik pojok DP adalah (0, 0), '+titik(D.X,0)+', dan '+titik(0,D.Y)+'. Hitung banyak titik pojoknya untuk menentukan bentuk DP.'],
      ['Titik sudut DP yang baru adalah (0, 0) dan titik potong garis ('+nD+') dengan kedua sumbu.',
       'Titik potong garis ('+nL+') dengan sumbu dan titik potong kedua garis tidak dipilih, karena tidak menjadi pojok DP yang baru.']
    ];
  },
  /* Tipe 3 HOTS c · menafsirkan titik usul */
  '3Hc':function(Q){
    var St=Q.st,R=tandaTitik(St[0],'rencana'),k1=Q.sys[0],k2=Q.sys[1];
    if(!R)return null;
    var o=St[1].it[0].o||[];
    var n1=ambil(/^Melanggar kendala (.+) saja\.$/,o[1],'(1)'),n2=ambil(/^Melanggar kendala (.+) saja\.$/,o[2],'(2)');
    var v1=k1.a*R.x+k1.b*R.y,v2=k2.a*R.x+k2.b*R.y;
    var pakai=St[2].it[0].key,f=v1?pakai/v1:1,A=k1.a*f,B=k1.b*f;
    var sat=ambil(/\(([^()]+)\) =$/,St[2].it[0].lab,'');
    var namaX=ambil(/Ada usul \S+ \d+ (.+?) dan \d+ /,Q.soal,'barang jenis x');
    var namaY=ambil(/Ada usul \S+ \d+ .+? dan \d+ (.+?)\. /,Q.soal,'barang jenis y');
    var uji='Kendala (1) → '+subst(k1.a,k1.b,R.x,R.y)+' = '+nm(v1)+'. Bandingkan dengan '+nm(k1.c)+' memakai tanda '+k1.op+'. '
      +'Kendala (2) → '+subst(k2.a,k2.b,R.x,R.y)+' = '+nm(v2)+'. Bandingkan dengan '+nm(k2.c)+' memakai tanda '+k2.op+'.';
    return [
      ['Usul itu ditulis sebagai titik '+ptS(R)+', artinya x = '+nm(R.x)+' dan y = '+nm(R.y)+'. '
        +'Model kendalanya (1) '+ineqS(k1)+' untuk '+n1+' dan (2) '+ineqS(k2)+' untuk '+n2+', ditambah x ≥ 0 dan y ≥ 0.'
        +(f!==1?' Model ini sudah disederhanakan, hasil ujinya tetap sama.':''),
       'Usul dapat dijalankan hanya jika titiknya memenuhi <b>semua</b> kendala, artinya titik itu berada di DP.',
       uji],
      ['Kendala yang dilanggar adalah kendala yang bernilai <b>salah</b> setelah titik disubstitusikan.',
       uji+' Tentukan mana yang benar dan mana yang salah, lalu cocokkan dengan pilihan.'],
      ['Satu '+namaX+' memerlukan '+angka(A)+' '+sat+' dan satu '+namaY+' memerlukan '+angka(B)+' '+sat+'.',
       angka(A)+' × '+nm(R.x)+' = '+angka(A*R.x)+' dan '+angka(B)+' × '+nm(R.y)+' = '+angka(B*R.y)+'. Jumlahkan kedua hasil itu.']
    ];
  }
};

/* dipanggil komponen.js: petunjuk tambahan untuk langkah s pada soal Q */
function petunjukLanjut(Q,s,St){
  var f=LANJUT[Q.t+Q.l+(Q.v||'')],daf=null;
  if(f){var semua=f(Q);if(semua&&semua[s])daf=semua[s];}
  if(!daf&&St&&St.k==='pts')daf=lanjutTitikSudut(Q);
  return daf||[];
}

function soalBaru(){
  var t=pick.t==='C'?1+Math.floor(Math.random()*4):pick.t,l=pick.l==='C'?'LMH'[Math.floor(Math.random()*3)]:pick.l;
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
  h+='<div class="lvl"><b>Tipe soal</b><div class="chips">'+[['1','1 · Menggambar DP'],['2','2 · Sistem dari DP'],['3','3 · Kasus kontekstual'],['4','4 · Nilai maks/min'],['C','Campuran']].map(function(o){return '<button class="chip'+(String(pick.t)===o[0]?' on':'')+'" data-aksi="tipe" data-v="'+o[0]+'">'+o[1]+'</button>';}).join('')+'</div></div>';
  h+='<div class="lvl"><b>Level</b><div class="chips">'+[['L','LOTS'],['M','MOTS'],['H','HOTS'],['C','Campuran']].map(function(o){return '<button class="chip'+(pick.l===o[0]?' on':'')+'" data-aksi="level" data-v="'+o[0]+'">'+o[1]+'</button>';}).join('')+'</div></div>';
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
    L.fb('ok','Tepat! '+(S.s<2?'Lanjut ke langkah berikutnya.':'Soal ini selesai.'));
    PL.Plus.say(S.s<2?'benar':'selesai');
    L.tombol('<button class="btn primary" data-aksi="lanjut">'+(S.s<2?'Langkah berikutnya ➜':'Lihat pembahasan ➜')+'</button>');
    L.renderBidang();L.renderProgres();
  }else{
    S.tries++;L.tandai(r);S.lw={a:a,r:r};
    L.fb('bad','Belum tepat. '+(L.curS().k==='form'&&r.items.some(Boolean)?'Bagian yang hijau sudah benar. ':'')+'Baca petunjuk, lalu coba lagi.');
    if(S.hints<2)L.tambahPetunjuk(false);
    L.tombolDiMana();
    if(S.tries>=2&&!L.el.panel.querySelector('[data-aksi="kunci"]'))L.tambahTombol('<button class="btn ghost" data-aksi="kunci">🔑 Lihat jawaban</button>');
    PL.Plus.say('salah');
  }
}
function lihatKunci(){
  var S=L.S;L.isiKunci();S.solved=true;L.panelLangkah();L.kunciSemua();
  L.fb('info','🔑 Jawaban yang benar adalah <b>'+L.teksKunci()+'</b>. Pelajari, lalu lanjutkan.');
  L.tombol('<button class="btn primary" data-aksi="lanjut">'+(S.s<2?'Langkah berikutnya ➜':'Lihat pembahasan ➜')+'</button>');L.renderBidang();
}
function lanjut(){var S=L.S;if(S.s<2){S.s++;L.reset();render();}else{tahap='selesai';render();PL.Plus.say('selesai');}}
function aksi(a,b){
  if(a==='tipe'){pick.t=b.dataset.v==='C'?'C':+b.dataset.v;soalBaru();}
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
    L=PL.Langkah(sec,{petunjuk:true,diManaSalah:true,pratinjau:true,ubahPetunjuk:namaRumus,petunjukLanjut:petunjukLanjut,periksa:periksa,aksi:aksi,
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
  petunjukLanjut:petunjukLanjut, /* untuk diuji dari konsol */
  tampil:function(){render();},
  sembunyi:function(){return true;}
};
})(window.PL);
