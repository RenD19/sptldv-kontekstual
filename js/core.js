/* core.js · CORE BERSAMA — harus PERSIS sama dengan blok CORE di server/Code.gs. Jangan disunting sebagian. */
/* ============================================================
   CORE BERSAMA (dipakai persis sama oleh halaman siswa dan server)
   Jangan diubah sebagian: pembangkit soal dan penilai harus
   identik di kedua sisi. Server menolak halaman yang "cek"-nya
   berbeda.
   ============================================================ */
var CORE=(function(){
'use strict';
var VERSI='2026-11-01.2';
var OPS=['<','≤','>','≥'];
var MAKS_COBA=2;          /* percobaan per langkah di Kuis: benar ke-1 = 2 poin, ke-2 = 1 poin, salah dua kali = 0 */
var NSOAL=8,NLANGKAH=3;
var TIPE={1:'Menggambar DP',2:'Sistem dari DP',3:'Kasus kontekstual',4:'Nilai maksimum/minimum'};
var LEVEL={L:'LOTS',M:'MOTS',H:'HOTS'};
var isSolid=function(op){return op==='≤'||op==='≥';};
var holds=function(v,c,op){return op==='<'?v<c:op==='≤'?v<=c:op==='>'?v>c:op==='≥'?v>=c:v===c;};
var weak=function(op){return op==='<'?'≤':op==='>'?'≥':op;};
var sideOf=function(op){return (op==='<'||op==='≤')?-1:1;};
var flipOp=function(op){return op==='<'?'>':op==='>'?'<':op==='≤'?'≥':op==='≥'?'≤':op;};
var gcd=function(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=a%b;a=b;b=t;}return a;};
var isNum=function(v){return typeof v==='number'&&isFinite(v);};
var isInt=function(v){return isNum(v)&&Math.floor(v)===v;};

/* ---------- bilangan acak berbenih ---------- */
function mulberry32(seed){
  var a=seed>>>0;
  return function(){
    a=(a+0x6D2B79F5)>>>0;
    var t=a;
    t=Math.imul(t^(t>>>15),t|1);
    t^=t+Math.imul(t^(t>>>7),t|61);
    return((t^(t>>>14))>>>0)/4294967296;
  };
}
function ri(rng,a,b){return Math.floor(rng()*(b-a+1))+a;}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function shuffle(arr,rng){
  for(var i=arr.length-1;i>0;i--){var j=Math.floor(rng()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t;}
  return arr;
}

/* ---------- penulisan bilangan dan bentuk aljabar ---------- */
function ribu(s){return s.replace(/\B(?=(\d{3})+(?!\d))/g,'.');}
function nm(v){return (v<0?'−':'')+ribu(String(Math.abs(v)));}
function rp(v){return (v<0?'−':'')+'Rp'+ribu(String(Math.abs(v)));}
function term(k,v,first){var m=Math.abs(k)===1?'':nm(Math.abs(k));if(first)return (k<0?'−':'')+m+v;return (k<0?' − ':' + ')+m+v;}
function lin(a,b){var s='';if(a!==0)s+=term(a,'x',true);if(b!==0)s+=term(b,'y',s==='');return s||'0';}
function ineqS(q){return lin(q.a,q.b)+' '+q.op+' '+nm(q.c);}
function eqS(q){return lin(q.a,q.b)+' = '+nm(q.c);}
function ptS(p){return '('+nm(p.x)+', '+nm(p.y)+')';}
function fS(p,q){return 'f(x, y) = '+lin(p,q);}
function subS(a,b,x,y){var s=[];if(a!==0)s.push((a===1?'':nm(a))+'('+nm(x)+')');if(b!==0)s.push((b===1?'':nm(b))+'('+nm(y)+')');return s.join(' + ');}
function L(a,b,c,op){return {a:a,b:b,c:c,op:op};}
function norm(q){var g=gcd(gcd(q.a,q.b),q.c)||1,a=q.a/g,b=q.b/g,c=q.c/g,op=q.op;if(a<0||(a===0&&b<0)){a=-a;b=-b;c=-c;op=flipOp(op);}return L(a,b,c,op);}
var AX=[L(1,0,0,'≥'),L(0,1,0,'≥')];

/* ---------- geometri ---------- */
function boxPoly(B){return [[B.x0,B.y0],[B.x1,B.y0],[B.x1,B.y1],[B.x0,B.y1]];}
function clipHalf(poly,q,side){
  var f=function(p){return side*(q.a*p[0]+q.b*p[1]-q.c);},out=[];
  for(var i=0;i<poly.length;i++){
    var P=poly[i],Q=poly[(i+1)%poly.length],fp=f(P),fq=f(Q);
    if(fp>=0)out.push(P);
    if((fp>0&&fq<0)||(fp<0&&fq>0)){var t=fp/(fp-fq);out.push([P[0]+t*(Q[0]-P[0]),P[1]+t*(Q[1]-P[1])]);}
  }
  return out;
}
function region(sys,B,skip){var poly=boxPoly(B);sys.forEach(function(q,i){if(i!==skip&&q.op!=='='&&poly.length)poly=clipHalf(poly,q,sideOf(q.op));});return poly;}
function area(poly){var a=0;for(var i=0;i<poly.length;i++){var P=poly[i],Q=poly[(i+1)%poly.length];a+=P[0]*Q[1]-Q[0]*P[1];}return Math.abs(a)/2;}
function inter(p,q){
  var d=p.a*q.b-q.a*p.b;if(d===0)return null;
  var nx=p.c*q.b-q.c*p.b,ny=p.a*q.c-q.a*p.c;
  return {x:nx/d+0,y:ny/d+0,bulat:(nx%d===0&&ny%d===0)};
}
function holdsAll(s,x,y){return s.every(function(q){return holds(q.a*x+q.b*y,q.c,q.op);});}
function holdsWeak(s,x,y){return s.every(function(q){return holds(q.a*x+q.b*y,q.c,weak(q.op));});}
function onAnyLine(s,x,y){return s.some(function(q){return q.a*x+q.b*y===q.c;});}
function samePt(p,q){return p.x===q.x&&p.y===q.y;}
function uniq(arr){var o=[];arr.forEach(function(p){if(!o.some(function(r){return samePt(r,p);}))o.push(p);});return o;}
function sortPts(arr){return arr.sort(function(p,q){return p.x-q.x||p.y-q.y;});}
/* titik sudut DP: titik potong dua garis batas yang memenuhi semua kendala */
function corners(s){
  var out=[];
  for(var i=0;i<s.length;i++)for(var j=i+1;j<s.length;j++){
    var p=inter(s[i],s[j]);
    if(p&&holdsWeak(s,p.x,p.y))out.push({x:p.x,y:p.y});
  }
  return sortPts(uniq(out));
}
/* calon titik sudut di kuadran I (untuk dipilih siswa): semua titik potong bulat di dalam kotak */
function candidates(s,B){
  var out=[];
  for(var i=0;i<s.length;i++)for(var j=i+1;j<s.length;j++){
    var p=inter(s[i],s[j]);
    if(p&&p.bulat&&p.x>=0&&p.y>=0&&p.x<=B.x1&&p.y<=B.y1)out.push({x:p.x,y:p.y});
  }
  return sortPts(uniq(out));
}
function findInside(s,B){
  var best=null;
  for(var x=Math.ceil(B.x0)+1;x<=B.x1-1;x++)for(var y=Math.ceil(B.y0)+1;y<=B.y1-1;y++){
    var d=1e9;
    s.forEach(function(q){var v=sideOf(q.op)*(q.a*x+q.b*y-q.c)/Math.sqrt(q.a*q.a+q.b*q.b);if(q.op!=='='&&v<d)d=v;});
    if(d>0&&(!best||d>best.d))best={x:x,y:y,d:d};
  }
  return best;
}
var FULL={x0:-10,y0:-10,x1:10,y1:10,g:1,lb:2};
function boxQ1(m,g,lx,ly){var k=Math.ceil(m/g)+1;var lb=g*(k>10?2:1);return {x0:-g,y0:-g,x1:k*g,y1:k*g,g:g,lb:lb,lx:lx||'x',ly:ly||'y'};}

/* ---------- penilaian satu langkah ---------- */
function propEq(k,a,b,c){
  if(!isInt(a)||!isInt(b)||!isInt(c)||(a===0&&b===0))return false;
  return k.a*b-a*k.b===0&&k.a*c-a*k.c===0&&k.b*c-b*k.c===0;
}
function judgeItem(it,a){
  if(it.t==='pg')return a===it.key;
  if(it.t==='num')return isNum(a)&&Math.abs(a-it.key)<1e-9;
  if(it.t==='eq')return Array.isArray(a)&&a.length===3&&propEq(it.key,a[0],a[1],a[2]);
  if(it.t==='ineq'){
    if(!Array.isArray(a)||a.length!==4||!propEq(it.key,a[0],a[1],a[2]))return false;
    var lam=a[0]*it.key.a+a[1]*it.key.b;
    return a[3]===(lam>0?it.key.op:flipOp(it.key.op));
  }
  return false;
}
function validItem(it,a){
  if(it.t==='pg')return isInt(a)&&a>=0&&a<it.o.length;
  if(it.t==='num')return isNum(a)&&Math.abs(a)<1e12;
  if(it.t==='eq')return Array.isArray(a)&&a.length===3&&a.every(function(v){return isInt(v)&&Math.abs(v)<1e9;});
  if(it.t==='ineq')return Array.isArray(a)&&a.length===4&&[0,1,2].every(function(i){return isInt(a[i])&&Math.abs(a[i])<1e9;})&&OPS.indexOf(a[3])>=0;
  return false;
}
function inBox(p,B){return !!p&&typeof p==='object'&&isInt(p.x)&&isInt(p.y)&&p.x>=B.x0&&p.x<=B.x1&&p.y>=B.y0&&p.y<=B.y1;}
/* jawaban mentah sah? (jika tidak, peristiwa diabaikan dan tidak dihitung sebagai percobaan) */
function valid(Q,s,a){
  var S=Q.st[s];
  if(S.k==='form')return Array.isArray(a)&&a.length===S.it.length&&S.it.every(function(it,i){return validItem(it,a[i]);});
  if(S.k==='pt')return inBox(a,Q.pl);
  if(S.k==='pts'){
    if(!Array.isArray(a)||a.length<1||a.length>16)return false;
    if(!a.every(function(p){return inBox(p,Q.pl);}))return false;
    return uniq(a.slice()).length===a.length;
  }
  return false;
}
function judgePt(c,p){
  if(c.k==='in')return holdsAll(c.s,p.x,p.y)&&!onAnyLine(c.s,p.x,p.y);
  if(c.k==='at')return c.p.some(function(q){return samePt(q,p);});
  return false;
}
/* hasil: {ok, items:[bool]} untuk form; {ok, kurang, lebih} untuk pts */
function judge(Q,s,a){
  var S=Q.st[s];
  if(S.k==='form'){var r=S.it.map(function(it,i){return judgeItem(it,a[i]);});return {ok:r.every(Boolean),items:r};}
  if(S.k==='pt')return {ok:judgePt(S.cond,a)};
  var kurang=S.key.filter(function(p){return !a.some(function(q){return samePt(p,q);});});
  var lebih=a.filter(function(p){return !S.key.some(function(q){return samePt(p,q);});});
  return {ok:!kurang.length&&!lebih.length,kurang:kurang,lebih:lebih};
}
/* jawaban kunci untuk satu langkah (dipakai saat kunci dibuka dan oleh cek()) */
function keyAns(Q,s){
  var S=Q.st[s];
  if(S.k==='form')return S.it.map(function(it){
    if(it.t==='eq')return [it.key.a,it.key.b,it.key.c];
    if(it.t==='ineq')return [it.key.a,it.key.b,it.key.c,it.key.op];
    return it.key;
  });
  if(S.k==='pt')return S.cond.k==='at'?{x:S.cond.p[0].x,y:S.cond.p[0].y}:{x:S.cond.ok.x,y:S.cond.ok.y};
  return S.key.map(function(p){return {x:p.x,y:p.y};});
}

/* ---------- pembentuk soal ---------- */
function F(nm,q,it,h,v,lay){return {nm:nm,k:'form',q:q,it:it,h:h||[],v:v||{},lay:lay||''};}
function P(nm,q,cond,h,v){return {nm:nm,k:'pt',q:q,cond:cond,h:h||[],v:v||{}};}
function PS(nm,q,key,h,v){return {nm:nm,k:'pts',q:q,key:key,h:h||[],v:v||{}};}
function pg(lab,o,key){return {t:'pg',lab:lab,o:o,key:key};}
function num(lab,key,u){return {t:'num',lab:lab,key:key,u:u||''};}
function eqI(lab,k,pts){return {t:'eq',lab:lab,key:{a:k.a,b:k.b,c:k.c},pts:pts||[]};}
function inI(lab,k){return {t:'ineq',lab:lab,key:{a:k.a,b:k.b,c:k.c,op:k.op}};}
function pgS(rng,lab,key,dis){var o=shuffle([key].concat(dis),rng);return pg(lab,o,o.indexOf(key));}
var YT=['Ya','Tidak'],BS=['Benar','Salah'],PP=['Penuh','Putus-putus'];
function mkQ(t,l,v,o){
  var Q={t:t,l:l,v:v,jd:'Tipe '+t+' · '+TIPE[t],lv:LEVEL[l],kko:o.kko,soal:o.soal,pl:o.pl,sys:o.sys||[],st:o.st||[],vz:o.vz||{},bahas:o.bahas||[]};
  if(o.ls)Q.ls=true;
  return Q;
}
function M(x,y,c,l){return {x:x,y:y,c:c||'k',l:l===undefined?ptS({x:x,y:y}):l};}
function inPt(s,B){var f=findInside(s,B);return f?{x:f.x,y:f.y}:{x:0,y:0};}

/* ================= TIPE 1 · MENGGAMBAR DP ================= */
function g1L(rng){
  var p=ri(rng,2,8),q=ri(rng,2,8);if(q===p)q=p===8?3:p+1;
  var op=pick(rng,OPS),k=norm(L(q,p,p*q,op)),X=k.c/k.a,Y=k.c/k.b;
  var T={x:ri(rng,0,X+1),y:ri(rng,0,Y+1)},v=k.a*T.x+k.b*T.y,ya=holds(v,k.c,k.op);
  return mkQ(1,'L','a',{kko:'menyebutkan, menentukan, memeriksa',pl:FULL,sys:[k],
    soal:'Perhatikan pertidaksamaan <b>'+ineqS(k)+'</b>.',
    st:[F('Jenis garis','Bagaimana garis batas pertidaksamaan ini digambar?',[pg('Garis batas '+eqS(k)+' digambar',PP,isSolid(op)?0:1)],
          ['Lihat tandanya: apakah ada garis di bawah tanda (≤ atau ≥)?','Tanda ≤ atau ≥ → garis penuh; tanda &lt; atau &gt; → garis putus-putus.']),
        F('Titik potong sumbu','Lengkapi tabel x | y untuk garis '+eqS(k)+'. Kedua titik itu adalah titik potong garis dengan sumbu.',[num('y saat x = 0',Y),num('x saat y = 0',X)],
          ['Kolom pertama x = 0. Substitusikan x = 0 ke '+eqS(k)+', lalu hitung y.','Kolom kedua y = 0. Substitusikan y = 0 sehingga '+term(k.a,'x',true)+' = '+nm(k.c)+', lalu bagi kedua ruas dengan '+nm(k.a)+'.'],{},'xy'),
        F('Memeriksa titik','Apakah titik '+ptS(T)+' termasuk penyelesaian?',[num('Nilai '+lin(k.a,k.b)+' di '+ptS(T)+' =',v),pg('Titik '+ptS(T)+' termasuk penyelesaian?',YT,ya?0:1)],
          ['Substitusikan x = '+nm(T.x)+' dan y = '+nm(T.y)+' ke ruas kiri.','Bandingkan hasilnya dengan '+nm(k.c)+' memakai tanda '+op+'.'],{ln:2,mk:[M(T.x,T.y,'b')]})],
    vz:{ln:2,sh:1,mk:[M(T.x,T.y,'b'),M(X,0),M(0,Y)]},
    bahas:['Tanda '+op+' → garis '+(isSolid(op)?'penuh':'putus-putus')+'.','Tabel x | y menghasilkan titik potong '+ptS({x:0,y:Y})+' dan '+ptS({x:X,y:0})+'.',
      'Uji '+ptS(T)+' → '+subS(k.a,k.b,T.x,T.y)+' = '+nm(v)+'; '+nm(v)+' '+op+' '+nm(k.c)+' '+(ya?'benar, jadi titik itu termasuk penyelesaian.':'salah, jadi titik itu tidak termasuk penyelesaian.')]});
}
function randLine(rng,pos){
  var op=pos?(rng()<.8?'≤':'<'):pick(rng,OPS),r=rng();
  if(!pos&&r<.15){var k=ri(rng,-6,6)||3;return rng()<.5?L(1,0,k,op):L(0,1,k,op);}
  if(!pos&&r<.27){var m=ri(rng,1,3),q2=ri(rng,1,3),g=gcd(m,q2);return norm(L(m/g,(rng()<.5?1:-1)*q2/g,0,op));}
  var p=ri(rng,2,8)*(!pos&&rng()<.3?-1:1),q=ri(rng,2,8)*(!pos&&rng()<.3?-1:1);
  return norm(L(q,p,p*q,op));
}
function validSys(s,B){
  var i,j;
  for(i=0;i<s.length;i++)for(j=i+1;j<s.length;j++)if(s[i].a*s[j].b-s[j].a*s[i].b===0)return false;
  var A=area(region(s,B));
  if(A<12||A>230)return false;
  for(i=0;i<s.length;i++)if(area(region(s,B,i))-A<1.5)return false;
  var f=findInside(s,B);return !!f&&f.d>=0.9;
}
function g1M(rng){
  var s=null,t;
  for(t=0;t<600&&!s;t++){
    var c=rng()<.35?[randLine(rng,true),randLine(rng,true)].concat(AX):[randLine(rng,false),randLine(rng,false)];
    if(validSys(c,FULL))s=c;
  }
  if(!s)s=[L(1,1,5,'≤'),L(2,-1,1,'>')];
  var T=[[0,0],[1,0],[0,1],[1,1],[-1,0],[0,-1],[2,1]].map(function(p){return {x:p[0],y:p[1]};}).filter(function(p){return !onAnyLine(s,p.x,p.y);})[0];
  var lab=function(q,i){return '('+(i+1)+') '+ineqS(q);};
  return mkQ(1,'M','a',{kko:'menggambar, menerapkan, mengarsir',pl:FULL,sys:s,
    soal:'Gambarlah DP sistem <b>'+s.map(ineqS).join(' ; ')+'</b>.',
    st:[F('Jenis garis','GAMBAR: tentukan jenis setiap garis batas.',s.map(function(q,i){return pg(lab(q,i),PP,isSolid(q.op)?0:1);}),
          ['Garis sudah digambar tipis. Tugasmu menentukan jenisnya dari tanda.','≤ atau ≥ → penuh; &lt; atau &gt; → putus-putus.'],{ln:1}),
        F('Uji titik','UJI: substitusikan titik uji '+ptS(T)+' ke setiap pertidaksamaan.',s.map(function(q,i){return pg(lab(q,i)+' di '+ptS(T),BS,holds(q.a*T.x+q.b*T.y,q.c,q.op)?0:1);}),
          ['Titik uji '+ptS(T)+' tidak terletak pada garis mana pun, jadi boleh dipakai.','Hitung ruas kiri, lalu bandingkan dengan ruas kanan.'],{ln:2,mk:[M(T.x,T.y,'g','T')]}),
        P('Titik di DP','ARSIR: panah menunjukkan sisi arsiran setiap garis. Klik satu titik kisi di dalam DP (irisan semua arsiran), bukan pada garis.',{k:'in',s:s,ok:inPt(s,FULL)},
          ['Benar → arsir sisi yang memuat titik uji; salah → sisi seberangnya.','DP adalah daerah yang ditunjuk oleh semua panah sekaligus.'],{ln:2,ar:1,mk:[M(T.x,T.y,'g','T')]})],
    vz:{ln:2,sh:1,mk:[M(T.x,T.y,'g','T')]},
    bahas:s.map(function(q,i){var v=q.a*T.x+q.b*T.y,h=holds(v,q.c,q.op);return lab(q,i)+' → garis '+(isSolid(q.op)?'penuh':'putus-putus')+'; uji '+ptS(T)+' → '+nm(v)+' '+q.op+' '+nm(q.c)+' '+(h?'benar, arsir sisi yang memuat T.':'salah, arsir sisi yang tidak memuat T.');}).concat(['DP = irisan semua arsiran.'])});
}
function g1H(rng,v){
  var q,st,soal,vz,bahas;
  if(v==='a'){
    var k=pick(rng,[1,2,3,-1,-2]),o=pick(rng,OPS),h0=holds(0,0,o);
    q=norm(L(k,-1,0,flipOp(o)));
    var kx=(k===1?'':k===-1?'−':nm(k))+'x',disp='y '+o+' '+kx,h1=holds(0,k,o);
    soal='Rudi menggambar DP dari <b>'+disp+'</b>. Ia menguji titik (0, 0) dan mendapat 0 '+o+' 0 yang bernilai '+(h0?'benar':'salah')+', lalu mengarsir sisi yang '+(h0?'memuat':'tidak memuat')+' (0, 0).';
    st=[F('Analisis kesalahan','Di mana letak kesalahan Rudi?',[pgS(rng,'Kesalahan Rudi','Titik (0, 0) terletak pada garis batas, jadi tidak dapat dipakai sebagai titik uji.',
          ['Garis batasnya seharusnya digambar '+(isSolid(o)?'putus-putus':'penuh')+'.','Pernyataan 0 '+o+' 0 seharusnya bernilai '+(h0?'salah':'benar')+'.','Tidak ada kesalahan; arsirannya sudah benar.'])],
          ['Substitusikan (0, 0) ke persamaan garis y = '+kx+'. Apa hasilnya?','Titik uji tidak boleh terletak pada garis batas.'],{ln:2,mk:[M(0,0,'r')]}),
        F('Uji titik lain','Uji titik (1, 0) yang tidak terletak pada garis.',[num('Nilai ruas kanan '+kx+' di (1, 0) =',k),pg('Pernyataan 0 '+o+' '+nm(k)+' bernilai',BS,h1?0:1)],
          ['Ruas kiri y bernilai 0; ruas kanan '+kx+' dengan x = 1.','Bandingkan 0 dengan '+nm(k)+' memakai tanda '+o+'.'],{ln:2,mk:[M(1,0,'g')]}),
        P('Mengarsir','Klik satu titik kisi di sisi yang benar (bukan pada garis).',{k:'in',s:[q],ok:inPt([q],FULL)},
          ['Pernyataan benar → sisi yang memuat (1, 0); salah → sisi seberangnya.'],{ln:2,mk:[M(1,0,'g')]})];
    vz={ln:2,sh:1,mk:[M(1,0,'g')]};
    bahas=['(0, 0) terletak pada garis y = '+kx+', sehingga uji (0, 0) tidak bisa menentukan sisi.','Uji (1, 0) → 0 '+o+' '+nm(k)+' '+(h1?'benar → arsir sisi yang memuat (1, 0).':'salah → arsir sisi yang tidak memuat (1, 0).')];
  }else if(v==='b'){
    var a=ri(rng,1,3),b=ri(rng,1,3);if(gcd(a,b)>1)b=1;
    var lo=ri(rng,1,4),hi=lo+ri(rng,2,4),ada=rng()<.5,c1=ada?hi:lo,c2=ada?lo:hi;
    var s1=L(a,b,c1,'≤'),s2=L(a,b,c2,'≥');q=s1;
    var ls=lin(a,b);
    soal='Tanpa menggambar, selidiki apakah sistem <b>'+ineqS(s1)+'</b> dan <b>'+ineqS(s2)+'</b> memiliki DP.';
    var r1='Ruas kiri kedua pertidaksamaan sama (garisnya sejajar) dan tidak ada nilai '+ls+' yang sekaligus ≤ '+c1+' dan ≥ '+c2+'.';
    var r2='Garisnya sejajar dan DP berupa jalur di antara kedua garis, yaitu '+c2+' ≤ '+ls+' ≤ '+c1+'.';
    var s3=ada?P('Titik di DP','Klik satu titik kisi di dalam DP, bukan pada garis.',{k:'in',s:[s1,s2],ok:inPt([s1,s2],FULL)},['DP berada di antara kedua garis sejajar.'],{ln:2,ar:1})
      :F('Syarat DP','Agar sistem memiliki DP, ruas kanan '+ls+' ≤ … paling kecil bernilai berapa?',[num('Ruas kanan paling kecil =',c2)],['Nilai '+ls+' harus bisa sekaligus ≤ ruas kanan dan ≥ '+c2+'.'],{ln:2,ar:1});
    st=[F('Menyelidiki DP','Apakah sistem ini memiliki DP?',[pg('Sistem memiliki DP?',['Ada','Tidak ada'],ada?0:1)],['Bandingkan ruas kiri kedua pertidaksamaan.','Ruas kiri sama → garis sejajar.']),
        F('Alasan','Pilih alasan yang tepat.',[pgS(rng,'Alasannya',ada?r2:r1,[ada?r1:r2,'Kedua garis pasti berpotongan, jadi DP selalu ada.','Kedua garis penuh, jadi DP pasti hanya berupa sebuah garis.'])],['Ruas kiri sama berarti kedua garis sejajar.']),s3];
    vz={ln:2,sh:ada?1:0,ar:ada?0:1};
    bahas=['Ruas kiri kedua pertidaksamaan sama, yaitu '+ls+', jadi garisnya sejajar.',ada?'Nilai '+ls+' antara '+c2+' dan '+c1+' memenuhi keduanya, jadi DP ada (jalur di antara garis).':'Tidak ada nilai '+ls+' yang ≤ '+c1+' sekaligus ≥ '+c2+', jadi DP tidak ada. DP baru ada jika ruas kanan pertama paling kecil '+c2+'.'];
    return mkQ(1,'H','b',{kko:'menyelidiki, menganalisis',pl:FULL,sys:[s1,s2],soal:soal,st:st,vz:vz,bahas:bahas});
  }else{
    var aa=ri(rng,1,3),m=ri(rng,1,4),n=ri(rng,1,4),kk=ri(rng,-2,4),op=pick(rng,OPS),c=aa*m+n*kk,ax=(aa===1?'':aa)+'x',sb=function(u){return aa===1?String(u):aa+'('+u+')';};
    var key=sb(m)+' + '+n+'k '+op+' '+nm(c);
    var dis=[sb(n)+' + '+m+'k '+op+' '+nm(c),sb(m)+' + '+n+'k '+flipOp(op)+' '+nm(c),sb(m)+' + k '+op+' '+nm(c),sb(n)+' + '+m+'k '+flipOp(op)+' '+nm(c)];
    dis=dis.filter(function(d,i){return d!==key&&dis.indexOf(d)===i;}).slice(0,3);
    q=L(aa,kk,c,op);
    soal='Tentukan nilai k agar titik ('+m+', '+n+') berada di DP <b>'+ax+' + ky '+op+' '+nm(c)+'</b>.';
    st=[F('Substitusi','Substitusikan titik ('+m+', '+n+').',[pgS(rng,'Hasil substitusi',key,dis)],['x diganti '+m+' dan y diganti '+n+'.']),
        F('Batas nilai k','Selesaikan pertidaksamaan dalam k.',[num('Batas nilai k =',kk)],['Pindahkan '+(aa*m)+' ke ruas kanan, lalu bagi dengan '+n+'.']),
        F('Parameter','Lengkapi syarat nilai k.',[pg('Jadi, k … '+nm(kk),OPS.slice(),OPS.indexOf(op))],['Membagi dengan bilangan positif '+n+' tidak mengubah tanda.'])];
    soal+='';
    vz={ln:2,sh:1,mk:[M(m,n,'b')]};
    bahas=['Substitusi menghasilkan '+key+' → '+n+'k '+op+' '+nm(c-aa*m)+' → k '+op+' '+nm(kk)+'.','Untuk k = '+nm(kk)+', titik ('+m+', '+n+') tepat berada pada garis batas.'];
    return mkQ(1,'H','c',{kko:'menentukan syarat',pl:FULL,sys:[q],soal:soal,st:st.map(function(S){S.v={mk:[M(m,n,'b')]};return S;}),vz:vz,bahas:bahas});
  }
  return mkQ(1,'H',v,{kko:'menganalisis',pl:FULL,sys:[q],soal:soal,st:st,vz:vz,bahas:bahas});
}

/* ================= TIPE 2 · SISTEM DARI DP ================= */
function g2L(rng){
  var k=ri(rng,1,8)*(rng()<.4?-1:1),op=pick(rng,OPS),tegak=rng()<.5,q=tegak?L(1,0,k,op):L(0,1,k,op),vr=tegak?'x':'y';
  var vv={ln:2,sh:1};
  return mkQ(2,'L','a',{kko:'menuliskan, mengenali',pl:FULL,sys:[q],
    soal:'DP (hijau) dibatasi satu garis '+(tegak?'tegak':'mendatar')+'. Tuliskan pertidaksamaannya.',
    st:[F('Bentuk garis','Garis batas pada gambar berbentuk',[pg('Persamaan garisnya',['x = … (garis tegak)','y = … (garis mendatar)'],tegak?0:1)],['Garis tegak sejajar sumbu-y; garis mendatar sejajar sumbu-x.'],vv),
        F('Konstanta','Garis itu memotong sumbu '+(tegak?'x':'y')+' di titik berapa?',[num(vr+' = □, □ =',k)],['Baca titik potong garis dengan sumbu-'+(tegak?'x':'y')+'.'],vv),
        F('Tanda','Pilih tanda dari jenis garis dan letak DP.',[pg(vr+' … '+nm(k),OPS.slice(),OPS.indexOf(op))],['Jenis garis: penuh (≤, ≥) atau putus-putus (&lt;, &gt;).',(tegak?'DP di kanan garis → '+vr+' lebih besar; di kiri → lebih kecil.':'DP di atas garis → '+vr+' lebih besar; di bawah → lebih kecil.')],vv)],
    vz:vv,bahas:['Garis '+(tegak?'tegak':'mendatar')+' '+vr+' = '+nm(k)+', '+(isSolid(op)?'penuh':'putus-putus')+'.','DP di '+(tegak?(sideOf(op)>0?'kanan':'kiri'):(sideOf(op)>0?'atas':'bawah'))+' garis → '+ineqS(q)+'.']});
}
function quad(rng){
  for(var t=0;t<500;t++){
    var A=ri(rng,4,10),B=ri(rng,4,10),P=ri(rng,1,A-1),Qy=ri(rng,1,B-1);
    if(P*B+Qy*A<=A*B)continue;
    var l1=norm(L(Qy,A-P,Qy*A,'≤')),l2=norm(L(B-Qy,P,P*B,'≤'));
    var y1=l1.c/l1.b,x2=l2.c/l2.a;
    if(!isInt(y1)||!isInt(x2)||y1>13||x2>13)continue;
    return {A:A,B:B,P:P,Q:Qy,l1:l1,l2:l2,m:Math.max(y1,x2,A,B)};
  }
  return {A:6,B:6,P:4,Q:4,l1:L(2,1,12,'≤'),l2:L(1,2,12,'≤'),m:12};
}
function g2M(rng,v){
  if(v==='a'){
    var p=ri(rng,2,8)*(rng()<.3?-1:1),q=ri(rng,2,8)*(rng()<.3?-1:1),op=pick(rng,OPS),k=norm(L(q,p,p*q,op));
    var vv={ln:2,sh:1,mk:[M(p,0),M(0,q)]};
    return mkQ(2,'M','a',{kko:'menyusun, menentukan, menerapkan',pl:FULL,sys:[k],
      soal:'Garis batas DP (hijau) melalui ('+nm(p)+', 0) dan (0, '+nm(q)+'). Tentukan pertidaksamaannya.',
      st:[F('Persamaan garis','BUAT persamaan garis melalui kedua titik dalam bentuk ax + by = c.',[eqI('Persamaan garis',k,[{x:p,y:0},{x:0,y:q}])],
            ['Rumus dua titik adalah (y − y₁)/(y₂ − y₁) = (x − x₁)/(x₂ − x₁).','Dengan titik ('+nm(p)+', 0) dan (0, '+nm(q)+') → '+nm(q)+'x + '+nm(p)+'y = '+nm(p*q)+', lalu sederhanakan.'],vv),
          P('Titik uji','UJI: klik satu titik kisi di dalam DP, bukan pada garis.',{k:'in',s:[k],ok:inPt([k],FULL)},['Pilih titik di daerah hijau yang mudah dihitung.'],vv),
          F('Tanda','TULIS tanda dari jenis garis dan hasil uji.',[pg(lin(k.a,k.b)+' … '+nm(k.c),OPS.slice(),OPS.indexOf(k.op))],['Garis '+(isSolid(op)?'penuh → ≤ atau ≥':'putus-putus → &lt; atau &gt;')+'.','Substitusikan titik di DP, lalu bandingkan dengan '+nm(k.c)+'.'],vv)],
      vz:vv,bahas:['Persamaan garisnya '+eqS(k)+'.','Garis '+(isSolid(op)?'penuh':'putus-putus')+' dan hasil uji titik di DP → '+ineqS(k)+'.']});
  }
  var d=quad(rng),B=boxQ1(d.m,1),l1=d.l1,l2=d.l2;
  if(rng()<.25)l1=L(l1.a,l1.b,l1.c,'<');
  if(rng()<.25)l2=L(l2.a,l2.b,l2.c,'<');
  var s=[l1,l2].concat(AX),cs=[M(0,0),M(d.A,0),M(d.P,d.Q),M(0,d.B)],vw={ln:2,sh:1,mk:cs};
  var rows=['(1) '+lin(l1.a,l1.b)+' … '+nm(l1.c),'(2) '+lin(l2.a,l2.b)+' … '+nm(l2.c),'x … 0','y … 0'];
  return mkQ(2,'M','b',{kko:'menyusun, menentukan, menerapkan',pl:B,sys:s,
    soal:'DP (hijau) berbentuk segi empat dengan titik sudut (0, 0), ('+d.A+', 0), ('+d.P+', '+d.Q+'), (0, '+d.B+'). Tentukan sistem pertidaksamaannya.',
    st:[F('Persamaan garis (1)','Garis (1) melalui ('+d.A+', 0) dan ('+d.P+', '+d.Q+').',[eqI('Garis (1)',l1,[{x:d.A,y:0},{x:d.P,y:d.Q}])],['Pakai rumus dua titik.','Periksa: kedua titik harus memenuhi persamaanmu.'],vw),
        F('Persamaan garis (2)','Garis (2) melalui (0, '+d.B+') dan ('+d.P+', '+d.Q+').',[eqI('Garis (2)',l2,[{x:0,y:d.B},{x:d.P,y:d.Q}])],['Pakai rumus dua titik.','Periksa: kedua titik harus memenuhi persamaanmu.'],vw),
        F('Tanda','Lengkapi tanda setiap pertidaksamaan. Pakai satu titik uji di dalam DP untuk semua garis.',s.map(function(q,i){return pg(rows[i],OPS.slice(),OPS.indexOf(q.op));}),
          ['Pilih titik uji di dalam DP, misalnya '+ptS(inPt(s,B))+'.','Sumbu koordinat juga garis batas, yaitu x = 0 dan y = 0.'],vw)],
    vz:vw,bahas:['(1) '+ineqS(l1)+'; (2) '+ineqS(l2)+'; x ≥ 0; y ≥ 0.','Uji titik '+ptS(inPt(s,B))+' di dalam DP membuat semua pertidaksamaan benar.']});
}
function g2H(rng,v){
  var d=quad(rng),B=boxQ1(d.m,1),s=[d.l1,d.l2].concat(AX),cs=[M(0,0),M(d.A,0),M(d.P,d.Q),M(0,d.B)];
  if(v==='r'){
    var vw={mk:cs},vf={ln:2,sh:1,mk:cs};
    return mkQ(2,'H','r',{kko:'merancang',pl:B,sys:s,ls:true,
      soal:'Rancang sistem pertidaksamaan yang DP-nya segi empat dengan titik sudut (0, 0), ('+d.A+', 0), ('+d.P+', '+d.Q+'), (0, '+d.B+'). Semua garis batas penuh.',
      st:[F('Garis (1)','Garis (1) menghubungkan ('+d.A+', 0) dan ('+d.P+', '+d.Q+').',[eqI('Garis (1)',d.l1,[{x:d.A,y:0},{x:d.P,y:d.Q}])],['Pakai rumus dua titik.'],vw),
          F('Garis (2)','Garis (2) menghubungkan (0, '+d.B+') dan ('+d.P+', '+d.Q+').',[eqI('Garis (2)',d.l2,[{x:0,y:d.B},{x:d.P,y:d.Q}])],['Pakai rumus dua titik.'],vw),
          F('Tanda','Lengkapi tanda agar DP-nya tepat segi empat itu.',s.map(function(q,i){return pg(['(1) '+lin(q.a,q.b)+' … '+nm(q.c),'(2) '+lin(q.a,q.b)+' … '+nm(q.c),'x … 0','y … 0'][i],OPS.slice(),OPS.indexOf(q.op));}),['Semua garis penuh → ≤ atau ≥.','(0, 0) adalah titik sudut DP, jadi uji titik lain di dalamnya, misalnya '+ptS(inPt(s,B))+'.'],vw)],
      vz:vf,bahas:['Sistemnya '+ineqS(d.l1)+'; '+ineqS(d.l2)+'; x ≥ 0; y ≥ 0.']});
  }
  var j=ri(rng,0,1),rin=s.map(function(q,i){return i===j?L(q.a,q.b,q.c,flipOp(q.op)):q;}),T=inPt(s,B),q=s[j],val=q.a*T.x+q.b*T.y;
  var lst=rin.map(ineqS),vv={ln:2,sh:1,mk:cs},vt={ln:2,sh:1,mk:cs.concat([M(T.x,T.y,'g','T')])};
  return mkQ(2,'H','a',{kko:'mengevaluasi, memperbaiki',pl:B,sys:s,
    soal:'Untuk DP segi empat (0, 0), ('+d.A+', 0), ('+d.P+', '+d.Q+'), (0, '+d.B+'), Rina menulis sistem <b>'+lst.join(' ; ')+'</b>. Periksa dan perbaiki.',
    st:[F('Evaluasi jawaban','Pertidaksamaan Rina yang salah adalah',[pg('Yang salah',lst,j)],['Uji satu titik di dalam DP ke setiap pertidaksamaan Rina.','Pertidaksamaan yang bernilai salah untuk titik di DP adalah yang keliru.'],vv),
        F('Uji titik','Uji titik T'+ptS(T)+' di dalam DP pada ruas kiri pertidaksamaan itu.',[num('Nilai '+lin(q.a,q.b)+' di T =',val)],['Substitusikan x = '+T.x+' dan y = '+T.y+'.'],vt),
        F('Perbaikan','Tanda yang benar:',[pg(lin(q.a,q.b)+' … '+nm(q.c),OPS.slice(),OPS.indexOf(q.op))],['Garis penuh → ≤ atau ≥.','Bandingkan '+nm(val)+' dengan '+nm(q.c)+'.'],vt)],
    vz:vt,bahas:['Uji T'+ptS(T)+' → '+subS(q.a,q.b,T.x,T.y)+' = '+nm(val)+', jadi '+lst[j]+' bernilai salah.','Perbaikannya '+ineqS(q)+'.']});
}

/* ================= KONTEKS (angka rekaan yang wajar) ================= */
var KW_LE=['paling banyak','tidak lebih dari','maksimal'],KW_GE=['paling sedikit','minimal','tidak kurang dari'];
function R(nm,sat,f,kal,fix){return {nm:nm,sat:sat,f:f,kal:kal,fix:!!fix};}
var CTX=[
 {id:'bazar',jenis:'max',who:'OSIS',kerja:'membuat',X:'loyang barongko',Y:'wajan onde-onde',sx:'loyang',sy:'wajan',sc:[1],
  intro:'OSIS membuat barongko dan onde-onde untuk bazar sekolah.',
  r:[R('waktu','jam',1,function(A,B,C,k){return 'Membuat satu loyang barongko memerlukan '+A+' jam dan satu wajan onde-onde '+B+' jam. Dapur dapat dipakai '+k+' '+C+' jam.';}),
     R('meja','wadah',1,function(A,B,C,k){return 'Meja bazar dapat memajang '+k+' '+C+' wadah (1 loyang atau 1 wajan = 1 wadah).';},true)],
  ob:{nm:'keuntungan',goal:'keuntungan sebesar-besarnya',u:5000,lo:10000,hi:60000,kal:function(p,q){return 'Keuntungan satu loyang barongko '+rp(p)+' dan satu wajan onde-onde '+rp(q)+'.';}}},
 {id:'songkok',jenis:'max',who:'Perajin itu',kerja:'membuat',X:'songkok recca',Y:'tas anyaman',sx:'buah',sy:'buah',sc:[1],
  intro:'Seorang perajin di Kabupaten Bone membuat songkok recca dan tas anyaman setiap minggu.',
  r:[R('waktu','jam',1,function(A,B,C,k){return 'Satu songkok memerlukan '+A+' jam menganyam dan satu tas '+B+' jam. Waktu yang tersedia '+k+' '+C+' jam.';}),
     R('bahan','ikat',1,function(A,B,C,k){return 'Satu songkok memerlukan '+A+' ikat bahan dan satu tas '+B+' ikat. Bahan yang tersedia '+k+' '+C+' ikat.';})],
  ob:{nm:'keuntungan',goal:'keuntungan sebesar-besarnya',u:5000,lo:20000,hi:100000,kal:function(p,q){return 'Keuntungan satu songkok '+rp(p)+' dan satu tas '+rp(q)+'.';}}},
 {id:'kapal',jenis:'max',who:'Petugas kapal',kerja:'memuat',coCek:function(co){return co[0][0]<co[0][1];},obCek:function(p,q){return q>p;},X:'mobil',Y:'truk',sx:'unit',sy:'unit',sc:[5],
  intro:'Sebuah kapal penyeberangan dari Pelabuhan Bajoe mengangkut mobil dan truk.',
  r:[R('luas lantai','m²',20,function(A,B,C,k){return 'Satu mobil memerlukan '+A+' m² dan satu truk '+B+' m². Luas lantai kendaraan yang terpakai '+k+' '+C+' m².';}),
     R('banyak kendaraan','kendaraan',1,function(A,B,C,k){return 'Demi keselamatan, kapal memuat '+k+' '+C+' kendaraan.';},true)],
  ob:{nm:'pendapatan',goal:'pendapatan sebesar-besarnya',u:100000,lo:300000,hi:1500000,kal:function(p,q){return 'Tarif penyeberangan satu mobil '+rp(p)+' dan satu truk '+rp(q)+'.';}}},
 {id:'sutra',jenis:'max',who:'Penenun itu',kerja:'membuat',X:'sarung sutra',Y:'selendang sutra',sx:'helai',sy:'helai',sc:[1],
  intro:'Seorang penenun di Kabupaten Bone membuat sarung sutra dan selendang sutra.',
  r:[R('benang','gulung',1,function(A,B,C,k){return 'Satu sarung memerlukan '+A+' gulung benang dan satu selendang '+B+' gulung. Benang yang tersedia '+k+' '+C+' gulung.';}),
     R('waktu','hari',1,function(A,B,C,k){return 'Menenun satu sarung memerlukan '+A+' hari dan satu selendang '+B+' hari. Waktu yang tersedia '+k+' '+C+' hari.';})],
  ob:{nm:'keuntungan',goal:'keuntungan sebesar-besarnya',u:10000,lo:50000,hi:200000,kal:function(p,q){return 'Keuntungan satu sarung '+rp(p)+' dan satu selendang '+rp(q)+'.';}}},
 {id:'pupuk',jenis:'min',X:'karung pupuk A',Y:'karung pupuk B',sx:'karung',sy:'karung',sc:[1],
  intro:'Pak Baso mencampur dua jenis pupuk untuk lahan jagungnya.',
  r:[R('nitrogen','unit',1,function(A,B,C,k){return 'Satu karung pupuk A mengandung '+A+' unit nitrogen dan satu karung pupuk B '+B+' unit. Lahannya memerlukan '+k+' '+C+' unit nitrogen.';}),
     R('fosfor','unit',1,function(A,B,C,k){return 'Satu karung pupuk A mengandung '+A+' unit fosfor dan satu karung pupuk B '+B+' unit. Lahannya memerlukan '+k+' '+C+' unit fosfor.';})],
  ob:{nm:'biaya',goal:'biaya serendah-rendahnya',u:10000,lo:50000,hi:200000,kal:function(p,q){return 'Harga pupuk A '+rp(p)+' dan pupuk B '+rp(q)+' per karung.';}}},
 {id:'pakan',jenis:'min',X:'karung pakan A',Y:'karung pakan B',sx:'karung',sy:'karung',sc:[1],
  intro:'Seorang peternak ayam di Watampone mencampur pakan A dan pakan B.',
  r:[R('protein','unit',1,function(A,B,C,k){return 'Satu karung pakan A mengandung '+A+' unit protein dan satu karung pakan B '+B+' unit. Ayamnya memerlukan '+k+' '+C+' unit protein setiap minggu.';}),
     R('energi','unit',1,function(A,B,C,k){return 'Satu karung pakan A mengandung '+A+' unit energi dan satu karung pakan B '+B+' unit. Ayamnya memerlukan '+k+' '+C+' unit energi setiap minggu.';})],
  ob:{nm:'biaya',goal:'biaya serendah-rendahnya',u:10000,lo:100000,hi:400000,kal:function(p,q){return 'Harga satu karung pakan A '+rp(p)+' dan pakan B '+rp(q)+'.';}}}
];
var TKT=[
 {id:'tiket',X:'tiket pelajar',Y:'tiket umum',sx:'lembar',sy:'lembar',base:[5000,10000],
  harga:function(p,q){return 'OSIS mengadakan pentas seni di aula sekolah. Tiket pelajar '+rp(p)+' dan tiket umum '+rp(q)+'.';},
  r:[R('pendapatan','rupiah',1,function(T,k){return 'Supaya biaya acara tertutup, pendapatan harus '+k+' '+rp(T)+'.';}),
     R('kursi','lembar',1,function(K,k){return 'Karena kursi terbatas, tiket yang terjual '+k+' '+K+' lembar.';})]},
 {id:'kaos',X:'kaos lengan pendek',Y:'kaos lengan panjang',sx:'buah',sy:'buah',base:[40000,50000],
  harga:function(p,q){return 'OSIS menjual kaos angkatan. Kaos lengan pendek '+rp(p)+' dan kaos lengan panjang '+rp(q)+'.';},
  r:[R('hasil penjualan','rupiah',1,function(T,k){return 'Agar dana kegiatan terkumpul, hasil penjualan harus '+k+' '+rp(T)+'.';}),
     R('produksi','buah',1,function(K,k){return 'Konveksi hanya sanggup membuat '+k+' '+K+' kaos.';})]}
];
var ABS_MAX={jenis:'max',r:[{},{}],sc:[1]},ABS_MIN={jenis:'min',r:[{},{}],sc:[1]};
function vars(c){return 'x = banyak '+c.X+' ('+c.sx+'), y = banyak '+c.Y+' ('+c.sy+')';}
function genInst(rng,ctx){
  var mx=ctx.jenis==='max',op=mx?'≤':'≥',t,s,co,u,v,ls,m,ok;
  for(t=0;t<600;t++){
    s=pick(rng,ctx.sc);
    co=ctx.r.map(function(r){return r.fix?[1,1]:[ri(rng,1,4),ri(rng,1,4)];});
    if(co[0][0]*co[1][1]===co[1][0]*co[0][1])continue;
    if(co.some(function(c){return gcd(c[0],c[1])>1;})||(ctx.coCek&&!ctx.coCek(co)))continue;
    u=ri(rng,1,6);v=ri(rng,1,6);
    ls=co.map(function(c){return L(c[0],c[1],c[0]*u+c[1]*v,op);});
    ok=true;m=0;
    ls.forEach(function(l){var X=l.c/l.a,Y=l.c/l.b;if(!isInt(X)||!isInt(Y))ok=false;m=Math.max(m,X,Y);});
    if(!ok||m>12||m<4)continue;
    if(corners(ls.concat(AX)).length!==(mx?4:3))continue;
    break;
  }
  if(t>=600){s=ctx.sc[0];co=mx?[[2,1],[1,1]]:[[2,1],[1,3]];u=mx?2:3;v=mx?6:2;if(ctx.r[0].fix)co=[co[1],co[0]];ls=co.map(function(c){return L(c[0],c[1],c[0]*u+c[1]*v,op);});m=mx?10:9;}
  var S=ls.map(function(l){return L(l.a,l.b,l.c*s,op);}),sys=S.concat(AX);
  return {ctx:ctx,s:s,co:co,ls:S,sys:sys,cs:corners(sys),opt:{x:u*s,y:v*s},box:boxQ1(m*s,s),max:mx,
    kw:ctx.r.map(function(){return pick(rng,mx?KW_LE:KW_GE);})};
}
function fval(p,q,P){return p*P.x+q*P.y;}
/* memilih fungsi tujuan: optimum tunggal di titik potong dua garis (I.opt); syarat tambahan opsional */
function pickObj(rng,I,syarat){
  var ob=I.ctx.ob;
  for(var t=0;t<300;t++){
    var p0=ri(rng,1,6),q0=ri(rng,1,6);
    if(gcd(p0,q0)>1)continue;
    var vo=fval(p0,q0,I.opt),ok=I.cs.every(function(P){return samePt(P,I.opt)||(I.max?fval(p0,q0,P)<vo:fval(p0,q0,P)>vo);});
    if(!ok||(syarat&&!syarat(p0,q0))||(I.ctx.obCek&&!I.ctx.obCek(p0,q0)))continue;
    if(!ob)return {p:p0,q:q0};
    var kmax=Math.floor(ob.hi/(Math.max(p0,q0)*ob.u)),kmin=Math.ceil(ob.lo/(Math.min(p0,q0)*ob.u));
    if(kmin>kmax)continue;
    var U=ob.u*ri(rng,kmin,kmax);
    return {p:p0*U,q:q0*U};
  }
  return null;
}
function story(I,o){
  var c=I.ctx,h=c.intro;
  c.r.forEach(function(r,i){h+=' '+r.kal(nm(I.co[i][0]*r.f),nm(I.co[i][1]*r.f),nm(I.ls[i].c*r.f),I.kw[i]);});
  if(o&&o.p!==undefined)h+=' '+c.ob.kal(o.p,o.q);
  return h;
}
function genTkt(rng){
  var c=pick(rng,TKT),s=5,b,u,v,K,c1,t;
  for(t=0;t<300;t++){
    b=ri(rng,2,3);v=ri(rng,1,4);u=b*ri(rng,1,3);K=u+v;c1=u+b*v;
    if(c1<=13&&K>=3)break;
  }
  if(t>=300){b=2;u=4;v=2;K=6;c1=8;}
  var base=pick(rng,c.base),p=base,q=b*base,T=c1*s*base;
  var l1=L(1,b,c1*s,'≥'),l2=L(1,1,K*s,'≤'),sys=[l1,l2].concat(AX);
  var kw=[pick(rng,KW_GE),pick(rng,KW_LE)];
  return {ctx:c,s:s,b:b,u:u*s,v:v*s,K:K*s,c1:c1*s,p:p,q:q,T:T,ls:[l1,l2],sys:sys,cs:corners(sys),box:boxQ1(Math.max(c1,K)*s,s),kw:kw,
    teks:c.harga(p,q)+' '+c.r[0].kal(T,kw[0])+' '+c.r[1].kal(nm(K*s),kw[1])};
}
var TND=['≤','≥','<','>','='];
var KAL=[['Andi ingin menghabiskan seluruh uangnya, yaitu Rp24.000.','='],['Berat muatan motor viar kurang dari 240 kg.','<'],['Penonton pentas seni lebih dari 100 orang.','>'],
  ['Pendapatan bazar paling sedikit Rp400.000.','≥'],['Kapal memuat paling banyak 20 kendaraan.','≤'],['Waktu kerja tidak lebih dari 8 jam sehari.','≤'],['Panen jagung minimal 2 ton.','≥'],
  ['Peserta lomba harus lebih dari 30 orang.','>'],['Ongkos kirim kurang dari Rp15.000.','<'],['Tiket yang terjual tepat 30 lembar.','='],
  ['Pupuk yang dibeli sekurang-kurangnya 5 karung.','≥'],['Belanja Nisa tidak boleh melebihi Rp30.000.','≤']];
function cornerMk(cs){return cs.map(function(P){return M(P.x,P.y,'k');});}
function modelS(sys){return sys.map(ineqS).join(' ; ');}

/* ================= TIPE 3 · KASUS KONTEKSTUAL ================= */
function g3L(rng){
  var tk=rng()<.3,I,c,sen,op,teks;
  if(tk){I=genTkt(rng);c=I.ctx;teks=I.teks;var j=ri(rng,0,1);sen=j?c.r[1].kal(nm(I.K),I.kw[1]):c.r[0].kal(I.T,I.kw[0]);op=j?'≤':'≥';}
  else{c=pick(rng,CTX);I=genInst(rng,c);teks=story(I);var r=c.r[0];sen=r.kal(nm(I.co[0][0]*r.f),nm(I.co[0][1]*r.f),nm(I.ls[0].c*r.f),I.kw[0]);op=I.max?'≤':'≥';}
  var k2=pick(rng,KAL),r0=c.r[0],r1=c.r[1];
  var dis=['x = harga satu '+c.X+', y = harga satu '+c.Y+' (rupiah)','x = banyak '+r0.nm+' ('+r0.sat+'), y = banyak '+r1.nm+' ('+r1.sat+')','x = banyak semua barang, y = total '+(c.ob?c.ob.nm:'pendapatan')+' (rupiah)'];
  return mkQ(3,'L','a',{kko:'menerjemahkan, mengidentifikasi',pl:I.box,
    soal:teks,
    st:[F('Kata kunci','Terjemahkan kalimat berikut menjadi tanda.',[pg('“'+sen+'”',TND.slice(),TND.indexOf(op))],['Cari kata kunci seperti “paling banyak”, “paling sedikit”, atau “tidak lebih dari”.','paling banyak / tidak lebih dari / maksimal → ≤; paling sedikit / minimal → ≥.']),
        F('Kata kunci','Terjemahkan kalimat berikut menjadi tanda.',[pg('“'+k2[0]+'”',TND.slice(),TND.indexOf(k2[1]))],['“kurang dari” → &lt;; “lebih dari” → &gt;; “tepat” atau “habis” → =.']),
        F('Variabel','MISALKAN: pilih variabel yang tepat untuk masalah di atas.',[pgS(rng,'Variabel',vars(c),dis)],['Variabel menyatakan banyak benda yang dipilih, beserta satuannya.'])],
    bahas:['“'+sen+'” → '+op+'.','“'+k2[0]+'” → '+k2[1]+'.','MISALKAN '+vars(c)+'.']});
}
function g3M(rng){
  var tk=rng()<.3,I,c,teks,labs;
  if(tk){I=genTkt(rng);c=I.ctx;teks=I.teks;labs=['(1) Kendala '+c.r[0].nm,'(2) Kendala '+c.r[1].nm];}
  else{c=pick(rng,CTX);I=genInst(rng,c);teks=story(I);labs=['(1) Kendala '+c.r[0].nm,'(2) Kendala '+c.r[1].nm];}
  var cd=candidates(I.sys,I.box),vw={ln:2,sh:1,cd:cd};
  return mkQ(3,'M','a',{kko:'memodelkan, menyelesaikan',pl:I.box,sys:I.sys,
    soal:teks+' <i>Misalkan '+vars(c)+'.</i> Buat modelnya dan tentukan titik sudut DP.',
    st:[F('Model kendala (1)','TERJEMAHKAN kalimat kendala '+c.r[0].nm+' menjadi pertidaksamaan.',[inI(labs[0],I.ls[0])],['Kalikan banyak benda dengan kebutuhan per benda, lalu jumlahkan.','Perhatikan kata kunci untuk memilih tanda. Boleh disederhanakan.']),
        F('Model kendala (2)','TERJEMAHKAN kalimat kendala '+c.r[1].nm+' menjadi pertidaksamaan.',[inI(labs[1],I.ls[1])],['Kalikan banyak benda dengan kebutuhan per benda, lalu jumlahkan.','Perhatikan kata kunci untuk memilih tanda.']),
        PS('Titik sudut DP','DP sudah digambar dari modelmu ditambah x ≥ 0, y ≥ 0. Klik <b>semua</b> titik sudut DP (titik bulat yang ditandai), lalu periksa.',I.cs,['Buat tabel x | y untuk setiap garis: isi x = 0 lalu hitung y, kemudian isi y = 0 lalu hitung x.','Titik sudut adalah titik pojok DP. Titik potong yang berada di luar DP bukan titik sudut.'],vw)],
    vz:{ln:2,sh:1,mk:cornerMk(I.cs)},
    bahas:['Model matematikanya '+modelS(I.sys)+'.','Titik sudut DP adalah '+I.cs.map(ptS).join(', ')+'.']});
}
function g3H(rng,v){
  if(v==='a'){
    var I=genTkt(rng),c=I.ctx,x0,y0,t;
    for(t=0;t<200;t++){y0=I.s*ri(rng,0,I.v/I.s-1);x0=I.s*ri(rng,1,I.K/I.s);if(x0+y0<=I.K&&x0+I.b*y0<I.c1)break;}
    if(t>=200){y0=0;x0=I.s;}
    var pend=I.p*x0+I.q*y0,vw={ln:2,sh:1,mk:[M(x0,y0,'r','rencana')]};
    return mkQ(3,'H','a',{kko:'menafsirkan, mengevaluasi',pl:I.box,sys:I.sys,
      soal:I.teks+' Panitia berencana menjual '+x0+' '+c.X+' dan '+y0+' '+c.Y+'. <i>Misalkan '+vars(c)+'.</i>',
      st:[F('Evaluasi rencana','Apakah rencana panitia memenuhi semua syarat?',[pg('Rencana memenuhi semua syarat?',YT,1)],['Uji titik rencana ke kedua kendala.'],vw),
          F('Menghitung','Hitung '+c.r[0].nm+' dari rencana itu.',[num('Hasil (Rp)',pend,'rp')],[rp(I.p)+' × '+x0+' + '+rp(I.q)+' × '+y0+'.'],vw),
          F('Saran','Agar target tercapai, paling sedikit berapa '+c.Y+' harus terjual?',[num('Paling sedikit '+c.Y+' =',I.v)],['Lihat titik DP yang paling rendah (nilai y terkecil).','Titik itu adalah titik potong kedua garis.'],vw)],
      vz:{ln:2,sh:1,mk:[M(x0,y0,'r','rencana')].concat(cornerMk(I.cs))},
      bahas:['Rencana '+ptS({x:x0,y:y0})+' menghasilkan '+rp(pend)+', kurang dari '+rp(I.T)+', jadi gagal.','Titik terendah DP adalah '+ptS({x:I.u,y:I.v})+', jadi paling sedikit '+I.v+' '+c.Y+' harus terjual.']});
  }
  var ctx=pick(rng,CTX.filter(function(x){return x.jenis==='max';})),J;
  if(v==='b'){
    var tt;
    for(tt=0;tt<100;tt++){
      J=genInst(rng,ctx);var j=ri(rng,0,1),i=1-j,li=J.ls[i],lj=J.ls[j],Xi=li.c/li.a,Yi=li.c/li.b,m0=Math.max(lj.a*Xi,lj.b*Yi);
      var st=lj.a*lj.b/gcd(lj.a,lj.b)*J.s,cn=(Math.floor(m0/st)+1)*st;
      if(Math.max(cn/lj.a,cn/lj.b)>13*J.s)continue;
      var nl=L(lj.a,lj.b,cn,'≤'),ns=(j===0?[nl,li]:[li,nl]).concat(AX),ncs=corners(ns),box=boxQ1(Math.max(cn/lj.a,cn/lj.b,Xi,Yi),J.s),rj=ctx.r[j],ri_=ctx.r[i];
      var vw={ln:2},vp={ln:2,sh:1,cd:candidates(ns,box)};
      return mkQ(3,'H','b',{kko:'menganalisis, mengevaluasi',pl:box,sys:ns,
        soal:story(J)+' Kemudian batas '+rj.nm+' diubah menjadi '+nm(cn*rj.f)+' '+rj.sat+'. <i>Misalkan '+vars(ctx)+'.</i> Gambar menunjukkan kedua garis batas yang baru.',
        st:[F('Menganalisis batasan','Setelah perubahan, kendala mana yang masih membatasi DP?',[pgS(rng,'Kendala yang membatasi','Hanya kendala '+ri_.nm,['Hanya kendala '+rj.nm,'Keduanya masih membatasi','Tidak ada yang membatasi'])],['Bandingkan titik potong kedua garis dengan sumbu.','Garis yang seluruhnya berada di luar daerah garis lain tidak lagi membatasi.'],vw),
            F('Bentuk DP','Bentuk DP yang baru adalah',[pg('Bentuk DP',['Segitiga','Segi empat','Segi lima','Daerah terbuka'],0)],['Hitung titik sudutnya, yaitu (0, 0) dan titik potong garis yang membatasi dengan kedua sumbu.'],vw),
            PS('Titik sudut DP','Klik semua titik sudut DP yang baru.',ncs,['Buat tabel x | y untuk setiap garis: isi x = 0 lalu hitung y, kemudian isi y = 0 lalu hitung x.','DP baru hanya dibatasi satu garis dan kedua sumbu.'],vp)],
        vz:{ln:2,sh:1,mk:cornerMk(ncs)},
        bahas:['Garis '+rj.nm+' yang baru melalui '+ptS({x:cn/lj.a,y:0})+' dan '+ptS({x:0,y:cn/lj.b})+', seluruhnya di luar daerah kendala '+ri_.nm+'.','Jadi hanya kendala '+ri_.nm+' yang membatasi; DP berupa segitiga '+ncs.map(ptS).join(', ')+'.']});
    }
  }
  J=genInst(rng,ctx);
  var want=pick(rng,['in','v0','v1']),P=null,tr;
  for(tr=0;tr<300;tr++){
    var px=J.s*ri(rng,1,J.box.x1/J.s-1),py=J.s*ri(rng,1,J.box.y1/J.s-1),a0=holds(J.ls[0].a*px+J.ls[0].b*py,J.ls[0].c,'≤'),a1=holds(J.ls[1].a*px+J.ls[1].b*py,J.ls[1].c,'≤');
    var cat=a0&&a1?'in':(!a0&&a1?'v0':(a0&&!a1?'v1':'vv'));
    if(cat===want){P={x:px,y:py,cat:cat};break;}
  }
  if(!P)P={x:J.opt.x,y:J.opt.y,cat:'in'};
  var r0=ctx.r[0],r1=ctx.r[1],o=['Memenuhi kedua kendala.','Melanggar kendala '+r0.nm+' saja.','Melanggar kendala '+r1.nm+' saja.','Melanggar kedua kendala.'],ki={'in':0,v0:1,v1:2,vv:3}[P.cat];
  var pakai=J.co[0][0]*r0.f*P.x+J.co[0][1]*r0.f*P.y,vw2={ln:2,sh:1,mk:[M(P.x,P.y,'b','rencana')]};
  return mkQ(3,'H','c',{kko:'menafsirkan',pl:J.box,sys:J.sys,
    soal:story(J)+' Ada usul '+ctx.kerja+' '+P.x+' '+ctx.X+' dan '+P.y+' '+ctx.Y+'. <i>Misalkan '+vars(ctx)+'.</i>',
    st:[F('Menafsirkan titik','Apakah usul '+ptS(P)+' dapat dijalankan?',[pg('Dapat dijalankan?',YT,P.cat==='in'?0:1)],['Titik di DP berarti semua kendala terpenuhi.'],vw2),
        F('Alasan','Pilih alasan yang tepat.',[pg('Alasannya',o,ki)],['Substitusikan '+ptS(P)+' ke setiap kendala.'],vw2),
        F('Makna','Hitung '+r0.nm+' yang terpakai bila usul itu dijalankan.',[num(r0.nm+' terpakai ('+r0.sat+') =',pakai)],['Kalikan kebutuhan per benda dengan banyaknya, lalu jumlahkan.'],vw2)],
    vz:vw2,bahas:['Uji '+ptS(P)+' → '+o[ki],r0.nm+' terpakai '+nm(pakai)+' '+r0.sat+' dari '+nm(J.ls[0].c*r0.f)+' '+r0.sat+'.']});
}

/* ================= TIPE 4 · NILAI MAKSIMUM/MINIMUM ================= */
function ctxAny(rng){return pick(rng,CTX);}
function instObj(rng,ctx,syarat){
  for(var t=0;t<60;t++){var I=genInst(rng,ctx),o=pickObj(rng,I,syarat);if(o){I.p=o.p;I.q=o.q;return I;}}
  var J=genInst(rng,ctx);J.p=J.max?(ctx.ob?30000:2):(ctx.ob?150000:2);J.q=J.max?(ctx.ob?20000:3):(ctx.ob?100000:3);return J;
}
function valS(I,v){return I.ctx.ob?rp(v):nm(v);}
function g4L(rng){
  var c=ctxAny(rng),I=instObj(rng,c),pts=[],x,y;
  for(x=0;x<=I.box.x1;x+=I.s)for(y=0;y<=I.box.y1;y+=I.s)if((x||y)&&holdsWeak(I.sys,x,y)&&x<I.box.x1-I.s&&y<I.box.y1-I.s)pts.push({x:x,y:y});
  var T=pts.length?pick(rng,pts):I.opt,fv=fval(I.p,I.q,T),ob=c.ob;
  var kal=c.r[0].kal(nm(I.co[0][0]*c.r[0].f),nm(I.co[0][1]*c.r[0].f),nm(I.ls[0].c*c.r[0].f),I.kw[0]);
  var dis=[c.intro.replace(/\.$/,'')+' dan ingin '+ob.goal+'.',ob.kal(I.p,I.q),'x menyatakan banyak '+c.X+' dan y menyatakan banyak '+c.Y+'.'];
  return mkQ(4,'L','a',{kko:'menuliskan, membedakan, menghitung',pl:I.box,sys:I.sys,
    soal:story(I,{p:I.p,q:I.q})+' Tujuannya '+ob.goal+'. <i>Misalkan '+vars(c)+'.</i>',
    st:[F('Fungsi tujuan','SUSUN fungsi tujuan f(x, y) = px + qy.',[num('p (Rp per '+c.sx+' '+c.X+') =',I.p,'rp'),num('q (Rp per '+c.sy+' '+c.Y+') =',I.q,'rp'),pg('Tujuan',['Maksimumkan','Minimumkan'],I.max?0:1)],
          ['p dan q adalah nilai '+ob.nm+' per satuan barang.','“'+ob.goal+'” menentukan maksimumkan atau minimumkan.']),
        F('Kendala atau tujuan','Kalimat mana yang menjadi <b>kendala</b>?',[pgS(rng,'Kendala',kal,dis)],['Kendala memuat kata kunci seperti “paling banyak” atau “paling sedikit”.']),
        F('Menghitung f','Hitung '+ob.nm+' untuk '+T.x+' '+c.sx+' '+c.X+' dan '+T.y+' '+c.sy+' '+c.Y+'.',[num('f'+ptS(T)+' (Rp) =',fv,'rp')],['f'+ptS(T)+' = '+nm(I.p)+'('+T.x+') + '+nm(I.q)+'('+T.y+').'])],
    vz:{ln:2,sh:1,mk:[M(T.x,T.y,'b')]},
    bahas:[(I.max?'Maksimumkan ':'Minimumkan ')+fS(I.p,I.q)+'.','Kendala: “'+kal+'”','f'+ptS(T)+' = '+nm(I.p)+'('+T.x+') + '+nm(I.q)+'('+T.y+') = '+rp(fv)+'.']});
}
function optQ(I,lbl){
  var best=I.cs.reduce(function(b,P){var v=fval(I.p,I.q,P);return (!b||(I.max?v>b.v:v<b.v))?{P:P,v:v}:b;},null);
  return best;
}
function g4M(rng,v){
  var c,I,ab=(v==='c'||v==='g'),soal,goal;
  if(v==='a'||v==='g')c=pick(rng,CTX.filter(function(x){return x.jenis==='max';}));
  else if(v==='b')c=pick(rng,CTX.filter(function(x){return x.jenis==='min';}));
  if(ab){c=v==='g'||rng()<.6?ABS_MAX:ABS_MIN;}
  I=instObj(rng,c);
  var best=optQ(I),tb=I.cs.map(function(P){return num('f'+ptS(P)+(c.ob?' (Rp)':'')+' =',fval(I.p,I.q,P),c.ob?'rp':'');});
  var kata=I.max?'maksimum':'minimum';
  if(ab)soal='Tentukan nilai '+kata+' <b>'+fS(I.p,I.q)+'</b> dengan kendala <b>'+modelS(I.sys)+'</b>.';
  else soal=story(I,{p:I.p,q:I.q})+' Tentukan '+c.ob.nm+' '+kata+'. <i>Misalkan '+vars(c)+'; '+fS(I.p,I.q)+'.</i>';
  var cd=candidates(I.sys,I.box),vw={ln:2,sh:1,cd:cd},vk={ln:2,sh:1,mk:cornerMk(I.cs)};
  var opts=I.cs.map(function(P){return valS(I,fval(I.p,I.q,P))+' di '+ptS(P);});
  var ki=I.cs.findIndex?I.cs.findIndex(function(P){return samePt(P,best.P);}):-1;
  if(ki<0)I.cs.forEach(function(P,i){if(samePt(P,best.P))ki=i;});
  var bah=['Model matematikanya '+(ab?'':(I.max?'maksimumkan ':'minimumkan '))+fS(I.p,I.q)+'; '+modelS(I.sys)+'.','Titik sudut DP adalah '+I.cs.map(ptS).join(', ')+'.',
    I.cs.map(function(P){return 'f'+ptS(P)+' = '+valS(I,fval(I.p,I.q,P));}).join('; ')+'.',
    'Nilai '+kata+' '+valS(I,best.v)+' di '+ptS(best.P)+(ab?'.':' ('+best.P.x+' '+c.X+' dan '+best.P.y+' '+c.Y+').')+(I.max?'':' DP terbuka, jadi nilai maksimum tidak ada.')];
  if(v==='g'){
    var z=I.cs.reduce(function(b,P){var w=fval(I.p,I.q,P);return (!b||w<b.v)?{P:P,v:w}:b;},null);
    var vg={ln:2,sh:1,gs:{p:I.p,q:I.q},mk:cornerMk(I.cs)};
    return mkQ(4,'M','g',{kko:'menentukan, menerapkan',pl:I.box,sys:I.sys,ls:true,soal:soal+' Gunakan metode garis selidik.',
      st:[P('Garis selidik','GESER garis selidik '+lin(I.p,I.q)+' = k memakai slider. Klik titik sudut <b>terakhir</b> yang disentuh garis (maksimum).',{k:'at',p:[best.P]},['Garis bergeser ke kanan-atas jika k diperbesar.','Titik terakhir yang disentuh sebelum garis meninggalkan DP.'],vg),
          F('Nilai maksimum','HITUNG f di titik itu.',[num('Nilai maksimum =',best.v)],['Substitusikan titik itu ke f.'],vg),
          F('Titik pertama','Titik sudut yang <b>pertama</b> disentuh garis selidik (nilai minimum) adalah',[pg('Titik pertama',I.cs.map(ptS),I.cs.indexOf(z.P))],['Mulailah dari k = 0.'],vg)],
      vz:vg,bahas:['Garis selidik terakhir menyentuh DP di '+ptS(best.P)+', jadi maksimum f = '+nm(best.v)+'.','Titik pertama yang disentuh adalah '+ptS(z.P)+' (minimum f = '+nm(z.v)+').']});
  }
  return mkQ(4,'M',v,{kko:'menentukan, menghitung, menerapkan',pl:I.box,sys:I.sys,soal:soal,
    st:[PS('Titik sudut DP','CARI: klik <b>semua</b> titik sudut DP (pilih di antara titik bulat yang ditandai), lalu periksa.',I.cs,['Buat tabel x | y untuk setiap garis: isi x = 0 lalu hitung y, kemudian isi y = 0 lalu hitung x.','Titik sudut bisa berupa (0, 0), titik potong garis dengan sumbu, atau titik potong dua garis.','Periksa setiap calon titik ke semua kendala; buang yang di luar DP.'],vw),
        F('Tabel f(x, y)','HITUNG nilai fungsi tujuan di setiap titik sudut.',tb,['Substitusikan x dan y setiap titik ke '+fS(I.p,I.q)+'.'],vk,'tbl'),
        F('Nilai optimum','PILIH nilai '+kata+' fungsi tujuan.',[pg('Nilai '+kata,opts,ki)],[I.max?'Maksimum = nilai terbesar dalam tabel.':'Minimum = nilai terkecil dalam tabel.'],vk)],
    vz:vk,bahas:bah});
}
function g4H(rng,v){
  if(v==='a'){
    var I=instObj(rng,ABS_MIN),best=optQ(I),mx=I.cs.reduce(function(b,P){var w=fval(I.p,I.q,P);return (!b||w>b.v)?{P:P,v:w}:b;},null),vw={ln:2,sh:1,mk:cornerMk(I.cs)};
    return mkQ(4,'H','a',{kko:'menganalisis, mengevaluasi',pl:I.box,sys:I.sys,
      soal:'Seorang siswa menyatakan bahwa nilai maksimum <b>'+fS(I.p,I.q)+'</b> dengan kendala <b>'+modelS(I.sys)+'</b> adalah '+nm(mx.v)+' di '+ptS(mx.P)+'. Evaluasi pernyataan itu.',
      st:[F('Evaluasi','Apakah pernyataan siswa itu benar?',[pg('Pernyataan siswa',['Benar','Keliru'],1)],['Perhatikan bentuk DP: tertutup atau terbuka?'],vw),
          F('Alasan','Pilih alasan yang tepat.',[pgS(rng,'Alasannya','DP terbuka (tidak terbatas), sehingga nilai maksimum tidak ada.',['Ada titik sudut yang terlewat; maksimum seharusnya di '+ptS(best.P)+'.','Nilai f di titik itu salah dihitung.','Nilai maksimum selalu berada di titik potong dua garis.'])],['Pada DP terbuka ke kanan-atas, f dapat dibuat sebesar apa pun.'],vw),
          F('Nilai minimum','Tentukan nilai minimum f.',[num('Nilai minimum =',best.v)],['Hitung f di setiap titik sudut, lalu pilih yang terkecil.'],vw)],
      vz:vw,bahas:['DP terbuka, jadi nilai maksimum tidak ada. Pernyataan siswa keliru.','Nilai minimum f = '+nm(best.v)+' di '+ptS(best.P)+'.']});
  }
  var ctx=pick(rng,CTX.filter(function(x){return x.jenis==='max'&&x.ob.nm==='keuntungan';})),J,ob=ctx.ob;
  if(v==='b'){
    for(var t=0;t<40;t++){
      J=instObj(rng,ctx,function(p0,q0){return p0>q0;});
      var bx=J.cs.filter(function(P){return P.y===0&&P.x>0;})[0];
      if(J.p>J.q&&bx){
        var best=optQ(J),fb=fval(J.p,J.q,bx),vw={ln:2,sh:1,mk:cornerMk(J.cs).concat([M(bx.x,bx.y,'r','keputusan')])};
        return mkQ(4,'H','b',{kko:'mengevaluasi, menyimpulkan',pl:J.box,sys:J.sys,
          soal:story(J,{p:J.p,q:J.q})+' '+ctx.who+' memutuskan '+ctx.kerja+' '+bx.x+' '+ctx.X+' saja karena '+ctx.X+' lebih untung per '+ctx.sx+'. <i>Misalkan '+vars(ctx)+'.</i> Apakah keputusan itu tepat?',
          st:[F('Menghitung','Hitung '+ob.nm+' dari keputusan itu.',[num('f'+ptS(bx)+' (Rp) =',fb,'rp')],['f'+ptS(bx)+' = '+nm(J.p)+' × '+bx.x+'.'],vw),
              P('Titik optimum','Klik titik sudut DP yang memberi '+ob.nm+' terbesar.',{k:'at',p:[best.P]},['Hitung f di setiap titik sudut, lalu bandingkan.'],vw),
              F('Kesimpulan','Apakah keputusan itu tepat?',[pgS(rng,'Kesimpulan','Tidak tepat, karena '+ptS(best.P)+' memberi '+rp(best.v)+', lebih besar daripada '+rp(fb)+'.',['Tepat, karena '+ctx.X+' lebih untung per '+ctx.sx+'.','Tepat, karena '+ptS(bx)+' adalah titik sudut DP.','Tidak tepat, karena sebaiknya membuat '+ctx.Y+' saja.'])],['Bandingkan '+rp(fb)+' dengan nilai f di titik optimum.'],vw)],
          vz:vw,bahas:['Keputusan '+ptS(bx)+' menghasilkan '+rp(fb)+'.','Nilai terbesar '+rp(best.v)+' di '+ptS(best.P)+'. Lebih untung per barang belum tentu terbaik karena kendala ikut menentukan.']});
      }
    }
  }
  for(var tc=0;tc<60;tc++){
    J=instObj(rng,ctx);
    var bx2=J.cs.filter(function(P){return P.y===0&&P.x>0;})[0];
    if(!bx2||bx2.x===J.opt.x)continue;
    var pmin=J.q*J.opt.y/(bx2.x-J.opt.x);
    if(!isInt(pmin)||pmin%1000!==0||pmin<=J.p)continue;
    var o3=['Membuat '+ctx.X+' saja '+ptS(bx2)+' dan '+ptS(J.opt)+' sama-sama optimum.','Hanya '+ptS(bx2)+' yang optimum.','Hanya '+ptS(J.opt)+' yang optimum.','Nilai maksimum tidak ada.'];
    var vw3={ln:2,sh:1,mk:cornerMk(J.cs)};
    return mkQ(4,'H','c',{kko:'menentukan syarat, menyimpulkan',pl:J.box,sys:J.sys,
      soal:story(J,{p:J.p,q:J.q})+' <i>Misalkan '+vars(ctx)+'.</i> Keuntungan '+ctx.Y+' tetap '+rp(J.q)+'. Paling sedikit berapa keuntungan '+ctx.X+' per '+ctx.sx+' agar membuat '+ctx.X+' saja '+ptS(bx2)+' menjadi pilihan terbaik?',
      st:[P('Titik pesaing','Dengan keuntungan sekarang, klik titik sudut yang memberi '+ob.nm+' terbesar (titik yang harus dikalahkan).',{k:'at',p:[J.opt]},['Hitung f di setiap titik sudut dengan keuntungan sekarang.'],vw3),
          F('Syarat parameter','Misalkan keuntungan '+ctx.X+' = p. Syaratnya p × '+bx2.x+' ≥ p × '+J.opt.x+' + '+nm(J.q)+' × '+J.opt.y+'.',[num('p paling sedikit (Rp) =',pmin,'rp')],['Kumpulkan suku p di ruas kiri sehingga p × '+(bx2.x-J.opt.x)+' ≥ '+nm(J.q*J.opt.y)+'.'],vw3),
          F('Kesimpulan','Apa yang terjadi saat p tepat '+rp(pmin)+'?',[pg('Saat p = '+rp(pmin),o3,0)],['Substitusikan p = '+rp(pmin)+' ke kedua titik.'],vw3)],
      vz:vw3,bahas:['Titik pesaingnya '+ptS(J.opt)+'.',nm(bx2.x)+'p ≥ '+nm(J.opt.x)+'p + '+nm(J.q*J.opt.y)+' → p ≥ '+rp(pmin)+'.','Pada p = '+rp(pmin)+', '+ptS(bx2)+' dan '+ptS(J.opt)+' sama-sama optimum.']});
  }
  return g4H(rng,'a');
}

/* ---------- pemilih pembangkit ---------- */
var VARS={
  '1L':['a'],'1M':['a'],'1H':['a','b','c'],
  '2L':['a'],'2M':['a','b'],'2H':['a'],
  '3L':['a'],'3M':['a'],'3H':['a','b','c'],
  '4L':['a'],'4M':['a','b','c'],'4H':['a','b','c']
};
var VARS_LATIHAN={'2H':['r'],'4M':['g']};   /* hanya di Latihan Mandiri */
function variants(t,l,latihan){var k=t+l;return VARS[k].concat(latihan&&VARS_LATIHAN[k]?VARS_LATIHAN[k]:[]);}
function gen(t,l,rng,latihan,v){
  if(!v)v=pick(rng,variants(t,l,latihan));
  if(t===1)return l==='L'?g1L(rng):l==='M'?g1M(rng):g1H(rng,v);
  if(t===2)return l==='L'?g2L(rng):l==='M'?g2M(rng,v):g2H(rng,v);
  if(t===3)return l==='L'?g3L(rng):l==='M'?g3M(rng):g3H(rng,v);
  return l==='L'?g4L(rng):l==='M'?g4M(rng,v):g4H(rng,v);
}

/* Satu "paket kuis" ditentukan sepenuhnya oleh benih (seed): 8 soal.
   Tipe 1 (Menggambar DP) dan Tipe 2 LOTS tidak dipakai di kuis.
   Tipe 2: MOTS, HOTS · Tipe 3: LOTS, MOTS, HOTS · Tipe 4: LOTS, MOTS, HOTS
   Hasilnya 2 LOTS + 3 MOTS + 3 HOTS, urut Tipe 2 → 4, di setiap tipe LOTS → HOTS. */
var SUSUNAN_KUIS=[[2,'MH'],[3,'LMH'],[4,'LMH']];
function buildPack(seed){
  var rng=mulberry32(seed),set=[];
  SUSUNAN_KUIS.forEach(function(x){
    x[1].split('').forEach(function(l){set.push(gen(x[0],l,rng,false));});
  });
  return {seed:seed,set:set};
}

/* ---------- penilai jejak jawaban ----------
   jejak = daftar peristiwa {p,s,a,t}: p = nomor soal (0–7), s = nomor langkah (0–2), a = jawaban mentah,
   t = waktu (ms sejak mulai). Hanya jawaban mentah yang dipercaya; benar-salahnya dihitung ulang di sini.
   Setiap langkah paling banyak MAKS_COBA percobaan: benar ke-1 = 2 poin, benar ke-2 = 1 poin, salah dua kali = 0
   (langkah ditutup dan kunci ditampilkan). Jawaban berformat tidak sah diabaikan, tidak dihitung percobaan. */
function gradeTrace(pack,trace){
  var Qs=pack.set,ev=Array.isArray(trace)?trace:[],total=Qs.length*NLANGKAH;
  var c=0,tries=0,score=0,ignored=0,steps=[],missed={},lastT=0,mono=true,rinci={};
  ['T2','T3','T4','LOTS','MOTS','HOTS'].forEach(function(k){rinci[k]=[0,0];});
  Qs.forEach(function(Q){rinci['T'+Q.t][1]+=2*NLANGKAH;rinci[LEVEL[Q.l]][1]+=2*NLANGKAH;});
  function close(pts){
    var Q=Qs[Math.floor(c/NLANGKAH)],S=Q.st[c%NLANGKAH];
    steps.push(pts);score+=pts;rinci['T'+Q.t][0]+=pts;rinci[LEVEL[Q.l]][0]+=pts;
    if(pts<2){var k='Tipe '+Q.t+' · '+S.nm;missed[k]=(missed[k]||0)+1;}
    c++;tries=0;
  }
  for(var k=0;k<ev.length;k++){
    var e=ev[k];
    if(!e||typeof e!=='object'){ignored++;continue;}
    if(isNum(e.t)){if(e.t<lastT)mono=false;else lastT=e.t;}
    if(c>=total){ignored++;continue;}
    var p=Math.floor(c/NLANGKAH),s=c%NLANGKAH;
    if(e.p!==p||e.s!==s||!valid(Qs[p],s,e.a)){ignored++;continue;}
    tries++;
    if(judge(Qs[p],s,e.a).ok)close(tries===1?2:1);
    else if(tries>=MAKS_COBA)close(0);
  }
  return {score:score,max:total*2,done:c,complete:c===total,tries:tries,ignored:ignored,steps:steps,missed:missed,rinci:rinci,monotonic:mono,lastT:lastT};
}

/* jawaban salah yang sah (untuk cek()) */
function wrongAns(Q,s){
  var S=Q.st[s],a=keyAns(Q,s);
  if(S.k==='form'){
    var it=S.it[0],w=a.slice();
    if(it.t==='pg')w[0]=(it.key+1)%it.o.length;
    else if(it.t==='num')w[0]=it.key+1;
    else if(it.t==='eq')w[0]=[it.key.a,it.key.b,it.key.c+1];
    else w[0]=[it.key.a,it.key.b,it.key.c,flipOp(it.key.op)];
    return w;
  }
  if(S.k==='pt'){
    var B=Q.pl,cs=[[B.x0,B.y0],[B.x1,B.y0],[B.x1,B.y1],[B.x0,B.y1],[0,0]];
    for(var i=0;i<cs.length;i++){var p={x:cs[i][0],y:cs[i][1]};if(!judgePt(S.cond,p))return p;}
    return {x:B.x0,y:B.y0};
  }
  return a.concat([{x:Q.pl.x0,y:Q.pl.y0}]);
}

/* ---------- sidik jari kode: halaman dan server harus menghasilkan nilai yang sama ---------- */
function djb2(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return (h>>>0).toString(16);}
function cek(){
  var pk=buildPack(20261029),rng=mulberry32(7),vs=[],sm=[],t=0;
  [1,2,3,4].forEach(function(tp){['L','M','H'].forEach(function(l){variants(tp,l,true).forEach(function(v){vs.push(gen(tp,l,rng,true,v));});});});
  pk.set.forEach(function(Q,p){
    for(var s=0;s<NLANGKAH;s++){
      var m=(p+s)%3;
      if(m===0){sm.push({p:p,s:s,a:wrongAns(Q,s),t:++t});sm.push({p:p,s:s,a:keyAns(Q,s),t:++t});}
      else if(m===1){sm.push({p:p,s:s,a:null,t:++t});sm.push({p:p,s:s,a:keyAns(Q,s),t:++t});}
      else{sm.push({p:p,s:s,a:wrongAns(Q,s),t:++t});sm.push({p:p,s:s,a:wrongAns(Q,s),t:++t});}
    }
  });
  sm.push({p:9,s:9,a:1,t:++t});
  var vj=vs.map(function(Q){return Q.st.map(function(S,s){return [judge(Q,s,keyAns(Q,s)).ok,judge(Q,s,wrongAns(Q,s)).ok];});});
  return VERSI+':'+djb2(JSON.stringify({pk:pk,vs:vs,vj:vj,g:gradeTrace(pk,sm)}));
}

return {VERSI:VERSI,OPS:OPS,TND:TND,MAKS_COBA:MAKS_COBA,NSOAL:NSOAL,NLANGKAH:NLANGKAH,TIPE:TIPE,LEVEL:LEVEL,
  isSolid:isSolid,holds:holds,sideOf:sideOf,flipOp:flipOp,gcd:gcd,mulberry32:mulberry32,
  nm:nm,rp:rp,lin:lin,ineqS:ineqS,eqS:eqS,ptS:ptS,fS:fS,subS:subS,norm:norm,L:L,AX:AX,
  boxPoly:boxPoly,clipHalf:clipHalf,region:region,area:area,inter:inter,holdsAll:holdsAll,holdsWeak:holdsWeak,onAnyLine:onAnyLine,
  corners:corners,candidates:candidates,findInside:findInside,FULL:FULL,boxQ1:boxQ1,
  variants:variants,gen:gen,buildPack:buildPack,valid:valid,judge:judge,judgePt:judgePt,keyAns:keyAns,wrongAns:wrongAns,
  gradeTrace:gradeTrace,cek:cek};
})();
