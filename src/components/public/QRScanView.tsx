/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRental } from '../../lib/context/RentalContext';
import {
  checkCitraRayaGeofence,
  CITRARAYA_JAMBI_CENTER,
  CITRARAYA_GEOFENCE_RADIUS_METERS,
} from '../../lib/utils/geoUtils';
import { getSupabaseClient } from '../../lib/supabase/client';
import {
  QrCode,
  MapPin,
  CheckCircle2,
  Bike,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Navigation,
  Compass,
  Radio,
  RefreshCw,
  ExternalLink,
  Info,
  Smartphone,
  Lock,
  Zap,
} from 'lucide-react';

export const QRScanView: React.FC = () => {
  const { bikes, bookings, viewParams, recordQRScan, navigateTo } = useRental();

  // Extract bike code from viewParams.token or query string fallback
  const getCleanToken = (): string => {
    if (viewParams.token) return viewParams.token.toUpperCase().trim();
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const urlTok = sp.get('token') || sp.get('code');
      if (urlTok) return urlTok.toUpperCase().trim();
      if (window.location.hash.includes('token=')) {
        const m = window.location.hash.match(/token=([^&]+)/);
        if (m) return decodeURIComponent(m[1]).toUpperCase().trim();
      }
    }
    return 'CB-01';
  };

  const tokenParam = getCleanToken();

  // Cari sepeda berdasarkan token QR, kode sepeda, atau ID
  const bike =
    bikes.find(
      (b) =>
        b.code.toUpperCase() === tokenParam ||
        b.qrToken.toUpperCase().includes(tokenParam) ||
        b.id.toUpperCase() === tokenParam
    ) || bikes[0];

  const activeBooking = bookings.find(
    (b) => b.status === 'sedang_disewa' && b.items.some((i) => i.bikeId === bike.id)
  );

  // Status GPS Tracking
  const [gpsStatus, setGpsStatus] = useState<
    'prompt' | 'requesting' | 'active' | 'denied' | 'hardware_off'
  >('prompt');
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number;
    address: string;
  } | null>(null);
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);
  const [pingCount, setPingCount] = useState<number>(0);
  const [isSendingPing, setIsSendingPing] = useState(false);
  const [pingSuccessNotice, setPingSuccessNotice] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<any>(null);

  // Evaluasi Geofence CitraRaya City Jambi
  const geofence = currentCoords
    ? checkCitraRayaGeofence(currentCoords.lat, currentCoords.lng)
    : bike.currentLocation
    ? checkCitraRayaGeofence(bike.currentLocation.lat, bike.currentLocation.lng)
    : null;

  // Fungsi pengiriman titik koordinat real-time ke sistem & Supabase
  const sendLocationPing = (
    lat: number,
    lng: number,
    accuracy?: number,
    speed?: number,
    customAddress?: string
  ) => {
    setIsSendingPing(true);
    const gf = checkCitraRayaGeofence(lat, lng);
    const address =
      customAddress ||
      (gf.isInside
        ? `${gf.nearestLandmark} (CitraRaya City)`
        : `Titik GPS (${lat.toFixed(5)}, ${lng.toFixed(5)})`);

    setCurrentCoords({
      lat,
      lng,
      accuracy,
      speed,
      address,
    });

    // 1. Simpan ke local context
    recordQRScan(bike.qrToken, lat, lng, address, accuracy, speed);

    // 2. Simpan langsung ke Supabase cloud database
    const client = getSupabaseClient();
    if (client) {
      client
        .from('qr_scans')
        .insert({
          bike_id: bike.id,
          bike_code: bike.code,
          booking_code: activeBooking ? activeBooking.bookingCode : 'LIVE-HP-SCAN',
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          address: address,
          scanner_role: 'konsumen',
          scanned_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          setIsSendingPing(false);
          if (error) {
            console.error('Supabase QRScanView insert error:', error.message);
          } else {
            console.log('✅ GPS HP berhasil terkirim ke Supabase:', bike.code, lat, lng);
            setPingSuccessNotice('Terkirim ke Peta Admin');
            setTimeout(() => setPingSuccessNotice(null), 2500);
          }
        });
    } else {
      setIsSendingPing(false);
    }

    const nowStr =
      new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' WIB';

    setLastPingTime(nowStr);
    setPingCount((prev) => prev + 1);

    // Gentle haptic feedback if mobile device supports it
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch {}
    }
  };

  // Fungsi pengambilan koordinat GPS HP pintar (Akurasi Tinggi + Fallback Seluler/WiFi)
  const startGpsTracking = () => {
    setGpsStatus('requesting');
    setGpsError(null);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatus('denied');
      setGpsError('Perangkat atau browser kamu tidak mendukung sensor Geolocation/GPS.');
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, speed } = position.coords;
      setGpsStatus('active');
      sendLocationPing(
        latitude,
        longitude,
        Math.round(accuracy),
        speed ? Math.round(speed * 3.6) : undefined
      );

      // Pasang watchPosition agar otomatis memperbarui saat HP berpindah
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      try {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (watchPos) => {
            const {
              latitude: wLat,
              longitude: wLng,
              accuracy: wAcc,
              speed: wSpd,
            } = watchPos.coords;
            sendLocationPing(
              wLat,
              wLng,
              Math.round(wAcc),
              wSpd ? Math.round(wSpd * 3.6) : undefined
            );
          },
          (watchErr) => {
            console.warn('WatchPosition error:', watchErr.message);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 25000,
          }
        );
      } catch (err) {
        console.warn('Failed to attach watchPosition:', err);
      }
    };

    // Helper untuk percobaan fallback jaringan
    const tryNetworkFallback = () => {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        (secondError) => {
          console.error('Semua percobaan Geolocation gagal:', secondError.message);
          if (secondError.code === secondError.PERMISSION_DENIED) {
            setGpsStatus('denied');
            setGpsError(
              'Izin akses lokasi ditolak di browser. Harap izinkan akses lokasi agar sistem tracking dapat mendeteksi posisi sepeda kamu.'
            );
          } else {
            setGpsStatus('hardware_off');
            setGpsError(
              'Layanan Lokasi (GPS) di HP kamu sedang nonaktif. Silakan tarik bar notifikasi HP Anda ke bawah dan nyalakan sakelar "Lokasi" atau "GPS".'
            );
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 30000,
        }
      );
    };

    // Percobaan 1: Coba GPS Satelit Akurasi Tinggi
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (firstError) => {
        console.warn('Percobaan 1 GPS Satelit gagal, mencoba fallback jaringan:', firstError.message);

        // Jika user secara eksplisit menolak izin (PERMISSION_DENIED)
        if (firstError.code === firstError.PERMISSION_DENIED) {
          setGpsStatus('denied');
          setGpsError(
            'Izin akses lokasi ditolak di browser. Silakan klik ikon gembok / perizinan di bilah alamat browser HP kamu untuk mengizinkan lokasi.'
          );
          return;
        }

        // Coba fallback jaringan (WiFi / Seluler) jika satelit timeout atau belum lock
        tryNetworkFallback();
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 10000,
      }
    );
  };

  // Otomatis minta izin saat pertama kali halaman dibuka
  useEffect(() => {
    startGpsTracking();
  }, [bike.code]);

  // Pasang heartbeat interval setiap 5 detik saat GPS aktif
  useEffect(() => {
    if (gpsStatus === 'active') {
      pingIntervalRef.current = setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude, accuracy, speed } = pos.coords;
              sendLocationPing(
                latitude,
                longitude,
                Math.round(accuracy),
                speed ? Math.round(speed * 3.6) : undefined
              );
            },
            () => {
              if (currentCoords) {
                sendLocationPing(
                  currentCoords.lat,
                  currentCoords.lng,
                  currentCoords.accuracy,
                  currentCoords.speed,
                  currentCoords.address
                );
              }
            },
            { enableHighAccuracy: false, timeout: 6000, maximumAge: 6000 }
          );
        }
      }, 5000);
    }

    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [gpsStatus, bike.code, currentCoords?.lat, currentCoords?.lng]);

  // Tombol simulasi titik uji coba kawasan CitraRaya City Jambi
  const handleSimulateLocation = (lat: number, lng: number, landmarkName: string) => {
    setGpsStatus('active');
    sendLocationPing(lat, lng, 3, 12, landmarkName);
  };

  return (
    <div className="py-6 sm:py-10 bg-[#FAFDFE] min-h-screen">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-5">
        {/* Top Header Card */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF9FA] text-[#00696D] flex items-center justify-center mx-auto border border-[#4FC3C8]/40 shadow-xs">
            <Radio className="w-7 h-7 animate-pulse text-[#00696D]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#12202F] text-white text-[11px] font-bold">
            <span>SISTEM TRACKING RESMI RAFA GO</span>
          </div>
          <h1 className="font-heading text-2xl font-black text-[#12202F]">
            Live GPS Tracking Sepeda
          </h1>
          <p className="text-xs text-[#5B7083] max-w-md mx-auto">
            Halaman ini menghubungkan sinyal GPS di HP kamu secara otomatis ke Dashboard Admin RAFA GO di CitraRaya City Jambi.
          </p>
        </div>

        {/* ======================================================== */}
        {/* PANDUAN AKTIVASI / NOTIFIKASI GPS HP */}
        {/* ======================================================== */}

        {/* 1. KONDISI: BELUM TERHUBUNG / BUTUH GESTURE PENGGUNA (PROMPT) */}
        {gpsStatus === 'prompt' && (
          <div className="p-6 rounded-3xl bg-[#12202F] text-white space-y-4 shadow-xl border-2 border-[#4FC3C8] text-center animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-[#4FC3C8]/20 text-[#4FC3C8] flex items-center justify-center mx-auto border border-[#4FC3C8]/40 shadow-inner">
              <Navigation className="w-7 h-7 animate-pulse text-[#4FC3C8]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#4FC3C8] uppercase tracking-wider block">
                Konfirmasi Izin GPS HP
              </span>
              <h3 className="font-heading font-black text-lg text-white mt-0.5">
                Koneksikan Sepeda [{bike.code}] ke Admin
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto mt-1.5">
                Klik tombol di bawah untuk mengaktifkan sensor lokasi di HP kamu agar admin dapat memantau rute sepeda di peta CitraRaya City Jambi.
              </p>
            </div>

            <button
              type="button"
              onClick={startGpsTracking}
              className="w-full py-4 rounded-2xl bg-[#4FC3C8] hover:bg-[#3db0ba] text-[#12202F] font-heading font-black text-sm flex items-center justify-center gap-2.5 cursor-pointer shadow-lg transition-all active:scale-[0.98]"
            >
              <Radio className="w-5 h-5 text-[#12202F] animate-pulse" />
              <span>AKTIFKAN GPS HP SEKARANG</span>
            </button>

            <p className="text-[11px] text-slate-400">
              🔒 Lokasi kamu diproses aman secara real-time via koneksi terenkripsi.
            </p>
          </div>
        )}

        {/* 2. KONDISI: SEDANG MEMINTA IZIN (REQUESTING) */}
        {gpsStatus === 'requesting' && (
          <div className="p-5 rounded-2xl bg-[#EBF9FA] border-2 border-[#4FC3C8] text-center space-y-3 shadow-md animate-in fade-in">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto text-[#00696D] shadow-xs">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <h3 className="font-heading font-black text-base text-[#12202F]">
              Meminta Izin Lokasi di HP Kamu...
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed max-w-sm mx-auto">
              Perhatikan kotak dialog yang muncul di layar browser HP kamu, lalu pilih:
            </p>
            <div className="inline-block p-2.5 rounded-xl bg-white border border-[#4FC3C8] font-bold text-xs text-[#00696D] shadow-xs">
              👉 Pilih "Izinkan saat menggunakan situs" / "Allow"
            </div>
            <div>
              <button
                onClick={startGpsTracking}
                className="text-xs text-sky-700 underline font-semibold cursor-pointer"
              >
                Klik di sini jika dialog tidak muncul
              </button>
            </div>
          </div>
        )}

        {/* 3. KONDISI: GPS FISIK HP NONAKTIF (HARDWARE_OFF) */}
        {gpsStatus === 'hardware_off' && (
          <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-3 shadow-md animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-400 text-amber-950 shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-black text-sm text-amber-950">
                  Layanan Lokasi (GPS) di HP Kamu Sedang Mati!
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Browser tidak dapat mendeteksi posisi karena sakelar GPS di HP Anda dalam posisi nonaktif (OFF).
                </p>
              </div>
            </div>

            {/* Step-by-Step Guide to Turn On GPS on Phone */}
            <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-2">
              <p className="font-bold text-slate-800">Cara menyalakan GPS di HP Anda:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                <li>
                  Tarik layar HP kamu <strong>dari atas ke bawah</strong> untuk membuka menu Pengaturan Cepat / Bar Notifikasi.
                </li>
                <li>
                  Cari ikon bertuliskan <strong>"Lokasi"</strong> atau <strong>"GPS"</strong> lalu ketuk hingga menyala (warna biru/aktif).
                </li>
                <li>Setelah GPS HP menyala, klik tombol di bawah ini:</li>
              </ol>
            </div>

            <button
              onClick={startGpsTracking}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sudah Dinyalakan, Deteksi Ulang Lokasi Saya</span>
            </button>
          </div>
        )}

        {/* 4. KONDISI: IZIN DITOLAK BROWSER (DENIED) */}
        {gpsStatus === 'denied' && (
          <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 space-y-3 shadow-md animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-black text-sm text-rose-950">
                  Akses Lokasi Diblokir di Browser HP
                </h3>
                <p className="text-xs text-rose-900 leading-relaxed">
                  {gpsError || 'Browser HP Anda belum memberikan izin akses lokasi untuk website ini.'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-rose-200 text-xs space-y-1.5 text-slate-700">
              <p className="font-bold text-slate-900">Cara membuka blokir izin:</p>
              <p className="text-[11px] leading-relaxed">
                Ketuk <strong>ikon gembok / setelan izin</strong> di sebelah kiri bilah alamat URL (di bagian atas browser HP kamu) → pilih <strong>"Izin Situs"</strong> → ubah Lokasi menjadi <strong>"Izinkan" (Allow)</strong>.
              </p>
            </div>

            <button
              onClick={startGpsTracking}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Coba Minta Izin Ulang</span>
            </button>
          </div>
        )}

        {/* 5. KONDISI: GPS BERHASIL TERHUBUNG & LIVE TRANSMITTING */}
        {gpsStatus === 'active' && currentCoords && (
          <div className="space-y-3 animate-in fade-in">
            {/* Success Status Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="font-heading font-black text-xs text-emerald-900 tracking-wide uppercase">
                    GPS HP AKTIF &amp; TERHUBUNG KE ADMIN!
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {pingSuccessNotice && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded animate-pulse">
                      {pingSuccessNotice}
                    </span>
                  )}
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                    Ping #{pingCount}
                  </span>
                </div>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Titik lokasi HP kamu saat ini terkirim secara berkala ke peta dashboard admin setiap 5 detik.
              </p>
            </div>

            {/* Geofence Alert Check */}
            {geofence && (
              <div
                className={`p-4 rounded-2xl border-2 space-y-1.5 shadow-xs ${
                  geofence.isInside
                    ? 'bg-[#EBF9FA] border-[#4FC3C8] text-[#00696D]'
                    : 'bg-rose-50 border-rose-500 text-rose-950 animate-pulse'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    {geofence.isInside ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>
                      {geofence.isInside
                        ? 'ZONA AMAN OPERASIONAL CITRARAYA'
                        : '⚠️ DI LUAR KAWASAN SEWA RESMI!'}
                    </span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      geofence.isInside
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    Radius: 2.5 km
                  </span>
                </div>

                <p className="text-xs leading-relaxed">
                  {geofence.isInside
                    ? `Kamu berada di dalam area sewa CitraRaya City Jambi. Jarak dari Boulevard Utama: ${geofence.formattedDistance}.`
                    : `Posisi Anda terdeteksi ${geofence.formattedDistance} dari pusat CitraRaya City Jambi. Harap kembali ke area Boulevard / Danau CitraRaya.`}
                </p>
              </div>
            )}

            {/* Live Telemetry Display */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-[#12202F] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  <span>Data Koordinat HP Kamu</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {lastPingTime || 'Baru saja'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-slate-700">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Lintang (Lat):</span>
                  <span className="font-mono font-bold text-xs text-[#12202F]">
                    {currentCoords.lat.toFixed(6)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Bujur (Lng):</span>
                  <span className="font-mono font-bold text-xs text-[#12202F]">
                    {currentCoords.lng.toFixed(6)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Akurasi Sensor:</span>
                  <span className="font-bold text-xs text-emerald-600">
                    ±{currentCoords.accuracy || 5} meter
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Status Kirim:</span>
                  <span className="font-bold text-xs text-sky-600 flex items-center gap-1">
                    {isSendingPing ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <span>Tersinkron (Supabase)</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() =>
                    sendLocationPing(
                      currentCoords.lat,
                      currentCoords.lng,
                      currentCoords.accuracy,
                      currentCoords.speed,
                      currentCoords.address
                    )
                  }
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Kirim Sinyal GPS Sekarang (Manual Ping)</span>
                </button>
              </div>
            </div>

            {/* Quick Testing Landmarks in CitraRaya City Jambi */}
            <div className="p-3.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Uji Coba Titik Simulasi CitraRaya City Jambi:</span>
                </span>
                <span className="text-[10px] text-slate-500">Live Test</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleSimulateLocation(-1.6375, 103.4969, 'Stasiun Hub CRC (Boulevard)')
                  }
                  className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-700 border border-slate-200 text-left truncate cursor-pointer shadow-2xs"
                >
                  📍 1. Hub CRC Boulevard
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSimulateLocation(-1.634, 103.4985, 'Danau & Taman CitraRaya')
                  }
                  className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-700 border border-slate-200 text-left truncate cursor-pointer shadow-2xs"
                >
                  🌳 2. Danau CitraRaya
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSimulateLocation(-1.639, 103.495, 'Bundaran Utama CitraRaya')
                  }
                  className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-700 border border-slate-200 text-left truncate cursor-pointer shadow-2xs"
                >
                  ⭕ 3. Bundaran Utama CRC
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSimulateLocation(-1.67, 103.52, 'Luar Batas (Simulasi Alarm)')
                  }
                  className="py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-[11px] font-bold text-rose-700 border border-rose-200 text-left truncate cursor-pointer shadow-2xs"
                >
                  ⚠️ 4. Luar Batas (Alarm)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* DETAIL SEPEDA YANG DISCAN */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2EBF0] shadow-sm space-y-4">
          <div className="flex items-center gap-3.5">
            <img
              src={bike.image}
              alt={bike.name}
              className="w-18 h-18 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-xs"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#12202F] text-white">
                  {bike.code}
                </span>
                <span className="text-xs font-semibold text-[#00696D]">
                  {bike.categoryName}
                </span>
              </div>
              <h2 className="font-heading font-bold text-base text-[#12202F] truncate">
                {bike.name}
              </h2>
              <p className="text-xs text-[#5B7083] font-mono mt-0.5">
                Token: {bike.qrToken}
              </p>
            </div>
          </div>

          {/* Aturan Gowes Kawasan CitraRaya */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <h3 className="text-xs font-bold text-[#12202F] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00696D]" />
              Aturan Gowes CitraRaya City Jambi
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <li>✓ Biarkan halaman ini tetap terbuka di browser HP selama perjalanan.</li>
              <li>✓ Tetap berada dalam radius aman 2.5 km dari Boulevard Utama CitraRaya.</li>
              <li>✓ Kunci sepeda menggunakan gembok kabel saat berhenti beristirahat.</li>
              <li>✓ Hubungi WhatsApp admin darurat jika rantai lepas atau ban kempis.</li>
            </ul>
          </div>
        </div>

        {/* Back navigation */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigateTo('home')}
            className="text-xs text-slate-500 hover:text-[#12202F] hover:underline cursor-pointer"
          >
            ← Kembali ke Beranda RAFA GO
          </button>
        </div>
      </div>
    </div>
  );
};
