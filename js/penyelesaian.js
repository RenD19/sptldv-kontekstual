/* ==========================================================================
   penyelesaian.js · PENYELESAIAN BERTAHAP (TAB LATIHAN MANDIRI)
   Setelah siswa menjawab benar (Periksa) atau menekan 🔑 Lihat jawaban, langkah yang
   memerlukan teknik aljabar (rumus dua titik, substitusi, eliminasi, menyelesaikan
   pertidaksamaan) ditampilkan sebagai perhitungan lengkap yang dirender KaTeX.

   PL.Penyelesaian.langkah(Q, s, St) → [{judul, tex:[baris…]}, …] atau [] bila langkah
   itu tidak memerlukan perhitungan aljabar.
   Semua angka dihitung dari objek soal Q, jadi core.js dan server/Code.gs TIDAK berubah.
   Muat setelah core.js, komponen.js, dan petunjuk.js; sebelum latihan.js.
   ========================================================================== */
(function(PL){
'use strict';
var C=CORE;
function A(){return (PL.Petunjuk&&PL.Petunjuk.alat)||{};}

/* ---------- penulisan bilangan dan bentuk aljabar dalam TeX ---------- */
function tn(v){
  v=Math.round(v*100)/100;
  var neg=v<0,s=String(Math.abs(v)).split('.'),bulat=s[0].replace(/\B(?=(\d{3})+(?!\d))/g,'{.}');
  return (neg?'-':'')+bulat+(s[1]?'{,}'+s[1]:'');
}
function tk(v){return v<0?'('+tn(v)+')':tn(v);}            /* bilangan negatif diberi kurung */
/* jumlah suku [[koefisien, variabel], …]; variabel '' = konstanta */
function ex(su){
  var t='';
  su.forEach(function(x){
    var c=x[0],v=x[1];if(!c)return;
    var neg=c<0,m=Math.abs(c),badan=v?(m===1?'':tn(m))+v:tn(m);
    t+=t===''?(neg?'-':'')+badan:(neg?' - ':' + ')+badan;
  });
  return t===''?'0':t;
}
function lin(a,b){return ex([[a,'x'],[b,'y']]);}
var OP={'≤':'\\le','≥':'\\ge','<':'<','>':'>','=':'='};
function benar(v,c,op){return C.holds(v,c,op);}
function pt(P){return '('+tn(P.x)+',\\ '+tn(P.y)+')';}
function teks(s){return '\\text{'+String(s).replace(/[\\{}]/g,'')+'}';}

/* ---------- blok-blok perhitungan ---------- */

/* substitusi titik P ke ruas kiri a·x + b·y; mengembalikan baris aligned (tanpa ruas kiri) */
function barisSub(a,b,P){
  var suku=[],hasil=[];
  if(a!==0){suku.push((a===1?'':tn(a)+' \\cdot ')+tk(P.x));hasil.push(a*P.x);}
  if(b!==0){suku.push((b===1?'':tn(b)+' \\cdot ')+tk(P.y));hasil.push(b*P.y);}
  var b1=suku.join(' + '),v=a*P.x+b*P.y,br=['&= '+b1];
  if(hasil.length>1&&!(a===1&&b===1))br.push('&= '+hasil.map(function(h,i){return i?(h<0?'- '+tn(-h):'+ '+tn(h)):tn(h);}).join(' '));
  if(hasil.length>1||(a!==1&&a!==0)||(b!==1&&b!==0))br.push('&= '+tn(v));
  return {br:br,v:v};
}
/* uji titik P pada pertidaksamaan q */
function blokUji(q,P,label){
  var r=barisSub(q.a,q.b,P),ok=benar(r.v,q.c,q.op);
  var tex=[lin(q.a,q.b)+' '+r.br[0]].concat(r.br.slice(1));
  tex.push('&\\Rightarrow\\ '+tn(r.v)+' '+OP[q.op]+' '+tn(q.c)+'\\quad'+teks(ok?'(benar)':'(salah)'));
  return {judul:(label?label+' ':'')+ineq(q)+' di titik '+ptTeks(P),tex:tex};
}
function ineq(q){return C.ineqS(q);}
function ptTeks(P){return '('+C.nm(P.x)+', '+C.nm(P.y)+')';}
/* nilai f(x, y) = p·x + q·y di titik P */
function blokF(o,P,judul){
  var r=barisSub(o.p,o.q,P),tex=['f'+pt(P)+' '+r.br[0]].concat(r.br.slice(1));
  return {judul:judul||('Nilai f di titik '+ptTeks(P)),tex:tex,v:r.v};
}
/* beberapa titik dalam satu blok (tabel nilai f) */
function blokFBanyak(o,cs,judul){
  var tex=[];
  cs.forEach(function(P){var r=barisSub(o.p,o.q,P);tex.push('f'+pt(P)+' &= '+r.br.map(function(b){return b.replace(/^&= /,'');}).join(' = '));});
  return {judul:judul||('Substitusi setiap titik sudut ke f(x, y) = '+C.lin(o.p,o.q)),tex:tex};
}
/* titik potong garis q dengan sumbu (tabel x | y dalam bentuk perhitungan) */
function blokPotongSumbu(q,no){
  var tex=[];
  if(q.b!==0){
    tex.push('x = 0 &\\Rightarrow '+lin(0,q.b)+' = '+tn(q.c)+(q.b!==1?'\\ \\Rightarrow\\ y = '+tn(q.c/q.b):'')+'\\quad\\Rightarrow\\ (0,\\ '+tn(q.c/q.b)+')');
  }
  if(q.a!==0){
    tex.push('y = 0 &\\Rightarrow '+lin(q.a,0)+' = '+tn(q.c)+(q.a!==1?'\\ \\Rightarrow\\ x = '+tn(q.c/q.a):'')+'\\quad\\Rightarrow\\ ('+tn(q.c/q.a)+',\\ 0)');
  }
  return {judul:'Titik potong garis ('+no+') '+C.lin(q.a,q.b)+' = '+C.nm(q.c)+' dengan sumbu',tex:tex};
}
/* titik potong dua garis: eliminasi x, lalu substitusi y */
function blokEliminasi(q1,n1,q2,n2){
  if(q1.a*q2.b-q2.a*q1.b===0)return [];
  var e1=lin(q1.a,q1.b)+' &= '+tn(q1.c),e2=lin(q2.a,q2.b)+' &= '+tn(q2.c),out=[];
  /* salah satu garis mendatar atau tegak → langsung terbaca */
  if(q1.a===0||q2.a===0){
    var h=q1.a===0?q1:q2,o=h===q1?q2:q1,no=h===q1?n2:n1,y=h.c/h.b;
    out.push({judul:'Dari garis ('+(h===q1?n1:n2)+')',tex:[lin(0,h.b)+' &= '+tn(h.c),'y &= '+tn(y)]});
    out.push(blokSubBalik(o,no,'y',y));
    return out;
  }
  if(q1.b===0||q2.b===0){
    var v=q1.b===0?q1:q2,o2=v===q1?q2:q1,no2=v===q1?n2:n1,x=v.c/v.a;
    out.push({judul:'Dari garis ('+(v===q1?n1:n2)+')',tex:[lin(v.a,0)+' &= '+tn(v.c),'x &= '+tn(x)]});
    out.push(blokSubBalik(o2,no2,'x',x));
    return out;
  }
  var g=C.gcd(Math.abs(q1.a),Math.abs(q2.a))||1,m1=q2.a/g,m2=q1.a/g;
  var a1=q1.a*m1,b1=q1.b*m1,c1=q1.c*m1,b2=q2.b*m2,c2=q2.c*m2,ky=b1-b2,kc=c1-c2;
  var tex=[];
  if(m1!==1||m2!==1){
    tex.push(lin(q1.a,q1.b)+' &= '+tn(q1.c)+' && \\lvert\\times '+tn(m1)+'\\ \\Rightarrow\\ '+lin(a1,b1)+' = '+tn(c1));
    tex.push(lin(q2.a,q2.b)+' &= '+tn(q2.c)+' && \\lvert\\times '+tn(m2)+'\\ \\Rightarrow\\ '+lin(a1,b2)+' = '+tn(c2));
  }else{tex.push(e1+' && ('+n1+')');tex.push(e2+' && ('+n2+')');}
  tex.push(teks('dikurangkan')+'\\quad '+lin(0,ky)+' &= '+tn(kc));
  if(ky!==1)tex.push('y &= '+tn(kc)+' \\div '+tk(ky)+' = '+tn(kc/ky));
  out.push({judul:'Eliminasi x dari persamaan ('+n1+') dan ('+n2+')',tex:tex});
  out.push(blokSubBalik(q1,n1,'y',kc/ky));
  return out;
}
/* substitusi nilai satu variabel ke persamaan q untuk mendapat variabel lainnya */
function blokSubBalik(q,no,vr,nilai){
  var tex=[],cari=vr==='y'?'x':'y',kc=vr==='y'?q.a:q.b,kv=vr==='y'?q.b:q.a,isi=kv*nilai;
  var sv=kv?(kv===1?'':tn(kv)+' \\cdot ')+tk(nilai):'',sc=kc?ex([[kc,cari]]):'';
  var kiriSub=vr==='y'?[sc,sv]:[sv,sc];kiriSub=kiriSub.filter(Boolean).join(' + ');
  tex.push(kiriSub+' &= '+tn(q.c));
  if(kc===0)return {judul:'Substitusi '+vr+' = '+C.nm(nilai)+' ke persamaan ('+no+')',tex:tex};
  tex.push((vr==='y'?ex([[kc,cari],[isi,'']]):ex([[isi,''],[kc,cari]]))+' &= '+tn(q.c));
  tex.push(ex([[kc,cari]])+' &= '+tn(q.c)+(isi<0?' + '+tn(-isi):' - '+tn(isi))+' = '+tn(q.c-isi));
  if(kc!==1)tex.push(cari+' &= '+tn(q.c-isi)+' \\div '+tk(kc)+' = '+tn((q.c-isi)/kc));
  return {judul:'Substitusi '+vr+' = '+C.nm(nilai)+' ke persamaan ('+no+')',tex:tex};
}
/* persamaan garis melalui dua titik */
function blokDuaTitik(it,judul){
  var P=it.pts&&it.pts[0],R=it.pts&&it.pts[1],k=it.key;if(!P||!R)return [];
  var dy=R.y-P.y,dx=R.x-P.x;if(!dx||!dy)return [];
  var Ey=ex([[1,'y'],[-P.y,'']]),Ex=ex([[1,'x'],[-P.x,'']]);
  var kur=function(e){return /[+-]/.test(e.replace(/^-/,''))?'('+e+')':e;};
  var kali=function(v,e){return v===1?e:v===-1?'-'+kur(e):tk(v)+kur(e);};
  var tex=[
    '\\frac{y - y_1}{y_2 - y_1} &= \\frac{x - x_1}{x_2 - x_1}',
    '\\frac{y - '+tk(P.y)+'}{'+tk(R.y)+' - '+tk(P.y)+'} &= \\frac{x - '+tk(P.x)+'}{'+tk(R.x)+' - '+tk(P.x)+'}',
    '\\frac{'+Ey+'}{'+tn(dy)+'} &= \\frac{'+Ex+'}{'+tn(dx)+'}',
    kali(dx,Ey)+' &= '+kali(dy,Ex)+'\\quad'+teks('(kali silang)'),
    ex([[dx,'y'],[-dx*P.y,'']])+' &= '+ex([[dy,'x'],[-dy*P.x,'']])
  ];
  var a=-dy,b=dx,c=dx*P.y-dy*P.x;
  tex.push(lin(a,b)+' &= '+tn(c));
  var f=k.a?a/k.a:b/k.b;
  if(f!==1)tex.push(lin(k.a,k.b)+' &= '+tn(k.c)+'\\quad'+teks('(kedua ruas dibagi ')+tk(f)+teks(')'));
  return [{judul:judul||('Persamaan garis melalui '+ptTeks(P)+' dan '+ptTeks(R)),tex:tex}];
}
/* titik sudut DP: titik potong dengan sumbu dan titik potong antargaris yang menjadi titik sudut */
/* titik kisi di dalam DP (tidak pada garis) yang paling dekat ke O, agar hitungannya ringan */
function titikDekat(sys,B){
  var g=B.g||1,best=null;
  for(var x=Math.ceil(B.x0/g)*g;x<=B.x1;x+=g)for(var y=Math.ceil(B.y0/g)*g;y<=B.y1;y+=g){
    if(!C.holdsAll(sys,x,y)||C.onAnyLine(sys,x,y))continue;
    var d=Math.abs(x)+Math.abs(y);if(!best||d<best.d)best={x:x,y:y,d:d};
  }
  return best?{x:best.x,y:best.y}:null;
}
function blokSudut(Q,cs){
  var al=A(),g=(al.garisBatas?al.garisBatas(Q):[]),out=[],ada=function(P){return cs.some(function(c){return c.x===P.x&&c.y===P.y;});};
  g.forEach(function(q){
    var no=al.noGaris(Q,q),pts=[];
    if(q.b)pts.push({x:0,y:q.c/q.b});if(q.a)pts.push({x:q.c/q.a,y:0});
    if(pts.some(ada))out.push(blokPotongSumbu(q,no));
  });
  for(var i=0;i<g.length;i++)for(var j=i+1;j<g.length;j++){
    var P=C.inter(g[i],g[j]);
    if(P&&P.x>0&&P.y>0&&ada({x:Math.round(P.x*100)/100,y:Math.round(P.y*100)/100}))
      out=out.concat(blokEliminasi(g[i],al.noGaris(Q,g[i]),g[j],al.noGaris(Q,g[j])));
  }
  return out;
}

/* ---------- penyelesaian per varian: [langkah 1, langkah 2, langkah 3] ---------- */
var PENY={
'2Ma':function(Q){
  var St=Q.st,k=Q.sys[0],T=titikDekat(Q.sys,Q.pl)||St[1].cond.ok;
  return [blokDuaTitik(St[0].it[0]),null,[blokUji(k,T,'Uji titik')]];
},
'2Mb':function(Q){
  var St=Q.st,T=C.findInside(Q.sys,Q.pl);T={x:T.x,y:T.y};
  return [blokDuaTitik(St[0].it[0],'Garis (1)'),blokDuaTitik(St[1].it[0],'Garis (2)'),
    Q.sys.slice(0,2).map(function(q,i){return blokUji(q,T,'('+(i+1)+')');})];
},
'2Hr':function(Q){return PENY['2Mb'](Q);},
'2Ha':function(Q){
  var St=Q.st,T=A().tanda(St[1],'T'),j=St[0].it[0].key,q=Q.sys[j];
  var rina=Q.sys.map(function(r,i){return i===j?C.L(r.a,r.b,r.c,C.flipOp(r.op)):r;});
  return [rina.filter(function(r){return !(r.c===0&&(r.a===0||r.b===0));}).map(function(r){return blokUji(r,T,'Uji T');}),
    [{judul:'Ruas kiri di T'+ptTeks(T),tex:[lin(q.a,q.b)+' '+barisSub(q.a,q.b,T).br.join(' \\\\ ')]}],
    [blokUji(q,T,'Perbaikan')]];
},
'3Ha':function(Q){
  var St=Q.st,R=A().tanda(St[0],'rencana'),k1=Q.sys[0],k2=Q.sys[1],hasil=St[1].it[0].key,d=k1.a*R.x+k1.b*R.y;if(!d)return null;
  var per=hasil/d,p=per*k1.a,q=per*k1.b,T=per*k1.c;
  var u1=blokUji(C.L(p,q,T,k1.op),R,'Kendala (1)'),u2=blokUji(k2,R,'Kendala (2)');
  return [[u1,u2],[blokF({p:p,q:q},R,'Hasil penjualan rencana '+ptTeks(R))],blokEliminasi(k1,1,k2,2)];
},
'3Hb':function(Q){
  var al=A(),g=al.garisBatas(Q);
  return [g.map(function(q){return blokPotongSumbu(q,al.noGaris(Q,q));}),null,blokSudut(Q,Q.st[2].key)];
},
'3Hc':function(Q){
  var St=Q.st,R=A().tanda(St[0],'rencana'),k1=Q.sys[0],k2=Q.sys[1];
  var u=[blokUji(k1,R,'Kendala (1)'),blokUji(k2,R,'Kendala (2)')];
  var v1=k1.a*R.x+k1.b*R.y,pakai=St[2].it[0].key,f=v1?pakai/v1:1;
  return [u,u,[blokF({p:k1.a*f,q:k1.b*f},R,'Banyak yang terpakai untuk usul '+ptTeks(R))].map(function(b){b.tex[0]=b.tex[0].replace(/^f\([^&]*\)/,'\\text{terpakai} ');return b;})];
},
'4La':function(Q){
  var St=Q.st,al=A(),o={p:St[0].it[0].key,q:St[0].it[1].key};
  var T={x:+al.ambil(/^f\((\d+),/,St[2].it[0].lab,'0'),y:+al.ambil(/^f\(\d+, (\d+)\)/,St[2].it[0].lab,'0')};
  return [null,null,[blokF(o,T)]];
},
'4Ma':function(Q){return optimum(Q);},'4Mb':function(Q){return optimum(Q);},'4Mc':function(Q){return optimum(Q);},
'4Mg':function(Q){
  var St=Q.st,g=St[0].v.gs,o={p:g.p,q:g.q},cs=A().sudut(St[0]),best=St[0].cond.p[0];
  return [null,[blokF(o,best)],[blokFBanyak(o,cs)]];
},
'4Ha':function(Q){
  var al=A(),cs=al.sudut(Q.st[0]),fs=/f\(x, y\) = ([^<]+)<\/b>/.exec(Q.soal),o=al.koefLin(fs?fs[1]:'');
  return o?[null,null,[blokFBanyak(o,cs)]]:null;
},
'4Hb':function(Q){
  var al=A(),St=Q.st,o=al.koefDariSoal(Q),bx=al.tanda(St[0],'keputusan'),cs=al.sudut(St[0]);
  if(!o||!bx)return null;
  return [[blokF(o,bx,'Keuntungan dari keputusan '+ptTeks(bx))],[blokFBanyak(o,cs)],null];
},
'4Hc':function(Q){
  var al=A(),St=Q.st,o=al.koefDariSoal(Q),cs=al.sudut(St[0]),J=St[0].cond.p[0];
  var bx=cs.filter(function(P){return P.y===0&&P.x>0;})[0],pmin=St[1].it[0].key;
  if(!o||!bx||!J)return null;
  var dx=bx.x-J.x,qy=o.q*J.y;
  var syarat={judul:'Syarat '+ptTeks(bx)+' tidak kalah dari '+ptTeks(J),tex:[
    'f'+pt(bx)+' &\\ge f'+pt(J),
    tn(bx.x)+'p &\\ge '+tn(J.x)+'p + '+tn(o.q)+' \\cdot '+tk(J.y),
    tn(bx.x)+'p - '+tn(J.x)+'p &\\ge '+tn(qy),
    ex([[dx,'p']])+' &\\ge '+tn(qy)]};
  if(dx!==1)syarat.tex.push('p &\\ge '+tn(qy)+' \\div '+tk(dx)+' = '+tn(qy/dx));
  var oBaru={p:pmin,q:o.q};
  return [[blokFBanyak(o,cs)],[syarat],[blokF(oBaru,bx,'Untuk p = '+C.nm(pmin)),blokF(oBaru,J,'Untuk p = '+C.nm(pmin))]];
}
};
function optimum(Q){
  var St=Q.st,cs=St[0].key,vals=St[1].it.map(function(it){return it.key;}),o=A().koefDariNilai(cs,vals);
  return [blokSudut(Q,cs),o?[blokFBanyak(o,cs)]:null,null];
}

function langkah(Q,s){
  var f=PENY[Q.t+Q.l+(Q.v||'')];if(!f)return [];
  var semua=f(Q);if(!semua||!semua[s])return [];
  return semua[s].filter(function(b){return b&&b.tex&&b.tex.length;}).map(function(b){
    /* baris yang sama berturut-turut cukup ditulis sekali */
    var t=[];b.tex.forEach(function(x){var y=x.replace(/\\quad\\text\{[^}]*\}$/,'');if(!t.length||t[t.length-1].replace(/\\quad\\text\{[^}]*\}$/,'')!==y)t.push(x);});
    return {judul:b.judul,tex:t};
  });
}

/* teks cadangan bila KaTeX belum siap */
function polos(t){
  return t.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g,'($1)/($2)').replace(/\\text\{([^{}]*)\}/g,'$1')
    .replace(/\\le/g,'≤').replace(/\\ge/g,'≥').replace(/\\cdot/g,'·').replace(/\\div/g,':').replace(/\\times/g,'×')
    .replace(/\\Rightarrow/g,'⇒').replace(/\\lvert/g,'|').replace(/\\quad|\\ /g,' ').replace(/\{\.\}/g,'.').replace(/\{,\}/g,',')
    .replace(/_1/g,'₁').replace(/_2/g,'₂').replace(/&&|&/g,'').replace(/[{}]/g,'').replace(/-/g,'−').replace(/\s+/g,' ').trim();
}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function html(bl){
  return '<div class="penyelesaian"><b>📝 Penyelesaian</b>'+bl.map(function(b){
    var tex='\\begin{aligned}'+b.tex.join(' \\\\ ')+'\\end{aligned}';
    return '<div class="py-blok"><p>'+esc(b.judul)+'</p><div class="py-tex" data-tex="'+esc(tex)+'">'+b.tex.map(function(t){return esc(polos(t));}).join('<br>')+'</div></div>';
  }).join('')+'</div>';
}

/* uji mandiri: PL.Penyelesaian.uji() di konsol */
function uji(n){
  n=n||40;var lap=[],rng=C.mulberry32(2026);
  [2,3,4].forEach(function(t){['L','M','H'].forEach(function(l){C.variants(t,l,true).forEach(function(v){
    for(var i=0;i<n;i++){
      var Q=C.gen(t,l,rng,true,v);
      Q.st.forEach(function(St,s){
        try{langkah(Q,s).forEach(function(b){b.tex.forEach(function(x){if(/NaN|undefined|null|Infinity/.test(x))lap.push(t+l+v+' langkah '+(s+1)+' '+x);});});}
        catch(e){lap.push(t+l+v+' langkah '+(s+1)+' galat '+e.message);}
      });
    }
  });});});
  return lap.length?lap:'Semua penyelesaian aman.';
}

PL.Penyelesaian={langkah:langkah,html:html,uji:uji,PENY:PENY};
})(window.PL=window.PL||{});
