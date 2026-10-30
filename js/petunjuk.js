/* ==========================================================================
   petunjuk.js · PETUNJUK LANJUTAN (TAB LATIHAN MANDIRI)
   Tombol 💡 membuka petunjuk satu per satu: mula-mula petunjuk CORE (St.h),
   lalu petunjuk lanjutan dari file ini, urut dari umum ke rinci.
   Pola setiap langkah: (1) strategi [CORE] → (2) makna/konsep → (3) langkah konkret
   dengan angka soal → (4) perhitungan hampir selesai; keputusan akhir tetap pada siswa.

   Semua angka dihitung dari objek soal Q, jadi core.js dan server/Code.gs TIDAK berubah
   (kode "cek" tetap sama, Apps Script tidak perlu diterbitkan ulang).
   Bergantung hanya pada CORE. Muat setelah core.js dan sebelum latihan.js.

   LANJUT['3Ha'] = petunjuk untuk Tipe 3, level HOTS, varian a. Isinya fungsi(Q) yang
   mengembalikan [[langkah 1], [langkah 2], [langkah 3]]. Langkah yang bernilai null
   memakai petunjuk umum (misalnya lanjutTitikSudut untuk langkah "klik semua titik sudut").
   Jika CORE kelak diubah, jalankan PL.Petunjuk.uji() di konsol untuk memeriksa semua varian.
   ========================================================================== */
(function(PL){
'use strict';
var C=CORE,nm=C.nm,rp=C.rp,lin=C.lin,ineqS=C.ineqS,eqS=C.eqS,ptS=C.ptS,fS=C.fS;

/* ---------- alat bantu umum ---------- */
function angka(v){v=Math.round(v*100)/100;if(v===Math.floor(v))return nm(v);return (v<0?'−':'')+String(Math.abs(v)).replace('.',',');}
function titik(x,y){return '('+angka(x)+', '+angka(y)+')';}
function isSumbu(q){return q.c===0&&(q.a===0||q.b===0);}
function garisBatas(Q){return (Q.sys||[]).filter(function(q){return !isSumbu(q);});}
function noGaris(Q,q){return Q.sys.indexOf(q)+1;} /* sama dengan label (1), (2) pada bidang */
function tanda(St,lbl){var m=((St&&St.v&&St.v.mk)||[]).filter(function(p){return lbl===undefined||p.l===lbl;})[0];return m?{x:m.x,y:m.y}:null;}
function sudut(St){return ((St&&St.v&&St.v.mk)||[]).filter(function(p){return p.l===ptS(p);}).map(function(p){return {x:p.x,y:p.y};});}
function ambil(re,s,cad){var m=re.exec(String(s||''));return m?m[1]:cad;}
function sub(a,b,P){return C.subS(a,b,P.x,P.y);}
function val(q,P){return q.a*P.x+q.b*P.y;}
function kurang(v,k){return k>=0?v+' − '+angka(k):v+' + '+angka(-k);}
function kurung(v){return v<0?'('+angka(v)+')':angka(v);}
function kata(op){return op==='≤'||op==='≥'?'penuh':'putus-putus';}
var TIP_GARIS='Garis penuh berarti titik-titik pada garis ikut menjadi penyelesaian (tanda ≤ atau ≥). Garis putus-putus berarti titik pada garis tidak termasuk (tanda &lt; atau &gt;).';

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
  var g=C.gcd(q1.a,q2.a)||1,m1=q2.a/g,m2=q1.a/g,ky=q1.b*m1-q2.b*m2,kc=q1.c*m1-q2.c*m2,kali=[];
  if(ky<0){ky=-ky;kc=-kc;}
  if(m1!==1)kali.push('persamaan ('+n1+') dengan '+nm(m1));
  if(m2!==1)kali.push('persamaan ('+n2+') dengan '+nm(m2));
  return awal+(kali.length?'Kalikan '+kali.join(' dan ')+' agar koefisien x sama. ':'')
    +'Kurangkan kedua persamaan supaya x hilang, sehingga diperoleh '+lin(0,ky)+' = '+nm(kc)+'.'
    +(ky!==1?' Bagi kedua ruas dengan '+nm(ky)+' untuk mendapat y.':'')+akhir;
}

/* uji satu titik ke beberapa pertidaksamaan (tanpa menyebut benar/salah) */
function ujiTitik(sys,P,label){
  return sys.map(function(q,i){
    return (label?label(q,i):'('+(i+1)+') '+ineqS(q))+' → '+sub(q.a,q.b,P)+' = '+nm(val(q,P))+'. Apakah '+nm(val(q,P))+' '+q.op+' '+nm(q.c)+'?';
  }).join(' ');
}

/* persamaan garis melalui dua titik (rumus dua titik, lalu kali silang) */
function garisDuaTitik(it){
  var P=it.pts[0],R=it.pts[1],k=it.key;if(!P||!R)return [];
  var dy=R.y-P.y,dx=R.x-P.x;
  return [
    'Masukkan titik '+ptS(P)+' sebagai (x₁, y₁) dan '+ptS(R)+' sebagai (x₂, y₂) → ('+kurang('y',P.y)+')/('+nm(dy)+') = ('+kurang('x',P.x)+')/('+nm(dx)+').',
    'Kali silang → '+kurung(dx)+'('+kurang('y',P.y)+') = '+kurung(dy)+'('+kurang('x',P.x)+'). Jabarkan kedua ruas, pindahkan suku x dan y ke ruas kiri, lalu sederhanakan.',
    'Setelah disederhanakan, ruas kirinya '+lin(k.a,k.b)+'. Cari ruas kanan dengan menyubstitusikan '+ptS(P)+' ke '+lin(k.a,k.b)+'. Periksa juga dengan titik '+ptS(R)+', hasilnya harus sama.'
  ];
}

/* petunjuk umum untuk langkah "klik semua titik sudut DP" */
function lanjutTitikSudut(Q){
  var g=garisBatas(Q),h=[],i,j;
  if(!g.length)return h;
  h.push('Titik potong setiap garis dengan sumbu dapat dibaca dari tabel x | y berikut.'+g.map(function(q){return tabelXY(q,noGaris(Q,q));}).join(''));
  for(i=0;i<g.length;i++)for(j=i+1;j<g.length;j++){
    var P=C.inter(g[i],g[j]);
    if(!P||P.x<0||P.y<0||P.x>Q.pl.x1||P.y>Q.pl.y1)continue;
    var e=eliminasi(g[i],noGaris(Q,g[i]),g[j],noGaris(Q,g[j]),true);
    if(e)h.push('Titik potong garis ('+noGaris(Q,g[i])+') dan garis ('+noGaris(Q,g[j])+'). '+e);
  }
  h.push('Kumpulkan semua calon titik, termasuk (0, 0). Substitusikan setiap calon titik ke semua kendala. Hanya titik yang memenuhi semua kendala yang menjadi titik sudut DP.');
  return h;
}

/* ---------- kata kunci kalimat → arti tanda ----------
   [kata kunci, arah ('k' batas atas, 'b' batas bawah, '=' tepat), boleh sama dengan?]
   Frasa panjang ("tidak lebih dari") diletakkan sebelum frasa pendek ("lebih dari"). */
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
function petunjukKata(kal){
  var e=kataKunci(kal);if(!e)return [];
  return ['Kata kuncinya adalah “'+e.kata+'”.',
    '“'+e.kata+'” berarti '+artiKata(e)+'.',
    TIP_TANDA+' Bayangkan kalimatnya ditulis sebagai “nilai … batas”, lalu pilih tanda yang cocok.'];
}
function kalimat(Q){
  var teks=String(Q.soal||'').split('<i>')[0].replace(/<[^>]+>/g,'').trim();
  return teks.split(/\.\s+/).map(function(k){return k.replace(/\.$/,'').trim();}).filter(Boolean);
}
/* kalimat cerita yang memuat kata kunci kendala, urut sesuai kendala (1), (2).
   Kalimat sebelumnya ikut diambil bila berisi angka per benda (tanpa kata kunci). */
function kalimatKendala(Q){
  var ks=kalimat(Q),out=[];
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

/* ---------- fungsi tujuan ---------- */
/* koefisien p, q dari nilai f di titik-titik yang diketahui */
function koefDariNilai(P,V){
  for(var i=0;i<P.length;i++)for(var j=i+1;j<P.length;j++){
    var d=P[i].x*P[j].y-P[j].x*P[i].y;
    if(d)return {p:(V[i]*P[j].y-V[j]*P[i].y)/d,q:(P[i].x*V[j]-P[j].x*V[i])/d};
  }
  return null;
}
/* dua nominal rupiah pertama di kalimat soal (kalimat keuntungan per benda) */
function koefDariSoal(Q){
  var r=String(Q.soal||'').match(/Rp[\d.]+/g)||[];
  if(r.length<2)return null;
  var b=function(s){return +s.replace(/^Rp/,'').replace(/\./g,'');};
  return {p:b(r[0]),q:b(r[1])};
}
function daftarF(o,cs){return cs.map(function(P){return 'f'+ptS(P)+' = '+sub(o.p,o.q,P);}).join('; ')+'.';}

/* ================================================================
   DAFTAR PETUNJUK PER VARIAN
   ================================================================ */
var LANJUT={

/* ---------- TIPE 1 · MENGGAMBAR DP ---------- */
'1La':function(Q){
  var k=Q.sys[0],T=tanda(Q.st[2]),v=val(k,T);
  return [
    [TIP_GARIS,'Tanda pada soal ini adalah '+k.op+'. Cocokkan dengan aturan tadi.'],
    ['Kolom pertama → '+lin(k.a,k.b).replace('x','(0)')+' = '+nm(k.c)+', jadi '+lin(0,k.b)+' = '+nm(k.c)+'. Kolom kedua → '+lin(k.a,k.b).replace('y','(0)')+' = '+nm(k.c)+', jadi '+lin(k.a,0)+' = '+nm(k.c)+'.',
     'Bagi setiap ruas dengan koefisiennya → y = '+nm(k.c)+' ÷ '+nm(k.b)+' dan x = '+nm(k.c)+' ÷ '+nm(k.a)+'.'],
    ['Titik '+ptS(T)+' termasuk penyelesaian jika pernyataan setelah substitusi bernilai benar.',
     'Ruas kiri → '+sub(k.a,k.b,T)+'. Hitung perkalian dulu ('+nm(k.a)+' × '+nm(T.x)+' = '+nm(k.a*T.x)+' dan '+nm(k.b)+' × '+nm(T.y)+' = '+nm(k.b*T.y)+'), lalu jumlahkan. Bandingkan hasilnya dengan '+nm(k.c)+' memakai tanda '+k.op+'.']
  ];
},
'1Ma':function(Q){
  var s=Q.sys,T=tanda(Q.st[1],'T'),lab=function(q,i){return '('+(i+1)+') '+ineqS(q);};
  return [
    [TIP_GARIS,s.map(function(q,i){return lab(q,i)+' memakai tanda '+q.op;}).join('; ')+'. Tentukan jenis garisnya dari tanda itu.'],
    ['Pernyataan bernilai benar jika hasil ruas kiri memenuhi tanda terhadap ruas kanan. Hitung satu per satu.',ujiTitik(s,T,lab)],
    ['Untuk setiap garis, hasil uji tadi menentukan sisi arsiran. Benar → sisi yang memuat T. Salah → sisi seberangnya.',
     s.map(function(q,i){return 'Garis ('+(i+1)+') → DP di sisi yang '+(C.holds(val(q,T),q.c,q.op)?'memuat':'tidak memuat')+' T';}).join('; ')+'. Pilih titik kisi di irisan semua sisi itu, bukan pada garis, lalu cek dengan substitusi sebelum mengetuk.']
  ];
},
'1Ha':function(Q){
  var St=Q.st,k=St[1].it[0].key,o=ambil(/^Pernyataan 0 (\S+) /,St[1].it[1].lab,'?'),kx=(k===1?'':k===-1?'−':nm(k))+'x';
  var benar=St[1].it[1].key===0;
  return [
    ['Garis batasnya y = '+kx+'. Saat x = 0, nilai y = '+kurung(k)+' × 0 = 0, jadi garis itu melalui (0, 0).',
     'Titik yang terletak tepat pada garis batas selalu membuat ruas kiri sama dengan ruas kanan. Hasil ujinya tidak dapat menunjukkan sisi mana yang diarsir.'],
    ['Pada titik (1, 0), ruas kiri y = 0 dan ruas kanan '+kx+' dengan x = 1.',
     'Ruas kanan = '+nm(k)+' × 1 = '+nm(k)+'. Bandingkan 0 dengan '+nm(k)+' memakai tanda '+o+'.'],
    ['Hasil uji (1, 0) menentukan sisi arsiran. Benar → sisi yang memuat (1, 0). Salah → sisi seberangnya.',
     'Pernyataan pada langkah sebelumnya bernilai '+(benar?'benar':'salah')+', jadi pilih titik kisi di sisi yang '+(benar?'memuat':'tidak memuat')+' (1, 0) dan tidak terletak pada garis.']
  ];
},
'1Hb':function(Q){
  var s1=Q.sys[0],s2=Q.sys[1],ls=lin(s1.a,s1.b),St2=Q.st[2];
  var tiga=St2.k==='pt'
    ?['DP berupa jalur di antara garis '+ls+' = '+nm(s2.c)+' dan garis '+ls+' = '+nm(s1.c)+'.',
      'Pilih titik kisi yang nilai '+ls+'-nya lebih dari '+nm(s2.c)+' dan kurang dari '+nm(s1.c)+', agar tidak terletak pada garis. Contohnya, pada sumbu Y (x = 0), cari y di antara '+angka(s2.c/s1.b)+' dan '+angka(s1.c/s1.b)+'.']
    :['Agar ada nilai '+ls+' yang ≤ ruas kanan sekaligus ≥ '+nm(s2.c)+', ruas kanan tidak boleh lebih kecil dari '+nm(s2.c)+'.',
      'Ruas kanan paling kecil adalah saat jalurnya tepat menyempit menjadi satu garis, yaitu saat kedua ruas kanan sama.'];
  return [
    ['Ruas kiri kedua pertidaksamaan sama, yaitu '+ls+'. Artinya kedua garis sejajar dan tidak pernah berpotongan.',
     'Misalkan nilai '+ls+' disebut N. Syaratnya N ≤ '+nm(s1.c)+' dan N ≥ '+nm(s2.c)+' sekaligus. Adakah bilangan yang memenuhi keduanya?'],
    ['Garis sejajar tidak pernah berpotongan, jadi pilihan yang menyebut garis pasti berpotongan tidak tepat.',
     'Jika batas bawah ('+nm(s2.c)+') tidak melebihi batas atas ('+nm(s1.c)+'), DP berupa jalur di antara kedua garis. Jika batas bawah melebihi batas atas, tidak ada nilai yang memenuhi keduanya.'],
    tiga
  ];
},
'1Hc':function(Q){
  var q=Q.sys[0],P=tanda(Q.st[0]),k=Q.st[1].it[0].key,am=q.a*P.x;
  return [
    ['Ganti x dengan '+nm(P.x)+' dan y dengan '+nm(P.y)+'. Koefisien k menempel pada y, jadi suku ky menjadi k × '+nm(P.y)+' = '+nm(P.y)+'k.',
     'Tanda pertidaksamaan tidak berubah saat substitusi, tetap '+q.op+'. Ruas kanan juga tetap '+nm(q.c)+'.'],
    [(q.a===1?'':nm(q.a)+' × ')+nm(P.x)+' = '+nm(am)+'. Pindahkan '+nm(am)+' ke ruas kanan → '+nm(P.y)+'k '+q.op+' '+nm(q.c)+' − '+nm(am)+' = '+nm(q.c-am)+'.',
     P.y===1?'Koefisien k sudah 1, jadi batas nilai k langsung terbaca.':'Bagi kedua ruas dengan '+nm(P.y)+' → k '+q.op+' '+nm(q.c-am)+' ÷ '+nm(P.y)+'.'],
    ['Membagi atau mengalikan kedua ruas dengan bilangan positif tidak mengubah arah tanda. Hanya bilangan negatif yang membalik tanda.',
     'Pada langkah sebelumnya kamu membagi dengan '+nm(P.y)+' (positif), jadi tandanya sama dengan tanda pada '+nm(P.y)+'k '+q.op+' '+nm(q.c-am)+'.']
  ];
},

/* ---------- TIPE 2 · SISTEM DARI DP ---------- */
'2La':function(Q){
  var q=Q.sys[0],tegak=q.b===0,vr=tegak?'x':'y',besar=C.sideOf(q.op)>0;
  return [
    ['Garis tegak sejajar sumbu Y, semua titiknya memiliki x yang sama. Garis mendatar sejajar sumbu X, semua titiknya memiliki y yang sama.',
     'Ambil dua titik pada garis di gambar. Jika x-nya sama, bentuknya x = …; jika y-nya sama, bentuknya y = ….'],
    ['Hitung kotak dari titik O sampai garis. Satu kotak kisi = '+nm(Q.pl.g)+' satuan.',
     'Jika garis berada di '+(tegak?'kiri':'bawah')+' titik O, nilainya negatif.'],
    [TIP_GARIS+' Garis pada gambar '+kata(q.op)+'.',
     'DP berada di '+(tegak?(besar?'kanan':'kiri'):(besar?'atas':'bawah'))+' garis, artinya '+vr+' bernilai lebih '+(besar?'besar':'kecil')+' daripada '+nm(q.c)+'. Gabungkan dengan jenis garis untuk memilih tanda.']
  ];
},
'2Ma':function(Q){
  var St=Q.st,k=St[0].it[0].key,P0=St[0].it[0].pts[0],P1=St[0].it[0].pts[1],ok=St[1].cond.ok,o={x:0,y:0};
  var dO=C.holdsAll(Q.sys,0,0)&&!C.onAnyLine(Q.sys,0,0),pada=C.onAnyLine(Q.sys,0,0);
  return [
    ['Periksa hasilmu → substitusikan '+ptS(P0)+' dan '+ptS(P1)+' ke persamaanmu. Keduanya harus menghasilkan ruas kanan yang sama.',
     'Bentuk sederhananya memiliki koefisien x = '+nm(k.a)+' dan koefisien y = '+nm(k.b)+'. Tentukan ruas kanannya dengan substitusi salah satu titik.'],
    ['Titik (0, 0) sering paling mudah dihitung, asalkan tidak terletak pada garis.',
     pada?'Titik (0, 0) terletak pada garis, jadi tidak boleh dipakai. Pilih titik lain di daerah hijau.':dO?'Titik (0, 0) berada di daerah hijau dan tidak pada garis, jadi boleh dipilih.':'Titik (0, 0) tidak berada di daerah hijau. Pilih titik di sisi seberang garis dari (0, 0).'],
    [TIP_GARIS+' Garis pada gambar '+kata(k.op)+'.',
     'Contoh dengan titik '+ptS(ok)+' di DP → '+sub(k.a,k.b,ok)+' = '+nm(val(k,ok))+'. Bandingkan dengan '+nm(k.c)+' → hasilnya lebih '+(val(k,ok)>k.c?'besar':'kecil')+', gabungkan dengan jenis garis.']
  ];
},
'2Mb':function(Q){
  var St=Q.st,T=C.findInside(Q.sys,Q.pl),lab=function(q,i){return ['(1) '+lin(q.a,q.b),'(2) '+lin(q.a,q.b),'x','y'][i]+' … '+nm(q.c);};
  T={x:T.x,y:T.y};
  return [
    garisDuaTitik(St[0].it[0]),
    garisDuaTitik(St[1].it[0]),
    [TIP_GARIS+' Lihat jenis setiap garis pada gambar.',
     'Uji titik '+ptS(T)+' (di dalam DP) pada setiap baris. '+Q.sys.map(function(q,i){return lab(q,i)+' → '+sub(q.a,q.b,T)+' = '+nm(val(q,T))+', dibandingkan dengan '+nm(q.c);}).join('; ')+'. Pilih tanda yang membuat setiap perbandingan benar.']
  ];
},
'2Ha':function(Q){
  var St=Q.st,T=tanda(St[1],'T'),j=St[0].it[0].key,q=Q.sys[j],v=val(q,T);
  var rina=Q.sys.map(function(r,i){return i===j?C.L(r.a,r.b,r.c,C.flipOp(r.op)):r;});
  return [
    ['Titik di dalam DP harus memenuhi semua pertidaksamaan yang benar. Pertidaksamaan Rina yang bernilai salah untuk titik di DP adalah yang keliru.',
     'Uji titik T'+ptS(T)+' ke pertidaksamaan Rina. '+ujiTitik(rina,T,function(r){return ineqS(r);})],
    ['Hitung perkalian dulu, lalu jumlahkan → '+nm(q.a)+' × '+nm(T.x)+' = '+nm(q.a*T.x)+' dan '+nm(q.b)+' × '+nm(T.y)+' = '+nm(q.b*T.y)+'.'],
    ['T berada di DP, jadi tanda yang benar harus membuat '+nm(v)+' … '+nm(q.c)+' bernilai benar.',
     nm(v)+' lebih '+(v>q.c?'besar':'kecil')+' daripada '+nm(q.c)+', dan garisnya penuh. Pilih tanda yang sesuai.']
  ];
},
'2Hr':function(Q){
  var St=Q.st,T=C.findInside(Q.sys,Q.pl),lab=['(1) ','(2) ','',''];
  T={x:T.x,y:T.y};
  return [
    garisDuaTitik(St[0].it[0]),
    garisDuaTitik(St[1].it[0]),
    ['Semua garis penuh, jadi setiap tanda adalah ≤ atau ≥. Uji titik di dalam DP untuk memilih di antara keduanya.',
     'Uji titik '+ptS(T)+' → '+Q.sys.map(function(q,i){return lab[i]+lin(q.a,q.b)+' = '+sub(q.a,q.b,T)+' = '+nm(val(q,T))+', dibandingkan dengan '+nm(q.c);}).join('; ')+'.']
  ];
},

/* ---------- TIPE 3 · KASUS KONTEKSTUAL ---------- */
'3La':function(Q){
  var St=Q.st,it2=St[2].it[0],V=namaVariabel(it2.o[it2.key]);
  return [
    petunjukKata(St[0].it[0].lab),
    petunjukKata(St[1].it[0].lab),
    ['Variabel menyatakan sesuatu yang banyaknya belum diketahui dan dapat diatur. Harga, kebutuhan per benda, dan batas sudah diketahui dari soal, jadi bukan variabel.',
     'Pada cerita ini yang diatur adalah banyak '+V.X+' dan banyak '+V.Y+'. Pilih variabel yang menyatakan banyak kedua benda itu beserta satuannya.']
  ];
},
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
  return [satu(0),satu(1),null];
},
'3Ha':function(Q){
  var St=Q.st,R=tanda(St[0],'rencana'),k1=Q.sys[0],k2=Q.sys[1];
  var hasil=St[1].it[0].key,dasar=val(k1,R);if(!dasar)return null;
  var per=hasil/dasar,p=per*k1.a,q=per*k1.b,T=per*k1.c;
  var nama1=ambil(/^Hitung (.+) dari rencana itu\.$/,St[1].q,'pendapatan');
  var namaY=ambil(/paling sedikit berapa (.+) harus terjual/,St[2].q,'barang jenis y');
  var v1=p*R.x+q*R.y,v2=val(k2,R);
  return [
    ['Rencana panitia ditulis sebagai titik '+ptS(R)+', artinya x = '+nm(R.x)+' dan y = '+nm(R.y)+'. '
      +'Kendala (1) tentang '+nama1+' adalah '+lin(p,q)+' '+k1.op+' '+nm(T)+' (bentuk sederhananya '+ineqS(k1)+'). '
      +'Kendala (2) adalah '+ineqS(k2)+'.',
     'Rencana memenuhi semua syarat hanya jika <b>kedua</b> kendala bernilai benar. Cukup satu kendala bernilai salah, rencana itu tidak memenuhi syarat.',
     'Kendala (1) → '+C.subS(p,q,R.x,R.y)+' = '+nm(v1)+'. Apakah '+nm(v1)+' '+k1.op+' '+nm(T)+'? '
      +'Kendala (2) → '+sub(k2.a,k2.b,R)+' = '+nm(v2)+'. Apakah '+nm(v2)+' '+k2.op+' '+nm(k2.c)+'?'],
    ['Kerjakan perkalian lebih dulu, baru penjumlahan. '+rp(p)+' × '+nm(R.x)+' = '+rp(p*R.x)+' dan '+rp(q)+' × '+nm(R.y)+' = '+rp(q*R.y)+'. Jumlahkan kedua hasil itu.'],
    ['Garis (1) adalah '+eqS(k1)+' dan garis (2) adalah '+eqS(k2)+'. Titik DP yang paling rendah adalah perpotongan kedua garis itu.',
     (eliminasi(k1,1,k2,2,false)||'')+' Nilai y itulah banyak '+namaY+' paling sedikit.']
  ];
},
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
'3Hc':function(Q){
  var St=Q.st,R=tanda(St[0],'rencana'),k1=Q.sys[0],k2=Q.sys[1];
  var o=St[1].it[0].o||[];
  var n1=ambil(/^Melanggar kendala (.+) saja\.$/,o[1],'(1)'),n2=ambil(/^Melanggar kendala (.+) saja\.$/,o[2],'(2)');
  var v1=val(k1,R),v2=val(k2,R),pakai=St[2].it[0].key,f=v1?pakai/v1:1,A=k1.a*f,B=k1.b*f;
  var sat=ambil(/\(([^()]+)\) =$/,St[2].it[0].lab,'');
  var namaX=ambil(/Ada usul \S+ \d+ (.+?) dan \d+ /,Q.soal,'barang jenis x');
  var namaY=ambil(/Ada usul \S+ \d+ .+? dan \d+ (.+?)\. /,Q.soal,'barang jenis y');
  var uji='Kendala (1) → '+sub(k1.a,k1.b,R)+' = '+nm(v1)+'. Bandingkan dengan '+nm(k1.c)+' memakai tanda '+k1.op+'. '
    +'Kendala (2) → '+sub(k2.a,k2.b,R)+' = '+nm(v2)+'. Bandingkan dengan '+nm(k2.c)+' memakai tanda '+k2.op+'.';
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
},

/* ---------- TIPE 4 · NILAI MAKSIMUM/MINIMUM ---------- */
'4La':function(Q){
  var St=Q.st,V=namaVariabel(Q.soal),p=St[0].it[0].key,q=St[0].it[1].key;
  var tujuan=ambil(/Tujuannya (.+?)\./,Q.soal,''),namaOb=tujuan.split(' ')[0]||'nilai';
  var kalOb=kalimat(Q).filter(function(k){return (k.match(/Rp/g)||[]).length>=2&&!kataKunci(k);})[0];
  var ok=St[1].it[0].o[St[1].it[0].key],kk=kataKunci(ok);
  var T={x:+ambil(/^f\((\d+),/,St[2].it[0].lab,'0'),y:+ambil(/^f\(\d+, (\d+)\)/,St[2].it[0].lab,'0')};
  return [
    ['p adalah '+namaOb+' untuk satu '+V.X+', q adalah '+namaOb+' untuk satu '+V.Y+'. “sebesar-besarnya” → maksimumkan; “serendah-rendahnya” → minimumkan.',
     (kalOb?'Angka p dan q ada pada kalimat “'+kalOb+'.” ':'')+'Tujuan soal ini '+tujuan+'.'],
    ['Kendala adalah batasan yang memuat kata kunci seperti “paling banyak” atau “paling sedikit”. Kalimat tentang '+namaOb+' per benda membentuk fungsi tujuan, sedangkan kalimat pengantar dan permisalan bukan kendala.',
     kk?'Cari pilihan yang memuat kata kunci “'+kk.kata+'”.':'Cari pilihan yang memuat batas yang tidak boleh dilanggar.'],
    ['Kalikan dulu, lalu jumlahkan → '+nm(p)+' × '+nm(T.x)+' = '+nm(p*T.x)+' dan '+nm(q)+' × '+nm(T.y)+' = '+nm(q*T.y)+'.']
  ];
},
'4Ma':function(Q){return lanjutOptimum(Q);},
'4Mb':function(Q){return lanjutOptimum(Q);},
'4Mc':function(Q){return lanjutOptimum(Q);},
'4Mg':function(Q){
  var St=Q.st,g=St[0].v.gs,cs=sudut(St[0]),o={p:g.p,q:g.q};
  return [
    ['Garis selidik '+lin(o.p,o.q)+' = k selalu sejajar untuk setiap nilai k. Makin besar k, garis makin jauh dari titik O.',
     'Geser slider pelan-pelan. Titik sudut terakhir yang masih disentuh garis sebelum garis meninggalkan DP adalah titik maksimum.',
     'Untuk memeriksa, hitung nilai f di setiap titik sudut lalu cari yang terbesar → '+daftarF(o,cs)],
    ['f(x, y) = '+lin(o.p,o.q)+'. Ganti x dan y dengan koordinat titik yang kamu klik pada langkah sebelumnya.',
     'Hitung perkalian dulu, baru jumlahkan.'],
    ['Saat k = 0, garis selidik melalui titik O. Titik sudut pertama yang tersentuh saat k diperbesar adalah titik dengan nilai f terkecil.',
     'Bandingkan nilai f di setiap titik sudut → '+daftarF(o,cs)+' Pilih yang terkecil.']
  ];
},
'4Ha':function(Q){
  var cs=sudut(Q.st[0]),fs=/f\(x, y\) = ([^<]+)<\/b>/.exec(Q.soal),o=koefLin(fs?fs[1]:'');
  var jauh={x:100,y:100};
  return [
    ['Lihat gambar. Apakah DP tertutup (dikelilingi garis di semua sisi) atau terbuka ke kanan-atas?',
     o?'Coba titik yang jauh, misalnya (100, 100). Titik itu memenuhi semua kendala bertanda ≥, dan f'+ptS(jauh)+' = '+sub(o.p,o.q,jauh)+' = '+nm(o.p*100+o.q*100)+'. Bandingkan dengan nilai maksimum yang dinyatakan siswa.':'Titik yang sangat jauh dari O tetap memenuhi semua kendala bertanda ≥.'],
    ['Pada DP terbuka, nilai f dapat terus membesar tanpa batas. Nilai maksimum hanya ada jika DP tertutup.'],
    ['Hitung f di setiap titik sudut, lalu pilih yang terkecil.'+(o?' '+daftarF(o,cs):'')]
  ];
},
'4Hb':function(Q){
  var St=Q.st,o=koefDariSoal(Q),bx=tanda(St[0],'keputusan'),cs=sudut(St[0]);
  if(!o||!bx)return null;
  return [
    ['Keputusan itu berarti x = '+nm(bx.x)+' dan y = 0. Substitusikan ke f(x, y) = '+lin(o.p,o.q)+'.',
     nm(o.p)+' × '+nm(bx.x)+' = '+nm(o.p*bx.x)+' dan '+nm(o.q)+' × 0 = 0. Jumlahkan.'],
    ['Lebih untung per barang belum tentu memberi '+'keuntungan total terbesar, karena kendala ikut membatasi banyak barang.',
     'Hitung f di setiap titik sudut → '+daftarF(o,cs)+' Klik titik dengan nilai terbesar.'],
    ['Bandingkan '+rp(o.p*bx.x)+' (keputusan) dengan nilai f di titik yang kamu klik pada langkah sebelumnya.',
     'Jika ada titik sudut lain yang nilainya lebih besar, keputusan itu tidak tepat.']
  ];
},
'4Hc':function(Q){
  var St=Q.st,o=koefDariSoal(Q),cs=sudut(St[0]),J=St[0].cond.p[0];
  var bx=cs.filter(function(P){return P.y===0&&P.x>0;})[0],pmin=St[1].it[0].key;
  if(!o||!bx||!J)return null;
  var dx=bx.x-J.x,qy=o.q*J.y;
  return [
    ['Dengan keuntungan sekarang, hitung f di setiap titik sudut → '+daftarF(o,cs),
     'Titik yang harus dikalahkan adalah titik dengan nilai f terbesar saat ini.'],
    ['Tulis f di kedua titik dengan p belum diketahui → f'+ptS(bx)+' = '+nm(bx.x)+'p dan f'+ptS(J)+' = '+nm(J.x)+'p + '+nm(o.q)+' × '+nm(J.y)+'.',
     'Kumpulkan suku p di ruas kiri → '+nm(bx.x)+'p − '+nm(J.x)+'p ≥ '+nm(qy)+', jadi '+lin(dx,0).replace('x','p')+' ≥ '+nm(qy)+'.'+(dx!==1?' Bagi kedua ruas dengan '+nm(dx)+'.':'')],
    ['Substitusikan p = '+rp(pmin)+' ke f'+ptS(bx)+' dan f'+ptS(J)+', lalu bandingkan hasilnya.',
     'f'+ptS(bx)+' = '+nm(pmin)+' × '+nm(bx.x)+' dan f'+ptS(J)+' = '+nm(pmin)+' × '+nm(J.x)+' + '+nm(o.q)+' × '+nm(J.y)+'. Hitung keduanya.']
  ];
}
};

/* koefisien p, q dari teks "30.000x + 20.000y" */
function koefLin(s){
  var m=/^(−?[\d.]*)x \+ ([\d.]*)y$/.exec(String(s).trim());if(!m)return null;
  var b=function(t){t=t.replace('−','-').replace(/\./g,'');return t===''?1:t==='-'?-1:+t;};
  return {p:b(m[1]),q:b(m[2])};
}

/* Tipe 4 MOTS a, b, c · titik sudut → tabel f → nilai optimum */
function lanjutOptimum(Q){
  var St=Q.st,cs=St[0].key,vals=St[1].it.map(function(it){return it.key;}),o=koefDariNilai(cs,vals);
  var kata=ambil(/^Nilai (\S+)/,St[2].it[0].lab,'optimum'),maks=kata==='maksimum';
  return [
    null,
    o?['f(x, y) = '+lin(o.p,o.q)+'. Untuk setiap titik, kalikan '+nm(o.p)+' dengan x dan '+nm(o.q)+' dengan y, lalu jumlahkan. Kerjakan satu baris dulu.',
       'Bentuk substitusinya '+daftarF(o,cs)]:[],
    ['“maksimum” → pilih nilai terbesar; “minimum” → pilih nilai terkecil. Soal ini mencari nilai '+kata+'.'+(maks?'':' DP terbuka, jadi yang dicari hanya nilai minimum.'),
     'Bandingkan nilai f yang sudah kamu isi di tabel, lalu pilih titik dengan nilai '+(maks?'terbesar':'terkecil')+'.']
  ];
}

/* dipanggil komponen.js lewat opsi.petunjukLanjut */
function lanjut(Q,s,St){
  var f=LANJUT[Q.t+Q.l+(Q.v||'')],daf=null;
  if(f){var semua=f(Q);if(semua&&semua[s])daf=semua[s];}
  if(!daf&&St&&St.k==='pts')daf=lanjutTitikSudut(Q);
  return daf||[];
}

/* uji mandiri: PL.Petunjuk.uji() di konsol → membangkitkan banyak soal setiap varian */
function uji(n){
  n=n||40;var lap=[],rng=C.mulberry32(12345);
  [1,2,3,4].forEach(function(t){['L','M','H'].forEach(function(l){C.variants(t,l,true).forEach(function(v){
    for(var i=0;i<n;i++){
      var Q=C.gen(t,l,rng,true,v),kode=Q.t+Q.l+Q.v;
      Q.st.forEach(function(St,s){
        var h;try{h=lanjut(Q,s,St);}catch(e){lap.push(kode+' langkah '+(s+1)+' galat '+e.message);return;}
        if(!h.length)lap.push(kode+' langkah '+(s+1)+' kosong');
        h.forEach(function(x){if(/NaN|undefined|null|Infinity|\[object/.test(x))lap.push(kode+' langkah '+(s+1)+' '+x);});
      });
    }
  });});});
  return lap.length?lap:'Semua petunjuk lanjutan aman.';
}

PL.Petunjuk={lanjut:lanjut,uji:uji,LANJUT:LANJUT};
})(window.PL=window.PL||{});
