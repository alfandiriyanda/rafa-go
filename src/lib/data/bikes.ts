/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bike, BikeCategory } from '../../types/rental';

export const BIKE_CATEGORIES: BikeCategory[] = [
  {
    id: 'cat-city',
    slug: 'city',
    name: 'City Bike',
    hourlyRate: 35000,
    description: 'Nyaman untuk keliling kota santai dengan keranjang depan, boncengan empuk, dan posisi tegak ergonomis.',
    features: ['Keranjang Depan Luas', 'Boncengan Belakang', '7-Speed Shimano', 'Lampu Reflektor', 'Pelindung Rantai'],
    recommendedFor: 'Wisata keliling jalanan kota, taman kota, santai berdua atau foto-foto.',
    iconName: 'Bike',
  },
  {
    id: 'cat-mtb',
    slug: 'mtb',
    name: 'Mountain Bike (MTB)',
    hourlyRate: 40000,
    description: 'Tangguh dan bertenaga di segala medan jalan beraspal maupun berbatu dengan suspensi depan ganda.',
    features: ['Suspensi Depan Empuk', 'Ban Tapak Lebar 27.5"', '21-Speed Shimano Tourney', 'Rem Cakram Hidrolik', 'Frame Alloy Ringan'],
    recommendedFor: 'Rute menanjak, jalanan sedikit berbatu, dan goweser yang suka tantangan.',
    iconName: 'Compass',
  },
  {
    id: 'cat-lipat',
    slug: 'lipat',
    name: 'Sepeda Lipat (Folding)',
    hourlyRate: 20000,
    description: 'Praktis, ringkas, dan lincah bermanuver di gang sempit atau mampir ke kafe lokal.',
    features: ['Bisa Dilipat Cepat (15 Detik)', 'Roda 20 Inci Lincah', '8-Speed Sensah', 'Tinggi Sadel & Stang Mudah Diatur', 'Berat Hanya 11 kg'],
    recommendedFor: 'Eksplorasi kafe/kuliner, spot sempit kota, dan anak muda/remaja.',
    iconName: 'Zap',
  },
  {
    id: 'cat-anak',
    slug: 'anak',
    name: 'Sepeda Anak (Kids)',
    hourlyRate: 25000,
    description: 'Aman dan ceria untuk anak-anak dengan roda bantu opsional, rem halus, dan pelindung stang.',
    features: ['Roda Bantu Samping (Bisa Pasang/Lepas)', 'Rem Tangan Ramah Anak', 'Pelindung Rantai Penuh', 'Bel Kring & Bendera Keselamatan'],
    recommendedFor: 'Anak usia 5–12 tahun bermain aman di taman atau kawasan ramah sepeda.',
    iconName: 'Smile',
  },
  {
    id: 'cat-listrik',
    slug: 'listrik',
    name: 'Sepeda Listrik (E-Bike)',
    hourlyRate: 50000,
    description: 'Gowes tanpa lelah dengan pedal assist bertenaga baterai lithium. Menjelajah jauh tetap segar!',
    features: ['Motor Listrik 250W Halus', 'Jarak Tempuh Baterai s.d 40 km', 'Speedometer Digital LED', 'Pedal Assist 3 Level', 'Pengisian Daya Cepat'],
    recommendedFor: 'Rute jauh, cuaca terik, dan wisatawan yang ingin menikmati perjalanan tanpa capek.',
    iconName: 'BatteryCharging',
  },
];

// Curated high quality bike images with license-free Unsplash photography
export const BIKE_IMAGES: Record<string, string[]> = {
  city: [
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&w=800&q=80',
  ],
  mtb: [
    'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502744688674-c619d3864003?auto=format&fit=crop&w=800&q=80',
  ],
  lipat: [
    'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1572111504021-464a13e74575?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1528629297340-d1d461b55f91?auto=format&fit=crop&w=800&q=80',
  ],
  anak: [
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1596727147705-61a532a659bd?auto=format&fit=crop&w=800&q=80',
  ],
  listrik: [
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
  ],
};

// Seed 50 bikes (15 City, 12 MTB, 10 Folding, 7 Kids, 6 E-Bike)
// Seluruh armada awal berstatus 'tersedia' (siap disewa, tanpa data sewa palsu)
export function generateInitialBikes(): Bike[] {
  const bikes: Bike[] = [];
  let idCounter = 1;

  // CitraRaya City Jambi Base Coordinates (Ruko Boulevard Utama)
  const CRC_CENTER_LAT = -1.6375;
  const CRC_CENTER_LNG = 103.4969;

  // City Bikes (15 units) - CB-01 s.d CB-15
  for (let i = 1; i <= 15; i++) {
    const code = `CB-${String(i).padStart(2, '0')}`;
    bikes.push({
      id: `bike-${idCounter++}`,
      code,
      name: `Polygon Sierra City ${code}`,
      categorySlug: 'city',
      categoryName: 'City Bike',
      hourlyRate: 35000,
      status: 'tersedia',
      frameSize: i % 2 === 0 ? 'Medium (17")' : 'Small (15")',
      gears: '7-Speed Shimano Tourney',
      brakes: 'V-Brake Tektro',
      color: i % 3 === 0 ? 'Aqua Tosca' : i % 3 === 1 ? 'Cream Ivory' : 'Mint Green',
      image: BIKE_IMAGES.city[(i - 1) % BIKE_IMAGES.city.length],
      qrToken: `QR-RAFA-CB-${String(i).padStart(3, '0')}`,
      totalRentals: 40 + i,
      currentLocation: {
        lat: CRC_CENTER_LAT,
        lng: CRC_CENTER_LNG,
        address: 'Stasiun Pusat RAFA GO — Ruko Boulevard CitraRaya City',
        lastUpdated: 'Standby di Hub',
        accuracy: 3,
        speed: 0,
        isOutOfBounds: false,
        distanceFromCenterMeters: 0,
      },
    });
  }

  // MTB (12 units) - MTB-01 s.d MTB-12
  for (let i = 1; i <= 12; i++) {
    const code = `MTB-${String(i).padStart(2, '0')}`;
    bikes.push({
      id: `bike-${idCounter++}`,
      code,
      name: `Polygon Cascade ${i % 2 === 0 ? '4' : '3'} MTB`,
      categorySlug: 'mtb',
      categoryName: 'Mountain Bike (MTB)',
      hourlyRate: 40000,
      status: 'tersedia',
      frameSize: i % 2 === 0 ? 'Large (19")' : 'Medium (17")',
      gears: '21-Speed Shimano Altus',
      brakes: 'Mechanical Disc Brake',
      color: i % 3 === 0 ? 'Matte Charcoal' : i % 3 === 1 ? 'Ocean Blue' : 'Racing Red',
      image: BIKE_IMAGES.mtb[(i - 1) % BIKE_IMAGES.mtb.length],
      qrToken: `QR-RAFA-MTB-${String(i).padStart(3, '0')}`,
      totalRentals: 50 + i,
      currentLocation: {
        lat: CRC_CENTER_LAT,
        lng: CRC_CENTER_LNG,
        address: 'Stasiun Pusat RAFA GO — Ruko Boulevard CitraRaya City',
        lastUpdated: 'Standby di Hub',
        accuracy: 3,
        speed: 0,
        isOutOfBounds: false,
        distanceFromCenterMeters: 0,
      },
    });
  }

  // Sepeda Lipat (10 units) - FL-01 s.d FL-10
  for (let i = 1; i <= 10; i++) {
    const code = `FL-${String(i).padStart(2, '0')}`;
    bikes.push({
      id: `bike-${idCounter++}`,
      code,
      name: `United Roar Folding 20" ${code}`,
      categorySlug: 'lipat',
      categoryName: 'Sepeda Lipat',
      hourlyRate: 20000,
      status: 'tersedia',
      frameSize: 'One Size Adjustable',
      gears: '8-Speed Sensah MX8',
      brakes: 'Hydraulic Disc Brake',
      color: i % 2 === 0 ? 'Satin Yellow' : 'Arctic White',
      image: BIKE_IMAGES.lipat[(i - 1) % BIKE_IMAGES.lipat.length],
      qrToken: `QR-RAFA-FL-${String(i).padStart(3, '0')}`,
      totalRentals: 80 + i,
      currentLocation: {
        lat: CRC_CENTER_LAT,
        lng: CRC_CENTER_LNG,
        address: 'Stasiun Pusat RAFA GO — Ruko Boulevard CitraRaya City',
        lastUpdated: 'Standby di Hub',
        accuracy: 3,
        speed: 0,
        isOutOfBounds: false,
        distanceFromCenterMeters: 0,
      },
    });
  }

  // Sepeda Anak (7 units) - KID-01 s.d KID-07
  for (let i = 1; i <= 7; i++) {
    const code = `KID-${String(i).padStart(2, '0')}`;
    bikes.push({
      id: `bike-${idCounter++}`,
      code,
      name: `Polygon Relic Kids ${code}`,
      categorySlug: 'anak',
      categoryName: 'Sepeda Anak',
      hourlyRate: 25000,
      status: 'tersedia',
      frameSize: i <= 3 ? '16" (Usia 5-8)' : '20" (Usia 8-12)',
      gears: 'Single Speed / 6-Speed',
      brakes: 'Kid-Safe V-Brake',
      color: i % 2 === 0 ? 'Coral Pink' : 'Sky Cyan',
      image: BIKE_IMAGES.anak[(i - 1) % BIKE_IMAGES.anak.length],
      qrToken: `QR-RAFA-KID-${String(i).padStart(3, '0')}`,
      totalRentals: 30 + i,
      currentLocation: {
        lat: CRC_CENTER_LAT,
        lng: CRC_CENTER_LNG,
        address: 'Stasiun Pusat RAFA GO — Ruko Boulevard CitraRaya City',
        lastUpdated: 'Standby di Hub',
        accuracy: 3,
        speed: 0,
        isOutOfBounds: false,
        distanceFromCenterMeters: 0,
      },
    });
  }

  // Sepeda Listrik (6 units) - EB-01 s.d EB-06
  for (let i = 1; i <= 6; i++) {
    const code = `EB-${String(i).padStart(2, '0')}`;
    bikes.push({
      id: `bike-${idCounter++}`,
      code,
      name: `Selis E-Urban Cruiser ${code}`,
      categorySlug: 'listrik',
      categoryName: 'Sepeda Listrik',
      hourlyRate: 50000,
      status: 'tersedia',
      frameSize: 'Medium (17")',
      gears: 'E-Assist 3 Mode + 7 Speed',
      brakes: 'Dual Disc Brake Cut-Off Sensor',
      color: 'Matte Titanium & Aqua Accent',
      image: BIKE_IMAGES.listrik[(i - 1) % BIKE_IMAGES.listrik.length],
      qrToken: `QR-RAFA-EB-${String(i).padStart(3, '0')}`,
      totalRentals: 90 + i,
      currentLocation: {
        lat: CRC_CENTER_LAT,
        lng: CRC_CENTER_LNG,
        address: 'Stasiun Pusat RAFA GO — Ruko Boulevard CitraRaya City',
        lastUpdated: 'Standby di Hub',
        accuracy: 3,
        speed: 0,
        isOutOfBounds: false,
        distanceFromCenterMeters: 0,
        batteryLevel: 100,
      },
    });
  }

  return bikes;
}
