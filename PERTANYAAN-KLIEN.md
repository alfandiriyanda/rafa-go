# Pertanyaan untuk Owner/Klien — RAFA GO

> **Dari**: Alfandi Riyanda (Developer)
> **Tanggal**: 8 November 2026
> **Tujuan**: Memfinalisasi keputusan bisnis sebelum development dimulai.
> **Cara menjawab**: Tulis jawaban di bawah setiap pertanyaan, atau balas lewat WhatsApp/email dengan nomor pertanyaan.

---

## A. Tenggat & Anggaran

**A1. Kapan batas waktu rilis (deadline)?**
Estimasi pengerjaan ≈18 minggu (4–5 bulan) untuk satu developer. Apakah ada tanggal target dari pemberi proyek?

> Jawaban: 30 hari

**A2. Adakah anggaran untuk layanan berbayar?**
Beberapa layanan butuh biaya bulanan:

| Layanan | Kebutuhan | Estimasi Biaya |
|---|---|---|
| Domain (.id / .com) | Wajib | Rp150.000–300.000/tahun |
| Supabase Pro | Disarankan (backup otomatis, lebih stabil) | $25/bulan (~Rp400.000) |
| Vercel Pro (hosting) | Opsional (free tier mungkin cukup awal) | $20/bulan (~Rp320.000) |
| Cloudflare (anti-bot) | Gratis | Rp0 |
| Sentry (error tracking) | Gratis untuk volume kecil | Rp0 |
| WhatsApp API (jika mau otomatis) | Opsional | Rp200.000–500.000/bulan |

Apakah owner bersedia menanggung biaya layanan di atas? Yang mana saja?

> Jawaban: dia mau gratis full(diluar vps dan domain)

---

## B. Harga & Durasi Sewa

**B1. Bagaimana pembulatan durasi sewa?**
Pilih salah satu:
- [ ] Per jam penuh (pembulatan ke atas). Contoh: sewa 1,5 jam ditagih 2 jam
- [✔] Per 30 menit. Contoh: sewa 1,5 jam ditagih 1,5 jam
- [ ] Lainnya: ___

**B2. Berapa durasi minimum sewa?**
- [✔] 1 jam
- [ ] 2 jam
- [ ] Lainnya: ___

**B3. Apakah ada harga paket?**
Contoh: paket 3 jam lebih murah dari 3× harga per jam, atau paket seharian.
- [✔] Tidak ada, tarif per jam saja
- [ ] Ada, yaitu: 

**B4. Berapa harga per jam per jenis sepeda?**
Contoh pengisian:

| Jenis Sepeda | Harga/Jam |
|---|---|
| Sepeda Kota / City Bike | Rp 35.000/jam |
| Sepeda Gunung / MTB | Rp40.000/jam |
| Sepeda Lipat | Rp20.000/jam |
| Sepeda Anak | Rp25.000/jam |
| Sepeda Listrik | Rp50.000/jam |
| Lainnya: ___ | Rp___/jam |

> Jawaban: ___

---

## C. Keterlambatan & Denda

**C1. Berapa toleransi keterlambatan sebelum denda?**
- [✔] 10 menit
- [ ] 15 menit
- [ ] 30 menit
- [ ] Tidak ada toleransi
- [ ] Lainnya: ___

**C2. Berapa tarif denda keterlambatan?**
Pilih salah satu:
- [ ] Sama dengan tarif sewa per jam (1×)
- [ ] 1,5× tarif sewa per jam
- [ ] 2× tarif sewa per jam
- [ ] Tarif tetap: Rp___/jam keterlambatan
- [ ] Lainnya: Rp 10.000/jam

**C3. Apakah denda dihitung per jam (bulatkan ke atas) atau per 30 menit?**
Contoh: terlambat 20 menit → ditagih 1 jam denda, atau 30 menit denda?

> Jawaban: bulatkan ke bawah saja

---

## D. Pembatalan & Pengembalian Dana (Refund)

**D1. Apakah ada kebijakan refund?**
Usulan kami (bisa diubah):

| Waktu Pembatalan | Refund |
|---|---|
| Sebelum pembayaran diverifikasi | 100% (otomatis, slot dilepas) |
| Lebih dari 24 jam sebelum jam mulai | 100% |
| 2–24 jam sebelum jam mulai | 50% |
| Kurang dari 2 jam atau tidak datang | 0% |

Pilih salah satu:
- [✔] Setuju dengan usulan di atas
- [ ] Tidak ada refund sama sekali setelah bayar
- [ ] Kebijakan lain: ___

**D2. Berapa lama toleransi "tidak datang" (no-show)?**
Setelah jam mulai + berapa menit, pesanan otomatis ditandai "Tidak Datang"?
- [ ] 30 menit
- [ ] 60 menit
- [✔] Lainnya: 3 jam

---

## E. Pembayaran

**E1. Berapa batas waktu bayar untuk pesanan online?**
Setelah pesanan dibuat, konsumen punya waktu berapa lama untuk upload bukti bayar sebelum pesanan otomatis batal?
- [✔] 30 menit
- [ ] 60 menit (1 jam)
- [ ] 120 menit (2 jam)
- [ ] Lainnya: ___

**E2. Bolehkah pesan untuk waktu mulai kurang dari 1 jam dari sekarang?**
Contoh: sekarang jam 14.00, konsumen pesan untuk jam 14.30 → boleh atau tidak?
- [✔] Boleh (langsung bayar di tempat)
- [ ] Tidak boleh, minimal 1 jam sebelumnya
- [ ] Tidak boleh, minimal ___ jam sebelumnya

**E3. Apakah ingin pakai kode unik pada nominal?**
Contoh: total Rp45.000 → konsumen diminta bayar Rp45.327 (angka 327 unik per pesanan). Tujuannya agar mudah dicocokkan di mutasi rekening.
- [✔] Ya, pakai kode unik
- [ ] Tidak perlu

**E4. Rekening dan QRIS yang akan ditampilkan:**
Isi semua yang akan aktif:

| No | Tipe | Nama Bank/E-Wallet | Nomor Rekening | Atas Nama |
|---|---|---|---|---|
| 1 ||Dana|08766533428|Fadel|
| 2 ||Seabank |65243745251832| Padel|
| 3 | | | | |

QRIS: (kirimkan gambar QRIS yang akan ditampilkan di website)

---

## F. Identitas & Dokumentasi Konsumen

**F1. Apakah konsumen wajib upload foto identitas (KTP/SIM)?**
- [ ] Wajib — harus upload sebelum bisa sewa
- [ ] Opsional — ditawarkan tapi boleh menolak
- [✔] Tidak perlu

**F2. Apakah ada jaminan lain selain identitas?**
- [ ] Tidak ada jaminan
- [ ] KTP/SIM ditahan secara fisik di konter
- [ ] Deposit uang: Rp___
- [ ] Lainnya: KTP dipegang Oleh owner/pengawas yang berjaga, jadi biarkan offline saja

**F3. Berapa jumlah minimum foto kondisi sepeda?**
Foto yang harus diambil admin sebelum dan sesudah sewa:
- [ ] 4 foto (depan, belakang, kiri, kanan)
- [ ] 6 foto (+ detail roda depan & belakang)
- [ ] Lainnya: satu saja, foto pembeli sambil menaiki sepeda yang disewa

---

## G. Notifikasi WhatsApp

**G1. Bagaimana cara kirim notifikasi WhatsApp ke konsumen?**
- [✔] **Manual** — admin klik tombol, otomatis buka WhatsApp dengan pesan terisi (gratis, tapi butuh klik manual tiap kali)
- [ ] **Otomatis** — pakai WhatsApp API berbayar, pesan terkirim otomatis tanpa klik (biaya ±Rp200.000–500.000/bulan)

> Jawaban: ___

---

## H. Operasional

**H1. Berapa jam operasional per hari?**
Contoh:

| Hari | Buka | Tutup |
|---|---|---|
| Senin–Jumat | 14:00 | 20:00 |
| Sabtu | 15:00 | 00:00 |
| Minggu | 08:00 | 18:00 |

**H2. Apakah jam sewa boleh melewati jam tutup?**
Contoh: tutup jam 21.00, konsumen sewa jam 20.00 untuk 3 jam (sampai 23.00) → boleh atau tidak?
- [✔] Tidak boleh, harus selesai sebelum tutup
- [ ] Boleh, dikembalikan besok pagi (jam buka)
- [ ] Lainnya: ___

**H3. Berapa waktu penyangga antar-sewa?**
Waktu kosong antara satu sewa dan sewa berikutnya untuk cek kondisi sepeda:
- [✔] 15 menit
- [ ] 30 menit
- [ ] Lainnya: ___

**H4. Berapa maksimum sepeda per satu transaksi?**
- [ ] 5 sepeda
- [ ] 10 sepeda
- [✔] Tidak dibatasi
- [ ] Lainnya: ___

---

## I. Kerusakan & Kehilangan

**I1. Bagaimana biaya ganti rugi kerusakan ditetapkan?**
- [✔] Ditetapkan admin saat pengembalian (berdasarkan kerusakan)
- [ ] Ada daftar tarif baku kerusakan: ___
- [ ] Lainnya: ___

**I2. Bagaimana jika sepeda hilang / tidak dikembalikan?**
> Jawaban: makanya dibuat track gps dan jika hilang konsumen wajib mengganti 100%

---

## J. QR Code & Scan

**J1. Kapan konsumen wajib scan QR?**
- [ ] Hanya atas permintaan admin/owner (via WhatsApp)
- [✔] Wajib saat mulai sewa
- [ ] Wajib berkala (setiap ___ jam)
- [ ] Kombinasi: ___

**J2. Apa konsekuensi jika konsumen tidak scan saat diminta?**
> Jawaban: sesuai petugas penjaga sepeda

---

## K. Data & Armada

**K1. Berapa jumlah sepeda saat ini?**
> Jawaban: 50 unit

**K2. Apa saja kategori sepeda yang ada?**
Contoh: City Bike, MTB, Lipat, Anak, Listrik
> Jawaban: City Bike, MTB, Lipat, Anak, Listrik

**K3. Berapa admin yang akan memakai dashboard?**
> Jawaban: 3 orang

**K4. Apakah ada data lama yang perlu dimigrasikan?**
Data sepeda, foto, riwayat penyewaan dari catatan manual / spreadsheet?
- [✔] Tidak ada, mulai dari nol
- [ ] Ada, yaitu: ___

---

## L. Branding & Domain

**L1. Apakah sudah ada nama domain yang diinginkan?**
Contoh: rafago.id, rafago.com, sewasepeda.id
> Jawaban: rafago.com

**L2. Apakah website perlu dua bahasa (Indonesia + Inggris)?**
Untuk melayani wisatawan asing:
- [✔] Indonesia saja
- [ ] Indonesia + Inggris
- [ ] Indonesia saja dulu, tambah Inggris nanti

---

## M. Retensi Data (Privasi)

**M1. Apakah setuju dengan usulan masa simpan data?**

| Data | Usulan Masa Simpan |
|---|---|
| Foto identitas konsumen | 30 hari setelah transaksi selesai |
| Foto kondisi sepeda | 12 bulan |
| Titik lokasi scan | 6 bulan |
| Bukti pembayaran | Sesuai kebutuhan pembukuan (tanpa batas) |

- [✔] Setuju
- [ ] Ubah: ___

---

## Catatan

Pertanyaan ini perlu dijawab sebelum fitur pemesanan, pembayaran, dan denda bisa dibangun. Semakin cepat dijawab, semakin cepat website bisa dirilis.

Bagian yang **sudah bisa dikerjakan tanpa jawaban ini**: setup project, landing page, katalog sepeda, desain database, komponen UI dasar.

> Silakan jawab bertahap — tidak harus sekaligus. Prioritas tertinggi: **A (tenggat), B (harga), E4 (rekening), H1 (jam operasional), K (data armada)**.
