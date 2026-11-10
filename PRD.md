# PRD Website RAFA GO – Rental Sepeda Per Jam

**Versi 1.1 · 8 November 2026 · Penyusun: Alfandi Riyanda (developer) · Status: Final — semua pertanyaan terbuka dijawab, rilis bertahap (V1 30 hari)**

## 1. Ringkasan Eksekutif

RAFA GO adalah bisnis rental sepeda dengan tarif per jam. Website RAFA GO menggantikan pencatatan manual (chat WhatsApp, buku catatan, transfer tanpa pelacakan) dengan satu sistem terpadu: katalog sepeda, pemesanan online dan walk-in, pembayaran manual dengan bukti transfer, pelacakan sepeda lewat QR Code + GPS saat dipindai, dokumentasi kondisi sepeda, serta dashboard untuk admin dan owner.

Keputusan produk paling penting dalam dokumen ini: **semua halaman untuk konsumen dibuat tanpa login**. Konsumen cukup mengisi nama dan nomor WhatsApp saat memesan, lalu mengakses pesanannya lewat kode booking dan tautan unik. Login (Supabase Authentication) hanya dipakai untuk **admin dan owner** di dashboard.

**Pembayaran bersifat manual**: website menampilkan nomor rekening dan/atau QRIS milik owner. Konsumen membayar di luar website, lalu mengisi data pengirim (nama bank/e-wallet, nama pemilik akun) dan mengunggah bukti pembayaran. Admin memverifikasi dan menyetujui atau menolak. Tidak ada payment gateway pada rilis ini.

Rilis bertahap: **V1** (fitur inti: katalog, pemesanan, pembayaran, dashboard inti) dalam 30 hari; **V2** (fitur lengkap) menyusul. Budget gratis (Supabase Free, Vercel Free) di luar VPS dan domain. Teknologi: Supabase (Auth, PostgreSQL, Storage, RLS), website responsif berbasis PWA.

## 2. Latar Belakang dan Masalah

| Masalah saat ini | Dampak |
| --- | --- |
| Pemesanan lewat chat, jadwal dicatat manual | Double booking, jadwal bentrok, sulit tahu sepeda mana kosong |
| Bukti transfer dikirim ke chat pribadi | Sulit dicocokkan dengan pesanan, rawan terlewat atau dipalsukan |
| Tidak ada catatan kondisi sepeda sebelum dan sesudah sewa | Sengketa kerusakan tidak bisa dibuktikan |
| Sepeda yang dibawa keluar tidak termonitor | Risiko hilang atau tidak dikembalikan |
| Durasi, denda keterlambatan, dan pendapatan dihitung manual | Salah hitung dan laporan lambat |
| Konsumen harus daftar akun untuk hal sederhana | Gesekan tinggi, calon penyewa batal |

## 3. Tujuan, Non-Tujuan, dan Metrik Sukses

### 3.1 Tujuan

1. Konsumen dapat memesan sepeda dan mengirim bukti bayar dari HP dalam kurang dari 3 menit tanpa membuat akun.
2. Tidak ada double booking pada sepeda yang sama dan jam yang bertumpuk.
3. Setiap sepeda yang sedang disewa dapat ditautkan ke penyewanya, lengkap dengan bukti kondisi dan titik lokasi saat QR dipindai.
4. Admin dapat memverifikasi pembayaran dan memproses pengambilan atau pengembalian dari satu dashboard.
5. Owner mendapat laporan pendapatan, performa sepeda, dan keterlambatan secara akurat dan dapat diekspor.

### 3.2 Non-Tujuan (rilis ini)

- Payment gateway atau verifikasi pembayaran otomatis (Midtrans, Xendit, dsb.).
- Pelacakan GPS real-time atau pemasangan perangkat GPS pada sepeda.
- Aplikasi native Android/iOS (PWA sudah cukup).
- Akun konsumen, poin loyalitas, atau sistem voucher.
- Fitur AI agent (dibahas terpisah).

### 3.3 Metrik Sukses (target 3 bulan setelah rilis, dapat disesuaikan dengan owner)

| Metrik | Target | Cara ukur |
| --- | --- | --- |
| Konversi kunjungan katalog → pesanan dibuat | ≥ 8% | Analytics + tabel pesanan |
| Pesanan online yang sampai upload bukti bayar | ≥ 80% | Status pesanan |
| Waktu verifikasi pembayaran oleh admin (jam operasional) | ≤ 15 menit (median) | Selisih waktu upload dan keputusan |
| Insiden double booking | 0 | Audit log, laporan admin |
| Pesanan walk-in tercatat di sistem | 100% | Perbandingan buku kas vs sistem |
| Pengembalian dengan foto kondisi lengkap | ≥ 95% | Tabel dokumentasi |
| Skor performa mobile (Lighthouse) | ≥ 85 | Pengujian berkala |

## 4. Persona

**Konsumen (tanpa login)** – wisatawan atau warga lokal, 15–45 tahun, memakai HP, sering lewat Instagram/WhatsApp. Ingin tahu harga, sepeda tersedia atau tidak, dan cara bayar yang jelas. Tidak mau daftar akun.

**Admin** – staf operasional di lokasi rental. Melayani walk-in, memverifikasi bukti bayar, menyerahkan dan menerima sepeda, memotret kondisi sepeda. Memakai HP atau laptop di konter.

**Owner** – pemilik bisnis. Memantau pendapatan, performa sepeda, aktivitas admin, dan lokasi hasil pemindaian QR. Mengatur harga, rekening/QRIS, kebijakan, dan akun admin.

## 5. Keputusan Produk dan Kebijakan Operasional

| Topik | Keputusan |
| --- | --- |
| Akses konsumen | **Tanpa login.** Identitas dasar: nama + nomor WhatsApp. Akses pesanan lewat kode booking + nomor WhatsApp atau tautan unik |
| Akses dashboard | Login admin/owner via Supabase Auth, role: `owner` dan `admin` |
| Durasi sewa | Fleksibel per jam; durasi minimum dan aturan pembulatan diatur owner |
| Pembayaran | Penuh di awal. Metode: transfer bank, e-wallet, QRIS (ke rekening/QRIS owner), tunai di tempat |
| Bukti pembayaran | Konsumen mengisi data pengirim + unggah bukti; admin memverifikasi manual |
| Dokumentasi identitas | Opsional (diatur owner apakah ditawarkan atau tidak) |
| Pemesanan | Online dan walk-in; satu transaksi boleh banyak sepeda |
| Pelacakan | QR Code unik per sepeda + GPS hanya saat QR dipindai (bukan real-time) |
| Database | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Zona waktu | Asia/Jakarta (WIB); data waktu disimpan sebagai `timestamptz` |
| Bahasa | Indonesia (struktur teks siap untuk multi-bahasa di masa depan) |

## 6. Ruang Lingkup

### 6.1 Dalam Lingkup

Seluruh 17 modul pada daftar fitur RAFA GO, dengan penyesuaian akibat keputusan tanpa login: modul **Dashboard Konsumen** menjadi halaman **Cek Pesanan** (tanpa akun), dan fitur **Edit Profil, Akun Konsumen, serta Notifikasi di akun konsumen** diganti oleh data kontak per pesanan dan notifikasi via WhatsApp (lihat bagian 8 dan 9).

### 6.2 Di Luar Lingkup

Payment gateway, refund otomatis, pelacakan GPS kontinu, integrasi WhatsApp API berbayar (diputuskan di bagian Pertanyaan Terbuka), multi-cabang, aplikasi native, program loyalitas.

## 7. Alur Utama

### 7.1 Pemesanan Online (konsumen)

1. Konsumen membuka katalog → memilih satu atau beberapa sepeda → mengisi tanggal, jam mulai, dan durasi.
2. Sistem mengecek ketersediaan, menghitung total, dan menampilkan ringkasan.
3. Konsumen mengisi nama dan nomor WhatsApp (opsional: email, catatan), menyetujui syarat sewa, lulus pengecekan anti-bot → pesanan dibuat dengan **kode booking** dan status *Menunggu Pembayaran*. Slot sepeda ditahan selama batas waktu bayar.
4. Halaman pembayaran menampilkan nominal, rekening/QRIS owner, dan batas waktu. Konsumen membayar, mengisi data pengirim, mengunggah bukti → status *Menunggu Verifikasi*.
5. Admin menyetujui → status *Terkonfirmasi* (invoice tersedia, tautan pesanan dikirim ke WhatsApp konsumen). Jika ditolak, konsumen diminta mengunggah ulang dengan alasan penolakan terlihat.
6. Konsumen datang, admin memeriksa dan memotret kondisi sepeda, mencatat waktu mulai → *Sedang Disewa*.
7. Selama sewa, konsumen memindai QR di sepeda (jika diminta atau sesuai aturan) → lokasi tercatat.
8. Saat kembali, admin memeriksa kondisi, memotret, menghitung biaya akhir dan denda → *Selesai*.

### 7.2 Walk-in (admin)

Admin membuat pesanan di dashboard (pilih sepeda, durasi, nama + WhatsApp konsumen), mencatat pembayaran (tunai, atau transfer/QRIS dengan bukti), langsung memulai sesi sewa. Kode booking dan invoice tetap dibuat.

### 7.3 Perpanjangan

Konsumen membuka Cek Pesanan → Perpanjang → memilih tambahan jam → sistem memeriksa ketersediaan setelah jam berakhir → pembayaran tambahan (alur sama seperti 7.1 langkah 4–5) atau admin mencatat tunai di tempat.

## 8. Kebutuhan Fungsional – Sisi Konsumen (Tanpa Login)

### 8.1 Landing Page

- **LP-01** Navbar sticky dengan menu: Beranda, Katalog, Cara Sewa, Harga, FAQ, Lokasi, Cek Pesanan; tombol WhatsApp melayang.
- **LP-02** Hero dengan CTA utama "Sewa Sekarang" ke katalog dan CTA sekunder "Cek Pesanan".
- **LP-03** Seksi: Tentang RAFA GO, Keunggulan, Katalog Unggulan (sepeda berlabel populer/terbaru), Cara Menyewa (langkah bergambar), Harga dan Tarif, Galeri, Testimoni, FAQ, Lokasi (peta + jam operasional), Kontak, Footer.
- **LP-04** Seluruh konten (teks, gambar galeri, testimoni, FAQ, harga ringkas) diambil dari pengaturan website sehingga owner dapat mengubahnya tanpa developer.
- **LP-05** Meta tag SEO, Open Graph, schema.org `LocalBusiness`, sitemap, dan robots.
- **LP-06** Indikator "Buka/Tutup sekarang" berdasarkan jam operasional.

### 8.2 Katalog dan Detail Sepeda

- **KAT-01** Daftar sepeda berupa kartu: foto utama, nama, kategori, harga per jam, status ketersediaan, label Populer/Terbaru.
- **KAT-02** Pencarian berdasarkan nama atau kategori (debounce, hasil < 500 ms).
- **KAT-03** Filter: kategori, rentang harga per jam, ketersediaan (tersedia sekarang / tersedia pada tanggal dan jam tertentu).
- **KAT-04** Detail sepeda: galeri foto (swipe + zoom), spesifikasi, deskripsi, harga per jam, status, rekomendasi sepeda serupa, tombol "Sewa Sepeda Ini".
- **KAT-05** Status ketersediaan: *Tersedia*, *Sedang Disewa*, *Dipesan*, *Perawatan*. Sepeda berstatus perawatan atau nonaktif tidak dapat dipesan.
- **KAT-06** Rekomendasi: sepeda sekategori yang tersedia pada waktu yang sama; urutan berdasarkan popularitas.

### 8.3 Pemesanan

- **BKG-01** Keranjang sewa (disimpan di browser) berisi satu atau lebih sepeda; setiap sepeda memakai tanggal, jam mulai, dan durasi yang sama dalam satu transaksi.
- **BKG-02** Input tanggal (tidak boleh lampau), jam mulai (dalam jam operasional), durasi (kelipatan sesuai pengaturan, minimum sesuai pengaturan).
- **BKG-03** Durasi selesai dan total biaya dihitung otomatis dan tampil langsung saat input berubah.
- **BKG-04** Cek ketersediaan sebelum submit dan sekali lagi di server saat pesanan dibuat; jika ada yang bentrok, tampilkan sepeda mana yang tidak tersedia dan sarankan alternatif.
- **BKG-05** Validasi: jam mulai + durasi tidak melewati jam tutup; maksimum sepeda per transaksi (pengaturan, default 10); maksimum 3 pesanan *Menunggu Pembayaran* aktif per nomor WhatsApp.
- **BKG-06** Data konsumen: nama lengkap (wajib), nomor WhatsApp (wajib, format +62), email (opsional), catatan (opsional), persetujuan syarat dan ketentuan sewa (wajib).
- **BKG-07** Perlindungan penyalahgunaan: Cloudflare Turnstile (atau hCaptcha), rate limit per IP, honeypot field.
- **BKG-08** Ringkasan pesanan sebelum konfirmasi: daftar sepeda, tanggal, jam mulai–selesai, durasi, rincian harga, total.
- **BKG-09** Kode booking otomatis format `RG-YYMMDD-XXXX` (4 karakter alfanumerik tanpa karakter ambigu seperti 0/O/1/I), unik.
- **BKG-10** Slot ditahan selama batas waktu bayar (**30 menit**). Jika tidak ada bukti bayar sampai batas, status menjadi *Kedaluwarsa* dan slot dilepas otomatis.
- **BKG-11** Pembatalan oleh konsumen dari halaman Cek Pesanan, sesuai kebijakan pembatalan (bagian 10.4). Pembatalan setelah pembayaran disetujui menjadi *Permintaan Pembatalan* yang diproses admin.

### 8.4 Pembayaran (Manual: Rekening/QRIS Owner + Bukti)

- **PAY-01** Halaman pembayaran menampilkan: kode booking, total yang harus dibayar, hitung mundur batas waktu, dan metode pembayaran aktif.
- **PAY-02** Informasi tujuan bayar diambil dari pengaturan owner: satu atau lebih rekening (nama bank, nomor rekening, atas nama) dengan tombol **Salin**, dan **gambar QRIS** (tombol perbesar dan unduh). Owner dapat mengaktifkan atau menonaktifkan tiap metode.
- **PAY-03** Pilihan metode oleh konsumen: Transfer Bank, E-Wallet, QRIS, atau Tunai di Tempat.
- **PAY-04** Formulir data pembayaran konsumen (untuk non-tunai):
  - Nama bank atau e-wallet pengirim (daftar pilihan: BCA, BRI, BNI, Mandiri, BSI, CIMB, Jago, SeaBank, DANA, OVO, GoPay, ShopeePay, LinkAja, Lainnya + isian bebas).
  - Nama pemilik rekening/akun pengirim (wajib).
  - Nomor rekening atau nomor HP e-wallet pengirim (opsional; disarankan cukup 4 digit terakhir demi privasi).
  - Nominal yang dikirim (terisi otomatis, bisa diubah jika berbeda).
  - Tanggal dan jam transfer (wajib).
  - Catatan (opsional).
- **PAY-05** Unggah bukti pembayaran: JPG/PNG/WebP/HEIC, maksimum 5 MB, kompresi sisi klien, pratinjau sebelum kirim, bisa ambil foto langsung dari kamera HP. Bukti disimpan di bucket privat.
- **PAY-06** Setelah kirim, status pembayaran *Menunggu Verifikasi*; konsumen melihat pesan konfirmasi dan estimasi waktu verifikasi (sesuai jam operasional).
- **PAY-07** Jika **ditolak**, halaman menampilkan alasan penolakan dan formulir unggah ulang; batas waktu bayar diperpanjang satu kali sesuai pengaturan (default 30 menit).
- **PAY-08** Tunai di tempat: tidak ada unggah bukti. Pesanan berstatus *Menunggu Pembayaran Tunai*; slot ditahan sampai jam mulai + toleransi (default 30 menit). Pembayaran dicatat admin sebelum sepeda diserahkan (kebijakan bayar penuh di awal tetap berlaku).
- **PAY-09** Invoice dapat dilihat dan diunduh (PDF) setelah pembayaran disetujui; berisi kode booking, rincian sepeda, durasi, total, metode, status lunas.
- **PAY-10** Riwayat pembayaran per pesanan (termasuk perpanjangan, denda, penolakan) tampil di Cek Pesanan.
- **PAY-11** Opsional (diputuskan owner): **kode unik** 1–999 ditambahkan ke nominal agar mudah dicocokkan di mutasi rekening.

### 8.5 Cek Pesanan (Pengganti Dashboard Konsumen)

- **CEK-01** Akses lewat: (a) tautan unik `/pesanan/{token}` yang dikirim ke WhatsApp dan ditampilkan setelah pemesanan, atau (b) formulir kode booking + nomor WhatsApp. Token berupa string acak minimal 128 bit.
- **CEK-02** Percobaan lookup dibatasi (5 kali per 15 menit per IP dan per kode booking); pesan galat tidak membocorkan apakah kode ada.
- **CEK-03** Peramban menyimpan daftar kode booking milik perangkat ini (localStorage) agar konsumen bisa membuka lagi pesanan tanpa mengetik ulang; ada tombol "Hapus dari perangkat ini".
- **CEK-04** Isi halaman: status pesanan dan status pembayaran, detail sepeda, waktu mulai dan berakhir, **sisa waktu sewa** (hitung mundur), total biaya, invoice, riwayat pembayaran.
- **CEK-05** Tindakan sesuai status: unggah bukti/unggah ulang, batalkan, perpanjang, tampilkan QR sepeda (untuk dipindai), unggah dokumentasi (8.7), hubungi admin via WhatsApp (pesan terisi otomatis dengan kode booking).
- **CEK-06** Halaman diperbarui otomatis (polling atau Supabase Realtime) saat status berubah.
- **CEK-07** Notifikasi ke konsumen dikirim lewat WhatsApp (tautan `wa.me` terisi otomatis oleh admin atau, jika owner memilih, WhatsApp API); opsional web push dengan izin konsumen.

### 8.6 QR Code dan Pemindaian

- **QR-01** Setiap sepeda memiliki QR Code unik berisi URL `/s/{qr_token}`; token acak, bukan ID sepeda yang mudah ditebak.
- **QR-02** Saat QR dipindai dengan kamera HP, halaman `/s/{qr_token}` terbuka tanpa instalasi aplikasi.
- **QR-03** Sistem mengenali sepeda dari token dan memeriksa apakah sepeda sedang disewa (*Sedang Disewa*).
- **QR-04** Validasi penyewa aktif: konsumen memasukkan kode booking (otomatis terisi bila perangkat menyimpannya) dan sistem memastikan kode itu mencakup sepeda ini dan sesi sewa sedang aktif.
- **QR-05** Jika valid, halaman meminta izin lokasi GPS dengan penjelasan tujuan. Saat diizinkan, sistem menyimpan: koordinat, akurasi (meter), waktu scan di server, id pesanan dan sepeda, serta status izin (`granted`).
- **QR-06** Jika izin ditolak, tidak tersedia, atau akurasi lebih dari 100 m, scan tetap dicatat dengan status izin (`denied`/`unavailable`/`low_accuracy`) dan terlihat oleh admin/owner.
- **QR-07** Jika sepeda tidak sedang disewa atau kode tidak cocok, halaman hanya menampilkan info publik sepeda dan percobaan dicatat sebagai *tidak tervalidasi* (tanpa menyimpan lokasi).
- **QR-08** Pemindaian bukan pelacakan real-time: lokasi hanya diketahui pada saat scan. Teks pada halaman scan harus menyatakan hal ini dengan jelas.
- **QR-09** Admin dapat memicu "permintaan scan" (pesan WhatsApp ke penyewa berisi tautan scan) bila perlu mengetahui lokasi sepeda.

### 8.7 Dokumentasi Konsumen dan Kondisi Sepeda

- **DOK-01** Jenis dokumentasi: foto konsumen, identitas konsumen (opsional, bila diaktifkan owner), foto kondisi sebelum sewa, foto kondisi setelah sewa/pengembalian.
- **DOK-02** Unggah dilakukan oleh admin di dashboard (utama) atau oleh konsumen lewat Cek Pesanan di HP; jumlah foto minimum per tahap diatur owner (default: 4 foto sepeda sebelum dan sesudah).
- **DOK-03** Setiap berkas dicatat: pesanan, sepeda, tahap, pengunggah (admin/konsumen), waktu, catatan.
- **DOK-04** Foto disimpan di bucket **privat**; akses hanya melalui signed URL berumur pendek (≤ 60 detik) untuk admin/owner. Konsumen hanya melihat foto miliknya sendiri pada pesanan terkait.
- **DOK-05** Metadata EXIF (termasuk GPS) dibuang pada saat unggah; gambar dikompresi (maks sisi terpanjang 1600 px).
- **DOK-06** Identitas konsumen bersifat opsional: konsumen dapat menolak tanpa menghalangi pemesanan, kecuali owner mengatur lain (lihat Pertanyaan Terbuka). Ada pernyataan persetujuan pemrosesan data pribadi dan masa simpan.
- **DOK-07** Galeri dokumentasi per transaksi (sebelum vs sesudah berdampingan) dan riwayat dokumentasi per sepeda untuk admin/owner.

## 9. Kebutuhan Fungsional – Dashboard Admin dan Owner (Wajib Login)

Dashboard berada di jalur terpisah (`/dashboard`), responsif untuk HP dan laptop. Seluruh tindakan yang mengubah data dicatat di audit log.

### 9.1 Ringkasan Dashboard

- **DSH-01** Kartu statistik periode terpilih (hari ini, 7 hari, 30 hari, kustom): jumlah pesanan, penyewaan aktif, pendapatan, transaksi, konsumen unik, sepeda tersedia/disewa/perawatan.
- **DSH-02** Daftar *Perlu Tindakan*: pembayaran menunggu verifikasi, sewa hampir habis, sewa terlambat, pesanan akan mulai dalam 1 jam, perawatan jatuh tempo.
- **DSH-03** Pemesanan terbaru, aktivitas terbaru, dan **kalender penyewaan** (tampilan hari/minggu per sepeda; klik blok membuka detail pesanan).
- **DSH-04** Pembaruan real-time (Supabase Realtime) untuk pesanan baru dan bukti bayar baru, disertai bunyi/indikator opsional.

### 9.2 Manajemen Sepeda dan Kategori

- **SPD-01** CRUD sepeda: nama, kategori, nomor identifikasi unik (kode sepeda), deskripsi, spesifikasi (daftar kunci–nilai), harga sewa per jam, label (populer/terbaru, otomatis atau manual), status operasional.
- **SPD-02** Unggah dan kelola galeri foto (urutan, foto utama, hapus). Kompresi dan konversi WebP otomatis.
- **SPD-03** CRUD kategori sepeda (nama, urutan, ikon).
- **SPD-04** Hapus sepeda memakai *soft delete*; sepeda yang punya riwayat sewa tidak dapat dihapus permanen, hanya dinonaktifkan.
- **SPD-05** Status operasional: *Aktif*, *Perawatan*, *Nonaktif*. Status *Disewa/Dipesan* diturunkan dari data pesanan, bukan diisi manual.
- **SPD-06** QR Code: generate otomatis saat sepeda dibuat, **unduh** (PNG/SVG), **cetak** (lembar stiker berisi nama + kode sepeda), **regenerasi** (token lama langsung tidak berlaku), **nonaktifkan**.
- **SPD-07** Riwayat penyewaan dan riwayat perawatan per sepeda.

### 9.3 Manajemen Pemesanan dan Verifikasi Pembayaran

- **ORD-01** Daftar pesanan dengan pencarian (kode booking, nama, WhatsApp) dan filter (tanggal, status pesanan, status pembayaran, sepeda).
- **ORD-02** Detail pesanan: data konsumen, item sepeda, jadwal, rincian biaya, riwayat status, pembayaran, dokumentasi, scan QR, catatan internal.
- **ORD-03** Buat pesanan walk-in dengan validasi ketersediaan yang sama seperti online.
- **ORD-04** Ubah jadwal, tambah/kurangi sepeda, batalkan pesanan (wajib alasan) selama belum *Sedang Disewa*; setiap perubahan menghitung ulang total dan mencatat selisih.
- **VER-01** Antrean verifikasi: pesanan dengan bukti baru, diurutkan dari yang terlama; menampilkan bukti pembayaran ukuran penuh dengan zoom, data pengirim yang diisi konsumen, nominal yang seharusnya vs yang dikirim, dan waktu unggah.
- **VER-02** **Setujui**: status pembayaran *Disetujui*, pesanan *Terkonfirmasi*, invoice dibuat, admin dapat langsung mengirim tautan pesanan via WhatsApp.
- **VER-03** **Tolak**: wajib memilih alasan (nominal tidak sesuai, bukti tidak terbaca, bukti tidak valid, lainnya) + catatan; konsumen dapat mengunggah ulang.
- **VER-04** Peringatan otomatis: nominal berbeda dari tagihan, bukti diunggah setelah batas waktu, dua pesanan memakai berkas yang sama (hash berkas identik).
- **VER-05** Admin dapat menandai pembayaran *Lunas Tunai* dan mencatat jumlah diterima; sistem menghitung kembalian.
- **VER-06** Pencatatan pengembalian dana (refund) manual: nominal, metode, catatan, dan bukti transfer admin.

### 9.4 Penyewaan dan Pengembalian

- **RNT-01** **Konfirmasi pengambilan**: admin memastikan pembayaran lunas, memeriksa kondisi sepeda, mengambil foto sebelum sewa (DOK-02), dan menekan *Mulai Sewa*; waktu mulai tercatat otomatis (dapat dikoreksi dengan alasan).
- **RNT-02** Durasi berjalan dan sisa waktu tampil real-time untuk setiap sesi aktif; peringatan visual saat sisa waktu ≤ 15 menit dan saat terlambat.
- **RNT-03** **Perpanjangan** oleh admin atau permintaan konsumen: cek ketersediaan, hitung biaya tambahan, catat pembayaran.
- **RNT-04** **Pengembalian**: catat waktu pengembalian aktual, periksa kondisi (baik / lecet ringan / rusak, catatan), ambil foto, hitung biaya akhir (sewa + denda keterlambatan + biaya kerusakan bila ada), tampilkan selisih yang harus dibayar atau dikembalikan.
- **RNT-05** Konfirmasi pengembalian dan **selesaikan transaksi**; sepeda otomatis kembali *Tersedia*, atau *Perawatan* bila kondisi rusak.
- **RNT-06** Pengembalian sebagian: satu transaksi banyak sepeda dapat dikembalikan satu per satu; transaksi selesai saat semua sepeda kembali.

### 9.5 Manajemen Konsumen

Karena konsumen tidak punya akun, data konsumen dibentuk dari pesanan dan digabungkan berdasarkan nomor WhatsApp yang dinormalisasi (format +62).

- **CUS-01** Daftar dan detail konsumen: nama, WhatsApp, email, jumlah dan riwayat pesanan, penyewaan, pembayaran, dokumentasi.
- **CUS-02** Tambah dan ubah data konsumen manual (untuk walk-in), gabungkan data ganda.
- **CUS-03** Status konsumen: *Aktif* atau *Diblokir* (nonaktifkan). Konsumen berstatus Diblokir ditolak saat memesan online dengan pesan netral; alasan hanya terlihat internal.
- **CUS-04** Hapus data konsumen mengikuti kebijakan retensi (bagian 12.5); data transaksi dianonimkan agar laporan keuangan tetap utuh.

### 9.6 Perawatan Sepeda

- **MNT-01** Tambah jadwal atau catatan perawatan (jenis, tanggal, teknisi, biaya, deskripsi kerusakan, foto kerusakan).
- **MNT-02** Status perawatan: *Dijadwalkan*, *Dikerjakan*, *Selesai*. Sepeda berstatus *Dikerjakan* otomatis tidak dapat dipesan dan memblokir kalender.
- **MNT-03** Pengingat perawatan berkala berdasarkan interval (hari atau total jam sewa) per sepeda.
- **MNT-04** Daftar sepeda dalam perawatan, riwayat perbaikan, total biaya perawatan per sepeda.
- **MNT-05** Aktivasi kembali sepeda setelah perawatan selesai (admin memilih foto kondisi akhir).
- **MNT-06** Peringatan jika perawatan terjadwal bentrok dengan pesanan yang sudah terkonfirmasi.

### 9.7 Tracking Center (Admin dan Owner)

- **TRK-01** Peta dengan titik hasil pemindaian terakhir per sepeda yang sedang disewa; klik titik menampilkan waktu, akurasi, penyewa, kode booking.
- **TRK-02** Daftar riwayat scan (filter sepeda, pesanan, tanggal, status izin lokasi, tervalidasi/tidak).
- **TRK-03** Detail aktivitas: jejak titik-titik scan berurutan per sesi sewa (garis putus-putus, bukan rute jalan).
- **TRK-04** Indikator status izin lokasi dan akurasi (hijau ≤ 30 m, kuning 30–100 m, abu-abu tidak tersedia).
- **TRK-05** Sepeda berstatus disewa yang belum pernah di-scan sejak durasi tertentu (pengaturan) diberi tanda *Belum ada lokasi* beserta tombol kirim permintaan scan (QR-09).
- **TRK-06** Peta memakai tile OpenStreetMap (Leaflet) agar tanpa biaya API; Google Maps hanya bila owner menghendaki.

### 9.8 Laporan dan Analitik

- **RPT-01** Laporan: pendapatan, transaksi, pemesanan, penyewaan, pengembalian, keterlambatan, sepeda terpopuler, performa per sepeda (jam tersewa, utilisasi %, pendapatan, biaya perawatan), konsumen, pembayaran, perawatan.
- **RPT-02** Filter: rentang tanggal, sepeda, kategori, status, metode pembayaran.
- **RPT-03** Grafik pendapatan (harian/mingguan/bulanan) dan jumlah penyewaan; perbandingan dengan periode sebelumnya.
- **RPT-04** Ekspor **PDF** (header RAFA GO, periode, ringkasan) dan **Excel** (.xlsx, data mentah per baris).
- **RPT-05** Laporan hanya menghitung pembayaran berstatus *Disetujui*; pendapatan ditampilkan per tanggal pembayaran dan per tanggal sewa (dapat dipilih).

### 9.9 Pengguna dan Hak Akses

- **USR-01** Login dashboard dengan email + kata sandi (Supabase Auth); pemulihan kata sandi lewat email; sesi kedaluwarsa setelah tidak aktif (default 12 jam).
- **USR-02** Owner menambah, mengubah, menonaktifkan akun admin; tidak ada pendaftaran publik.
- **USR-03** Dukungan autentikasi dua faktor (TOTP) untuk owner, dianjurkan untuk admin.
- **USR-04** Hak akses berbasis peran:

| Fitur | Owner | Admin |
| --- | :-: | :-: |
| Pesanan, penyewaan, pengembalian, dokumentasi | Ya | Ya |
| Verifikasi pembayaran | Ya | Ya |
| Konsumen (lihat/ubah) | Ya | Ya (tanpa hapus) |
| Sepeda & kategori (CRUD) | Ya | Lihat + ubah status |
| Perawatan | Ya | Ya |
| Tracking Center | Ya | Ya |
| Laporan keuangan & ekspor | Ya | Terbatas (tanpa laba/biaya) |
| Pengaturan website, rekening/QRIS, harga, kebijakan | Ya | Tidak |
| Kelola akun admin | Ya | Tidak |
| Audit log | Ya | Tidak (hanya aktivitas sendiri) |

- **USR-05** Pembatasan diberlakukan di dua lapis: antarmuka (menu disembunyikan) dan database (RLS), sehingga pemanggilan API langsung tetap ditolak.
- **USR-06** Audit log mencatat siapa, kapan, aksi, objek, nilai sebelum dan sesudah, serta alamat IP; tidak dapat diubah atau dihapus dari antarmuka.

### 9.10 Notifikasi

Notifikasi dashboard muncul di ikon lonceng (Realtime) dan dapat ditandai sudah dibaca. Notifikasi ke konsumen memakai WhatsApp.

| Peristiwa | Penerima | Kanal |
| --- | --- | --- |
| Pesanan baru | Admin, owner | Dashboard |
| Bukti pembayaran masuk | Admin | Dashboard |
| Pembayaran disetujui / ditolak | Konsumen | WhatsApp + halaman Cek Pesanan |
| Konfirmasi pesanan + tautan pesanan | Konsumen | WhatsApp |
| Pesanan kedaluwarsa | Konsumen, admin | WhatsApp, dashboard |
| Sisa waktu sewa 15 menit | Konsumen, admin | WhatsApp, dashboard |
| Terlambat | Konsumen, admin, owner | WhatsApp, dashboard |
| Pengembalian selesai + invoice akhir | Konsumen | WhatsApp |
| Perawatan jatuh tempo | Admin, owner | Dashboard |

Pengiriman WhatsApp: tahap awal memakai tombol "Kirim via WhatsApp" (`wa.me` dengan teks terisi) yang ditekan admin; otomatisasi penuh memerlukan penyedia WhatsApp API dan masuk Pertanyaan Terbuka.

### 9.11 Pengaturan Website (Owner)

- **SET-01** Profil bisnis: nama, logo, tagline, alamat, titik peta, nomor WhatsApp, email, media sosial.
- **SET-02** **Rekening dan QRIS pembayaran**: tambah banyak rekening (bank/e-wallet, nomor, atas nama, aktif/nonaktif, urutan) dan unggah gambar QRIS; perubahan dicatat di audit log dan owner diminta memasukkan ulang kata sandi sebelum menyimpan.
- **SET-03** Jam operasional per hari dan hari libur.
- **SET-04** Harga dan aturan: durasi minimum, kelipatan durasi, toleransi keterlambatan, faktor denda, batas waktu bayar, toleransi tunai di tempat, maksimum sepeda per transaksi, wajib identitas (ya/tidak/opsional), jumlah foto minimum.
- **SET-05** Kebijakan pembatalan dan syarat sewa (teks yang ditampilkan dan disetujui konsumen; setiap persetujuan menyimpan versi teks yang disetujui).
- **SET-06** Konten landing page, galeri, testimoni, FAQ (CRUD + urutan).
- **SET-07** Template pesan WhatsApp untuk tiap peristiwa dengan variabel (`{nama}`, `{kode}`, `{total}`, `{link}`).

## 10. Aturan Bisnis dan Perhitungan

### 10.1 Harga dan Durasi

- **Harga per jam**: City Bike Rp35.000, MTB Rp40.000, Lipat Rp20.000, Anak Rp25.000, Listrik Rp50.000. Tidak ada harga paket.
- **Durasi**: kelipatan 30 menit, minimum 1 jam. Jam tertagih = durasi dibulatkan ke atas ke kelipatan 30 menit.
- Total = Σ (harga per jam setiap sepeda × jam tertagih). *Contoh: 1 City Bike × 1,5 jam = Rp35.000 × 1,5 = Rp52.500.*
- Harga disimpan sebagai salinan (*snapshot*) pada item pesanan sehingga perubahan harga tidak mengubah pesanan lama.
- Seluruh angka dalam Rupiah bilangan bulat; tidak memakai tipe pecahan untuk uang.

### 10.2 Keterlambatan

- Waktu berakhir = waktu mulai aktual + durasi dibayar. Toleransi keterlambatan: **10 menit**.
- Setelah toleransi, denda = **Rp10.000/jam**, **dibulatkan ke bawah per 30 menit**. Contoh: terlambat 20 menit → Rp0 (di bawah 30 menit); terlambat 40 menit → Rp5.000 (30 menit); terlambat 70 menit → Rp10.000 (1 jam); terlambat 100 menit → Rp15.000 (1,5 jam).
- Denda dibayar saat pengembalian (tunai atau transfer dengan bukti); transaksi baru *Selesai* setelah denda lunas atau admin mencatat keringanan dengan alasan.
- Sewa berikutnya pada sepeda yang sama yang terdampak keterlambatan: sistem memberi peringatan ke admin agar sepeda pengganti ditawarkan.

### 10.3 Status

| Objek | Status dan alurnya |
| --- | --- |
| Pesanan | Menunggu Pembayaran → Menunggu Verifikasi → Terkonfirmasi → Sedang Disewa → Selesai. Cabang: Pembayaran Ditolak (kembali ke Menunggu Pembayaran), Kedaluwarsa, Dibatalkan, Tidak Datang (no-show) |
| Pembayaran | Belum Dibayar, Menunggu Verifikasi, Disetujui, Ditolak, Dikembalikan (sebagian/penuh) |
| Sepeda | Aktif, Perawatan, Nonaktif; status turunan Tersedia, Dipesan, Sedang Disewa |
| Perawatan | Dijadwalkan, Dikerjakan, Selesai |
| QR Code | Aktif, Dinonaktifkan, Diregenerasi (token lama kedaluwarsa) |

Perubahan status hanya melalui fungsi di server dengan validasi transisi; urutan yang tidak sah ditolak.

### 10.4 Pembatalan dan Pengembalian Dana (usulan, perlu persetujuan owner)

- Sebelum pembayaran disetujui: dibatalkan bebas biaya, slot dilepas.
- Setelah disetujui, lebih dari 24 jam sebelum jam mulai: pengembalian 100%; 2–24 jam: 50%; kurang dari 2 jam atau tidak datang: tanpa pengembalian. Persentase dan batas waktu bisa diatur di SET-05.
- Refund diproses manual oleh admin ke rekening/e-wallet yang diisi konsumen pada permintaan pembatalan, dan dicatat (VER-06).
- Tidak datang: pesanan menjadi *Tidak Datang* otomatis setelah **jam mulai + 3 jam** bila belum ada sesi dimulai.

### 10.5 Pencegahan Pemesanan Bentrok

- Satu sepeda tidak boleh punya dua pesanan aktif dengan rentang waktu yang beririsan. Dijamin di **level database** memakai *exclusion constraint* PostgreSQL (`btree_gist`, `tstzrange`) pada tabel item pesanan dengan status penahan slot, bukan hanya validasi di aplikasi.
- Rentang yang ditahan = jam mulai sampai jam berakhir + waktu penyangga antar-sewa (default 15 menit, diatur owner) untuk pemeriksaan sepeda.
- Pembuatan pesanan berjalan dalam satu transaksi database; bila ada pelanggaran constraint, seluruh pesanan gagal dan konsumen mendapat saran alternatif.

## 11. Model Data (Ringkas)

Semua tabel memiliki `id` (UUID), `created_at`, `updated_at`. Uang berupa `integer` Rupiah. Waktu `timestamptz`.

| Tabel | Kolom penting | Catatan |
| --- | --- | --- |
| `profiles` | user\_id (Auth), nama, role (`owner`/`admin`), aktif | Hanya admin/owner |
| `bike_categories` | nama, urutan, ikon |  |
| `bikes` | kode, nama, category\_id, deskripsi, spesifikasi (jsonb), harga\_per\_jam, status\_operasional, label, deleted\_at | Kode unik |
| `bike_images` | bike\_id, path, urutan, is\_primary | Bucket publik khusus katalog |
| `qr_codes` | bike\_id, token (unik, acak), status, dibuat, dinonaktifkan | Satu aktif per sepeda |
| `customers` | nama, whatsapp (dinormalisasi, unik), email, status, catatan\_internal | Tanpa akun Auth |
| `bookings` | kode\_booking (unik), customer\_id, public\_token, sumber (`online`/`walkin`), status, mulai, selesai\_rencana, subtotal, denda, total, expires\_at, setuju\_syarat\_versi |  |
| `booking_items` | booking\_id, bike\_id, harga\_snapshot, jam\_tertagih, rentang (tstzrange) | Exclusion constraint per bike |
| `payment_accounts` | tipe (`bank`/`ewallet`/`qris`), nama, nomor, atas\_nama, qris\_path, aktif, urutan | Diatur owner |
| `payments` | booking\_id, jenis (`utama`/`perpanjangan`/`denda`/`refund`), metode, nominal, status, nama\_bank\_pengirim, nama\_pemilik\_pengirim, no\_akun\_pengirim, waktu\_transfer, bukti\_path, bukti\_hash, diverifikasi\_oleh, alasan\_tolak, verified\_at | Bukti di bucket privat |
| `rentals` | booking\_id, item\_id, mulai\_aktual, selesai\_aktual, kondisi\_awal, kondisi\_akhir, denda | Sesi per sepeda |
| `qr_scans` | qr\_id, bike\_id, booking\_id, waktu, lat, lng, akurasi\_m, status\_izin, tervalidasi, user\_agent |  |
| `documentation_files` | booking\_id, rental\_id, jenis, tahap, path, pengunggah, catatan | Bucket privat |
| `maintenance_records` | bike\_id, jenis, status, jadwal, selesai, biaya, deskripsi, foto |  |
| `notifications` | penerima (user/customer), jenis, payload, dibaca, kirim\_status |  |
| `audit_logs` | actor\_id, aksi, tabel, objek\_id, sebelum, sesudah, ip | Hanya tambah, tidak ubah |
| `site_settings`, `faqs`, `testimonials`, `gallery_items` | konten dan aturan yang diatur owner |  |

Indeks wajib: `bookings(kode_booking)`, `bookings(public_token)`, `bookings(status, expires_at)`, `booking_items` (GiST pada `bike_id` + `rentang`), `qr_codes(token)`, `qr_scans(bike_id, waktu)`, `customers(whatsapp)`.

## 12. Pertimbangan Teknis dan Keamanan

### 12.1 Arsitektur

- **Frontend**: aplikasi web responsif mobile-first, dapat dipasang sebagai PWA (manifest, service worker, ikon, layar splash). Pilihan framework ditentukan developer; rekomendasi React/Next.js + Tailwind CSS dengan klien `supabase-js`.
- **Backend**: Supabase – PostgreSQL (data inti, constraint, RLS, fungsi), Auth (hanya admin/owner), Storage (foto), Edge Functions (aksi publik dan tugas terjadwal), Realtime (notifikasi dashboard).
- **Hosting**: frontend di platform statis/edge (mis. Vercel atau Cloudflare Pages) dengan domain + HTTPS.
- **Peta**: Leaflet + OpenStreetMap. **Anti-bot**: Cloudflare Turnstile. **Ekspor**: pembuatan PDF/Excel di sisi server atau Edge Function.

### 12.2 Akses Data Tanpa Login (Prinsip Kunci)

Karena konsumen tidak punya akun Supabase Auth, peran `anon` **tidak boleh** membaca atau menulis tabel sensitif secara langsung.

- `anon` hanya mendapat `SELECT` pada *view* publik: sepeda aktif, kategori, galeri, FAQ, testimoni, jam operasional, rekening/QRIS yang aktif, dan ketersediaan (hanya blok waktu terisi, tanpa data pemesan).
- Semua aksi konsumen berjalan lewat Edge Function atau fungsi RPC `SECURITY DEFINER` yang memvalidasi masukan dan token: membuat pesanan, melihat pesanan (kode + WhatsApp atau `public_token`), mengirim data pembayaran, meminta pembatalan/perpanjangan, mendapat URL unggah foto, mencatat scan QR.
- Unggahan konsumen memakai *signed upload URL* yang terikat ke satu pesanan, tipe berkas, dan ukuran maksimum; berkas tidak dapat ditimpa setelah diverifikasi.
- `service_role` key hanya ada di lingkungan server, tidak pernah dikirim ke peramban.
- Token publik (`public_token`, `qr_token`) dibuat dengan generator acak kriptografis (≥ 128 bit) dan tidak berisi informasi yang dapat ditebak.

### 12.3 Ringkasan Kebijakan RLS

| Data | `anon` | `admin` | `owner` |
| --- | --- | --- | --- |
| Konten publik (via view) | Baca | Baca/tulis terbatas | Baca/tulis |
| `bookings`, `payments`, `customers`, `rentals` | Tidak ada akses langsung | Baca/tulis | Baca/tulis |
| `documentation_files`, `payment` bukti | Tidak ada akses langsung | Baca (signed URL) / tulis | Baca/tulis |
| `qr_scans` | Tulis hanya via fungsi tervalidasi | Baca | Baca |
| `site_settings`, `payment_accounts` | Baca (view terbatas) | Baca | Baca/tulis |
| `audit_logs` | Tidak | Baca milik sendiri | Baca semua |

Role pengguna dibaca dari tabel `profiles` melalui fungsi pembantu (bukan dari klaim yang bisa diubah pengguna). Setiap tabel diuji dengan skenario negatif (anon, admin, owner, pengguna tidak aktif).

### 12.4 Storage

| Bucket | Akses | Isi |
| --- | --- | --- |
| `bike-photos` | Baca publik | Foto katalog sepeda |
| `site-assets` | Baca publik | Logo, galeri, gambar QRIS |
| `payment-proofs` | Privat | Bukti pembayaran |
| `documentation` | Privat | Foto konsumen, identitas, kondisi sepeda |

Bucket privat hanya diakses lewat signed URL berumur pendek. Nama berkas diacak (UUID), bukan nama asli.

### 12.5 Privasi dan Retensi Data

- Data pribadi (nama, WhatsApp, foto, identitas, lokasi scan) diperlakukan sebagai data pribadi menurut UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi; konsumen diberi pemberitahuan tujuan pemrosesan dan memberi persetujuan eksplisit (checkbox terpisah untuk lokasi dan untuk identitas).
- Usulan masa simpan (dikonfirmasi owner): foto identitas dihapus 30 hari setelah transaksi selesai tanpa sengketa; foto kondisi sepeda 12 bulan; titik lokasi scan 6 bulan; bukti pembayaran dan data transaksi sesuai kebutuhan pembukuan. Penghapusan dijalankan tugas terjadwal.
- Halaman Kebijakan Privasi dan Syarat Sewa tersedia publik; kontak untuk permintaan hapus data.
- Nomor rekening/HP pengirim bersifat opsional dan disarankan hanya 4 digit terakhir; tampilan di dashboard disamarkan sebagian.

### 12.6 Keamanan Lain

- HTTPS wajib, HSTS, Content-Security-Policy, header keamanan standar, cookie `HttpOnly`/`Secure`/`SameSite` untuk sesi dashboard.
- Validasi skema di klien dan server (mis. Zod) termasuk penyaringan tipe dan ukuran berkas; kompresi dan pembuangan EXIF sebelum disimpan.
- Rate limit di Edge Function: pembuatan pesanan, lookup, unggah, scan; blokir sementara pada pola mencurigakan.
- Audit log untuk semua perubahan data sensitif, termasuk perubahan rekening/QRIS.
- Tidak ada data pribadi di log aplikasi; rahasia (key) disimpan di variabel lingkungan.
- Backup: pencadangan otomatis Supabase (cakupan bergantung paket), ditambah ekspor mingguan ke penyimpanan terpisah; uji pemulihan minimal sekali per kuartal.

### 12.7 Tugas Terjadwal

| Tugas | Frekuensi | Fungsi |
| --- | --- | --- |
| Kedaluwarsakan pesanan tanpa bukti bayar | Tiap menit | Ubah status, lepas slot |
| Tandai Tidak Datang | Tiap 5 menit | Pesanan lewat jam mulai + toleransi |
| Pengingat sisa waktu 15 menit dan tandai terlambat | Tiap menit | Buat notifikasi |
| Pengingat perawatan | Harian | Notifikasi |
| Hapus data sesuai retensi | Harian | Dokumentasi, lokasi scan |

## 13. Kebutuhan Non-Fungsional

| Kategori | Persyaratan |
| --- | --- |
| Performa | LCP ≤ 2,5 detik pada 4G untuk landing dan katalog; respons API pembuatan pesanan ≤ 1 detik (p95); gambar katalog WebP dengan *lazy loading* |
| Kapasitas | Mendukung sampai 200 pesanan per hari dan 10 pengguna dashboard bersamaan tanpa penurunan berarti |
| Ketersediaan | Target 99,5% per bulan (bergantung penyedia); halaman error yang ramah dan jalur kontak WhatsApp cadangan |
| Kompatibilitas | Chrome, Safari, Firefox, Samsung Internet (2 versi terakhir); Android 8+, iOS 15+; lebar layar mulai 360 px |
| Aksesibilitas | Mengacu WCAG 2.1 AA untuk dasar: kontras teks, label formulir, fokus keyboard, area ketuk ≥ 44 px |
| PWA | Dapat dipasang; halaman statis dan Cek Pesanan terakhir tersedia offline (hanya baca); pemesanan, pembayaran, dan scan memerlukan koneksi dan menampilkan pesan jelas saat offline |
| SEO | Landing dan halaman detail sepeda dapat diindeks, judul/deskripsi unik, URL ramah, data terstruktur |
| Observabilitas | Pelacakan galat (mis. Sentry), pemantauan uptime, dasbor kegagalan Edge Function |
| Keandalan data | Seluruh perhitungan uang dan waktu dilakukan di server; zona waktu WIB konsisten di tampilan dan laporan |
| Kemudahan pemeliharaan | Migrasi database berversi, lingkungan staging terpisah dari produksi, data contoh (*seed*) untuk uji |

## 14. Desain dan Pengalaman Pengguna

- **Prinsip**: mobile-first; satu tindakan utama per layar; teks Indonesia sederhana; konfirmasi jelas setiap langkah; status selalu terlihat dengan warna dan label (tidak mengandalkan warna saja).
- **Layar konsumen**: Landing, Katalog, Detail Sepeda, Keranjang/Form Pemesanan, Pembayaran, Cek Pesanan, Perpanjang, Scan QR, Unggah Dokumentasi, Kebijakan.
- **Layar dashboard**: Ringkasan, Pesanan, Verifikasi Pembayaran, Penyewaan Aktif, Pengembalian, Sepeda, Kategori, Konsumen, Perawatan, Tracking Center, Laporan, Notifikasi, Pengguna, Audit Log, Pengaturan.
- **Dashboard**: tabel yang bisa dipakai di HP (kartu pada layar sempit), tindakan cepat di konter (Mulai Sewa, Kembalikan, Verifikasi) maksimal 2 ketukan dari daftar.
- **Keadaan**: setiap layar menyediakan kondisi *loading* (skeleton), kosong, galat, dan offline.
- **Identitas visual**: logo dan palet RAFA GO dari owner; bila belum ada, developer mengusulkan palet dan tipografi untuk disetujui.
- **Deliverable desain**: wireframe/mockup (Figma) untuk layar konsumen dan alur dashboard utama sebelum implementasi.

## 15. User Story dan Kriteria Penerimaan

**US-01 Memesan tanpa akun** Sebagai konsumen, saya ingin memesan sepeda hanya dengan nama dan nomor WhatsApp, agar tidak perlu membuat akun.

- Pesanan dapat dibuat tanpa login dan menghasilkan kode booking unik.
- Nomor WhatsApp divalidasi (format Indonesia) dan disimpan dalam format +62.
- Setelah pesanan dibuat, tautan pesanan dan kode booking ditampilkan serta dapat disalin.
- Bot sederhana ditolak oleh Turnstile dan rate limit.

**US-02 Ketersediaan akurat** Sebagai konsumen, saya ingin tahu sepeda mana yang kosong pada jam pilihan saya, agar pesanan saya tidak ditolak belakangan.

- Filter ketersediaan menampilkan hanya sepeda tanpa pesanan/perawatan yang beririsan, termasuk waktu penyangga.
- Jika dua orang memesan sepeda dan jam yang sama bersamaan, hanya satu yang berhasil dan satu lagi mendapat pesan serta alternatif.

**US-03 Membayar dengan rekening/QRIS owner** Sebagai konsumen, saya ingin melihat rekening atau QRIS tujuan dan mengirim bukti, agar pesanan saya dikonfirmasi.

- Rekening dapat disalin dan QRIS dapat diperbesar/diunduh.
- Formulir mewajibkan nama bank/e-wallet pengirim, nama pemilik akun, waktu transfer, dan satu berkas bukti (≤ 5 MB).
- Setelah kirim, status menjadi *Menunggu Verifikasi* dan tampil di Cek Pesanan.
- Berkas non-gambar atau melebihi batas ditolak dengan pesan jelas.

**US-04 Memverifikasi pembayaran** Sebagai admin, saya ingin memeriksa bukti bersama data pengirim dalam satu layar, agar keputusan cepat dan tepat.

- Layar menampilkan bukti, nominal tagihan vs dikirim, dan data pengirim.
- Setujui mengubah status pesanan menjadi *Terkonfirmasi* dan membuat invoice; Tolak mewajibkan alasan.
- Tindakan tercatat di audit log dengan nama admin dan waktu.

**US-05 Mengecek pesanan tanpa login** Sebagai konsumen, saya ingin membuka pesanan saya kapan saja, agar saya tahu status dan sisa waktu sewa.

- Akses berhasil dengan tautan unik atau kode booking + nomor WhatsApp yang cocok.
- Pesan galat sama untuk kode salah maupun nomor salah; percobaan berulang dibatasi.
- Sisa waktu sewa terhitung mundur dan sinkron dengan waktu server.

**US-06 Mengambil sepeda dengan bukti kondisi** Sebagai admin, saya ingin memotret kondisi sepeda sebelum diserahkan, agar kerusakan dapat dibuktikan.

- *Mulai Sewa* tidak dapat ditekan bila pembayaran belum lunas atau foto belum mencapai jumlah minimum.
- Waktu mulai tercatat otomatis dan sisa waktu mulai berjalan.

**US-07 Memindai QR sepeda** Sebagai penyewa, saya ingin memindai QR di sepeda dan memasukkan kode booking, agar pemilik tahu sepeda masih dalam penguasaan saya.

- Scan sepeda yang sedang disewa dengan kode booking yang cocok meminta izin lokasi dan menyimpan koordinat, akurasi, waktu.
- Jika izin ditolak, scan tetap tercatat dengan status izin *denied*.
- Scan sepeda yang tidak sedang disewa atau kode tidak cocok tidak menyimpan lokasi dan tercatat sebagai tidak tervalidasi.

**US-08 Melihat lokasi scan** Sebagai owner, saya ingin melihat titik scan terakhir sepeda yang disewa, agar bisa bertindak bila sepeda tidak kembali.

- Tracking Center menampilkan titik terakhir, waktu, akurasi, dan penyewa.
- Sepeda disewa tanpa scan melewati ambang waktu ditandai dan dapat dikirimi permintaan scan.

**US-09 Perpanjangan sewa** Sebagai penyewa, saya ingin menambah jam sewa dari HP, agar tidak perlu kembali ke konter.

- Tombol Perpanjang hanya aktif bila sepeda tidak dipesan orang lain setelah jam berakhir.
- Biaya tambahan dihitung otomatis; sesi diperpanjang setelah pembayaran tambahan disetujui atau dicatat tunai.

**US-10 Pengembalian dan denda** Sebagai admin, saya ingin sistem menghitung biaya akhir dan denda, agar tidak salah hitung.

- Denda dihitung sesuai toleransi dan tarif pada pengaturan; admin dapat memberi keringanan dengan alasan tercatat.
- Sepeda menjadi *Tersedia* setelah pengembalian dikonfirmasi, atau *Perawatan* bila ditandai rusak.

**US-11 Mengelola sepeda dan QR** Sebagai owner, saya ingin menambah sepeda dan mencetak QR-nya, agar armada baru siap disewa.

- Sepeda baru langsung memiliki QR unik; QR dapat diunduh, dicetak, diregenerasi, dan dinonaktifkan.
- Setelah regenerasi, QR lama menampilkan pesan "QR tidak berlaku".

**US-12 Mengatur rekening/QRIS** Sebagai owner, saya ingin mengganti rekening dan QRIS sendiri, agar pembayaran selalu masuk ke akun yang benar.

- Hanya owner yang dapat mengubah; perubahan meminta kata sandi ulang dan masuk audit log.
- Perubahan langsung terlihat di halaman pembayaran semua pesanan yang belum dibayar.

**US-13 Laporan** Sebagai owner, saya ingin laporan pendapatan dan performa sepeda yang bisa diekspor, agar saya dapat mengambil keputusan.

- Filter tanggal, sepeda, dan status bekerja; angka sama antara tampilan, PDF, dan Excel.
- Hanya pembayaran *Disetujui* dihitung sebagai pendapatan.

## 16. Rencana Pengerjaan (Estimasi Kasar, Developer Solo)

Seluruh fitur dirilis sekaligus; tabel berikut hanya urutan pengerjaan internal. Estimasi total sekitar 18 minggu kerja dan harus disesuaikan dengan tenggat proyek.

| Tahap | Isi | Estimasi |
| --- | --- | --- |
| T0 Persiapan | Finalisasi PRD, jawaban pertanyaan terbuka, wireframe, branding | 2 minggu |
| T1 Fondasi | Skema database, constraint anti-bentrok, Auth + role, RLS, bucket, Edge Function dasar, CI dan staging | 2 minggu |
| T2 Sisi publik 1 | Landing page, katalog, detail sepeda, pengaturan konten | 2 minggu |
| T3 Pemesanan dan pembayaran | Form pesanan, ketersediaan, kode booking, halaman bayar, unggah bukti, Cek Pesanan | 3 minggu |
| T4 Dashboard inti | Pesanan, verifikasi pembayaran, penyewaan, pengembalian, denda, konsumen, invoice | 3 minggu |
| T5 QR dan dokumentasi | QR, halaman scan, GPS, Tracking Center, unggah dokumentasi | 2 minggu |
| T6 Pelengkap | Perawatan, laporan + ekspor, notifikasi, pengguna/audit log, PWA, SEO | 2 minggu |
| T7 QA dan peluncuran | Pengujian menyeluruh, UAT dengan admin/owner, perbaikan, pelatihan, migrasi data awal, go-live | 2 minggu |

**Kriteria siap rilis**: semua user story di bagian 15 lulus kriteria penerimaan; uji keamanan RLS lulus; uji beban sederhana lulus; satu simulasi sewa penuh (online + walk-in + perpanjangan + denda + pengembalian) berhasil di lingkungan produksi; owner dan admin sudah dilatih.

## 17. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Bukti transfer palsu atau salah nominal | Kerugian finansial | Verifikasi manual terhadap mutasi rekening/e-wallet owner, pencocokan nominal, deteksi berkas identik, kode unik opsional (PAY-11) |
| Tanpa login: pesanan diakses orang lain | Kebocoran data konsumen | Token acak 128 bit, lookup dibatasi, pesan galat seragam, data sensitif (identitas) tidak ditampilkan penuh di Cek Pesanan |
| Spam/pesanan palsu menahan slot | Sepeda tampak penuh | Turnstile, rate limit, batas pesanan menunggu per WhatsApp, kedaluwarsa otomatis |
| GPS hanya saat scan; konsumen sengaja tidak scan | Sepeda tidak termonitor | Syarat sewa mewajibkan scan atas permintaan, permintaan scan WhatsApp, kebijakan jaminan (identitas) bila owner menghendaki, penjelasan jujur batas fitur |
| Akurasi GPS rendah di dalam gedung/HP lama | Lokasi tidak berguna | Simpan akurasi, tampilkan status kualitas, tidak menyimpulkan lokasi dari akurasi rendah |
| Privasi: identitas dan foto konsumen | Pelanggaran data pribadi | Bucket privat, signed URL, persetujuan eksplisit, retensi otomatis, akses berbasis peran |
| Kesalahan konfigurasi RLS | Data terbuka | Uji negatif otomatis tiap tabel, tinjauan kebijakan sebelum rilis, `anon` tanpa akses default |
| Notifikasi WhatsApp tidak otomatis | Beban admin dan keterlambatan pesan | Tombol `wa.me` terisi otomatis; opsi WhatsApp API setelah keputusan owner |
| Perubahan harga/kebijakan merusak data lama | Perselisihan | Snapshot harga dan versi syarat pada setiap pesanan |
| Ketergantungan pada satu admin saat verifikasi | Pembayaran menumpuk | Notifikasi real-time, kartu *Perlu Tindakan*, jam operasional tampak di halaman bayar |
| Lingkup besar untuk satu developer dan rilis serentak | Terlambat | Urutan tahap jelas, kriteria penerimaan, fitur pelengkap (T6) dapat dikorbankan terakhir bila tenggat mepet dengan persetujuan klien |

## 18. Dependensi dan Asumsi

**Dependensi**: akun dan proyek Supabase (paket sesuai kebutuhan backup), domain dan hosting, akun Cloudflare Turnstile, data sepeda dan foto dari owner, rekening/QRIS resmi owner, teks syarat sewa dan kebijakan, logo dan identitas merek.

**Asumsi**:

- Satu lokasi rental dan satu zona waktu (WIB); belum ada multi-cabang.
- Konsumen memakai HP dengan kamera dan koneksi internet saat memesan dan memindai QR.
- Owner/admin bersedia memeriksa mutasi rekening/e-wallet secara manual saat verifikasi.
- Rekening dan QRIS atas nama owner/bisnis, bukan pribadi staf.
- Satu sepeda per QR dan satu QR aktif per sepeda.
- Angka default pada dokumen ini (toleransi 10 menit, batas bayar 60 menit, penyangga 15 menit, persentase refund) adalah usulan yang dikonfirmasi owner dan semuanya dapat diubah lewat pengaturan.

## 19. Pertanyaan Terbuka — TERJAWAB

> Semua pertanyaan telah dijawab oleh klien. Lihat `PERTANYAAN-KLIEN.md` untuk jawaban lengkap.
> Jawaban sudah diintegrasikan ke bagian terkait dalam dokumen ini.

| # | Pertanyaan | Jawaban |
|---|---|---|
| 1 | Tenggat dan anggaran | 30 hari; gratis (di luar VPS + domain) |
| 2 | Pembulatan durasi | Per 30 menit, minimum 1 jam, tanpa paket |
| 3 | Denda keterlambatan | Rp10.000/jam, toleransi 10 menit, bulatkan ke bawah per 30 menit |
| 4 | Kebijakan pembatalan dan refund | Setuju: 100% (>24j) / 50% (2–24j) / 0% (<2j) |
| 5 | Batas waktu bayar | 30 menit; boleh pesan mendadak (<1 jam) |
| 6 | Kode unik nominal | Ya |
| 7 | Notifikasi WhatsApp | Manual (wa.me) |
| 8 | Identitas dan jaminan | Tidak upload — KTP ditahan fisik di konter (offline) |
| 9 | Kerusakan/kehilangan | Admin tetapkan saat pengembalian; kehilangan ganti 100% |
| 10 | Armada dan staf | 50 unit, 5 kategori, 3 admin |
| 11 | Jam operasional | Sen–Jum 14–20, Sab 15–00, Min 08–18; tidak boleh melewati tutup; penyangga 15 menit |
| 12 | Retensi data | Setuju usulan (identitas 30d, foto 12mo, lokasi 6mo, bukti bayar ∞) |
| 13 | Merek dan domain | rafago.com; Indonesia saja |
| 14 | QR scan | Wajib saat mulai sewa; konsekuensi sesuai petugas penjaga |
| 15 | Data awal | Tidak ada, mulai dari nol |
