# Program Linear: dari Contoh Kontekstual ke Nilai Optimum

Media pembelajaran Matematika Kelas X (Fase E), terbagi menjadi dua halaman:

- **`index.html`** (halaman materi): tab **Belajar** dan **Latihan Mandiri**.
- **`kuis.html`** (halaman kuis): **Kuis** saja. Skor disetor ke Google Sheet lewat Google Apps Script.

Halaman materi tidak menautkan ke kuis, jadi guru membagikan tautan kuis sendiri saat kuis dimulai.

## Isi folder

```
media-nilai-optimum/
├── index.html            halaman MATERI: tab Belajar + Latihan Mandiri
├── kuis.html             halaman KUIS: tab Kuis saja
├── .nojekyll             berkas kosong; membuat GitHub Pages menyajikan file apa adanya
├── css/
│   └── gaya.css          seluruh tampilan, disusun dalam lapisan (@layer)
├── js/
│   ├── config.js         PENGATURAN: alamat server (ENDPOINT)  ← biasanya hanya file ini yang diubah
│   ├── core.js           CORE BERSAMA: pembangkit soal + penilai (harus sama dengan server/Code.gs)
│   ├── komponen.js       komponen bersama: bidang koordinat, maskot Plus, penampil langkah soal
│   ├── belajar-data.js   teks materi tab Belajar (Bagian 1 dan Bagian 2)
│   ├── belajar.js        perilaku tab Belajar
│   ├── latihan.js        perilaku tab Latihan Mandiri
│   ├── kuis.js           perilaku tab Kuis (masuk, simpan progres, kirim skor)
│   └── main.js           pengatur tab (dipakai kedua halaman)
└── server/
    └── Code.gs           SALINAN kode server; dipasang di Google Apps Script, BUKAN dijalankan GitHub
```

### Ingin mengubah sesuatu? Buka file ini

| Yang ingin diubah | File |
|---|---|
| Alamat server kuis | `js/config.js` |
| Menampilkan lagi tombol "Kuis ➜" di Latihan Mandiri | `css/gaya.css`, hapus baris `body[data-halaman="materi"] [data-aksi="ke-kuis"]` |
| Teks materi, contoh, Pertanyaan Diskusi | `js/belajar-data.js` |
| Tampilan yang hanya berlaku di satu mode | `css/gaya.css`, bagian `@layer mode` |
| Perilaku tombol atau alur satu tab | `js/belajar.js`, `js/latihan.js`, atau `js/kuis.js` |
| Soal, kunci, cara menilai | `js/core.js` **dan** `server/Code.gs` (lihat "Aturan penting") |

Setiap tab memakai wadahnya sendiri (`#tab-belajar`, `#tab-latihan`, `#tab-kuis`).
Mode aktif ditulis di `<body data-mode="belajar|latihan|kuis">`, jadi aturan khusus satu mode cukup ditulis seperti ini:

```css
@layer mode {
  body[data-mode="kuis"] .tab-view .kartu { border-left: 4px solid var(--amber); }
  #tab-kuis[data-tahap="masuk"] .plane { opacity: .6; }
}
```

## Menerbitkan di GitHub Pages (tanpa perintah terminal)

1. **Buat akun** di https://github.com (gratis), lalu masuk.
2. **Buat repositori baru.** Klik tombol **+** di kanan atas → **New repository**.
   - Repository name: misalnya `nilai-optimum` (huruf kecil, tanpa spasi).
   - Pilih **Public**. GitHub Pages gratis hanya untuk repositori publik.
   - Klik **Create repository**.
3. **Unggah file.** Di halaman repositori, klik **uploading an existing file**
   (atau **Add file → Upload files**).
   - Buka folder `media-nilai-optimum` di komputer, pilih **semua isinya**
     (`index.html`, `.nojekyll`, folder `css`, `js`, `server`, dan `README.md`),
     lalu seret ke halaman GitHub. Jangan menyeret folder induknya, agar `index.html` berada di akar repositori.
   - Bila `.nojekyll` tidak ikut (file berawalan titik kadang tersembunyi), buat sendiri:
     **Add file → Create new file**, beri nama `.nojekyll`, biarkan kosong, lalu **Commit**.
   - Klik **Commit changes**.
4. **Aktifkan Pages.** Buka **Settings** → **Pages** (menu kiri).
   - Source: **Deploy from a branch**.
   - Branch: **main**, folder **/ (root)** → **Save**.
5. **Tunggu 1–2 menit**, lalu muat ulang halaman Settings → Pages.
   Alamatnya muncul seperti `https://namaakun.github.io/nilai-optimum/`.
   - Materi: `https://namaakun.github.io/nilai-optimum/` (bisa juga `…/#latihan` untuk langsung ke Latihan Mandiri)
   - Kuis: `https://namaakun.github.io/nilai-optimum/kuis.html`

## Menghubungkan ke Google Sheet

1. Pasang `server/Code.gs` di Google Apps Script. Langkahnya tertulis di bagian atas file itu:
   buat Sheet baru → Ekstensi → Apps Script → tempel → jalankan `siapkan` → isi sheet Siswa →
   Deploy sebagai Aplikasi web (Jalankan sebagai: Saya; Akses: Siapa saja).
2. Salin URL yang berakhiran `/exec`.
3. Di GitHub, buka `js/config.js` → ikon **pensil (Edit)** → isi:
   ```js
   window.OPTIMUM_CONFIG={ENDPOINT:"https://script.google.com/macros/s/…/exec",MATERI:"optimum"};
   ```
   → **Commit changes**. Tunggu 1–2 menit.
4. Buka `kuis.html` di alamat GitHub Pages. Harus muncul
   **"✔ Halaman dan server cocok (versi 2026-10-30.1)"**.

Bila `ENDPOINT` dikosongkan, Kuis berjalan dalam **mode uji**: bisa dikerjakan, tetapi skor tidak disetor.

## Memeriksa bahwa halaman dan server sama

Ada tiga cara, dan ketiganya harus menunjukkan kode yang sama, misalnya `2026-10-30.1:ca2c254e`:

- Di editor Apps Script, jalankan `ujiCek`, lalu lihat Log.
- Buka URL `/exec` di peramban, lalu lihat nilai `"cek"`.
- Di halaman siswa, tekan F12 → Console, lalu ketik `__api.CORE.cek()`.

## Aturan penting

- **`js/core.js` dan blok "CORE BERSAMA" di `server/Code.gs` harus persis sama.**
  Jika salah satu diubah, salin perubahan ke yang lain, terbitkan versi baru Apps Script
  (Deploy → Kelola penerapan → pensil → Versi baru → Terapkan), lalu unggah `core.js` ke GitHub.
  Lakukan sebelum kuis dimulai: siswa yang sedang mengerjakan dengan versi lama tidak dapat melanjutkan.
- **Setiap memperbarui file di GitHub, naikkan penanda versi** di `index.html` **dan** `kuis.html`
  (misalnya `?v=2026-11-01.1` → `?v=2026-11-05.1` pada semua baris `<link>` dan `<script>`).
  Tanpa ini, peramban siswa bisa tetap memakai salinan lama.
  Cara cepat di GitHub: buka `index.html` → pensil → tekan Ctrl+F untuk mencari `?v=` → ubah semuanya → Commit.
- Urutan `<script>` jangan diubah:
  - `index.html`: `config → core → komponen → petunjuk → belajar-data → belajar → latihan → main`
  - `kuis.html`: `config → core → komponen → kuis → main`
- Repositori bersifat publik, jadi isi `server/Code.gs` dapat dibaca orang lain. Ini aman:
  kunci rahasia server dibuat otomatis dan disimpan di Script Properties, bukan di file.
  Daftar siswa dan PIN hanya ada di Google Sheet.

## Mencoba di komputer sendiri

Klik dua kali `index.html` (materi) atau `kuis.html` (kuis). Keduanya berjalan langsung dari folder tanpa server.
Rumus KaTeX memerlukan internet; tanpa internet, rumus tampil sebagai teks biasa.
