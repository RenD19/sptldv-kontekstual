/* ==========================================================================
latihan.js · TAB LATIHAN MANDIRI
Wadah: <section id="tab-latihan">. Soal dibangkitkan acak oleh CORE,
dinilai langsung di halaman, tidak dikirim ke server.
Opsi khusus tab ini: petunjuk bertahap, "Di mana salahku?", percobaan tanpa batas,
tombol "Lihat jawaban" setelah dua kali salah (disertai pembahasan langkah itu).
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
/* ---------- Pembahasan saat "🔑 Lihat jawaban" dibuka ----------
Disusun di halaman ini dari data soal yang sudah ada. CORE tidak diubah,
jadi kode "cek" tetap sama dan Apps Script tidak perlu diterbitkan ulang. */
var ptS=U.ptS,nm=U.nm;
/* substitusi yang rapi, misalnya 2(1) − 3(4), bukan 2(1) + −3(4) */
function subT(a,b,x,y){
var s='',suku=function(k,v,awal){if(k===0)return;var m=Math.abs(k)===1?'':nm(Math.abs(k));s+=awal?(k<0?'−':'')+m+'('+nm(v)+')':(k<0?' − ':' + ')+m+'('+nm(v)+')';};
suku(a,x,true);suku(b,y,s==='');return s||'0';
}
function gabung(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' dan '+a[a.length-1];}
function teksJawab(it,a){
if(a===null||a===undefined)return '…';
if(it.t==='pg')return it.o[a]===undefined?'…':it.o[a];
if(it.t==='num')return (typeof a!=='number'||isNaN(a))?'…':(it.u==='rp'?U.rp(a):nm(a));
if(it.t==='eq')return U.eqS(U.Lq(a[0],a[1],a[2],'='));
return U.ineqS(U.Lq(a[0],a[1],a[2],a[3]));
}
function labelBersih(lab){return String(lab).replace(/\s*=\s*$/,'');}
function bagianForm(St,k,lw){
var ok=lw&&lw.r&&lw.r.items?lw.r.items:null,h='';
if(St.lay==='xy'){
h+='<div class="kb-gulir"><table class="tbl kb-xy"><tr><th>x</th><td>0</td><td class="kb-benar">'+nm(k[1])+'</td></tr>'
+'<tr><th>y</th><td class="kb-benar">'+nm(k[0])+'</td><td>0</td></tr>'
+'<tr><th>(x, y)</th><td>'+ptS({x:0,y:k[0]})+'</td><td>'+ptS({x:k[1],y:0})+'</td></tr></table></div>';
if(ok&&lw.a)h+='<p class="muted">Isianmu sebelumnya, y = <span class="'+(ok[0]?'':'kb-salah')+'">'+esc(teksJawab(St.it[0],lw.a[0]))+'</span> dan x = <span class="'+(ok[1]?'':'kb-salah')+'">'+esc(teksJawab(St.it[1],lw.a[1]))+'</span>.</p>';
return h;
}
h+='<div class="kb-gulir"><table class="tbl kb-tbl"><tr><th>Bagian</th>'+(ok?'<th>Jawabanmu</th>':'')+'<th>Jawaban benar</th></tr>';
St.it.forEach(function(it,i){
h+='<tr><td>'+esc(labelBersih(it.lab))+'</td>';
if(ok)h+='<td>'+(ok[i]?'✓ '+esc(teksJawab(it,lw.a[i])):'<span class="kb-salah">'+esc(teksJawab(it,lw.a[i]))+'</span>')+'</td>';
h+='<td class="kb-benar">'+esc(teksJawab(it,k[i]))+'</td></tr>';
});
h+='</table></div>';
/* pemeriksaan tambahan untuk persamaan dan pertidaksamaan */
var cek=[];
St.it.forEach(function(it,i){
if(it.t==='eq'&&it.pts&&it.pts.length){
var a=k[i][0],b=k[i][1],c=k[i][2];
it.pts.forEach(function(P){cek.push('Substitusikan '+ptS(P)+' ke '+esc(U.eqS(U.Lq(a,b,c,'=')))+' sehingga '+esc(subT(a,b,P.x,P.y))+' = '+nm(a*P.x+b*P.y)+'. Hasilnya sama dengan '+nm(c)+', jadi garis melalui titik itu.');});
}
});
if(St.it.some(function(it){return it.t==='eq'||it.t==='ineq';}))cek.push('Bentuk yang setara juga benar, misalnya kedua ruas dikalikan dengan bilangan yang sama.');
if(cek.length)h+='<ul class="kb-cek">'+cek.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
return h;
}
function bagianPt(St,k,lw){
var h='<p>Titik yang benar adalah <b class="kb-benar">'+ptS(k)+'</b>'+(St.cond.k==='in'?'. Ini salah satu contoh; titik kisi lain di dalam DP yang tidak terletak pada garis juga benar.':'.')+'</p>';
if(lw&&lw.a)h+='<p>Titik pilihanmu, <span class="kb-salah">'+ptS(lw.a)+'</span>, belum tepat.</p>';
if(St.cond.k==='in'){
h+='<p>Uji titik '+ptS(k)+' ke setiap pertidaksamaan.</p><ul class="kb-cek">'+St.cond.s.map(function(c){
var v=c.a*k.x+c.b*k.y;
return '<li>'+esc(U.ineqS(c))+' menjadi '+esc(subT(c.a,c.b,k.x,k.y))+' = '+nm(v)+', dan '+nm(v)+' '+esc(c.op)+' '+nm(c.c)+' bernilai benar.</li>';
}).join('')+'</ul>';
}else if(St.v&&St.v.gs&&St.v.mk){
var g=St.v.gs,f=function(P){return g.p*P.x+g.q*P.y;};
h+='<p>Nilai '+esc(U.lin(g.p,g.q))+' di setiap titik sudut.</p><ul class="kb-cek">'+St.v.mk.map(function(P){
var tepat=P.x===k.x&&P.y===k.y;
return '<li'+(tepat?' class="kb-benar"':'')+'>'+ptS(P)+' menghasilkan '+nm(f(P))+(tepat?' (terbesar, titik terakhir yang disentuh garis selidik)':'')+'</li>';
}).join('')+'</ul>';
}
return h;
}
function namaGaris(c){
if(c.a!==0&&c.b===0&&c.c===0)return 'sumbu y';
if(c.a===0&&c.b!==0&&c.c===0)return 'sumbu x';
return 'garis '+esc(U.eqS(c));
}
function bagianPts(Q,k,lw){
var lewat=function(P){return Q.sys.filter(function(c){return c.a*P.x+c.b*P.y===c.c;}).map(namaGaris);};
var h='<p>DP memiliki '+k.length+' titik sudut, yaitu <b class="kb-benar">'+k.map(ptS).join(', ')+'</b>.</p><ul class="kb-cek">'
+k.map(function(P){var g=lewat(P);return '<li>'+ptS(P)+(g.length>1?' adalah perpotongan '+gabung(g):'')+'.</li>';}).join('')+'</ul>';
if(lw&&lw.r){
var cat=[];
(lw.r.lebih||[]).forEach(function(P){
var bad=Q.sys.filter(function(c){return !CORE.holds(c.a*P.x+c.b*P.y,c.c,c.op==='<'?'≤':c.op==='>'?'≥':c.op);})[0];
cat.push('<span class="kb-salah">'+ptS(P)+'</span> bukan titik sudut karena '+(bad?'tidak memenuhi '+esc(U.ineqS(bad))+'.':'tidak berada di pojok DP.'));
});
if((lw.r.kurang||[]).length)cat.push('Titik sudut yang belum kamu pilih adalah '+lw.r.kurang.map(ptS).join(', ')+'.');
if(cat.length)h+='<p class="kb-judul">📍 Tentang pilihanmu</p><ul class="kb-cek">'+cat.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
}
return h;
}
function pembahasanKunci(Q,St,k,lw){
var h='<div class="kb"><p class="kb-judul">🔑 Jawaban yang benar</p>';
if(St.k==='form')h+=bagianForm(St,k,lw);
else if(St.k==='pt')h+=bagianPt(St,k,lw);
else h+=bagianPts(Q,k,lw);
if(St.h&&St.h.length)h+='<p class="kb-judul">🧭 Cara mendapatkannya</p><ol class="kb-cara">'+St.h.map(function(x){return '<li>'+namaRumus(x)+'</li>';}).join('')+'</ol>';
h+='<p class="kb-tutup">Bandingkan dengan jawabanmu. Kalau sudah paham, tekan tombol di bawah untuk melanjutkan.</p></div>';
return h;
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
var S=L.S,St=L.curS(),k=CORE.keyAns(S.Q,S.s),lw=S.lw;
L.isiKunci();S.solved=true;L.panelLangkah();L.kunciSemua();
var hh=L.el.panel.querySelector('.hints');if(hh)hh.hidden=true; /* petunjuk sudah dimuat di pembahasan */
L.fb('info kunci',pembahasanKunci(S.Q,St,k,lw));
L.tombol('<button class="btn primary" data-aksi="lanjut">'+(S.s<2?'Langkah berikutnya ➜':'Lihat pembahasan ➜')+'</button>');L.renderBidang();
if(St.k==='pt')PL.Plus.go({pt:[k.x,k.y]},'Ini titik yang benar. Baca pembahasannya, ya!',6000);
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
L=PL.Langkah(sec,{petunjuk:true,diManaSalah:true,pratinjau:true,ubahPetunjuk:namaRumus,periksa:periksa,aksi:aksi,
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
