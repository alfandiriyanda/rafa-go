# User Stories — RAFA GO

> Setiap story mengikuti format: **Sebagai [persona], saya ingin [aksi], agar [manfaat].**
> Acceptance criteria menggunakan format Given/When/Then.

---

## Konsumen (Tanpa Login)

### US-01 · Memesan Tanpa Akun

**Sebagai** konsumen, **saya ingin** memesan sepeda hanya dengan nama dan nomor WhatsApp, **agar** tidak perlu membuat akun.

**Acceptance Criteria:**
- [ ] Given konsumen di halaman pemesanan, When mengisi nama + WhatsApp + memilih sepeda + durasi dan submit, Then pesanan dibuat dengan kode booking format `RG-YYMMDD-XXXX`
- [ ] Given nomor WhatsApp, When divalidasi, Then hanya format Indonesia (+62) diterima
- [ ] Given pesanan berhasil dibuat, Then tautan pesanan dan kode booking ditampilkan dan dapat disalin
- [ ] Given bot mencoba submit, When Turnstile gagal, Then pesanan ditolak
- [ ] Given satu nomor WhatsApp, When sudah punya 3 pesanan *Menunggu Pembayaran*, Then pesanan baru ditolak

**PRD refs**: BKG-01 s/d BKG-11

---

### US-02 · Ketersediaan Akurat

**Sebagai** konsumen, **saya ingin** tahu sepeda mana yang kosong pada jam pilihan saya, **agar** pesanan saya tidak ditolak belakangan.

**Acceptance Criteria:**
- [ ] Given filter tanggal + jam, When diterapkan, Then hanya sepeda tanpa pesanan/perawatan yang beririsan (termasuk penyangga) ditampilkan
- [ ] Given dua konsumen memesan sepeda + jam yang sama bersamaan, When submit, Then hanya satu berhasil; yang lain mendapat pesan + saran alternatif
- [ ] Given sepeda berstatus *Perawatan* atau *Nonaktif*, Then tidak muncul sebagai tersedia

**PRD refs**: KAT-03, KAT-05, BKG-04, §10.5

---

### US-03 · Membayar dengan Rekening/QRIS Owner

**Sebagai** konsumen, **saya ingin** melihat rekening atau QRIS tujuan dan mengirim bukti, **agar** pesanan saya dikonfirmasi.

**Acceptance Criteria:**
- [ ] Given halaman pembayaran, Then rekening aktif ditampilkan dengan tombol Salin, QRIS dengan tombol perbesar/unduh
- [ ] Given konsumen mengisi form pembayaran, When submit bukti (JPG/PNG/WebP/HEIC ≤5MB), Then status menjadi *Menunggu Verifikasi*
- [ ] Given file bukan gambar atau >5MB, When upload, Then ditolak dengan pesan jelas
- [ ] Given bukti berhasil dikirim, Then status terlihat di Cek Pesanan
- [ ] Given pembayaran ditolak, Then alasan penolakan ditampilkan + form unggah ulang tersedia + batas waktu diperpanjang

**PRD refs**: PAY-01 s/d PAY-11

---

### US-04 · Mengecek Pesanan Tanpa Login

**Sebagai** konsumen, **saya ingin** membuka pesanan saya kapan saja, **agar** saya tahu status dan sisa waktu sewa.

**Acceptance Criteria:**
- [ ] Given tautan unik `/pesanan/{token}`, When dibuka, Then detail pesanan tampil
- [ ] Given kode booking + nomor WhatsApp yang cocok, When disubmit, Then pesanan ditemukan
- [ ] Given kode salah atau nomor salah, Then pesan galat sama (tidak membocorkan apakah kode ada)
- [ ] Given 5 percobaan gagal dalam 15 menit, Then akses diblokir sementara
- [ ] Given pesanan status *Sedang Disewa*, Then sisa waktu terhitung mundur sinkron dengan server
- [ ] Given status berubah (di sisi admin), Then halaman update otomatis (Realtime/polling)

**PRD refs**: CEK-01 s/d CEK-07

---

### US-05 · Memindai QR Sepeda

**Sebagai** penyewa, **saya ingin** memindai QR di sepeda dan memasukkan kode booking, **agar** pemilik tahu sepeda masih dalam penguasaan saya.

**Acceptance Criteria:**
- [ ] Given QR sepeda yang sedang disewa + kode booking cocok, When scan, Then izin lokasi diminta
- [ ] Given izin lokasi diberikan, Then koordinat + akurasi + waktu tersimpan
- [ ] Given izin lokasi ditolak, Then scan tetap tercatat dengan status `denied`
- [ ] Given akurasi >100m, Then scan tercatat dengan status `low_accuracy`
- [ ] Given sepeda tidak sedang disewa atau kode tidak cocok, Then info publik sepeda ditampilkan, scan tercatat sebagai tidak tervalidasi, lokasi tidak disimpan
- [ ] Given halaman scan, Then teks jelas menyatakan ini bukan pelacakan real-time

**PRD refs**: QR-01 s/d QR-09

---

### US-06 · Perpanjangan Sewa

**Sebagai** penyewa, **saya ingin** menambah jam sewa dari HP, **agar** tidak perlu kembali ke konter.

**Acceptance Criteria:**
- [ ] Given pesanan *Sedang Disewa*, When buka Cek Pesanan, Then tombol Perpanjang tersedia
- [ ] Given perpanjang, When sepeda sudah dipesan orang lain setelah jam berakhir, Then perpanjangan ditolak
- [ ] Given perpanjang berhasil, Then biaya tambahan dihitung otomatis, alur pembayaran dimulai
- [ ] Given admin mencatat perpanjangan tunai, Then durasi langsung diperpanjang

**PRD refs**: §7.3, RNT-03, BKG-11

---

## Admin

### US-07 · Memverifikasi Pembayaran

**Sebagai** admin, **saya ingin** memeriksa bukti bersama data pengirim dalam satu layar, **agar** keputusan cepat dan tepat.

**Acceptance Criteria:**
- [ ] Given antrean verifikasi, Then bukti ditampilkan ukuran penuh + zoom, nominal tagihan vs dikirim, data pengirim, waktu unggah
- [ ] Given admin klik Setujui, Then status pesanan → *Terkonfirmasi*, invoice dibuat, tombol kirim WhatsApp tersedia
- [ ] Given admin klik Tolak, Then wajib pilih alasan + catatan, konsumen dapat unggah ulang
- [ ] Given tindakan verifikasi, Then tercatat di audit log (admin, waktu, aksi)
- [ ] Given nominal berbeda dari tagihan, Then peringatan otomatis ditampilkan
- [ ] Given dua pesanan pakai file identik (hash sama), Then peringatan ditampilkan

**PRD refs**: VER-01 s/d VER-06

---

### US-08 · Mengambil Sepeda (Mulai Sewa)

**Sebagai** admin, **saya ingin** memotret kondisi sepeda sebelum diserahkan, **agar** kerusakan dapat dibuktikan.

**Acceptance Criteria:**
- [ ] Given pembayaran belum lunas, When tekan Mulai Sewa, Then ditolak
- [ ] Given foto belum mencapai jumlah minimum, When tekan Mulai Sewa, Then ditolak
- [ ] Given pembayaran lunas + foto cukup, When tekan Mulai Sewa, Then waktu mulai tercatat otomatis, sisa waktu mulai berjalan
- [ ] Given waktu mulai, Then admin dapat koreksi dengan alasan (tercatat di audit log)

**PRD refs**: RNT-01, DOK-01 s/d DOK-07

---

### US-09 · Pengembalian dan Denda

**Sebagai** admin, **saya ingin** sistem menghitung biaya akhir dan denda, **agar** tidak salah hitung.

**Acceptance Criteria:**
- [ ] Given pengembalian setelah toleransi, Then denda = jam terlambat (bulatkan ke atas) × tarif × faktor denda
- [ ] Given admin memberi keringanan denda, Then wajib isi alasan (tercatat di audit log)
- [ ] Given pengembalian selesai + denda lunas, Then sepeda → *Tersedia*
- [ ] Given sepeda ditandai rusak, Then sepeda → *Perawatan*
- [ ] Given transaksi multi-sepeda, Then pengembalian bisa satu per satu; transaksi selesai saat semua kembali

**PRD refs**: RNT-04 s/d RNT-06, §10.2

---

### US-10 · Membuat Pesanan Walk-in

**Sebagai** admin, **saya ingin** mencatat pesanan walk-in langsung di dashboard, **agar** semua penyewaan tercatat.

**Acceptance Criteria:**
- [ ] Given admin di dashboard walk-in, When pilih sepeda + durasi + nama + WhatsApp, Then pesanan dibuat dengan validasi ketersediaan yang sama seperti online
- [ ] Given pembayaran tunai, When admin catat jumlah diterima, Then sistem hitung kembalian
- [ ] Given walk-in selesai, Then kode booking + invoice tetap dibuat

**PRD refs**: §7.2, ORD-03, PAY-08, VER-05

---

## Owner

### US-11 · Melihat Lokasi Scan Sepeda

**Sebagai** owner, **saya ingin** melihat titik scan terakhir sepeda yang disewa, **agar** bisa bertindak bila sepeda tidak kembali.

**Acceptance Criteria:**
- [ ] Given Tracking Center, Then peta menampilkan titik terakhir per sepeda yang disewa + waktu + akurasi + penyewa
- [ ] Given sepeda disewa tanpa scan melewati ambang waktu, Then ditandai *Belum ada lokasi*
- [ ] Given tombol permintaan scan, When ditekan, Then pesan WhatsApp (wa.me) terisi otomatis dengan tautan scan
- [ ] Given akurasi ≤30m, Then indikator hijau; 30–100m kuning; tidak tersedia abu-abu

**PRD refs**: TRK-01 s/d TRK-06

---

### US-12 · Mengelola Sepeda dan QR

**Sebagai** owner, **saya ingin** menambah sepeda dan mencetak QR-nya, **agar** armada baru siap disewa.

**Acceptance Criteria:**
- [ ] Given sepeda baru ditambah, Then QR Code unik otomatis dibuat
- [ ] Given QR, Then dapat diunduh (PNG/SVG), dicetak (stiker: nama + kode sepeda), diregenerasi, dinonaktifkan
- [ ] Given QR diregenerasi, Then token lama langsung tidak berlaku, halaman menampilkan "QR tidak berlaku"
- [ ] Given sepeda punya riwayat sewa, Then tidak dapat dihapus permanen, hanya dinonaktifkan (soft delete)

**PRD refs**: SPD-01 s/d SPD-07

---

### US-13 · Mengatur Rekening/QRIS

**Sebagai** owner, **saya ingin** mengganti rekening dan QRIS sendiri, **agar** pembayaran selalu masuk ke akun yang benar.

**Acceptance Criteria:**
- [ ] Given pengaturan rekening, Then hanya owner yang dapat mengubah
- [ ] Given perubahan rekening/QRIS, When simpan, Then diminta memasukkan ulang kata sandi
- [ ] Given perubahan disimpan, Then tercatat di audit log
- [ ] Given perubahan, Then langsung terlihat di halaman pembayaran pesanan yang belum dibayar

**PRD refs**: SET-02, USR-04

---

### US-14 · Laporan dan Ekspor

**Sebagai** owner, **saya ingin** laporan pendapatan dan performa sepeda yang bisa diekspor, **agar** saya dapat mengambil keputusan.

**Acceptance Criteria:**
- [ ] Given filter tanggal + sepeda + status, When diterapkan, Then data berubah
- [ ] Given ekspor PDF, Then berisi header RAFA GO, periode, ringkasan, data
- [ ] Given ekspor Excel, Then berisi data mentah per baris
- [ ] Given angka, Then sama persis antara tampilan web, PDF, dan Excel
- [ ] Given pendapatan, Then hanya pembayaran berstatus *Disetujui* yang dihitung
- [ ] Given admin role, Then laporan keuangan terbatas (tanpa laba/biaya)

**PRD refs**: RPT-01 s/d RPT-05, USR-04

---

## Cross-Cutting

### US-15 · Keamanan Data Konsumen

**Sebagai** sistem, data pribadi konsumen harus dilindungi sesuai UU PDP.

**Acceptance Criteria:**
- [ ] Given foto identitas, Then disimpan di bucket privat, signed URL ≤60 detik
- [ ] Given EXIF metadata, Then dibuang saat upload
- [ ] Given nama file asli, Then tidak disimpan (UUID only)
- [ ] Given persetujuan data pribadi, Then checkbox terpisah untuk lokasi dan identitas
- [ ] Given retensi: identitas 30 hari, foto kondisi 12 bulan, lokasi scan 6 bulan, Then tugas terjadwal menghapus data expired

**PRD refs**: §12.5, DOK-04 s/d DOK-06

---

### US-16 · Anti-Double-Booking

**Sebagai** sistem, satu sepeda tidak boleh punya dua pesanan aktif dengan waktu beririsan.

**Acceptance Criteria:**
- [ ] Given exclusion constraint PostgreSQL pada `booking_items`, When dua pesanan bersamaan untuk sepeda + jam yang sama, Then hanya satu berhasil
- [ ] Given pesanan gagal karena constraint, Then seluruh transaksi rollback, konsumen mendapat saran alternatif
- [ ] Given rentang waktu, Then termasuk penyangga antar-sewa (default 15 menit)
- [ ] Given audit: 0 insiden double booking selama 3 bulan

**PRD refs**: §10.5, BKG-04

---

### US-17 · PWA dan Offline

**Sebagai** konsumen, **saya ingin** mengakses website walau sinyal lemah, **agar** tetap bisa melihat info penting.

**Acceptance Criteria:**
- [ ] Given PWA manifest, Then website dapat di-install ke home screen
- [ ] Given offline, Then halaman statis (landing, kebijakan) dan Cek Pesanan terakhir tersedia (read-only)
- [ ] Given offline + coba pesan/bayar/scan, Then pesan jelas "Memerlukan koneksi internet"
- [ ] Given Lighthouse PWA audit, Then score ≥85

**PRD refs**: §13 PWA
