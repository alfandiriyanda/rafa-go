/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utilitas Geografis & Geofencing untuk Kawasan CitraRaya City Jambi
 * Lokasi: Pematang Gajah / Mendalo Darat, Kec. Jambi Luar Kota, Muaro Jambi
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

// Titik Pusat Operasional RAFA GO di CitraRaya City Jambi
export const CITRARAYA_JAMBI_CENTER: GeoPoint = {
  lat: -1.6375,
  lng: 103.4969,
};

// Radius Geofence Zona Aman Operasional (2.5 km = 2500 meter)
export const CITRARAYA_GEOFENCE_RADIUS_METERS = 2500;

// Daftar Titik Landmark Populer di Kawasan CitraRaya City Jambi
export const CITRARAYA_LANDMARKS = [
  {
    name: 'Stasiun Pusat RAFA GO — Ruko Boulevard Utama CitraRaya',
    lat: -1.6375,
    lng: 103.4969,
    description: 'Pusat sewa & servis armada RAFA GO',
  },
  {
    name: 'Bundaran Utama CitraRaya City & Landmark Monumen',
    lat: -1.6415,
    lng: 103.4962,
    description: 'Spot foto ikonik & jalur gowes santai',
  },
  {
    name: 'Danau Rekreasi & Taman Hijau CitraRaya',
    lat: -1.6342,
    lng: 103.4995,
    description: 'Area jogging track & trek keliling danau',
  },
  {
    name: 'World Water Park CitraRaya City Jambi',
    lat: -1.6395,
    lng: 103.4938,
    description: 'Wahana air keluarga & area parkir luas',
  },
  {
    name: 'Sentra Kuliner Ruko Promenade Mendalo',
    lat: -1.6338,
    lng: 103.4942,
    description: 'Pusat jajan santai & kafe outdoor',
  },
  {
    name: 'Cluster Teras Mendalo & Jalur Hijau Rindang',
    lat: -1.6362,
    lng: 103.5015,
    description: 'Area hunian tertata dengan jalan beraspal halus',
  },
  {
    name: 'Gerbang Masuk Boulevard CitraRaya Jambi (Jl. Raya Mendalo)',
    lat: -1.6445,
    lng: 103.4952,
    description: 'Pintu gerbang utama akses Jl. Lintas Sumatera',
  },
];

/**
 * Menghitung jarak antara dua koordinat menggunakan formula Haversine (hasil dalam meter)
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius bumi dalam meter
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export interface GeofenceCheckResult {
  isInside: boolean;
  distanceMeters: number;
  distanceKm: number;
  formattedDistance: string;
  zoneStatus: 'aman' | 'waspada' | 'pelanggaran';
  nearestLandmark: string;
  warningMessage?: string;
}

/**
 * Mengecek apakah suatu titik koordinat berada di dalam kawasan CitraRaya City Jambi
 */
export function checkCitraRayaGeofence(lat: number, lng: number): GeofenceCheckResult {
  const distance = calculateDistanceMeters(
    lat,
    lng,
    CITRARAYA_JAMBI_CENTER.lat,
    CITRARAYA_JAMBI_CENTER.lng
  );

  const distanceKm = +(distance / 1000).toFixed(2);
  const formattedDistance =
    distance < 1000 ? `${distance} m` : `${distanceKm} km`;

  // Cari landmark terdekat
  let nearest = CITRARAYA_LANDMARKS[0];
  let minLandmarkDist = Infinity;
  for (const lm of CITRARAYA_LANDMARKS) {
    const d = calculateDistanceMeters(lat, lng, lm.lat, lm.lng);
    if (d < minLandmarkDist) {
      minLandmarkDist = d;
      nearest = lm;
    }
  }

  const nearestLandmark =
    minLandmarkDist < 200
      ? `Dekat ${nearest.name}`
      : `${minLandmarkDist}m dari ${nearest.name}`;

  if (distance <= CITRARAYA_GEOFENCE_RADIUS_METERS) {
    return {
      isInside: true,
      distanceMeters: distance,
      distanceKm,
      formattedDistance,
      zoneStatus: distance > 2200 ? 'waspada' : 'aman',
      nearestLandmark,
      warningMessage:
        distance > 2200
          ? 'Kamu mendekati batas luar kawasan CitraRaya City (radius aman 2.5 km).'
          : undefined,
    };
  }

  const excessMeters = distance - CITRARAYA_GEOFENCE_RADIUS_METERS;
  return {
    isInside: false,
    distanceMeters: distance,
    distanceKm,
    formattedDistance,
    zoneStatus: 'pelanggaran',
    nearestLandmark,
    warningMessage: `PERINGATAN: Posisi berada ${
      excessMeters < 1000 ? `${excessMeters} m` : `${(excessMeters / 1000).toFixed(1)} km`
    } di luar kawasan operasional resmi CitraRaya City Jambi! Segera kembali ke dalam kawasan.`,
  };
}

/**
 * Memberikan simulasi posisi realistis di dalam atau di luar CitraRaya City Jambi
 */
export function getSimulatedCitraRayaPosition(isOutOfBounds = false): {
  lat: number;
  lng: number;
  address: string;
} {
  if (isOutOfBounds) {
    // Luar batas: misal arah Simpang Rimbo / Kota Jambi (~4 km timur)
    return {
      lat: -1.6250,
      lng: 103.5350,
      address: 'Jl. Lintas Jambi - Muara Bulian (Di Luar CitraRaya City)',
    };
  }

  // Pilih acak salah satu landmark CitraRaya City dengan sedikit offset jitter
  const randomLandmark =
    CITRARAYA_LANDMARKS[Math.floor(Math.random() * CITRARAYA_LANDMARKS.length)];
  const jitterLat = (Math.random() - 0.5) * 0.003;
  const jitterLng = (Math.random() - 0.5) * 0.003;

  return {
    lat: +(randomLandmark.lat + jitterLat).toFixed(6),
    lng: +(randomLandmark.lng + jitterLng).toFixed(6),
    address: randomLandmark.name,
  };
}
