/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRental } from '../../lib/context/RentalContext';
import {
  CITRARAYA_JAMBI_CENTER,
  CITRARAYA_GEOFENCE_RADIUS_METERS,
  CITRARAYA_LANDMARKS,
  checkCitraRayaGeofence,
} from '../../lib/utils/geoUtils';
import { getSupabaseClient } from '../../lib/supabase/client';
import L from 'leaflet';
import {
  MapPin,
  Bike,
  Clock,
  Compass,
  Search,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Radio,
  ExternalLink,
  Phone,
  Maximize2,
  RefreshCw,
  CheckCircle2,
  Layers,
  Smartphone,
  Eye,
  Trash2,
  X,
} from 'lucide-react';

interface LiveScanData {
  id: string;
  bikeId: string;
  bikeCode: string;
  lat: number;
  lng: number;
  address: string;
  scannedAt: string;
  scannerRole: string;
}

export const TrackingCenterTab: React.FC = () => {
  const { bikes, bookings } = useRental();

  const [selectedBikeId, setSelectedBikeId] = useState<string>(bikes[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live_phone' | 'out_of_bounds' | 'available'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Live scans from Supabase database (synced across multiple devices / mobile phones)
  const [liveScansMap, setLiveScansMap] = useState<Record<string, LiveScanData>>({});
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [latestActiveScan, setLatestActiveScan] = useState<LiveScanData | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const previousScanIdRef = useRef<string>('');

  // Fetch live scans from Supabase cloud database
  const fetchScansFromSupabase = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      setIsSyncing(true);
      const { data, error } = await client
        .from('qr_scans')
        .select('*')
        .order('scanned_at', { ascending: false })
        .limit(60);

      if (error) {
        console.warn('Supabase qr_scans fetch error:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const newMap: Record<string, LiveScanData> = {};
        data.forEach((row) => {
          const code = (row.bike_code || '').toUpperCase();
          if (code && !newMap[code]) {
            newMap[code] = {
              id: row.id,
              bikeId: row.bike_id,
              bikeCode: code,
              lat: Number(row.lat),
              lng: Number(row.lng),
              address: row.address || 'Titik GPS Konsumen',
              scannedAt: row.scanned_at,
              scannerRole: row.scanner_role || 'konsumen',
            };
          }
        });

        setLiveScansMap(newMap);
        setLastSyncTime(
          new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
        );

        // Find most recent scan
        const top = data[0];
        if (top) {
          const latest: LiveScanData = {
            id: top.id,
            bikeId: top.bike_id,
            bikeCode: (top.bike_code || '').toUpperCase(),
            lat: Number(top.lat),
            lng: Number(top.lng),
            address: top.address || 'Titik GPS Konsumen',
            scannedAt: top.scanned_at,
            scannerRole: top.scanner_role || 'konsumen',
          };
          setLatestActiveScan(latest);
        }
      } else {
        setLiveScansMap({});
        setLatestActiveScan(null);
      }
    } catch (err) {
      console.error('fetchScansFromSupabase error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Poll Supabase every 4 seconds and subscribe to Realtime postgres_changes
  useEffect(() => {
    fetchScansFromSupabase();

    const interval = setInterval(() => {
      fetchScansFromSupabase();
    }, 4000);

    const client = getSupabaseClient();
    let channel: any = null;
    if (client) {
      channel = client
        .channel('qr_scans_realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'qr_scans' },
          (payload) => {
            console.log('⚡ Realtime GPS scan detected from phone:', payload.new);
            fetchScansFromSupabase();
          }
        )
        .subscribe();
    }

    return () => {
      clearInterval(interval);
      if (channel && client) {
        client.removeChannel(channel);
      }
    };
  }, [fetchScansFromSupabase]);

  // Otomatis arahkan peta ke posisi HP konsumen saat scan baru masuk
  useEffect(() => {
    if (latestActiveScan && latestActiveScan.id !== previousScanIdRef.current) {
      previousScanIdRef.current = latestActiveScan.id;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([latestActiveScan.lat, latestActiveScan.lng], 16, {
          duration: 1.2,
        });
      }
    }
  }, [latestActiveScan]);

  // Gabungkan data armada sepeda dengan data scan live GPS dari Supabase
  const fleetWithLiveGps = bikes.map((bike) => {
    const liveScan = liveScansMap[bike.code.toUpperCase()];

    if (liveScan) {
      const gf = checkCitraRayaGeofence(liveScan.lat, liveScan.lng);
      return {
        ...bike,
        isLivePhoneConnected: true,
        currentLocation: {
          lat: liveScan.lat,
          lng: liveScan.lng,
          address: liveScan.address,
          lastUpdated: new Date(liveScan.scannedAt).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WIB',
          isOutOfBounds: !gf.isInside,
          distanceFromCenterMeters: gf.distanceMeters,
        },
      };
    }

    return {
      ...bike,
      isLivePhoneConnected: false,
    };
  });

  // Filter bikes
  const filteredBikes = fleetWithLiveGps.filter((b) => {
    const matchesSearch =
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterStatus === 'live_phone') return b.isLivePhoneConnected;
    if (filterStatus === 'available') return !b.isLivePhoneConnected;
    if (filterStatus === 'out_of_bounds') {
      return b.isLivePhoneConnected && b.currentLocation?.isOutOfBounds === true;
    }
    return true;
  });

  const selectedBike =
    fleetWithLiveGps.find((b) => b.id === selectedBikeId) || fleetWithLiveGps[0];

  const livePhonesCount = fleetWithLiveGps.filter((b) => b.isLivePhoneConnected).length;
  const outOfBoundsCount = fleetWithLiveGps.filter(
    (b) => b.isLivePhoneConnected && b.currentLocation?.isOutOfBounds === true
  ).length;

  // Inisialisasi Peta Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Inisialisasi peta berpusat di CitraRaya City Jambi pada zoom 15 (Level Jalanan)
    const map = L.map(mapContainerRef.current, {
      center: [CITRARAYA_JAMBI_CENTER.lat, CITRARAYA_JAMBI_CENTER.lng],
      zoom: 15,
      zoomControl: true,
      minZoom: 6,
      maxZoom: 19,
    });

    // Pasang tile OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> • RAFA GO CitraRaya City Jambi',
      maxZoom: 19,
    }).addTo(map);

    // Tambahkan Lingkaran Geofence 2.5 KM (Zona Aman Operasional)
    const geofenceCircle = L.circle(
      [CITRARAYA_JAMBI_CENTER.lat, CITRARAYA_JAMBI_CENTER.lng],
      {
        radius: CITRARAYA_GEOFENCE_RADIUS_METERS,
        color: '#00696D',
        fillColor: '#4FC3C8',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '8, 8',
      }
    ).addTo(map);

    geofenceCircle.bindTooltip(
      '<strong>Batas Geofence CitraRaya City Jambi (Radius 2.5 km)</strong><br>Batas aman operasional rental sepeda',
      { permanent: false, direction: 'top' }
    );

    // Marker Pos Utama Stasiun Pusat RAFA GO
    const stationHtml = `
      <div style="background-color: #12202F; color: #4FC3C8; border: 2px solid #4FC3C8; padding: 4px 10px; border-radius: 9999px; font-weight: 800; font-size: 11px; box-shadow: 0 4px 14px rgba(0,0,0,0.35); display: flex; align-items: center; gap: 6px; white-space: nowrap;">
        <span>🏠 Stasiun Hub RAFA GO CRC</span>
      </div>
    `;
    const stationIcon = L.divIcon({
      html: stationHtml,
      className: 'custom-station-icon',
      iconSize: [160, 28],
      iconAnchor: [80, 14],
    });

    L.marker([CITRARAYA_JAMBI_CENTER.lat, CITRARAYA_JAMBI_CENTER.lng], {
      icon: stationIcon,
    })
      .addTo(map)
      .bindPopup(
        `<strong>Stasiun Pusat RAFA GO</strong><br>Ruko Boulevard CitraRaya City Mendalo Jambi<br><span style="color:#00696d;font-size:11px;">Pusat armada sepeda, titik awal sewa & servis</span>`
      );

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Pastikan container ukuran peta langsung dihitung dengan benar
    setTimeout(() => map.invalidateSize(), 150);
    setTimeout(() => map.invalidateSize(), 500);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker sepeda saat data scan HP atau filter berubah
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    // Render penanda untuk setiap sepeda yang terhubung ke HP konsumen
    filteredBikes.forEach((bike) => {
      if (!bike.currentLocation) return;

      const { lat, lng, isOutOfBounds, address, lastUpdated } = bike.currentLocation;
      const isSelected = bike.id === selectedBikeId;
      const isPhoneActive = bike.isLivePhoneConnected;

      // Hitung geofence
      const gf = checkCitraRayaGeofence(lat, lng);

      // Hanya tampilkan pin di peta jika HP konsumen sedang terhubung ATAU sepeda tersebut dipilih di daftar
      if (!isPhoneActive && !isSelected) {
        return;
      }

      let badgeBg = '#10B981'; // Default standby: emerald
      let iconSymbol = '🚲';
      let pulseHtml = '';
      let labelText = bike.code;

      if (isPhoneActive) {
        if (isOutOfBounds) {
          badgeBg = '#E11D48'; // Merah keluar batas
          iconSymbol = '⚠️';
          labelText = `${bike.code} (LUAR BATAS)`;
          pulseHtml = `
            <div style="position: absolute; inset: -8px; border-radius: 9999px; background-color: rgba(225, 29, 72, 0.45); animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          `;
        } else {
          badgeBg = '#0284C7'; // Biru aktif gowes
          iconSymbol = '📱';
          labelText = `${bike.code} (HP Terhubung)`;
          pulseHtml = `
            <div style="position: absolute; inset: -6px; border-radius: 9999px; background-color: rgba(2, 132, 199, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          `;
        }
      }

      const markerHtml = `
        <div style="position: relative; cursor: pointer; display: flex; flex-direction: column; align-items: center;">
          ${pulseHtml}
          <div style="background-color: ${badgeBg}; color: #ffffff; border: 2px solid #ffffff; width: ${
        isPhoneActive ? '38px' : '30px'
      }; height: ${isPhoneActive ? '38px' : '30px'}; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35); font-weight: bold; font-size: ${
        isPhoneActive ? '16px' : '12px'
      };">
            ${iconSymbol}
          </div>
          <div style="background-color: rgba(18, 32, 47, 0.95); color: #ffffff; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 800; font-family: monospace; margin-top: 3px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.25);">
            ${labelText}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'bike-map-marker',
        iconSize: [60, 52],
        iconAnchor: [30, 26],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; min-width: 210px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E2EBF0; padding-bottom: 6px; margin-bottom: 6px;">
            <strong style="font-size: 13px; color: #12202F;">${bike.code} — ${bike.name}</strong>
          </div>
          <div style="margin-bottom: 4px;">
            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; background-color: ${
              isPhoneActive
                ? isOutOfBounds
                  ? '#FFE4E6'
                  : '#E0F2FE'
                : '#DCFCE7'
            }; color: ${
              isPhoneActive
                ? isOutOfBounds
                  ? '#9F1239'
                  : '#0369A1'
                : '#166534'
            };">
              ${
                isPhoneActive
                  ? isOutOfBounds
                    ? '⚠️ TERDETEKSI DI LUAR CITRARAYA!'
                    : '🟢 HP Konsumen Terhubung (Live GPS)'
                  : '✓ Standby di Stasiun Hub'
              }
            </span>
          </div>
          <p style="margin: 4px 0; color: #475569;">📍 ${address}</p>
          <p style="margin: 4px 0; color: #475569;">📏 Jarak dari Boulevard: <strong>${
            gf.formattedDistance
          }</strong></p>
          <p style="margin: 4px 0; color: #475569;">🕒 Terakhir terdeteksi: <strong>${lastUpdated}</strong></p>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setSelectedBikeId(bike.id);
      });

      markersGroup.addLayer(marker);
    });
  }, [filteredBikes, selectedBikeId, filterStatus]);

  // Terbang ke lokasi sepeda terpilih
  const handleFlyToBike = (bike: typeof fleetWithLiveGps[0]) => {
    setSelectedBikeId(bike.id);
    if (mapInstanceRef.current && bike.currentLocation) {
      mapInstanceRef.current.flyTo(
        [bike.currentLocation.lat, bike.currentLocation.lng],
        16,
        { duration: 1.2 }
      );
    }
  };

  // Fokus kembali ke pusat kawasan CitraRaya City Jambi
  const handleResetToCitraRaya = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [CITRARAYA_JAMBI_CENTER.lat, CITRARAYA_JAMBI_CENTER.lng],
        15,
        { duration: 1.2 }
      );
    }
  };

  // Fokus langsung ke titik HP konsumen yang terakhir aktif
  const handleFocusLatestPhone = () => {
    if (!latestActiveScan || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([latestActiveScan.lat, latestActiveScan.lng], 16, {
      duration: 1.2,
    });
  };

  // Sesuaikan zoom peta agar seluruh titik (Hub CRC dan semua HP aktif) terlihat sekaligus di layar
  const handleFitAllBounds = () => {
    if (!mapInstanceRef.current) return;
    const points: L.LatLngExpression[] = [[CITRARAYA_JAMBI_CENTER.lat, CITRARAYA_JAMBI_CENTER.lng]];
    Object.values(liveScansMap).forEach((scan) => {
      points.push([scan.lat, scan.lng]);
    });

    if (points.length === 1) {
      mapInstanceRef.current.flyTo([CITRARAYA_JAMBI_CENTER.lat, CITRARAYA_JAMBI_CENTER.lng], 15, { duration: 1 });
    } else {
      const bounds = L.latLngBounds(points);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  };

  // Putuskan dan hapus sinyal GPS untuk satu unit sepeda tertentu (kembalikan ke Hub)
  const handleDisconnectBike = async (bikeCode: string) => {
    const cleanCode = bikeCode.toUpperCase();
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('qr_scans').delete().eq('bike_code', cleanCode);
        console.log('✅ Berhasil menghapus sinyal sepeda:', cleanCode);
      } catch (err) {
        console.warn('Gagal menghapus scan:', err);
      }
    }

    setLiveScansMap((prev) => {
      const next = { ...prev };
      delete next[cleanCode];
      return next;
    });

    if (latestActiveScan && latestActiveScan.bikeCode === cleanCode) {
      setLatestActiveScan(null);
    }

    await fetchScansFromSupabase();
  };

  // Putuskan dan hapus SEMUA sinyal GPS yang terhubung (kembalikan semua armada ke Stasiun Hub)
  const handleResetAllScans = async () => {
    if (
      !window.confirm(
        'Yakin ingin memutuskan semua koneksi GPS HP? Semua armada sepeda akan kembali standby di Stasiun Hub RAFA GO.'
      )
    ) {
      return;
    }

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('qr_scans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log('✅ Seluruh sinyal QR scans telah dibersihkan');
      } catch (err) {
        console.warn('Gagal menghapus seluruh scan:', err);
      }
    }

    setLiveScansMap({});
    setLatestActiveScan(null);
    await fetchScansFromSupabase();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Supabase Live Status Bar */}
      <div className="bg-white p-6 rounded-3xl border border-[#E2EBF0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF9FA] text-[#00696D] text-xs font-bold mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            <span>Koneksi Database Supabase Live</span>
            {lastSyncTime && (
              <span className="text-[10px] text-slate-500 font-normal">
                • Sinkron: {lastSyncTime}
              </span>
            )}
          </div>
          <h2 className="font-heading font-black text-xl text-[#12202F] flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#00696D]" />
            <span>Live GPS Tracking Armada Sepeda</span>
          </h2>
          <p className="text-xs text-[#5B7083] mt-0.5">
            Menerima transmisi titik koordinat GPS dari HP konsumen saat QR discan dan memantau rute perjalanan secara real-time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {latestActiveScan && (
            <button
              onClick={handleFocusLatestPhone}
              className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              <span>Zoom ke HP ({latestActiveScan.bikeCode})</span>
            </button>
          )}

          <button
            onClick={handleFitAllBounds}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#12202F] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Tampilkan seluruh posisi armada dan stasiun hub di layar"
          >
            <Maximize2 className="w-4 h-4 text-[#00696D]" />
            <span>Lihat Semua Posisi</span>
          </button>

          <button
            onClick={handleResetToCitraRaya}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#12202F] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Compass className="w-4 h-4 text-[#00696D]" />
            <span>Pusatkan ke CitraRaya</span>
          </button>

          {livePhonesCount > 0 && (
            <button
              onClick={handleResetAllScans}
              className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              title="Putuskan semua device HP yang terhubung dan kembalikan ke Hub"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Semua Device ({livePhonesCount})</span>
            </button>
          )}

          <button
            onClick={fetchScansFromSupabase}
            disabled={isSyncing}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors"
            title="Segarkan sinyal GPS sekarang"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#00696D]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Banner if a Phone GPS has connected */}
      {latestActiveScan && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-300 text-sky-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-sky-600 text-white shrink-0 mt-0.5">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-sky-950 flex items-center gap-2">
                <span>HP KONSUMEN TERHUBUNG: SEPEDA {latestActiveScan.bikeCode}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Sinyal Aktif
                </span>
              </h4>
              <p className="text-xs text-sky-800 mt-0.5">
                Koordinat HP: <strong>{latestActiveScan.lat.toFixed(5)}, {latestActiveScan.lng.toFixed(5)}</strong> •{' '}
                {latestActiveScan.address}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleFocusLatestPhone}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 cursor-pointer shadow-xs"
            >
              Lihat Posisi di Peta →
            </button>
            <button
              type="button"
              onClick={() => handleDisconnectBike(latestActiveScan.bikeCode)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              title="Putuskan koneksi HP ini"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Putuskan</span>
            </button>
          </div>
        </div>
      )}

      {/* Geofence Breach Warning Banner if any bike leaves CitraRaya */}
      {outOfBoundsCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-pulse">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-heading font-black text-sm text-rose-950">
                PERINGATAN GEOFENCE: {outOfBoundsCount} UNIT TERDETEKSI DI LUAR CITRARAYA!
              </h4>
              <p className="text-xs text-rose-800 mt-0.5">
                HP konsumen terdeteksi berada di luar radius operasional 2.5 km Boulevard CitraRaya City Jambi.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterStatus('out_of_bounds')}
            className="px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer shrink-0"
          >
            Tampilkan Pelanggar Batas →
          </button>
        </div>
      )}

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2EBF0] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Armada</span>
            <Bike className="w-4 h-4 text-[#00696D]" />
          </div>
          <p className="font-heading font-black text-2xl text-[#12202F] mt-1">{bikes.length}</p>
          <span className="text-[10px] text-slate-400">Semua unit terdaftar</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2EBF0] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>HP Terhubung (Live)</span>
            <Smartphone className="w-4 h-4 text-sky-500 animate-pulse" />
          </div>
          <p className="font-heading font-black text-2xl text-sky-600 mt-1">{livePhonesCount}</p>
          <span className="text-[10px] text-sky-700 font-semibold">
            {livePhonesCount > 0 ? 'Konsumen sedang aktif' : 'Belum ada scan aktif'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2EBF0] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Standby di Hub</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-heading font-black text-2xl text-emerald-600 mt-1">
            {bikes.length - livePhonesCount}
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold">Siap disewa</span>
        </div>

        <div
          className={`p-4 rounded-2xl border shadow-xs ${
            outOfBoundsCount > 0 ? 'bg-rose-50 border-rose-300' : 'bg-white border-[#E2EBF0]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Luar Batas (Alarm)</span>
            <AlertTriangle
              className={`w-4 h-4 ${outOfBoundsCount > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-400'}`}
            />
          </div>
          <p className={`font-heading font-black text-2xl mt-1 ${outOfBoundsCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
            {outOfBoundsCount}
          </p>
          <span className={`text-[10px] font-bold ${outOfBoundsCount > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
            {outOfBoundsCount > 0 ? 'Perlu tindakan!' : 'Kondisi aman'}
          </span>
        </div>
      </div>

      {/* Main Content Grid: Leaflet Map (8 cols) & Fleet Position List (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Leaflet Map */}
        <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-[#E2EBF0] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00696D]" />
              <span className="font-bold text-[#12202F]">
                Peta Kawasan CitraRaya City Jambi (OpenStreetMap Live)
              </span>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-[#12202F] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({bikes.length})
              </button>
              <button
                onClick={() => setFilterStatus('live_phone')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                  filterStatus === 'live_phone'
                    ? 'bg-sky-600 text-white'
                    : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                }`}
              >
                📱 HP Terhubung ({livePhonesCount})
              </button>
              <button
                onClick={() => setFilterStatus('available')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                  filterStatus === 'available'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Standby di Pos
              </button>
              {outOfBoundsCount > 0 && (
                <button
                  onClick={() => setFilterStatus('out_of_bounds')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                    filterStatus === 'out_of_bounds'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                >
                  ⚠️ Luar Batas ({outOfBoundsCount})
                </button>
              )}
            </div>
          </div>

          {/* Interactive Map DOM Container with fixed min-height */}
          <div
            ref={mapContainerRef}
            className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-10"
            style={{ minHeight: '520px' }}
          />

          {/* Map Legend */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] font-bold text-slate-500">Keterangan Penanda:</span>
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span>Standby di Pos Hub</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500 inline-block animate-ping"></span>
                <span className="font-bold text-sky-700">HP Konsumen Terhubung</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-600 inline-block animate-ping"></span>
                <span className="font-bold text-rose-700">Keluar Batas (Alarm)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 border-t-2 border-dashed border-[#00696D] inline-block"></span>
                <span>Radius Geofence 2.5 km</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Fleet List & Selected Bike Telemetry */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Bike Quick Card */}
          {selectedBike && (
            <div className="bg-white p-5 rounded-3xl border border-[#E2EBF0] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs text-slate-500 uppercase tracking-wider">
                  Detail Sepeda Terpilih
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    selectedBike.isLivePhoneConnected
                      ? selectedBike.currentLocation?.isOutOfBounds
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : 'bg-sky-100 text-sky-900 border border-sky-300'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {selectedBike.isLivePhoneConnected
                    ? selectedBike.currentLocation?.isOutOfBounds
                      ? '⚠️ Luar Batas CRC'
                      : '📱 HP Konsumen Terhubung'
                    : 'Standby'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={selectedBike.image}
                  alt={selectedBike.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-100"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs bg-[#12202F] text-white px-2 py-0.5 rounded">
                      {selectedBike.code}
                    </span>
                    <span className="text-[11px] font-semibold text-[#00696D]">
                      {selectedBike.categoryName}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#12202F] truncate mt-1">
                    {selectedBike.name}
                  </h4>
                </div>
              </div>

              {selectedBike.currentLocation && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00696D] shrink-0 mt-0.5" />
                    <span className="text-slate-800 font-medium">
                      {selectedBike.currentLocation.address}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Koordinat GPS:</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {selectedBike.currentLocation.lat.toFixed(5)},{' '}
                      {selectedBike.currentLocation.lng.toFixed(5)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Jarak dari Boulevard:</span>
                    <span className="font-bold text-[#12202F]">
                      {selectedBike.currentLocation.distanceFromCenterMeters
                        ? `${selectedBike.currentLocation.distanceFromCenterMeters} m`
                        : '0 m'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Pembaruan:</span>
                    <span className="text-emerald-600 font-bold">
                      {selectedBike.currentLocation.lastUpdated}
                    </span>
                  </div>
                </div>
              )}

              {selectedBike.isLivePhoneConnected && (
                <button
                  type="button"
                  onClick={() => handleDisconnectBike(selectedBike.code)}
                  className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs mt-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Putuskan &amp; Hapus Sinyal Device Ini</span>
                </button>
              )}
            </div>
          )}

          {/* Fleet Search & List */}
          <div className="bg-white p-5 rounded-3xl border border-[#E2EBF0] shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-[#12202F]">
                Daftar Posisi Armada ({filteredBikes.length})
              </h3>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari kode unit e.g. CB-01..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#4FC3C8]"
              />
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
              {filteredBikes.map((bike) => {
                const isSelected = bike.id === selectedBikeId;
                const isPhone = bike.isLivePhoneConnected;
                const isOut = bike.currentLocation?.isOutOfBounds;

                return (
                  <div
                    key={bike.id}
                    onClick={() => handleFlyToBike(bike)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EBF9FA] border-[#00696D] shadow-xs'
                        : isOut
                        ? 'bg-rose-50/70 border-rose-300 hover:bg-rose-100'
                        : isPhone
                        ? 'bg-sky-50/70 border-sky-300 hover:bg-sky-100'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono font-bold text-xs text-[#12202F]">
                        {bike.code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isOut
                              ? 'bg-rose-600 text-white'
                              : isPhone
                              ? 'bg-sky-600 text-white'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOut
                            ? '⚠️ LUAR BATAS'
                            : isPhone
                            ? '📱 HP TERHUBUNG'
                            : 'STANDBY'}
                        </span>
                        {isPhone && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDisconnectBike(bike.code);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title={`Putuskan koneksi device ${bike.code}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="font-semibold text-slate-800 truncate">{bike.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {bike.currentLocation?.address || 'Stasiun Pusat CRC'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
