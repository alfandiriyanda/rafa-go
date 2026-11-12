/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BikeCategorySlug = 'city' | 'mtb' | 'lipat' | 'anak' | 'listrik' | string;

export interface BikeCategory {
  id: string;
  slug: BikeCategorySlug;
  name: string;
  hourlyRate: number; // in Rupiah (integer)
  description: string;
  features: string[];
  recommendedFor: string;
  iconName: string;
}

export type BikeStatus = 'tersedia' | 'disewa' | 'perawatan' | 'nonaktif';

export interface Bike {
  id: string;
  code: string; // e.g. "CB-01", "MTB-05", "EB-02"
  name: string;
  categorySlug: BikeCategorySlug;
  categoryName: string;
  hourlyRate: number;
  status: BikeStatus;
  frameSize: string;
  color: string;
  image: string;
  qrToken: string;
  // Spesifikasi unik rental
  rideType?: string; // e.g. "Santai & Keliling Danau", "Olahraga & Tanjakan", "Wisata Keluarga"
  accessories?: string; // e.g. "Helm SNI + Gembok Baja + Keranjang"
  condition?: string; // e.g. "100% Siap Gowes (Ban & Rantai Prima)"
  gears?: string; // opsional / backward-compatible
  brakes?: string; // opsional / backward-compatible
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
    lastUpdated: string;
    accuracy?: number; // Akurasi GPS dalam meter (e.g. 5m)
    speed?: number; // Kecepatan bergerak (km/h)
    isOutOfBounds?: boolean; // True jika di luar radius 2.5km CitraRaya City Jambi
    distanceFromCenterMeters?: number; // Jarak dari pusat CitraRaya City
    batteryLevel?: number; // Indikator level baterai
  };
  totalRentals: number;
  notes?: string;
}

export type BookingStatus =
  | 'menunggu_pembayaran'
  | 'menunggu_verifikasi'
  | 'terkonfirmasi'
  | 'sedang_disewa'
  | 'selesai'
  | 'dibatalkan';

export type PaymentMethod = 'qris' | 'dana' | 'seabank' | 'tunai';

export interface BookingCustomer {
  name: string;
  whatsapp: string; // e.g. "+6281234567890"
  notes?: string;
  ktpHeldOffline?: boolean;
}

export interface BookingBikeItem {
  bikeId: string;
  bikeCode: string;
  bikeName: string;
  categoryName: string;
  hourlyRate: number;
}

export interface PaymentProof {
  method: PaymentMethod;
  senderBank: string;
  senderAccountName: string;
  transferTime: string;
  nominalPaid: number;
  receiptImage: string; // URL or base64
  uploadedAt: string;
}

export interface QRScanRecord {
  id: string;
  bikeId: string;
  bikeCode: string;
  bookingCode?: string;
  scannedAt: string;
  lat: number;
  lng: number;
  address: string;
  accuracy?: number;
  isOutOfBounds?: boolean;
  distanceFromCenterMeters?: number;
  scannerRole: 'konsumen' | 'admin';
}

export interface Booking {
  id: string;
  bookingCode: string; // "RG-261109-XXXX"
  publicToken: string; // crypto random token for direct URL lookup
  customer: BookingCustomer;
  items: BookingBikeItem[];
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationHours: number; // minimum 1.0, 30-min increments (e.g. 1.0, 1.5, 2.0)
  endTime: string; // HH:mm
  baseAmount: number; // in Rupiah
  uniqueNominalCode: number; // e.g. 142
  totalAmount: number; // baseAmount + uniqueNominalCode
  status: BookingStatus;
  createdAt: string; // ISO string
  paymentExpiresAt: string; // 30 min from creation
  paymentProof?: PaymentProof;
  paymentVerifiedAt?: string;
  paymentVerifiedBy?: string;
  rejectionReason?: string;
  cancelReason?: string;
  cancelledAt?: string;
  cancelledBy?: 'konsumen' | 'admin';
  rentalStartedAt?: string;
  rentalCustomerPhoto?: string; // photo of customer on bike
  rentalReturnedAt?: string;
  returnCondition?: 'baik' | 'lecet_ringan' | 'rusak_berat';
  damageFee?: number;
  lateFee?: number;
  totalPaidFinal?: number;
  notes?: string;
}

export type UserRole = 'consumer' | 'admin' | 'owner';

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: 'admin' | 'owner' | 'system';
  action: string;
  details: string;
  bookingCode?: string;
}
