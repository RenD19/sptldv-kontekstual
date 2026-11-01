/* ==========================================================================
   Saran.gs · PENERIMA KRITIK & SARAN (Google Apps Script)
   TERPISAH dari kuis: dipasang di spreadsheet baru dengan proyek Apps Script sendiri,
   sehingga data kritik/saran tidak bercampur dengan data kuis (Code.gs tidak berubah).

   CARA MEMASANG
   1. Buat Google Sheet baru, misalnya "Kritik dan Saran SPtLDV".
   2. Di Sheet itu: Ekstensi → Apps Script. Hapus isi Code.gs bawaan, tempel seluruh file ini.
   3. Pilih fungsi siapkan() → Jalankan (sekali). Izinkan akses bila diminta.
      Sheet "Saran" dibuat otomatis dengan judul kolom.
   4. Deploy → Penerapan baru → jenis: Aplikasi web.
        Jalankan sebagai : Saya
        Yang memiliki akses : Siapa saja
      Salin URL yang berakhiran /exec.
   5. Tempel URL itu di js/config.js → SARAN_ENDPOINT (BUKAN di ENDPOINT kuis).
   6. Uji: buka URL /exec di peramban → harus tampil {"ok":true,"layanan":"saran",...}.

   SETIAP mengubah kode di sini: Deploy → Kelola penerapan → ikon pensil →
   Versi: Versi baru → Terapkan (URL tetap sama).

   SHEET YANG DIISI
   Saran : waktu, nama ("anonim" bila kosong), kritik_saran
   ========================================================================== */

var KONFIG_SARAN={
  ID_SPREADSHEET:'',     /* kosongkan bila skrip dibuat dari dalam Google Sheet */
  NAMA_SHEET:'Saran',
  MAKS_NAMA:60,
  MAKS_ISI:1000,
  MAKS_PER_MENIT:30      /* batas kiriman per menit dari semua pengguna (pengaman dari spam) */
};
var HDR_SARAN=['waktu','nama','kritik_saran'];

function bukuSaran(){return KONFIG_SARAN.ID_SPREADSHEET?SpreadsheetApp.openById(KONFIG_SARAN.ID_SPREADSHEET):SpreadsheetApp.getActiveSpreadsheet();}

/* Jalankan SEKALI dari editor: membuat sheet "Saran" beserta judul kolom. Aman dijalankan ulang. */
function siapkan(){
  var b=bukuSaran(),sh=b.getSheetByName(KONFIG_SARAN.NAMA_SHEET)||b.insertSheet(KONFIG_SARAN.NAMA_SHEET);
  if(sh.getLastRow()===0){
    sh.getRange(1,1,1,HDR_SARAN.length).setValues([HDR_SARAN]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1,150);sh.setColumnWidth(2,160);sh.setColumnWidth(3,520);
    sh.getRange('C:C').setWrap(true);
  }
}

function jawab(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}

function doGet(){return jawab({ok:true,layanan:'saran'});}

/* teks bersih: tanpa karakter kendali, dipotong, dan tidak dibaca sebagai rumus oleh Sheet */
function bersih(s,maks){
  s=String(s==null?'':s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').trim().slice(0,maks);
  if(/^[=+\-@]/.test(s))s="'"+s;
  return s;
}

function doPost(e){
  try{
    var d=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
    if(d.action!=='saran')return jawab({ok:false,pesan:'Permintaan tidak dikenal.'});
    var isi=bersih(d.isi,KONFIG_SARAN.MAKS_ISI),nama=bersih(d.nama,KONFIG_SARAN.MAKS_NAMA)||'anonim';
    if(isi.replace(/^'/,'').length<3)return jawab({ok:false,pesan:'Kritik/saran belum diisi.'});

    /* pengaman spam sederhana: hitung kiriman per menit */
    var cache=CacheService.getScriptCache(),kunci='saran-'+Math.floor(Date.now()/60000),n=+(cache.get(kunci)||0);
    if(n>=KONFIG_SARAN.MAKS_PER_MENIT)return jawab({ok:false,pesan:'Server sedang sibuk. Coba lagi sebentar lagi.'});
    cache.put(kunci,String(n+1),120);

    var kunciTulis=LockService.getScriptLock();
    kunciTulis.waitLock(10000);
    try{
      var sh=bukuSaran().getSheetByName(KONFIG_SARAN.NAMA_SHEET);
      if(!sh){siapkan();sh=bukuSaran().getSheetByName(KONFIG_SARAN.NAMA_SHEET);}
      sh.appendRow([Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyy-MM-dd HH:mm:ss'),nama,isi]);
    }finally{kunciTulis.releaseLock();}
    return jawab({ok:true});
  }catch(err){
    return jawab({ok:false,pesan:'Gagal menyimpan. Coba lagi.'});
  }
}
