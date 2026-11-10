# Rencana Implementasi: Sistem Pelacakan GPS Sepeda Berbasis QR & Geofencing CitraRaya City Jambi

Dokumen ini memuat rencana arsitektur dan teknis implementasi fitur **Live Tracking GPS Sepeda melalui QR Code HP Konsumen** serta **Dashboard Pemantauan Interaktif Armada Sepeda dengan Geofencing Kawasan CitraRaya City Jambi**.

---

## 1. Ringkasan Kebutuhan & Keputusan

Berdasarkan jawaban kuesioner dan data wilayah:
1. **Mekanisme Pelacakan HP Konsumen**:
   - Konsumen menyalin/memindai kode QR fisik yang menempel di stang/frame sepeda (misal: `/s?bike=CB-02` atau via menu scan QR).
   - Layar sewa HP konsumen **mewajibkan izin GPS perangkat** (`enableHighAccuracy: true`). Jika izin ditolak atau GPS mati, layar menampilkan peringatan panduan menyalakan GPS dan mengunci tombol mulai sewa.
   - Selama durasi sewa aktif dan halaman dibuka, browser menjalankan *heartbeat background watchPosition* setiap 15–20 detik untuk memperbarui koordinat ke sistem/database.
2. **Pusat Pemantauan Admin (Dashboard Tracking Center)**:
   - Peta interaktif berbasis Leaflet & OpenStreetMap beresolusi tinggi, terpusat di kawasan **CitraRaya City Jambi** (Mendalo / Pematang Gajah, Muaro Jambi).
   - Menampilkan titik armada sepeda secara real-time dengan status warna (Sedang Disewa, Siap Pakai, Perlu Servis, Diluar Area).
   - Kartu info cepat sepeda saat penanda diklik (nama penyewa, sisa waktu sewa, kecepatan, koordinat, baterai/sinyal indikatif).
3. **Geofencing CitraRaya City Jambi**:
   - Titik pusat: `Lat -1.6375, Lng 103.4969` (Kawasan Boulevard CitraRaya City Mendalo).
   - Radius zona aman operasional: **2.5 km** mencakup area perumahan, Danau CitraRaya, Waterpark, dan Boulevard Utama.
   - Jika sepeda berada di luar radius operasional, sistem memberikan peringatan visual merah di dashboard admin serta notifikasi peringatan di HP penyewa.

---

## 2. Diagram Alur & Arsitektur

```
[ Sepeda Fisik ]
       | (Stiker QR Code)
       v
[ HP Konsumen ] 
   -> Buka Halaman Sewa (/s?code=...)
   -> Pop-up Wajib Akses GPS ("Izinkan Lokasi Presisi")
   -> navigator.geolocation.watchPosition() aktif
   -> Kirim lat, lng, akurasi, timestamp tiap 15s ke Supabase
       |
       v
[ Supabase Database ]
   - Tabel `bikes`: update last_latitude, last_longitude, last_ping_at, is_out_of_bounds
   - Tabel `qr_scans`: log riwayat pergerakan & tracking ping
       |
       v
[ Dashboard Admin / Owner ]
   - Peta Interaktif Leaflet + OpenStreetMap (CitraRaya City Jambi)
   - Lingkaran Geofence 2.5 KM (Zona Hijau Operasional)
   - Marker Sepeda Real-time + Peringatan Alarm Sepeda Keluar Batas
```

---

## 3. Spesifikasi Lokasi CitraRaya City Jambi

- **Koordinat Pusat**: `-1.6375, 103.4969` (Pematang Gajah / Mendalo Darat, Kec. Jambi Luar Kota, Kabupaten Muaro Jambi).
- **Landmark Utama**:
  - Gerbang Utama CitraRaya City Boulevard
  - Bundaran CitraRaya City
  - Kolam Retensi / Danau CitraRaya
  - World Water Park CitraRaya City Jambi
  - Sentra Niaga & Ruko Promenade
- **Batas Geofence**: Radius 2.500 meter dari titik pusat. Formula Haversine digunakan untuk menghitung jarak langsung dari koordinat sepeda ke titik pusat.

---

## 4. Rincian Modul yang Akan Dikerjakan

### Tahap 1: Pemasangan Dependensi Peta & Ikon
- Memasang paket `leaflet` dan `@types/leaflet` untuk rendering peta interaktif yang ringan, mulus, dan tanpa memerlukan API key berbayar.
- Menyediakan styling CSS Leaflet di `src/index.css`.

### Tahap 2: Penguatan Layar Konsumen (QR Scanner & Live GPS Sender)
- **File**: `src/components/public/QRScanView.tsx` dan `src/lib/context/RentalContext.tsx`.
- Menambahkan **Modal Wajib GPS**:
  - Edukasi pengguna: "RAFA GO membutuhkan akses lokasi presisi untuk memastikan keamanan sepeda selama gowes di kawasan CitraRaya City Jambi."
  - Deteksi status izin browser (`navigator.permissions.query({ name: 'geolocation' })`).
  - Pemanggilan `navigator.geolocation.watchPosition` dengan opsi `{ enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }`.
- Menambahkan transmisi periodik koordinat ke database `bikes` & `qr_scans`.
- Menampilkan widget status di layar HP konsumen:
  - "GPS Aktif & Terpantau (Akurasi: ±5m)"
  - Indikator status area: "Kamu berada di dalam zona aman CitraRaya City" atau "PERINGATAN: Kamu keluar dari batas kawasan rental!"

### Tahap 3: Pembaruan Dashboard Pemantauan Admin (Tracking Center)
- **File**: `src/components/dashboard/TrackingCenterTab.tsx`.
- Mengganti tampilan statis dengan **Peta Interaktif Leaflet**:
  - Tile peta OpenStreetMap yang tajam dan responsif.
  - Visualisasi poligon/lingkaran batas aman CitraRaya City Jambi berwarna toska/cyan transparan dengan garis batas putus-putus.
  - Marker kustom untuk setiap sepeda berdasarkan status:
    - 🟢 **Hijau/Toska**: Sedang disewa & berada di dalam area aman.
    - 🔴 **Merah Berkedip**: Sepeda disewa yang melanggar batas geofence (>2.5 km).
    - 🔵 **Biru**: Sepeda standby di pos rental.
  - Fitur interaksi:
    - Klik marker untuk melihat info detail sepeda, penyewa, waktu sewa, dan tombol hubungi WhatsApp penyewa.
    - Tombol "Fokus ke CitraRaya City" untuk mengembalikan sudut pandang peta.
    - Filter cepat armada (Semua, Sedang Gowes, Di Luar Area, Siap Pakai).
  - Panel samping rekap telemetri armada real-time (jumlah sepeda di dalam area vs di luar area).

### Tahap 4: Sinkronisasi Supabase Real-Time
- Memastikan field koordinat (`last_latitude`, `last_longitude`, `last_ping_at`, `is_out_of_bounds`) tersimpan baik di state lokal maupun kolom Supabase, dengan fallback mulus agar sistem tetap berjalan tanpa hambatan jika koneksi offline sementara.

---

## 5. Rencana Verifikasi & Pengujian

1. **Uji Kompilasi & Linting**:
   - Menjalankan `compile_applet` dan `lint_applet` untuk memastikan seluruh tipe data TypeScript dan dependensi Leaflet valid.
2. **Uji Izin GPS di HP**:
   - Mensimulasikan persetujuan izin geolocation di browser serta penolakan izin untuk memastikan pesan error dan pemblokiran sewa berjalan tepat.
3. **Uji Geofence & Jarak Haversine**:
   - Menguji koordinat di dalam CitraRaya City (misal: `-1.6375, 103.4969` -> jarak 0 m, status Aman).
   - Menguji koordinat di luar CitraRaya City (misal: Jambi Kota / Sipin `-1.609, 103.585` -> jarak ~10 km, status Pelanggaran/Keluar Batas).
4. **Uji Interaksi Peta Admin**:
   - Memastikan zoom, pan, klik marker, dan filter sepeda di peta berjalan responsif di layar desktop maupun mobile admin.

---

Mohon klik tombol **Proceed** untuk melanjutkan implementasi fitur ini secara lengkap.
