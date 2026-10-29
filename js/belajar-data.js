/* ==========================================================================
   belajar-data.js · ISI TAB BELAJAR
   Bagian 1 bersumber dari PDF "Pembahasan Contoh Kontekstual SPtLDV",
   Bagian 2 dari PDF "Fungsi Tujuan dan Nilai Optimum".
   Untuk mengubah teks materi, sunting file ini saja.
   Setiap layar = {t, jd (judul), src (sumber), parts:[HTML], beats:[{show, say, v, at, k}]}
     show : bagian (parts) terakhir yang ditampilkan pada langkah itu
     say  : ucapan Plus;  v : tampilan bidang;  k : nilai awal garis selidik
   ========================================================================== */
(function(PL){
'use strict';
var U=PL.U,COL=PL.COL,Lq=U.Lq,lin=U.lin,nm=U.nm,rp=U.rp,frac=U.frac;

/* ============================================================
   TAB BELAJAR: penjelasan materi bersama Plus
   Isi bersumber dari PDF "Pembahasan Contoh Kontekstual SPtLDV"
   (Bagian 1) dan "Fungsi Tujuan dan Nilai Optimum" (Bagian 2).
   Tab ini TIDAK menyentuh skor, jejak, atau server.
   ============================================================ */
var BQ=function(m,g){return CORE.boxQ1(m,g||1);};
function ln(a,b,c,op,k,lbl){return {q:Lq(a,b,c,op),ty:2,col:COL[k||0],lbl:lbl};}
function pv(B,o){var V={B:B};if(o)for(var k in o)V[k]=o[k];return V;}
function pt(x,y,c,l,h){return {x:x,y:y,c:c||'k',l:l,h:h};}
function P2(x,y){return {x:x,y:y};}
function ingat(h){return '<div class="rule"><b>INGAT!</b> '+h+'</div>';}
function ul(a){return '<ul class="exl">'+a.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';}
function ol(a){return '<ol class="exl">'+a.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol>';}
/* tabel x | y untuk mencari titik pada garis */
function tabXY(cap,xs,ys){
  var f=function(v){return typeof v==='number'?frac(v):v;};
  return '<table class="tbl txy">'+(cap?'<caption>'+cap+'</caption>':'')+'<tr><th>x</th>'+xs.map(function(v){return '<td>'+f(v)+'</td>';}).join('')+'</tr><tr><th>y</th>'+ys.map(function(v){return '<td>'+f(v)+'</td>';}).join('')+'</tr><tr><th>(x, y)</th>'+xs.map(function(v,i){return '<td>('+f(v)+', '+f(ys[i])+')</td>';}).join('')+'</tr></table>';
}
function eq(t){return '<span class="eq">'+t+'</span>';}
/* susunan eliminasi bersusun: rows = [[tanda, ruas, label], ...]; baris terakhir = hasil */
function elim(rows){
  return '<table class="elim">'+rows.map(function(r,i){return '<tr'+(i===rows.length-1?' class="hasil"':'')+'><td>'+r[0]+'</td><td>'+r[1]+'</td><td class="muted">'+(r[2]||'')+'</td></tr>';}).join('')+'</table>';
}
function tblE(head,rows,cls){
  return '<div class="tscroll"><table class="ext'+(cls?' '+cls:'')+'"><tr>'+head.map(function(h){return '<th>'+h+'</th>';}).join('')+'</tr>'
    +rows.map(function(r){return '<tr'+(r.pt?' class="tpt" data-x="'+r.pt[0]+'" data-y="'+r.pt[1]+'" data-ok="'+(r.ok?1:0)+'" tabindex="0"':'')+'>'+r.c.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>';}).join('')+'</table></div>';
}
function R(x,y,ok,cells){return {pt:[x,y],ok:ok,c:cells};}
function sysX(arr){return arr.concat(CORE.AX);}
function cornersMk(arr){return arr.map(function(p){return pt(p[0],p[1]);});}

/* pembentuk satu contoh kontekstual: Situasi → Diketahui/Ditanyakan → langkah → uji titik → Diskusi → Coba Sendiri */
function contoh(o){
  var parts=[],beats=[],last=o.v0;
  parts.push('<p class="muted">Konteks: '+o.konteks+'</p><div class="exbox"><b>Situasi</b><p>'+o.situasi+'</p></div>');
  beats.push({show:0,say:'Baca situasinya dulu, ya.',v:o.v0});
  parts.push('<div class="dd"><div class="exbox"><b>Diketahui</b>'+ul(o.dik)+'</div><div class="exbox"><b>Ditanyakan</b>'+ul(o.tanya)+'</div></div>');
  beats.push({show:1,say:'Sebelum melihat penyelesaian, tulis sendiri yang diketahui dan ditanyakan.',v:o.v0});
  o.langkah.forEach(function(l){
    parts.push('<div class="exstep">'+(l[0]?'<b class="lkh">'+l[0].replace(/:$/,'')+'</b> ':'')+l[1]+'</div>');
    if(l[3])last=l[3];
    beats.push({show:parts.length-1,say:l[2],v:last});
  });
  parts.push('<h3>Uji titik dan tafsirannya</h3>'+tblE(o.head,o.rows,'tuji')+'<p class="muted">✓ = pertidaksamaan bernilai benar, ✗ = salah. Ketuk satu baris untuk melihat titiknya di grafik.</p>');
  beats.push({show:parts.length-1,say:'Titik di DP membuat semua pertidaksamaan benar. Ketuk baris tabel untuk melihat titiknya.',v:o.vAkhir||last});
  parts.push('<div class="exbox"><b>Pertanyaan Diskusi</b>'+ol(o.diskusi)+'<details><summary>Lihat petunjuk jawaban</summary>'+ol(o.kunciD)+'</details></div>');
  beats.push({show:parts.length-1,say:'Diskusikan pertanyaan ini bersama teman.',v:o.vAkhir||last});
  parts.push('<div class="exbox fix"><b>Coba Sendiri</b><p>'+o.coba+'</p><details><summary>Buka kunci</summary><p>'+o.kunciC+'</p></details></div>');
  beats.push({show:parts.length-1,say:'Sekarang giliranmu. Coba sendiri, baru buka kuncinya!',v:o.vCoba||o.vAkhir||last});
  return {t:o.t,jd:o.jd,src:o.src,parts:parts,beats:beats};
}

/* ---------- Bagian 1 ---------- */
var BA=BQ(10),LA=ln(4,3,24,'=',0,'4x + 3y = 24');
var BB=BQ(8),LB=ln(5,6,30,'≤',0,'5x + 6y = 30');
var BC=BQ(10),SC=sysX([Lq(2,1,10,'≤'),Lq(1,1,8,'≤')]),LC=[ln(2,1,10,'≤',0,'(1)'),ln(1,1,8,'≤',1,'(2)')];
var BD=BQ(8),SD=sysX([Lq(3,2,12,'≤')]),LD=[ln(3,2,12,'≤',0,'')];
var BE=BQ(8),SE=sysX([Lq(2,1,12,'≤'),Lq(1,2,12,'≤')]),LE=[ln(2,1,12,'≤',0,'(1)'),ln(1,2,12,'≤',1,'(2)')];
var BF1=BQ(30,5),SF1=sysX([Lq(1,3,30,'≤'),Lq(1,1,20,'≤')]),LF1=[ln(1,3,30,'≤',0,'(1)'),ln(1,1,20,'≤',1,'(2)')];
var BF2=BQ(40,5),SF2=sysX([Lq(1,2,40,'≥'),Lq(1,1,30,'≤')]),LF2=[ln(1,2,40,'≥',0,'(1)'),ln(1,1,30,'≤',1,'(2)')];
function dotsIn(sys,mx,my){var d=[];for(var x=0;x<=mx;x++)for(var y=0;y<=my;y++)if(CORE.holdsAll(sys,x,y))d.push(P2(x,y));return d;}
var CAP_INT='Titik bulat menunjukkan pilihan yang benar-benar mungkin.';

var EX1=[
{t:'p1',jd:'Bagian 1 · Pembahasan Contoh Kontekstual',src:'Pembahasan Contoh Kontekstual, halaman 1',
 parts:['<p>Setiap contoh kontekstual dibahas lebih dalam: <b>Situasi • Diketahui & Ditanyakan • Penyelesaian • Uji Titik • Diskusi • Coba Sendiri</b>.</p>'
   +tblE(['Bagian','Materi','Contoh kontekstual','Model'],[{c:['A','Menggambar garis','Belanja barongko dan onde-onde','4x + 3y = 24']},{c:['B','Menentukan daerah','Uang jajan seminggu','5x + 6y ≤ 30']},
     {c:['C','Daerah penyelesaian sistem','Membuat kue untuk bazar OSIS','2x + y ≤ 10; x + y ≤ 8']},{c:['D','Pertidaksamaan dari grafik','Muatan motor viar petani jagung','3x + 2y ≤ 12']},
     {c:['E','Sistem dari DP','Songkok recca dan tas anyaman','2x + y ≤ 12; x + 2y ≤ 12']},{c:['F-1','Memodelkan masalah','Kapal penyeberangan Pelabuhan Bajoe','x + 3y ≤ 30; x + y ≤ 20']},
     {c:['F-2','Memodelkan masalah','Tiket pentas seni OSIS','x + 2y ≥ 40; x + y ≤ 30']}]),
   '<h3>Cara memakai pembahasan ini</h3>'+ol(['<b>BACA</b> situasi, lalu tulis sendiri apa yang diketahui dan ditanyakan sebelum melihat penyelesaian.','<b>IKUTI</b> penyelesaian langkah demi langkah dan cocokkan dengan grafik.',
     '<b>PERIKSA</b> tabel uji titik: titik di DP membuat semua pertidaksamaan benar; titik di luar DP membuat sedikitnya satu salah.','<b>DISKUSIKAN</b> pertanyaan bersama teman, lalu kerjakan Coba Sendiri. Kuncinya bisa dibuka.']),
   ingat('Pada tabel uji titik, tanda ✓ berarti pertidaksamaan bernilai benar dan ✗ berarti salah. Semua titik yang diuji memiliki x ≥ 0 dan y ≥ 0, jadi syarat nonnegatif tidak ditulis ulang di tabel.')
   +ingat('Harga, waktu, dan kapasitas dalam semua contoh adalah angka rekaan yang dibuat wajar supaya mudah dihitung, bukan data sebenarnya.')],
 beats:[{show:0,say:'Halo! Aku Plus. Kita bahas tujuh contoh kontekstual, ya.',v:pv(BC,{lines:LC,shade:SC})},{show:1,say:'Ikuti empat langkah ini setiap membaca contoh.',v:pv(BC,{lines:LC,shade:SC})},{show:2,say:'Ingat dua catatan penting ini.',v:pv(BC,{lines:LC,shade:SC})}]},

contoh({t:'A',jd:'A · Belanja barongko dan onde-onde',src:'Pembahasan, Bagian A (halaman 2)',konteks:'kantin sekolah di Watampone',
 situasi:'Di kantin sekolah, barongko dijual Rp4.000 per buah dan onde-onde Rp3.000 per buah. Andi membawa Rp24.000 dan ingin menghabiskan seluruh uangnya untuk membeli kedua jenis kue itu. Andi ingin tahu kombinasi apa saja yang mungkin.',
 dik:['Harga barongko Rp4.000, onde-onde Rp3.000','Uang Rp24.000 habis tepat'],tanya:['Persamaan dan grafiknya','Kombinasi pembelian yang mungkin'],
 v0:pv(BA,{cap:'x = banyak barongko, y = banyak onde-onde (buah).'}),
 langkah:[['MISALKAN:','x = banyak barongko (buah), y = banyak onde-onde (buah).','Tetapkan dulu arti x dan y.'],
  ['SUSUN:','Uang habis tepat → persamaan, bukan pertidaksamaan, yaitu '+eq('4.000x + 3.000y = 24.000')+'. Bagi kedua ruas dengan 1.000 → '+eq('4x + 3y = 24'),'Kata “habis tepat” menghasilkan persamaan.'],
  ['PILIH dan HITUNG:','Pilih nilai x, lalu hitung y dari 4x + 3y = 24.'+tabXY('',[0,3,6],[8,4,0])+'x = 0 → 3y = 24 → y = 8<br>x = 3 → 12 + 3y = 24 → y = 4<br>x = 6 → 24 + 3y = 24 → y = 0<br>Kombinasi yang mungkin adalah (0, 8), (3, 4), dan (6, 0).','Isi tabel x | y. Ada tiga kombinasi bilangan bulat.',pv(BA,{mk:[pt(0,8),pt(3,4),pt(6,0)]})],
  ['','x = 1 → 4 + 3y = 24 → y = 6⅔ (bukan bilangan bulat).'+tabXY('',[1],[20/3]),'x = 1 memberi pecahan, jadi bukan pilihan.',pv(BA,{mk:[pt(0,8),pt(3,4),pt(6,0),pt(1,20/3,'r',undefined,true)]})],
  ['GAMBAR:','Plot titik-titik itu dan hubungkan dengan garis lurus. Tiga titik segaris → hitungan benar.'+ingat('Kata <i>tepat</i> atau <i>habis</i> menghasilkan persamaan (=). Pertidaksamaan muncul jika ada kata seperti “paling banyak” atau “minimal”.'),'Tiga titik segaris berarti hitungannya benar.',pv(BA,{lines:[LA],mk:[pt(0,8),pt(3,4),pt(6,0)]})]],
 head:['Titik','Uji 4x + 3y = 24','Di DP?','Makna dalam konteks'],
 rows:[R(0,8,1,['(0, 8)','4(0) + 3(8) = 24 = 24 ✓','Ya','8 onde-onde saja, uang pas']),R(3,4,1,['(3, 4)','4(3) + 3(4) = 24 = 24 ✓','Ya','3 barongko + 4 onde-onde, uang pas']),
  R(6,0,1,['(6, 0)','4(6) + 3(0) = 24 = 24 ✓','Ya','6 barongko saja, uang pas']),R(1,20/3,1,['(1, 6⅔)','4(1) + 3(6⅔) = 24 = 24 ✓','Ya','Di garis, tetapi 6⅔ onde-onde tidak mungkin dibeli']),
  R(2,5,0,['(2, 5)','4(2) + 3(5) = 23 ≠ 24 ✗','Tidak','Belanja Rp23.000, sisa Rp1.000, jadi uang tidak habis'])],
 diskusi:['Mengapa garis 4x + 3y = 24 tetap digambar utuh, padahal hanya tiga titik yang menjadi jawaban?','Mengapa nilai x yang dipilih adalah 0, 3, dan 6?','Jika soalnya berbunyi “uang tidak lebih dari Rp24.000”, apa yang berubah pada model dan grafiknya?'],
 kunciD:['Garis menunjukkan semua pasangan yang memenuhi; hanya titik bilangan bulat yang bermakna.','3y = 24 − 4x harus habis dibagi 3. Karena 24 habis dibagi 3, 4x juga harus, jadi x kelipatan 3.','Tanda menjadi ≤ dan seluruh daerah kiri-bawah garis ikut menjadi penyelesaian.'],
 coba:'Harga barongko naik menjadi Rp5.000, onde-onde tetap Rp3.000, dan Andi membawa Rp30.000 yang ingin dihabiskan.<br>a. Tulis persamaannya dalam bentuk paling sederhana.<br>b. Tentukan semua kombinasi pembelian yang mungkin.',
 kunciC:'a. 5x + 3y = 30<br>b. (0, 10), (3, 5), (6, 0)',vCoba:pv(BQ(10),{cap:'Coba Sendiri: gambar garismu sendiri, lalu buka kunci.'})}),

contoh({t:'B',jd:'B · Uang jajan seminggu',src:'Pembahasan, Bagian B (halaman 3)',konteks:'kantin sekolah',
 situasi:'Nisa menyiapkan Rp30.000 untuk jajan selama seminggu. Ia suka nasi kuning (Rp5.000 per porsi) dan es pisang ijo (Rp6.000 per gelas). Belanjanya tidak boleh lebih dari Rp30.000. Nisa ingin tahu pilihan jajan mana saja yang masih terjangkau.',
 dik:['Nasi kuning Rp5.000/porsi, es pisang ijo Rp6.000/gelas','Batas belanja Rp30.000 (tidak lebih dari)'],tanya:['Pertidaksamaan dan DP-nya','Pilihan jajan yang terjangkau'],
 v0:pv(BB,{cap:'x = porsi nasi kuning, y = gelas es pisang ijo.'}),
 langkah:[['MISALKAN:','x = banyak porsi nasi kuning, y = banyak gelas es pisang ijo.','Tetapkan arti x dan y.'],
  ['SUSUN:','“Tidak lebih dari” → ≤<br>'+eq('5.000x + 6.000y ≤ 30.000')+' → bagi 1.000 → '+eq('5x + 6y ≤ 30'),'“Tidak lebih dari” berarti ≤.'],
  ['GAMBAR:','Garis batas 5x + 6y = 30. Cari dua titik dengan tabel x | y.'+tabXY('',[0,6],[5,0])+'x = 0 → 6y = 30 → y = 5<br>y = 0 → 5x = 30 → x = 6<br>Tanda ≤ → garis penuh (belanja tepat Rp30.000 boleh).','Tanda ≤ membuat garisnya penuh.',pv(BB,{lines:[LB],mk:[pt(0,5),pt(6,0)]})],
  ['UJI:','Titik (0, 0) → 5(0) + 6(0) = 0 ≤ 30, benar.','Uji titik (0, 0): hasilnya benar.',pv(BB,{lines:[LB],mk:[pt(0,5),pt(6,0),pt(0,0,'g','(0, 0)')]})],
  ['ARSIR:','Benar → arsir sisi yang memuat (0, 0), yaitu sisi kiri-bawah garis.'+ingat('Titik cokelat pada grafik adalah pilihan yang benar-benar mungkin: bilangan bulat dan tidak negatif.'),'Titik cokelat adalah pilihan jajan yang mungkin.',pv(BB,{lines:[LB],shade:sysX([Lq(5,6,30,'≤')]),dots:dotsIn(sysX([Lq(5,6,30,'≤')]),8,8),cap:CAP_INT})]],
 head:['Titik','Uji 5x + 6y ≤ 30','Di DP?','Makna dalam konteks'],
 rows:[R(2,3,1,['(2, 3)','5(2) + 6(3) = 28 ≤ 30 ✓','Ya','Rp28.000, sisa Rp2.000']),R(3,2,1,['(3, 2)','5(3) + 6(2) = 27 ≤ 30 ✓','Ya','Rp27.000, sisa Rp3.000']),
  R(1,4,1,['(1, 4)','5(1) + 6(4) = 29 ≤ 30 ✓','Ya','Rp29.000, sisa Rp1.000']),R(0,5,1,['(0, 5)','5(0) + 6(5) = 30 ≤ 30 ✓','Ya','Tepat Rp30.000, masih boleh']),
  R(4,2,0,['(4, 2)','5(4) + 6(2) = 32 > 30 ✗','Tidak','Rp32.000, uang kurang Rp2.000'])],
 diskusi:['Paling banyak berapa gelas es yang dapat dibeli jika Nisa tidak membeli nasi kuning?','Mengapa garis batasnya penuh, bukan putus-putus?','Jika kalimatnya diganti “kurang dari Rp30.000”, apa yang berubah? Apakah (0, 5) masih termasuk?'],
 kunciD:['5 gelas (titik (0, 5)).','Belanja tepat Rp30.000 masih diperbolehkan.','Tanda &lt;, garis putus-putus; (0, 5) tidak termasuk karena 30 &lt; 30 salah.'],
 coba:'Uang jajan Rp24.000, nasi kuning Rp4.000 per porsi, es pisang ijo Rp6.000 per gelas, belanja tidak lebih dari uang yang ada.<br>a. Tulis pertidaksamaan paling sederhana.<br>b. Apakah 3 porsi dan 2 gelas dapat dibeli? Bagaimana dengan 4 porsi dan 2 gelas?',
 kunciC:'a. 4x + 6y ≤ 24 → 2x + 3y ≤ 12<br>b. (3, 2) → 12 ≤ 12, bisa (tepat Rp24.000). (4, 2) → 14 &gt; 12, tidak bisa (Rp28.000).',
 vCoba:pv(BB,{mk:[pt(3,2,'b'),pt(4,2,'b')],cap:'Coba Sendiri: uji kedua titik ini.'})}),

contoh({t:'C',jd:'C · Membuat kue untuk bazar OSIS',src:'Pembahasan, Bagian C (halaman 4)',konteks:'kegiatan OSIS',
 situasi:'OSIS membuat barongko dan onde-onde untuk bazar sekolah. Mengukus satu loyang barongko memerlukan 2 jam, sedangkan menggoreng satu wajan onde-onde memerlukan 1 jam. Dapur hanya dapat dipakai paling lama 10 jam. Meja bazar dapat memajang paling banyak 8 wadah (1 loyang atau 1 wajan = 1 wadah).',
 dik:['Barongko 2 jam/loyang, onde-onde 1 jam/wajan, waktu paling banyak 10 jam','Meja paling banyak 8 wadah'],tanya:['Sistem pertidaksamaan dan DP-nya','Titik sudut DP dan artinya'],
 v0:pv(BC,{cap:'x = loyang barongko, y = wajan onde-onde.'}),
 langkah:[['MISALKAN:','x = banyak loyang barongko, y = banyak wajan onde-onde.','Tetapkan arti x dan y.'],
  ['SUSUN:','Waktu → '+eq('2x + y ≤ 10')+' ... (1)<br>Wadah → '+eq('x + y ≤ 8')+' ... (2)<br>Banyak kue tidak negatif, jadi x ≥ 0 dan y ≥ 0','Ada dua batasan: waktu dan wadah.'],
  ['GAMBAR:','Garis (1) 2x + y = 10, penuh.'+tabXY('',[0,5],[10,0]),'Gambar garis (1) dulu.',pv(BC,{lines:[LC[0]],mk:[pt(5,0),pt(0,10)]})],
  ['','Garis (2) x + y = 8, penuh.'+tabXY('',[0,8],[8,0]),'Lalu garis (2).',pv(BC,{lines:LC,mk:[pt(5,0),pt(0,10),pt(8,0),pt(0,8)]})],
  ['UJI dan ARSIR:','(0, 0) → 0 ≤ 10 dan 0 ≤ 8 benar → arsir sisi yang memuat (0, 0), di kuadran I.','Uji (0, 0) benar untuk keduanya.',pv(BC,{lines:LC,shade:SC,mk:[pt(0,0,'g','(0, 0)')]})],
  ['TITIK POTONG:','eliminasi y dengan mengurangkan (2) dari (1).'+elim([['','2x + y = 10','(1)'],['−','x + y = 8','(2)'],['','x = 2','']])+'Substitusi x = 2 ke (2) → 2 + y = 8 → y = 6.<br>DP berupa segi empat dengan titik sudut (0, 0), (5, 0), (2, 6), (0, 8).','Titik potongnya (2, 6). DP berbentuk segi empat.',pv(BC,{lines:LC,shade:SC,mk:cornersMk([[0,0],[5,0],[2,6],[0,8]])})]],
 head:['Titik','Uji (1) waktu','Uji (2) wadah','Di DP?','Makna dalam konteks'],
 rows:[R(2,4,1,['(2, 4)','2(2) + 4 = 8 ≤ 10 ✓','2 + 4 = 6 ≤ 8 ✓','Ya','Waktu 8 jam, 6 wadah: bisa']),R(2,6,1,['(2, 6)','2(2) + 6 = 10 ≤ 10 ✓','2 + 6 = 8 ≤ 8 ✓','Ya','Waktu dan meja tepat penuh']),
  R(4,4,0,['(4, 4)','2(4) + 4 = 12 &gt; 10 ✗','4 + 4 = 8 ≤ 8 ✓','Tidak','Meja cukup, tetapi waktu kurang 2 jam']),R(1,8,0,['(1, 8)','2(1) + 8 = 10 ≤ 10 ✓','1 + 8 = 9 &gt; 8 ✗','Tidak','Waktu cukup, tetapi butuh 9 wadah'])],
 diskusi:['Jika OSIS ingin membuat barongko sebanyak-banyaknya, batasan mana yang lebih dulu habis?','Titik (4, 4) dan (1, 8) sama-sama di luar DP. Apa beda penyebabnya?','Jika meja ditambah menjadi 10 wadah, bagaimana DP-nya berubah?'],
 kunciD:['Waktu: paling banyak 5 loyang barongko, sedangkan meja masih muat 8.','(4, 4) melanggar waktu; (1, 8) melanggar wadah.','x + y ≤ 10 tidak lagi membatasi; DP menjadi segitiga (0, 0), (5, 0), (0, 10).'],
 coba:'Waktu dapur diperpanjang menjadi paling lama 12 jam, sedangkan meja tetap paling banyak 8 wadah.<br>a. Tulis sistem pertidaksamaannya.<br>b. Tentukan titik-titik sudut DP-nya.',
 kunciC:'a. 2x + y ≤ 12, x + y ≤ 8, x ≥ 0, y ≥ 0<br>b. (0, 0), (6, 0), (4, 4), (0, 8)',vCoba:pv(BQ(12),{cap:'Coba Sendiri: gambar sistem barumu.'})}),

contoh({t:'D',jd:'D · Muatan motor viar petani jagung',src:'Pembahasan, Bagian D (halaman 5)',konteks:'pertanian jagung di Kabupaten Bone',
 situasi:'Pak Baso mengangkut hasil panen jagung dengan motor viar. Ia memakai karung besar (60 kg) dan karung kecil (40 kg). Petugas koperasi memberinya grafik muatan yang aman. Pak Baso ingin tahu aturan apa yang tersembunyi di balik grafik itu.',
 dik:['Grafik DP dengan garis penuh melalui (0, 6) dan (4, 0)','Karung besar 60 kg, karung kecil 40 kg'],tanya:['Pertidaksamaan dari grafik','Arti pertidaksamaan dalam kilogram'],
 v0:pv(BD,{lines:LD,shade:SD,cap:'Grafik muatan aman. x = karung besar, y = karung kecil.'}),
 langkah:[['MISALKAN:','x = banyak karung besar, y = banyak karung kecil.','Tetapkan arti x dan y.'],
  ['TENTUKAN:','Baca dua titik di perpotongan kisi dan catat dalam tabel x | y.'+tabXY('',[0,4],[6,0]),'Cari dua titik tepat di perpotongan kisi.',pv(BD,{lines:LD,shade:SD,mk:[pt(0,6),pt(4,0)]})],
  ['BUAT:','(y − 6)/(0 − 6) = (x − 0)/(4 − 0)<br>(y − 6)/(−6) = x/4 → 4(y − 6) = −6x<br>4y − 24 = −6x → 6x + 4y = 24 → '+eq('3x + 2y = 12'),'Pakai rumus dua titik, lalu sederhanakan.'],
  ['TENTUKAN jenis garis:','Garis penuh → tanda ≤ atau ≥.','Garis penuh berarti ≤ atau ≥.'],
  ['UJI:','(1, 1) di arsiran → 3(1) + 2(1) = 5 &lt; 12 → tanda ≤.','Titik (1, 1) ada di arsiran. Hasilnya kurang dari 12.',pv(BD,{lines:LD,shade:SD,mk:[pt(0,6),pt(4,0),pt(1,1,'g','(1, 1)')]})],
  ['TULIS:',eq('3x + 2y ≤ 12')+'. Kalikan 20 → 60x + 40y ≤ 240 → muatan paling banyak 240 kg.','Dikali 20, artinya muatan paling banyak 240 kg.']],
 head:['Titik','Uji 3x + 2y ≤ 12','Di DP?','Makna dalam konteks'],
 rows:[R(2,2,1,['(2, 2)','3(2) + 2(2) = 10 ≤ 12 ✓','Ya','200 kg, aman']),R(1,4,1,['(1, 4)','3(1) + 2(4) = 11 ≤ 12 ✓','Ya','220 kg, aman']),
  R(2,3,1,['(2, 3)','3(2) + 2(3) = 12 ≤ 12 ✓','Ya','Tepat 240 kg, masih boleh']),R(4,0,1,['(4, 0)','3(4) + 2(0) = 12 ≤ 12 ✓','Ya','Tepat 240 kg, hanya karung besar']),
  R(3,3,0,['(3, 3)','3(3) + 2(3) = 15 &gt; 12 ✗','Tidak','300 kg, terlalu berat'])],
 diskusi:['Bolehkah (0, 0) dipakai sebagai titik uji? Apa hasilnya?','Paling banyak berapa karung kecil yang dapat dibawa jika tidak ada karung besar?','Jika batas muatan dinaikkan menjadi 300 kg, bagaimana pertidaksamaannya?'],
 kunciD:['Boleh, karena (0, 0) tidak di garis → 0 &lt; 12 → ≤.','6 karung kecil (titik (0, 6)).','60x + 40y ≤ 300 → 3x + 2y ≤ 15.'],
 coba:'Grafik di samping menunjukkan muatan aman motor lain dengan karung besar 50 kg (x) dan karung kecil 40 kg (y).<br>a. Tentukan pertidaksamaannya.<br>b. Jelaskan artinya dalam kilogram.',
 kunciC:'a. Melalui (0, 5) dan (4, 0) → 5x + 4y = 20; uji (0, 0) → 5x + 4y ≤ 20<br>b. Kali 10 → 50x + 40y ≤ 200 → muatan paling banyak 200 kg.',
 vCoba:pv(BD,{lines:[ln(5,4,20,'≤',0,'')],shade:sysX([Lq(5,4,20,'≤')]),cap:'Grafik untuk Coba Sendiri.'})}),

contoh({t:'E',jd:'E · Songkok recca dan tas anyaman',src:'Pembahasan, Bagian E (halaman 6)',konteks:'kerajinan di Kabupaten Bone',
 situasi:'Seorang perajin menggambar grafik rencana produksi songkok recca dan tas anyaman per minggu. Songkok memerlukan 2 jam menganyam dan 1 ikat bahan. Tas memerlukan 1 jam dan 2 ikat. Tersedia 12 jam dan 12 ikat bahan.',
 dik:['Grafik DP berbentuk segi empat dengan titik sudut (0, 0), (6, 0), (4, 4), (0, 6)','Data waktu dan bahan per barang'],tanya:['Sistem pertidaksamaan dari grafik','Arti tiap pertidaksamaan'],
 v0:pv(BE,{lines:LE,shade:SE,mk:cornersMk([[0,0],[6,0],[4,4],[0,6]]),cap:'x = songkok recca, y = tas anyaman (per minggu).'}),
 langkah:[['MISALKAN:','x = banyak songkok recca, y = banyak tas anyaman (per minggu).','Tetapkan arti x dan y.'],
  ['TENTUKAN dan BUAT:','(1) melalui (6, 0) dan (4, 4) → y/4 = (x − 6)/(−2) → −2y = 4x − 24 → '+eq('2x + y = 12'),'Garis (1) melalui (6, 0) dan (4, 4).'],
  ['','(2) melalui (0, 6) dan (4, 4) → (y − 6)/(−2) = x/4 → 4y − 24 = −2x → '+eq('x + 2y = 12'),'Garis (2) melalui (0, 6) dan (4, 4).'],
  ['','(3) sumbu-y, yaitu x = 0; (4) sumbu-x, yaitu y = 0. Semua garis penuh → ≤ atau ≥.','Sumbu koordinat juga garis batas.'],
  ['UJI:','Satu titik untuk semua garis, yaitu (2, 2).<br>(1) → 6 &lt; 12 → ≤; (2) → 6 &lt; 12 → ≤; (3) → 2 &gt; 0 → x ≥ 0; (4) → 2 &gt; 0 → y ≥ 0','Satu titik uji (2, 2) dipakai untuk semua garis.',pv(BE,{lines:LE,shade:SE,mk:cornersMk([[0,0],[6,0],[4,4],[0,6]]).concat([pt(2,2,'g','(2, 2)')])})],
  ['TULIS:',eq('2x + y ≤ 12, x + 2y ≤ 12, x ≥ 0, y ≥ 0')+'<br>(1) = batas waktu (koefisien 2 dan 1 jam), (2) = batas bahan (1 dan 2 ikat).','Koefisien menunjukkan arti setiap pertidaksamaan.']],
 head:['Titik','Uji (1) waktu','Uji (2) bahan','Di DP?','Makna dalam konteks'],
 rows:[R(2,2,1,['(2, 2)','2(2) + 2 = 6 ≤ 12 ✓','2 + 2(2) = 6 ≤ 12 ✓','Ya','6 jam, 6 ikat: banyak sisa']),R(4,4,1,['(4, 4)','2(4) + 4 = 12 ≤ 12 ✓','4 + 2(4) = 12 ≤ 12 ✓','Ya','Waktu dan bahan tepat habis']),
  R(1,6,0,['(1, 6)','2(1) + 6 = 8 ≤ 12 ✓','1 + 2(6) = 13 &gt; 12 ✗','Tidak','Waktu cukup, bahan kurang 1 ikat']),R(5,4,0,['(5, 4)','2(5) + 4 = 14 &gt; 12 ✗','5 + 2(4) = 13 &gt; 12 ✗','Tidak','Waktu dan bahan sama-sama kurang'])],
 diskusi:['Bagaimana cara mengetahui garis mana yang menyatakan waktu dan mana yang menyatakan bahan?','Pada titik (6, 0), berapa ikat bahan yang tersisa?','Mengapa (2, 2), bukan (0, 0), yang dipakai sebagai titik uji?'],
 kunciD:['Bandingkan koefisien dengan data, yaitu 2 jam dan 1 jam untuk waktu, 1 ikat dan 2 ikat untuk bahan.','x + 2y = 6, jadi sisa 6 ikat.','(0, 0) ada di sumbu-x dan sumbu-y, jadi tidak boleh untuk garis (3) dan (4).'],
 coba:'Grafik di samping: garis (1) melalui (5, 0) dan (3, 3); garis (2) melalui (0, 4) dan (3, 3).<br>a. Tentukan sistemnya.<br>b. Jika (1) batas waktu, berapa jam untuk satu songkok dan satu tas?',
 kunciC:'a. 3x + 2y ≤ 15, x + 3y ≤ 12, x ≥ 0, y ≥ 0<br>b. Songkok 3 jam, tas 2 jam (koefisien 3 dan 2).',
 vCoba:pv(BE,{lines:[ln(3,2,15,'≤',0,'(1)'),ln(1,3,12,'≤',1,'(2)')],shade:sysX([Lq(3,2,15,'≤'),Lq(1,3,12,'≤')]),mk:cornersMk([[0,0],[5,0],[3,3],[0,4]]),cap:'Grafik untuk Coba Sendiri.'})}),

contoh({t:'F1',jd:'F-1 · Kapal penyeberangan di Pelabuhan Bajoe',src:'Pembahasan, Bagian F, Contoh F-1 (halaman 7)',konteks:'transportasi laut Kabupaten Bone',
 situasi:'Sebuah kapal penyeberangan dari Pelabuhan Bajoe memiliki lantai kendaraan seluas 600 m². Satu mobil memerlukan 20 m² dan satu truk 60 m². Demi keselamatan, kapal memuat paling banyak 20 kendaraan. Petugas ingin tahu susunan muatan yang diperbolehkan.',
 dik:['Luas lantai 600 m²; mobil 20 m², truk 60 m²','Paling banyak 20 kendaraan'],tanya:['Model matematika dan DP-nya','Susunan muatan yang diperbolehkan'],
 v0:pv(BF1,{cap:'x = mobil, y = truk (unit). Satu kotak kisi = 5 unit.'}),
 langkah:[['MISALKAN:','x = banyak mobil (unit), y = banyak truk (unit).','Tetapkan arti x dan y.'],
  ['TERJEMAHKAN:','Luas → 20x + 60y ≤ 600 → bagi 20 → '+eq('x + 3y ≤ 30')+' ... (1)<br>Banyak kendaraan → '+eq('x + y ≤ 20')+' ... (2)','Bagi 20 supaya angkanya kecil.'],
  ['TAMBAHKAN:','x ≥ 0, y ≥ 0','Banyak kendaraan tidak mungkin negatif.'],
  ['GAMBAR:','<div class="dd">'+tabXY('(1) x + 3y = 30',[0,30],[10,0])+tabXY('(2) x + y = 20',[0,20],[20,0])+'</div>Keduanya penuh.<br>Uji (0, 0) → 0 ≤ 30 dan 0 ≤ 20 benar → sisi (0, 0).','Gambar kedua garis, lalu uji (0, 0).',pv(BF1,{lines:LF1,shade:SF1,mk:[pt(30,0),pt(0,10),pt(20,0),pt(0,20)]})],
  ['Titik potong:','eliminasi x dengan mengurangkan (2) dari (1).'+elim([['','x + 3y = 30','(1)'],['−','x + y = 20','(2)'],['','2y = 10','']])+'2y = 10 → y = 5. Substitusi ke (2) → x + 5 = 20 → x = 15.<br>Titik sudut DP adalah (0, 0), (20, 0), (15, 5), (0, 10).','Titik potongnya (15, 5).',pv(BF1,{lines:LF1,shade:SF1,mk:cornersMk([[0,0],[20,0],[15,5],[0,10]])})],
  ['TAFSIRKAN:','Lihat tabel uji titik di bawah.','Sekarang tafsirkan dengan tabel.']],
 head:['Titik','Uji (1) luas','Uji (2) banyak','Di DP?','Makna dalam konteks'],
 rows:[R(10,5,1,['(10, 5)','10 + 3(5) = 25 ≤ 30 ✓','10 + 5 = 15 ≤ 20 ✓','Ya','500 m², 15 kendaraan: boleh']),R(15,5,1,['(15, 5)','15 + 3(5) = 30 ≤ 30 ✓','15 + 5 = 20 ≤ 20 ✓','Ya','Tepat 600 m² dan 20 kendaraan']),
  R(20,0,1,['(20, 0)','20 + 3(0) = 20 ≤ 30 ✓','20 + 0 = 20 ≤ 20 ✓','Ya','20 mobil, 400 m²: boleh']),R(0,10,1,['(0, 10)','0 + 3(10) = 30 ≤ 30 ✓','0 + 10 = 10 ≤ 20 ✓','Ya','10 truk, tepat 600 m²']),
  R(12,7,0,['(12, 7)','12 + 3(7) = 33 &gt; 30 ✗','12 + 7 = 19 ≤ 20 ✓','Tidak','Butuh 660 m², lantai tidak cukup']),R(18,4,0,['(18, 4)','18 + 3(4) = 30 ≤ 30 ✓','18 + 4 = 22 &gt; 20 ✗','Tidak','Luas pas 600 m², tetapi 22 kendaraan'])],
 diskusi:['Mengapa pertidaksamaan luas dibagi 20? Apakah DP-nya berubah?','Jika kapal hanya memuat truk, paling banyak berapa truk?','Titik (12, 7) dan (18, 4) sama-sama ditolak. Batasan mana yang dilanggar oleh masing-masing?'],
 kunciD:['Agar angkanya kecil; DP tidak berubah karena dibagi bilangan positif.','10 truk (titik (0, 10)).','(12, 7) melanggar luas; (18, 4) melanggar banyak kendaraan.'],
 coba:'Kapal lain: lantai 400 m², mobil 20 m², truk 40 m², paling banyak 15 kendaraan.<br>a. Buat model matematikanya.<br>b. Tentukan titik sudut DP.<br>c. Apakah 8 mobil dan 6 truk boleh dimuat?',
 kunciC:'a. x + 2y ≤ 20, x + y ≤ 15, x ≥ 0, y ≥ 0<br>b. (0, 0), (15, 0), (10, 5), (0, 10)<br>c. Boleh, karena 8 + 12 = 20 ≤ 20 dan 14 ≤ 15.',vCoba:pv(BQ(20,5),{cap:'Coba Sendiri: satu kotak kisi = 5 unit.'})}),

contoh({t:'F2',jd:'F-2 · Tiket pentas seni OSIS',src:'Pembahasan, Bagian F, Contoh F-2 (halaman 8)',konteks:'kegiatan OSIS',
 situasi:'OSIS mengadakan pentas seni di aula sekolah. Tiket pelajar Rp10.000 dan tiket umum Rp20.000. Karena kursi terbatas, tiket yang terjual tidak lebih dari 30 lembar. Supaya biaya acara tertutup, pendapatan harus paling sedikit Rp400.000.',
 dik:['Tiket pelajar Rp10.000, umum Rp20.000','Tiket terjual tidak lebih dari 30','Pendapatan paling sedikit Rp400.000'],tanya:['Model matematika dan DP-nya','Penjualan yang memenuhi target'],
 v0:pv(BF2,{cap:'x = tiket pelajar, y = tiket umum (lembar). Satu kotak kisi = 5 lembar.'}),
 langkah:[['MISALKAN:','x = banyak tiket pelajar, y = banyak tiket umum (lembar).','Tetapkan arti x dan y.'],
  ['TERJEMAHKAN:','Pendapatan → 10.000x + 20.000y ≥ 400.000 → bagi 10.000 → '+eq('x + 2y ≥ 40')+' ... (1)<br>Kursi → '+eq('x + y ≤ 30')+' ... (2)','“Paling sedikit” → ≥; “tidak lebih dari” → ≤.'],
  ['TAMBAHKAN:','x ≥ 0, y ≥ 0','Banyak tiket tidak negatif.'],
  ['GAMBAR:','Garis (1) x + 2y = 40, penuh.'+tabXY('',[0,40],[20,0])+'Uji (0, 0) → 0 ≥ 40 salah → arsir sisi yang tidak memuat (0, 0).','Uji (0, 0) pada (1) salah! Arsir sisi seberangnya.',pv(BF2,{lines:[LF2[0]],shade:sysX([Lq(1,2,40,'≥')]),mk:[pt(40,0),pt(0,20),pt(0,0,'r','(0, 0)')]})],
  ['','Garis (2) x + y = 30, penuh.'+tabXY('',[0,30],[30,0])+'Uji (0, 0) → 0 ≤ 30 benar → sisi (0, 0).','Pada (2), uji (0, 0) benar.',pv(BF2,{lines:LF2,shade:SF2,mk:[pt(30,0),pt(0,30)]})],
  ['Titik potong:','eliminasi x dengan mengurangkan (2) dari (1).'+elim([['','x + 2y = 40','(1)'],['−','x + y = 30','(2)'],['','y = 10','']])+'Substitusi y = 10 ke (2) → x + 10 = 30 → x = 20.<br>DP berupa segitiga dengan titik sudut (0, 20), (0, 30), (20, 10).'+ingat('Jangan mengarsir sisi (0, 0) hanya karena kebiasaan. Selalu uji.'),'DP berupa segitiga yang tidak memuat (0, 0).',pv(BF2,{lines:LF2,shade:SF2,mk:cornersMk([[0,20],[0,30],[20,10]])})],
  ['TAFSIRKAN:','Dari kedua batasan, y ≥ 10: paling sedikit 10 tiket umum harus terjual.','Paling sedikit 10 tiket umum harus terjual.']],
 head:['Titik','Uji (1) pendapatan','Uji (2) kursi','Di DP?','Makna dalam konteks'],
 rows:[R(5,20,1,['(5, 20)','5 + 2(20) = 45 ≥ 40 ✓','5 + 20 = 25 ≤ 30 ✓','Ya','Rp450.000 dari 25 kursi']),R(20,10,1,['(20, 10)','20 + 2(10) = 40 ≥ 40 ✓','20 + 10 = 30 ≤ 30 ✓','Ya','Tepat Rp400.000, kursi penuh']),
  R(0,25,1,['(0, 25)','0 + 2(25) = 50 ≥ 40 ✓','0 + 25 = 25 ≤ 30 ✓','Ya','Rp500.000, sisa 5 kursi']),R(10,10,0,['(10, 10)','10 + 2(10) = 30 &lt; 40 ✗','10 + 10 = 20 ≤ 30 ✓','Tidak','Hanya Rp300.000, target gagal']),
  R(15,20,0,['(15, 20)','15 + 2(20) = 55 ≥ 40 ✓','15 + 20 = 35 &gt; 30 ✗','Tidak','Rp550.000, tetapi butuh 35 kursi'])],
 diskusi:['Mengapa DP pada contoh ini tidak memuat titik (0, 0)?','Jika semua 30 kursi diisi pelajar, apakah target tercapai?','Jelaskan mengapa paling sedikit 10 tiket umum harus terjual.'],
 kunciD:['Uji (0, 0) pada x + 2y ≥ 40 bernilai salah.','Tidak. Titik (30, 0) memberi 30 &lt; 40, pendapatan hanya Rp300.000.','Kurangkan (2) dari (1) → y ≥ 10. Titik terendah DP adalah (20, 10).'],
 coba:'Pentas berikutnya: tiket pelajar Rp10.000, umum Rp20.000, kursi tidak lebih dari 40, pendapatan paling sedikit Rp600.000.<br>a. Buat model matematikanya.<br>b. Tentukan titik sudut DP.<br>c. Paling sedikit berapa tiket umum harus terjual?',
 kunciC:'a. x + 2y ≥ 60, x + y ≤ 40, x ≥ 0, y ≥ 0<br>b. (0, 30), (0, 40), (20, 20)<br>c. 20 tiket umum.',vCoba:pv(BQ(60,5),{cap:'Coba Sendiri: satu kotak kisi = 5 lembar.'})}),

{t:'z1',jd:'Tantangan Bagian 1',src:'Pembahasan, halaman 9',
 parts:['<div class="exbox fix"><p><b>Tantangan:</b> buat satu soal cerita dari kehidupanmu di Bone, misalnya tentang pasar, sawah, atau kegiatan sekolah. Selesaikan dengan langkah <b>MISALKAN • TERJEMAHKAN • TAMBAHKAN • GAMBAR • TAFSIRKAN</b>, lalu tukarkan dengan temanmu.</p></div>',
   '<p>Berikutnya: <b>Bagian 2 · Fungsi tujuan dan nilai optimum</b>. Kita akan memilih titik terbaik di dalam DP.</p>'],
 beats:[{show:0,say:'Ayo buat soal ceritamu sendiri!',v:pv(BQ(10))},{show:1,say:'Lanjut ke Bagian 2, ya.',v:pv(BC,{lines:LC,shade:SC,mk:cornersMk([[0,0],[5,0],[2,6],[0,8]])})}]}
];


/* ---------- Bagian 2 ---------- */
function scr(t,jd,src,items,go){
  var parts=[],beats=[],last=null;
  items.forEach(function(it){
    if(it[0]!==null)parts.push(it[0]);
    if(it[2])last=it[2];
    var b={show:parts.length-1,say:it[1],v:last};
    if(it[3])for(var k in it[3])b[k]=it[3][k];
    beats.push(b);
  });
  return {t:t,jd:jd,src:src,parts:parts,beats:beats,go:!!go};
}
function slider(id,max,step,unit){return '<div class="gsbox"><label for="'+id+'"><b>Geser garis selidik</b>, k = <span id="'+id+'V">0</span></label><input type="range" id="'+id+'" class="gsr" min="0" max="'+max+'" step="'+step+'" value="0"'+(unit?' data-u="'+unit+'"':'')+'><span id="'+id+'T" class="muted" role="status"></span></div>';}
function fTbl(p,q,pts,rpY,best){
  return tblE(['Titik sudut','f(x, y) = '+lin(p,q),'Nilai'],pts.map(function(P){var v=p*P[0]+q*P[1];return R(P[0],P[1],1,['('+P[0]+', '+P[1]+')',nm(p)+'('+P[0]+') + '+nm(q)+'('+P[1]+')',(best&&best[0]===P[0]&&best[1]===P[1]?'<b>':'')+(rpY?rp(v):nm(v))+(best&&best[0]===P[0]&&best[1]===P[1]?'</b>':'')]);}));
}
var B21=BQ(6),S21=sysX([Lq(1,1,4,'≤'),Lq(1,3,6,'≤')]),L21=[ln(1,1,4,'≤',0,'(1)'),ln(1,3,6,'≤',1,'(2)')],C21=[[0,0],[4,0],[3,1],[0,2]];
var B22=BQ(9),L22=[ln(2,1,8,'=',0,'(1)'),ln(1,3,9,'=',1,'(2)')];
var BC2=BQ(10),SC2=sysX([Lq(1,1,5,'≥'),Lq(1,3,9,'≥')]),LC2=[ln(1,1,5,'≥',0,'(1)'),ln(1,3,9,'≥',1,'(2)')],CC2=[[0,5],[3,2],[9,0]];
var SE3=sysX([Lq(1,3,30,'≤'),Lq(1,1,20,'≤')]),SE4=sysX([Lq(2,1,8,'≥'),Lq(1,3,9,'≥')]),LE4=[ln(2,1,8,'≥',0,'(1)'),ln(1,3,9,'≥',1,'(2)')];
function gsV(V,p,q,cs,open,unit){V.gs={p:p,q:q,cs:cs,open:!!open,u:unit||''};return V;}
var VB21=pv(B21,{lines:L21,shade:S21,mk:cornersMk(C21)});
var VBZ=pv(BC,{lines:LC,shade:SC,mk:cornersMk([[0,0],[5,0],[2,6],[0,8]]),cap:'x = loyang barongko, y = wajan onde-onde.'});
var VSK=pv(BE,{lines:LE,shade:SE,mk:cornersMk([[0,0],[6,0],[4,4],[0,6]]),cap:'x = songkok recca, y = tas anyaman.'});
var VKP=pv(BF1,{lines:LF1,shade:SE3,mk:cornersMk([[0,0],[20,0],[15,5],[0,10]]),cap:'x = mobil, y = truk. Satu kotak kisi = 5 unit.'});
var VPK=pv(BC2,{lines:LE4,shade:SE4,mk:cornersMk([[0,8],[3,2],[9,0]]),cap:'x = karung pupuk A, y = karung pupuk B.'});
function V2(V,o){var W={};for(var k in V)W[k]=V[k];for(var j in o)W[j]=o[j];return W;}

var EX2=[
scr('p2','Bagian 2 · Fungsi Tujuan dan Nilai Optimum','Fungsi Tujuan dan Nilai Optimum, halaman 1',[
 ['<p>Nilai maksimum atau minimum fungsi tujuan ditemukan dengan langkah:</p><p class="ans">SUSUN model • GAMBAR DP • CARI titik sudut • HITUNG dan PILIH</p>','Bagian 2: memilih titik terbaik di dalam DP.',VBZ],
 ['<p>Isi bagian ini: A. Fungsi Tujuan • B. Titik Sudut DP • C. Metode Uji Titik Sudut • D. Metode Garis Selidik • E. Contoh Kontekstual • F. Kesalahan Umum</p>'+ingat('Materi ini memakai DP dan contoh kontekstual dari rangkuman Sistem Pertidaksamaan Linear Dua Variabel. Harga, keuntungan, dan tarif adalah angka rekaan yang dibuat wajar supaya mudah dihitung.'),'DP dan contohnya sama dengan Bagian 1.']]),
scr('fA','A · Fungsi tujuan','Fungsi Tujuan, Bagian A (halaman 1–2)',[
 ['<p>Daerah penyelesaian (DP) memuat semua pilihan yang mungkin. Dalam kehidupan sehari-hari, kita biasanya ingin memilih yang terbaik: keuntungan terbesar, pendapatan terbesar, atau biaya terkecil. Ukuran “terbaik” itu ditulis sebagai <b>fungsi tujuan</b> (fungsi objektif).</p><p class="ans" data-tex="f(x, y) = px + qy">f(x, y) = px + qy</p>','Ukuran “terbaik” ditulis sebagai fungsi tujuan.',VBZ],
 ['<p>Fungsi tujuan bersama sistem pertidaksamaan (disebut <b>kendala</b>) membentuk sebuah model program linear.</p>','Fungsi tujuan + kendala = model program linear.'],
 ['<p>Untuk menyusun fungsi tujuan, lakukan:</p>'+ol(['<b>TENTUKAN</b> apa yang ingin dioptimalkan (keuntungan, pendapatan, biaya)','<b>TULIS</b> nilai per satuan untuk x dan untuk y','<b>SUSUN</b> f(x, y) = px + qy, lalu tulis maksimumkan atau minimumkan'])+ingat('Kalimat dengan “paling banyak”, “paling sedikit”, atau “tidak lebih dari” menjadi kendala. Kalimat “keuntungan sebesar-besarnya” atau “biaya serendah-rendahnya” menjadi fungsi tujuan.'),'Tiga langkah menyusun fungsi tujuan.'],
 ['<div class="exbox"><b>Bentuk model program linear</b><p>Maksimumkan / minimumkan f(x, y) = px + qy<br>Kendala berupa sistem pertidaksamaan linear<br>x ≥ 0, y ≥ 0</p></div>','Inilah bentuk lengkap modelnya.'],
 ['<h3>Kata kunci tujuan</h3>'+tblE(['Kata kunci dalam soal','Tujuan','Contoh'],[{c:['keuntungan sebesar-besarnya, pendapatan maksimum, hasil terbanyak','Maksimumkan','Keuntungan bazar OSIS sebesar-besarnya']},{c:['biaya serendah-rendahnya, ongkos minimum, paling hemat, waktu tersingkat','Minimumkan','Biaya membeli pupuk serendah-rendahnya']}]),'Kata kunci menentukan maksimumkan atau minimumkan.'],
 ['<div class="exbox"><b>Contoh</b><p>Pada bazar OSIS, keuntungan satu loyang barongko Rp30.000 dan satu wajan onde-onde Rp20.000. OSIS ingin keuntungan sebesar-besarnya. Susun fungsi tujuannya dan hitung keuntungan untuk 2 loyang barongko dan 4 wajan onde-onde.</p></div>','Mari coba dengan contoh bazar OSIS.'],
 [ol(['Yang dioptimalkan: keuntungan → maksimumkan.','x = banyak loyang barongko (Rp30.000), y = banyak wajan onde-onde (Rp20.000).','f(x, y) = 30.000x + 20.000y'])+'<p class="ans">Maksimumkan f(x, y) = 30.000x + 20.000y</p><p>f(2, 4) = 30.000(2) + 20.000(4) = 60.000 + 80.000 = <b>Rp140.000</b></p>'+ingat('Fungsi tujuan tidak diberi tanda ≤ atau ≥. Ia hanya dihitung nilainya di titik-titik DP.'),'f(2, 4) = Rp140.000. Titik (2, 4) ada di dalam DP.',V2(VBZ,{mk:[pt(2,4,'b')]})]]),
scr('fB1','B · Titik sudut DP (Contoh 1)','Fungsi Tujuan, Bagian B (halaman 2)',[
 ['<p><b>Titik sudut</b> adalah titik pojok DP. Titik sudut dapat berupa titik (0, 0), titik potong garis dengan sumbu, atau titik potong dua garis batas.</p>','Titik sudut = titik pojok DP.',VB21],
 ['<p>Untuk mencari titik sudut, lakukan:</p>'+ol(['<b>CARI</b> titik potong tiap garis dengan sumbu (x = 0 dan y = 0)','<b>ELIMINASI</b> satu variabel untuk titik potong dua garis, lalu <b>SUBSTITUSI</b>','<b>PERIKSA</b> setiap calon titik ke semua kendala; buang yang berada di luar DP'])+ingat('Tidak semua titik potong adalah titik sudut. Titik sudut harus memenuhi semua kendala.'),'Tiga langkah mencari titik sudut.'],
 ['<div class="exbox"><b>Contoh 1 (eliminasi langsung)</b><p>Tentukan titik sudut DP dari x + y ≤ 4 ... (1), x + 3y ≤ 6 ... (2), x ≥ 0, y ≥ 0.</p></div>','Ini Contoh 1.',pv(B21,{lines:L21,shade:S21})],
 ['<p><b>Titik potong sumbu</b> dicari dengan tabel x | y.</p><div class="dd">'+tabXY('(1) x + y = 4',[0,4],[4,0])+tabXY('(2) x + 3y = 6',[0,6],[2,0])+'</div>','Isi tabel x | y. Ada empat titik potong dengan sumbu.',pv(B21,{lines:L21,shade:S21,mk:cornersMk([[4,0],[0,4],[6,0],[0,2]])})],
 ['<p><b>Titik potong (1) dan (2)</b>, kurangkan (1) dari (2).</p>'+elim([['','x + 3y = 6','(2)'],['−','x + y = 4','(1)'],['','2y = 2','']])+'<p>2y = 2 → y = 1. Substitusi ke (1) → x + 1 = 4 → x = 3 → (3, 1).</p>','Titik potong kedua garis adalah (3, 1).',pv(B21,{lines:L21,shade:S21,mk:cornersMk([[4,0],[0,4],[6,0],[0,2],[3,1]])})],
 ['<p><b>Periksa</b> setiap calon titik. (6, 0) → 6 ≤ 4 salah, buang. (0, 4) → 12 ≤ 6 salah, buang.</p>','(6, 0) dan (0, 4) berada di luar DP, jadi dibuang.',pv(B21,{lines:L21,shade:S21,mk:cornersMk([[4,0],[0,2],[3,1]]),cross:[P2(6,0),P2(0,4)]})],
 ['<p class="ans">Titik sudut adalah (0, 0), (4, 0), (3, 1), (0, 2).</p>','Ada empat titik sudut.',VB21]]),
scr('fB2','B · Titik sudut DP (Contoh 2)','Fungsi Tujuan, Bagian B (halaman 2)',[
 ['<div class="exbox"><b>Contoh 2 (eliminasi dengan menyamakan koefisien)</b><p>Tentukan titik potong garis 2x + y = 8 ... (1) dan x + 3y = 9 ... (2).</p></div>','Pada Contoh 2, koefisiennya belum sama.',pv(B22,{lines:L22})],
 ['<p>Koefisien x belum sama. Kalikan (2) dengan 2 → 2x + 6y = 18.</p>'+elim([['','2x + 6y = 18','(2)×2'],['−','2x + y = 8','(1)'],['','5y = 10','']])+ingat('Jika koefisien belum sama, kalikan salah satu atau kedua persamaan dulu, baru kurangkan atau jumlahkan.'),'Samakan koefisien x dulu, baru kurangkan.'],
 ['<p>5y = 10 → y = 2. Substitusi ke (1) → 2x + 2 = 8 → x = 3. Titik potongnya <b>(3, 2)</b>.</p>'+ingat('Periksa hasil dengan memasukkan titik ke kedua persamaan, yaitu 2(3) + 2 = 8 ✓ dan 3 + 3(2) = 9 ✓.'),'Titik potongnya (3, 2). Periksa ke kedua persamaan.',pv(B22,{lines:L22,mk:[pt(3,2)]})]]),
scr('fC1','C · Metode uji titik sudut (maksimum)','Fungsi Tujuan, Bagian C (halaman 3)',[
 ['<p>Untuk menentukan nilai optimum, lakukan:</p>'+ol(['<b>GAMBAR</b> DP dari kendala','<b>CARI</b> semua titik sudut DP','<b>HITUNG</b> nilai f(x, y) di setiap titik sudut','<b>PILIH</b> nilai terbesar (maksimum) atau terkecil (minimum)'])+ingat('Jika DP tertutup (terbatas), nilai maksimum dan minimum fungsi tujuan selalu berada di titik sudut DP.'),'Bandingkan nilai fungsi tujuan di setiap titik sudut.',VB21],
 ['<div class="exbox"><b>Contoh 1 (nilai maksimum)</b><p>Tentukan nilai maksimum f(x, y) = 2x + 3y dengan kendala x + y ≤ 4, x + 3y ≤ 6, x ≥ 0, y ≥ 0.</p></div>','Pada Contoh 1, cari nilai maksimum.'],
 [ol(['DP digambar seperti grafik (Bagian B, Contoh 1).','Titik sudut adalah (0, 0), (4, 0), (3, 1), (0, 2).','Hitung f di setiap titik (tabel).']),'DP dan titik sudutnya sudah kita dapat.'],
 [fTbl(2,3,C21,false),'Hitung f di setiap titik sudut.'],
 ['<p class="ans">4. Nilai terbesar adalah 9 di (3, 1). Nilai maksimum f = 9, dicapai di (3, 1).</p>','Nilai maksimum f = 9 di (3, 1).',V2(VB21,{mk:cornersMk(C21).concat([pt(3,1,'g','maks (3, 1)')])})]]),
scr('fC2','C · Metode uji titik sudut (minimum pada DP terbuka)','Fungsi Tujuan, Bagian C (halaman 3)',[
 ['<div class="exbox"><b>Contoh 2 (nilai minimum pada DP terbuka)</b><p>Tentukan nilai minimum f(x, y) = 2x + 3y dengan kendala x + y ≥ 5, x + 3y ≥ 9, x ≥ 0, y ≥ 0.</p></div>','Pada Contoh 2, kendalanya bertanda ≥.',pv(BC2,{lines:LC2})],
 ['<p>1. Kedua garis penuh; uji (0, 0) → 0 ≥ 5 salah dan 0 ≥ 9 salah → arsir sisi yang tidak memuat (0, 0).</p>','Uji (0, 0) salah, jadi arsir sisi seberangnya.',pv(BC2,{lines:LC2,shade:SC2,mk:[pt(0,0,'r','(0, 0)')]})],
 ['<p>2. Titik potong, kurangkan (1) dari (2).</p>'+elim([['','x + 3y = 9','(2)'],['−','x + y = 5','(1)'],['','2y = 4','']])+'<p>y = 2, x = 3. Titik sudut adalah (0, 5), (3, 2), (9, 0).</p>','Titik sudutnya (0, 5), (3, 2), dan (9, 0).',pv(BC2,{lines:LC2,shade:SC2,mk:cornersMk(CC2)})],
 ['<p>3–4. Lihat tabel; nilai terkecil 12 di (3, 2).</p>'+fTbl(2,3,CC2,false),'Hitung f di ketiga titik sudut.'],
 ['<p class="ans">Nilai minimum f = 12, dicapai di (3, 2).</p>'+ingat('DP ini terbuka ke kanan-atas, jadi f dapat dibuat sebesar apa pun. Nilai maksimum tidak ada; yang ada hanya nilai minimum.'),'DP terbuka: maksimum tidak ada, minimum 12 di (3, 2).',pv(BC2,{lines:LC2,shade:SC2,mk:cornersMk(CC2).concat([pt(3,2,'g','min (3, 2)')])})]]),
scr('fD','D · Metode garis selidik','Fungsi Tujuan, Bagian D (halaman 4)',[
 ['<p><b>Garis selidik</b> adalah garis px + qy = k yang sejajar dengan fungsi tujuan f(x, y) = px + qy. Jika p dan q positif, semakin jauh garis digeser ke kanan-atas, semakin besar nilai k.</p>','Garis selidik sejajar dengan fungsi tujuan.',gsV(pv(B21,{lines:L21,shade:S21,mk:cornersMk(C21)}),2,3,C21),{k:0}],
 ['<p>Untuk memakai garis selidik, lakukan:</p>'+ol(['<b>GAMBAR</b> garis px + qy = k untuk sebuah k yang mudah, misalnya k = 0','<b>GESER</b> garis itu sejajar melintasi DP','<b>PILIH</b> titik terakhir yang disentuh untuk maksimum, titik pertama untuk minimum','<b>HITUNG</b> f di titik itu']),'Empat langkah garis selidik.',null,{k:0}],
 ['<div class="exbox"><b>Contoh → maksimumkan f = 2x + 3y pada DP Bagian C, Contoh 1.</b></div>'+slider('exGs',14,1),'Garis 2x + 3y = 0 menyentuh DP di (0, 0): titik pertama, jadi minimum f = 0.',null,{k:0,at:{el:'#exGs'}}],
 ['<p>Garis 2x + 3y = 0 menyentuh DP di (0, 0) → titik pertama, jadi minimum f = 0.</p>','Saat k = 0, titik pertama (0, 0), minimum f = 0.',null,{k:0}],
 ['<p>Garis 2x + 3y = 6 melalui (0, 2), masih memotong DP.</p>','Saat k = 6, garis melalui (0, 2) dan masih memotong DP.',null,{k:6}],
 ['<p>Garis 2x + 3y = 9 menyentuh DP terakhir kali di (3, 1).</p><p class="ans">Nilai maksimum f = 2(3) + 3(1) = 9. Hasilnya sama dengan metode uji titik sudut.</p>'+ingat('Jika garis selidik sejajar dengan salah satu sisi DP, nilai optimum dicapai di semua titik pada sisi itu.'),'Saat k = 9, titik terakhir (3, 1), maksimum f = 9. Coba geser sendiri slidernya!',null,{k:9}],
 [tblE(['','Metode uji titik sudut','Metode garis selidik'],[{c:['Cara kerja','Hitung f di semua titik sudut, lalu bandingkan','Geser garis px + qy = k melintasi DP']},{c:['Kelebihan','Pasti teliti; cocok untuk semua soal','Cepat menunjukkan titik optimum dari gambar']},{c:['Perhatian','Jangan ada titik sudut yang terlewat','Gambar harus teliti; tetap hitung f di titik itu']}]),'Bandingkan kedua metode.',null,{k:9}]]),
scr('fE1','E · Keuntungan bazar OSIS (maksimum)','Fungsi Tujuan, Bagian E (halaman 5)',[
 ['<p class="muted">Konteks: kegiatan OSIS</p><div class="exbox"><p>Kendala bazar: waktu 2x + y ≤ 10, meja x + y ≤ 8, x ≥ 0, y ≥ 0 (x = loyang barongko, y = wajan onde-onde). Keuntungan barongko Rp30.000 per loyang dan onde-onde Rp20.000 per wajan. Tentukan keuntungan maksimum.</p></div>','Kendalanya sama dengan Contoh C di Bagian 1.',pv(BC,{lines:LC,cap:VBZ.cap})],
 ['<p><b class=\"lkh\">SUSUN</b> maksimumkan f(x, y) = 30.000x + 20.000y.</p>','Susun fungsi tujuannya.'],
 ['<p><b class=\"lkh\">GAMBAR</b> DP seperti grafik.</p>','Gambar DP-nya.',pv(BC,{lines:LC,shade:SC,cap:VBZ.cap})],
 ['<p><b>CARI</b> titik potong, kurangkan (2) dari (1).</p>'+elim([['','2x + y = 10','(1)'],['−','x + y = 8','(2)'],['','x = 2','']])+'<p>Substitusi ke (2) → 2 + y = 8 → y = 6. Titik sudut adalah (0, 0), (5, 0), (2, 6), (0, 8).</p>','Titik sudutnya empat.',VBZ],
 ['<p><b class=\"lkh\">HITUNG dan PILIH</b> lihat tabel.</p>'+fTbl(30000,20000,[[0,0],[5,0],[2,6],[0,8]],true,[2,6]),'Hitung keuntungan di setiap titik sudut.'],
 ['<p class="ans">Maksimum Rp180.000 di (2, 6)</p><div class="exbox fix"><b>Makna dalam konteks</b><p>Keuntungan terbesar Rp180.000 didapat dengan membuat 2 loyang barongko dan 6 wajan onde-onde. Barongko lebih untung per wadah, tetapi memakan waktu 2 jam. Membuat barongko saja (5, 0) hanya menghasilkan Rp150.000.</p></div>','Maksimum Rp180.000 dengan 2 loyang barongko dan 6 wajan onde-onde.',V2(VBZ,{mk:cornersMk([[0,0],[5,0],[0,8]]).concat([pt(2,6,'g','maks (2, 6)')])})],
 [slider('exGs',240000,10000,'rp'),'Coba garis selidik: geser slider sampai titik terakhir.',gsV(V2(VBZ,{}),30000,20000,[[0,0],[5,0],[2,6],[0,8]],false,'rp'),{k:0,at:{el:'#exGs'}}]]),
scr('fE2','E · Keuntungan perajin songkok recca (maksimum)','Fungsi Tujuan, Bagian E (halaman 6)',[
 ['<p class="muted">Konteks: kerajinan di Kabupaten Bone</p><div class="exbox"><p>Kendala produksi: waktu 2x + y ≤ 12, bahan x + 2y ≤ 12, x ≥ 0, y ≥ 0 (x = songkok recca, y = tas anyaman). Keuntungan songkok Rp50.000 dan tas Rp40.000 per buah. Tentukan keuntungan maksimum per minggu.</p></div>','Kendalanya sama dengan Contoh E di Bagian 1.',pv(BE,{lines:LE,shade:SE,cap:VSK.cap})],
 ['<p><b class=\"lkh\">SUSUN</b> maksimumkan f(x, y) = 50.000x + 40.000y.</p>','Susun fungsi tujuannya.'],
 ['<p><b>CARI</b> titik potong. Kalikan (1) dengan 2, lalu kurangkan (2).</p>'+elim([['','4x + 2y = 24','(1)×2'],['−','x + 2y = 12','(2)'],['','3x = 12','']])+'<p>3x = 12 → x = 4. Substitusi ke (1) → 8 + y = 12 → y = 4. Titik sudut adalah (0, 0), (6, 0), (4, 4), (0, 6).</p>','Samakan koefisien y dulu. Titik potongnya (4, 4).',VSK],
 ['<p><b class=\"lkh\">HITUNG dan PILIH</b> lihat tabel.</p>'+fTbl(50000,40000,[[0,0],[6,0],[4,4],[0,6]],true,[4,4]),'Hitung keuntungan di setiap titik sudut.'],
 ['<p class="ans">Maksimum Rp360.000 di (4, 4)</p><div class="exbox fix"><b>Makna dalam konteks</b><p>Keuntungan terbesar Rp360.000 per minggu dengan membuat 4 songkok recca dan 4 tas anyaman. Pada titik ini waktu dan bahan tepat habis. Membuat songkok saja (6, 0) hanya menghasilkan Rp300.000, walaupun songkok lebih untung per buah.</p></div>','Maksimum Rp360.000 dengan 4 songkok dan 4 tas.',V2(VSK,{mk:cornersMk([[0,0],[6,0],[0,6]]).concat([pt(4,4,'g','maks (4, 4)')])})],
 [slider('exGs',420000,10000,'rp'),'Coba garis selidik: geser slider sampai titik terakhir.',gsV(V2(VSK,{}),50000,40000,[[0,0],[6,0],[4,4],[0,6]],false,'rp'),{k:0,at:{el:'#exGs'}}]]),
scr('fE3','E · Pendapatan kapal penyeberangan (maksimum)','Fungsi Tujuan, Bagian E (halaman 7)',[
 ['<p class="muted">Konteks: Pelabuhan Bajoe</p><div class="exbox"><p>Kendala muatan: luas x + 3y ≤ 30, banyak kendaraan x + y ≤ 20, x ≥ 0, y ≥ 0 (x = mobil, y = truk). Tarif penyeberangan mobil Rp500.000 dan truk Rp1.200.000. Tentukan pendapatan maksimum sekali berlayar.</p></div>','Kendalanya sama dengan Contoh F-1 di Bagian 1.',pv(BF1,{lines:LF1,shade:SE3,cap:VKP.cap})],
 ['<p><b class=\"lkh\">SUSUN</b> maksimumkan f(x, y) = 500.000x + 1.200.000y.</p>','Susun fungsi tujuannya.'],
 ['<p><b>CARI</b> titik potong, kurangkan (2) dari (1).</p>'+elim([['','x + 3y = 30','(1)'],['−','x + y = 20','(2)'],['','2y = 10','']])+'<p>y = 5. Substitusi ke (2) → x = 15. Titik sudut adalah (0, 0), (20, 0), (15, 5), (0, 10).</p>','Titik potongnya (15, 5).',VKP],
 ['<p><b class=\"lkh\">HITUNG dan PILIH</b> lihat tabel.</p>'+fTbl(500000,1200000,[[0,0],[20,0],[15,5],[0,10]],true,[15,5]),'Hitung pendapatan di setiap titik sudut.'],
 ['<p class="ans">Maksimum Rp13.500.000 di (15, 5)</p><div class="exbox fix"><b>Makna dalam konteks</b><p>Pendapatan terbesar Rp13.500.000 dengan memuat 15 mobil dan 5 truk. Hanya mengangkut truk (0, 10) memberi Rp12.000.000 karena lantai cepat penuh; hanya mobil (20, 0) memberi Rp10.000.000.</p></div>','Maksimum Rp13.500.000 dengan 15 mobil dan 5 truk.',V2(VKP,{mk:cornersMk([[0,0],[20,0],[0,10]]).concat([pt(15,5,'g','maks (15, 5)')])})],
 [slider('exGs',16000000,100000,'rp'),'Coba garis selidik: geser slider sampai titik terakhir.',gsV(V2(VKP,{}),500000,1200000,[[0,0],[20,0],[15,5],[0,10]],false,'rp'),{k:0,at:{el:'#exGs'}}]]),
scr('fE4','E · Biaya pupuk paling hemat (minimum)','Fungsi Tujuan, Bagian E (halaman 8)',[
 ['<p class="muted">Konteks: pertanian jagung di Kabupaten Bone</p><div class="exbox"><p>Pak Baso mencampur dua jenis pupuk. Satu karung pupuk A mengandung 2 unit nitrogen dan 1 unit fosfor; satu karung pupuk B mengandung 1 unit nitrogen dan 3 unit fosfor. Lahannya memerlukan paling sedikit 8 unit nitrogen dan 9 unit fosfor. Harga pupuk A Rp150.000 dan pupuk B Rp100.000 per karung. Tentukan biaya minimum.</p></div>','Kali ini kita mencari biaya paling hemat.',pv(BC2,{cap:VPK.cap})],
 ['<p><b class=\"lkh\">SUSUN</b> x = karung pupuk A, y = karung pupuk B.<br>Kendala → 2x + y ≥ 8 ... (1), x + 3y ≥ 9 ... (2), x ≥ 0, y ≥ 0.<br>Minimumkan f(x, y) = 150.000x + 100.000y.</p>','“Paling sedikit” → ≥; biaya → minimumkan.'],
 ['<p><b class=\"lkh\">GAMBAR</b> uji (0, 0) salah pada kedua kendala → arsir sisi yang tidak memuat (0, 0).</p>','Uji (0, 0) salah, jadi arsir sisi seberangnya.',pv(BC2,{lines:LE4,shade:SE4,mk:[pt(0,0,'r','(0, 0)')],cap:VPK.cap})],
 ['<p><b>CARI</b> titik potong. Kalikan (2) dengan 2, lalu kurangkan (1).</p>'+elim([['','2x + 6y = 18','(2)×2'],['−','2x + y = 8','(1)'],['','5y = 10','']])+'<p>y = 2, x = 3. Titik sudut adalah (0, 8), (3, 2), (9, 0).</p>','Titik potongnya (3, 2).',VPK],
 ['<p><b class=\"lkh\">HITUNG dan PILIH</b></p>'+fTbl(150000,100000,[[0,8],[3,2],[9,0]],true,[3,2]),'Hitung biaya di setiap titik sudut.'],
 ['<p class="ans">Minimum Rp650.000 di (3, 2)</p><div class="exbox fix"><b>Makna dalam konteks</b><p>Biaya paling hemat Rp650.000 dengan membeli 3 karung pupuk A dan 2 karung pupuk B. DP terbuka, jadi biaya maksimum tidak ada; mencari biaya terbesar juga tidak bermakna dalam masalah ini.</p></div>','Minimum Rp650.000 dengan 3 karung A dan 2 karung B.',V2(VPK,{mk:cornersMk([[0,8],[9,0]]).concat([pt(3,2,'g','min (3, 2)')])})],
 [slider('exGs',1500000,50000,'rp'),'Untuk minimum, cari titik pertama yang disentuh garis.',gsV(V2(VPK,{}),150000,100000,[[0,8],[3,2],[9,0]],true,'rp'),{k:0,at:{el:'#exGs'}}]]),
scr('fF','F · Kesalahan umum','Fungsi Tujuan, Bagian F (halaman 8)',[
 ['<p>Kenali kesalahan berikut, lalu hindari.</p>'+kes('Ada titik sudut yang terlewat','Hanya menghitung f di (5, 0) dan (0, 8) pada soal bazar','Cari juga titik potong dua garis, yaitu (2, 6) yang memberi Rp180.000'),'Kesalahan pertama, titik potong dua garis terlewat.',V2(VBZ,{mk:[pt(5,0,'r'),pt(0,8,'r'),pt(2,6,'g','(2, 6) terlewat')]})],
 [kes('Memakai titik potong di luar DP','Menghitung f di (6, 0) pada Bagian C, Contoh 1','Periksa ke semua kendala → 6 ≤ 4 salah, jadi (6, 0) bukan titik sudut'),'Kesalahan kedua, titik di luar DP ikut dihitung.',V2(VB21,{cross:[P2(6,0)]})],
 [kes('Tertukar maksimum dan minimum','Soal biaya pupuk dijawab dengan nilai terbesar Rp1.350.000','Biaya dicari yang terkecil, yaitu Rp650.000'),'Kesalahan ketiga, biaya harus dicari yang terkecil.',V2(VPK,{mk:[pt(9,0,'r','Rp1.350.000'),pt(3,2,'g','Rp650.000')]})],
 [kes('Mencari maksimum pada DP terbuka','Menyatakan maksimum 2x + 3y adalah 18 pada Bagian C, Contoh 2','Nilai maksimum tidak ada karena DP tidak terbatas'),'Kesalahan keempat, DP terbuka tidak punya maksimum.',pv(BC2,{lines:LC2,shade:SC2,mk:cornersMk(CC2)})],
 [kes('Fungsi tujuan diberi tanda','Menulis 30.000x + 20.000y ≤ 180.000 sebagai fungsi tujuan','Fungsi tujuan ditulis f(x, y) = 30.000x + 20.000y'),'Kesalahan kelima, fungsi tujuan tidak diberi tanda.',VBZ],
 [kes('Jawaban tanpa makna','“Maksimumnya 180.000”','“Keuntungan maksimum Rp180.000 dengan 2 loyang barongko dan 6 wajan onde-onde”')+ingat('Jika titik sudut berupa pecahan padahal variabelnya banyak benda, periksa juga titik-titik bilangan bulat di DP yang terdekat dengan titik sudut itu.'),'Kesalahan keenam, tulis jawaban beserta maknanya.',V2(VBZ,{mk:[pt(2,6,'g','(2, 6)')]})]]),
scr('fZ','Rangkuman langkah','Fungsi Tujuan, halaman 9',[
 [tblE(['Langkah','Yang dilakukan','Catatan'],[{c:['1. SUSUN','Tulis fungsi tujuan dan kendala','Maksimumkan untung/pendapatan; minimumkan biaya']},{c:['2. GAMBAR','Gambar DP dari semua kendala','Uji titik; DP = irisan semua arsiran']},
   {c:['3. CARI','Tentukan semua titik sudut DP','Eliminasi dan substitusi; buang titik di luar DP']},{c:['4. HITUNG','Hitung f di setiap titik sudut, atau geser garis selidik','Tabel memudahkan perbandingan']},{c:['5. PILIH','Ambil nilai terbesar atau terkecil, lalu tafsirkan','DP terbuka: biasanya maksimum tidak ada']}]),'Lima langkah menentukan nilai optimum.',VBZ],
 ['<p class="ans">Siap berlatih! Kerjakan soal di Latihan Mandiri, lalu ikuti Kuis.</p>','Siap berlatih? Ayo ke Latihan Mandiri!']],true)
];
function kes(a,b,c){return '<div class="exbox why"><b>Kesalahan</b><br>'+a+'<br><b>Contoh</b><br>'+b+'</div><div class="exbox fix"><b>Seharusnya</b><br>'+c+'</div>';}
PL.EX1=EX1;PL.EX2=EX2;PL.EX=EX1.concat(EX2);
PL.belajarAlat={pt:pt,V2:V2,BQ:BQ};

})(window.PL);
