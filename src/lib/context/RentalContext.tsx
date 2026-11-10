/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bike, BikeCategory, Booking, BookingCustomer, PaymentProof, QRScanRecord, AuditLog, UserRole, BikeStatus } from '../../types/rental';
import { BIKE_CATEGORIES, generateInitialBikes } from '../data/bikes';
import { INITIAL_BOOKINGS, INITIAL_AUDIT_LOGS } from '../data/initialBookings';
import { getSupabaseClient } from '../supabase/client';
import { checkCitraRayaGeofence } from '../utils/geoUtils';

interface CartItem {
  bike: Bike;
}

export type ViewType = 'home' | 'katalog' | 'pesan' | 'bayar' | 'pesanan' | 's' | 'kebijakan' | 'dashboard' | 'admin-login';

interface RentalContextType {
  bikes: Bike[];
  categories: BikeCategory[];
  bookings: Booking[];
  auditLogs: AuditLog[];
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isAdminAuthenticated: boolean;
  loginAdmin: (role: 'admin' | 'owner', pin: string) => boolean;
  logoutAdmin: () => void;
  currentView: ViewType;
  navigateTo: (view: ViewType, params?: Record<string, string>) => void;
  viewParams: Record<string, string>;
  selectedBikeForDetail: Bike | null;
  setSelectedBikeForDetail: (bike: Bike | null) => void;
  // Cart
  cart: CartItem[];
  addToCart: (bike: Bike) => void;
  removeFromCart: (bikeId: string) => void;
  clearCart: () => void;
  bookingFormState: {
    date: string;
    startTime: string;
    durationHours: number;
  };
  setBookingFormState: React.Dispatch<React.SetStateAction<{ date: string; startTime: string; durationHours: number }>>;
  // Core Actions
  createBooking: (customer: BookingCustomer) => Booking;
  submitPaymentProof: (bookingCode: string, proof: PaymentProof) => boolean;
  verifyPayment: (bookingCode: string, approved: boolean, reason?: string) => boolean;
  startRental: (bookingCode: string, photoUrl?: string) => boolean;
  returnBike: (bookingCode: string, condition: 'baik' | 'lecet_ringan' | 'rusak_berat', damageFee: number) => { success: boolean; lateFee: number; totalFinal: number };
  extendRental: (bookingCode: string, additionalHours: number) => boolean;
  recordQRScan: (
    qrToken: string,
    lat: number,
    lng: number,
    address: string,
    accuracy?: number,
    speed?: number
  ) => QRScanRecord | null;
  updateBikeStatus: (bikeId: string, status: BikeStatus) => void;
  getBookingByCode: (codeOrToken: string) => Booking | undefined;
  // Bikes CRUD
  addBike: (bikeData: Omit<Bike, 'id' | 'totalRentals'>) => Bike;
  updateBike: (bikeId: string, updates: Partial<Bike>) => boolean;
  deleteBike: (bikeId: string) => { success: boolean; message?: string };
  // Categories CRUD
  addCategory: (categoryData: Omit<BikeCategory, 'id'>) => BikeCategory;
  updateCategory: (id: string, updates: Partial<BikeCategory>) => boolean;
  deleteCategory: (id: string) => { success: boolean; message?: string };
}

const RentalContext = createContext<RentalContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BIKES: 'rafa_go_bikes_v3',
  CATEGORIES: 'rafa_go_categories_v1',
  BOOKINGS: 'rafa_go_bookings_v3',
  LOGS: 'rafa_go_logs_v1',
  CART: 'rafa_go_cart_v1',
};

export const RentalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bikes, setBikes] = useState<Bike[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BIKES);
      if (saved) {
        const parsed: Bike[] = JSON.parse(saved);
        // Pastikan seluruh data awal bersih dari status sewa dummy
        return parsed.map((b) => ({
          ...b,
          status: 'tersedia' as BikeStatus,
          currentLocation: {
            lat: -1.6375,
            lng: 103.4969,
            address: 'Stasiun Pusat RAFA GO — Ruko Boulevard CitraRaya City',
            lastUpdated: 'Standby di Hub',
            accuracy: 3,
            speed: 0,
            isOutOfBounds: false,
            distanceFromCenterMeters: 0,
          },
        }));
      }
      return generateInitialBikes();
    } catch {
      return generateInitialBikes();
    }
  });

  const [categories, setCategories] = useState<BikeCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : BIKE_CATEGORIES;
    } catch {
      return BIKE_CATEGORIES;
    }
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('rafa_go_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const savedRole = sessionStorage.getItem('rafa_go_admin_role');
      if (sessionStorage.getItem('rafa_go_admin_auth') === 'true' && (savedRole === 'admin' || savedRole === 'owner')) {
        return savedRole;
      }
      return 'consumer';
    } catch {
      return 'consumer';
    }
  });

  const resolveRouteFromUrl = (isAdminAuth: boolean): { view: ViewType; params: Record<string, string> } => {
    if (typeof window === 'undefined') {
      return { view: 'home', params: {} };
    }

    const pathname = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash.toLowerCase();
    const params: Record<string, string> = {};

    searchParams.forEach((val, key) => {
      params[key] = val;
    });

    // 1. QR Scan Route: /s, /s/..., ?view=s, ?token=..., #s, #/s
    if (
      pathname === '/s' ||
      pathname.startsWith('/s/') ||
      searchParams.get('view') === 's' ||
      searchParams.has('token') ||
      hash.startsWith('#/s') ||
      hash.startsWith('#s')
    ) {
      if (!params.token && hash.includes('token=')) {
        const match = hash.match(/token=([^&]+)/);
        if (match) params.token = decodeURIComponent(match[1]);
      }
      if (!params.token && pathname.startsWith('/s/')) {
        params.token = decodeURIComponent(pathname.replace('/s/', '')).toUpperCase();
      }
      return { view: 's', params };
    }

    // 2. Admin / Dashboard
    if (hash === '#admin' || hash === '#login' || searchParams.get('view') === 'admin') {
      return { view: isAdminAuth ? 'dashboard' : 'admin-login', params };
    }

    // 3. Payment
    if (pathname === '/bayar' || searchParams.get('view') === 'bayar' || hash.startsWith('#bayar')) {
      return { view: 'bayar', params };
    }

    // 4. Order lookup
    if (pathname === '/pesanan' || searchParams.get('view') === 'pesanan' || hash.startsWith('#pesanan')) {
      return { view: 'pesanan', params };
    }

    // 5. Katalog
    if (pathname === '/katalog' || searchParams.get('view') === 'katalog' || hash.startsWith('#katalog')) {
      return { view: 'katalog', params };
    }

    // 6. Kebijakan
    if (pathname === '/kebijakan' || searchParams.get('view') === 'kebijakan' || hash.startsWith('#kebijakan')) {
      return { view: 'kebijakan', params };
    }

    return { view: 'home', params };
  };

  const initialRoute = resolveRouteFromUrl(isAdminAuthenticated);
  const [currentView, setCurrentView] = useState<ViewType>(initialRoute.view);
  const [viewParams, setViewParams] = useState<Record<string, string>>(initialRoute.params);
  const [selectedBikeForDetail, setSelectedBikeForDetail] = useState<Bike | null>(null);

  // Default booking time is today at next rounded hour
  const [bookingFormState, setBookingFormState] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      date: today,
      startTime: '15:00',
      durationHours: 2.0,
    };
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BIKES, JSON.stringify(bikes));
    } catch (e) {
      console.warn('Failed saving bikes to storage', e);
    }
  }, [bikes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed saving categories to storage', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch (e) {
      console.warn('Failed saving bookings to storage', e);
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('Failed saving logs to storage', e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed saving cart to storage', e);
    }
  }, [cart]);

  // Helper to map Supabase row to Booking type
  const mapSupabaseBooking = (row: any): Booking => {
    let items: any[] = [];
    if (row.booking_items && Array.isArray(row.booking_items) && row.booking_items.length > 0) {
      items = row.booking_items.map((i: any) => ({
        bikeId: i.bike_id,
        bikeCode: i.bike_code,
        bikeName: i.bike_name,
        categoryName: 'Sepeda RAFA GO',
        hourlyRate: i.hourly_rate,
      }));
    } else if (row.customer_notes && row.customer_notes.includes('__ITEMS__:')) {
      try {
        const jsonPart = row.customer_notes.split('__ITEMS__:')[1];
        items = JSON.parse(jsonPart);
      } catch {}
    }

    if (!items || items.length === 0) {
      items = [
        {
          bikeId: 'cb-01',
          bikeCode: 'CB-01',
          bikeName: 'Sepeda RAFA GO',
          categoryName: 'City Bike',
          hourlyRate: Math.round(row.base_amount / (Number(row.duration_hours) || 1)),
        },
      ];
    }

    let paymentProof = undefined;
    if (row.payments && Array.isArray(row.payments) && row.payments.length > 0) {
      const p = row.payments[0];
      paymentProof = {
        method: p.method || 'qris',
        senderBank: p.sender_bank || '',
        senderAccountName: p.sender_account_name || '',
        transferTime: p.transfer_time || '',
        nominalPaid: p.nominal_paid || row.total_amount,
        receiptImage: p.receipt_image || '',
        uploadedAt: p.uploaded_at || row.created_at,
      };
    }

    let cleanNotes = row.customer_notes || undefined;
    if (cleanNotes && cleanNotes.includes('__ITEMS__:')) {
      cleanNotes = cleanNotes.split('__ITEMS__:')[0].trim() || undefined;
    }

    return {
      id: row.id,
      bookingCode: row.booking_code,
      publicToken: row.public_token,
      customer: {
        name: row.customer_name,
        whatsapp: row.customer_whatsapp,
        notes: cleanNotes,
      },
      items,
      bookingDate: row.booking_date,
      startTime: row.start_time,
      durationHours: Number(row.duration_hours),
      endTime: row.end_time,
      baseAmount: row.base_amount,
      uniqueNominalCode: row.unique_nominal_code,
      totalAmount: row.total_amount,
      status: row.status,
      createdAt: row.created_at,
      paymentExpiresAt: row.payment_expires_at,
      paymentProof,
      paymentVerifiedAt: row.rental_started_at || undefined,
      rentalStartedAt: row.rental_started_at || undefined,
      rentalCustomerPhoto: row.rental_customer_photo || undefined,
      rentalReturnedAt: row.rental_returned_at || undefined,
      returnCondition: row.return_condition || undefined,
      damageFee: row.damage_fee || 0,
      lateFee: row.late_fee || 0,
      totalPaidFinal: row.total_paid_final || undefined,
    };
  };

  // Real-time synchronization for bikes and bookings from Supabase
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    const loadBikes = async () => {
      try {
        const { data, error } = await client
          .from('bikes')
          .select('*')
          .order('code', { ascending: true });

        if (!error && data && data.length > 0) {
          const mappedBikes: Bike[] = data.map((b: any) => ({
            id: b.id,
            code: b.code,
            name: b.name,
            categorySlug: b.category_slug as any,
            categoryName: b.category_name,
            hourlyRate: b.hourly_rate,
            status: b.status as any,
            frameSize: b.frame_size || 'M',
            gears: b.gears || 'Standard',
            brakes: b.brakes || 'Disk Brake',
            color: b.color || 'Teal',
            image: b.image || '',
            qrToken: b.qr_token || b.code,
            totalRentals: b.total_rentals || 0,
          }));
          setBikes(mappedBikes);
        }
      } catch (err) {
        console.warn('Supabase fetch bikes error:', err);
      }
    };

    const loadBookings = async () => {
      try {
        const { data, error } = await client
          .from('bookings')
          .select('*, payments(*), booking_items(*)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map(mapSupabaseBooking);
          setBookings(mapped);
        }
      } catch (err) {
        console.warn('Supabase fetch bookings error:', err);
      }
    };

    loadBikes();
    loadBookings();

    // Poll every 3.5 seconds to synchronize between mobile phone and admin screen
    const interval = setInterval(() => {
      loadBookings();
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Comprehensive URL routing listener (hash and history popstate)
  useEffect(() => {
    const handleUrlChange = () => {
      const route = resolveRouteFromUrl(isAdminAuthenticated);
      setCurrentView(route.view);
      setViewParams(route.params);
    };

    handleUrlChange();
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [isAdminAuthenticated]);

  const loginAdmin = (role: 'admin' | 'owner', pin: string): boolean => {
    const cleanPin = pin.trim();
    // Default PIN: 1234 for Budi (Staff), 8888 for Fadel (Owner)
    const isValid =
      (role === 'admin' && (cleanPin === '1234' || cleanPin === 'admin123' || cleanPin === '0000')) ||
      (role === 'owner' && (cleanPin === '8888' || cleanPin === 'owner123' || cleanPin === '123456'));

    if (isValid) {
      setIsAdminAuthenticated(true);
      setUserRole(role);
      try {
        sessionStorage.setItem('rafa_go_admin_auth', 'true');
        sessionStorage.setItem('rafa_go_admin_role', role);
      } catch {}
      addAuditLog(
        'Login Petugas Berhasil',
        `${role === 'owner' ? 'Fadel (Owner)' : 'Budi (Admin Lapangan)'} berhasil masuk ke dashboard internal.`
      );
      navigateTo('dashboard');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setUserRole('consumer');
    try {
      sessionStorage.removeItem('rafa_go_admin_auth');
      sessionStorage.removeItem('rafa_go_admin_role');
    } catch {}
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    navigateTo('home');
  };

  const navigateTo = (view: ViewType, params: Record<string, string> = {}) => {
    // Protected route guard: only authenticated staff can access the internal dashboard
    if (view === 'dashboard' && !isAdminAuthenticated) {
      setCurrentView('admin-login');
      setViewParams(params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (bike: Bike) => {
    setCart((prev) => {
      if (prev.some((item) => item.bike.id === bike.id)) return prev;
      return [...prev, { bike }];
    });
  };

  const removeFromCart = (bikeId: string) => {
    setCart((prev) => prev.filter((item) => item.bike.id !== bikeId));
  };

  const clearCart = () => setCart([]);

  const getBookingByCode = (codeOrToken: string): Booking | undefined => {
    const clean = codeOrToken.trim().toUpperCase();
    return bookings.find(
      (b) => b.bookingCode.toUpperCase() === clean || b.publicToken.toUpperCase() === clean
    );
  };

  const addAuditLog = (action: string, details: string, bookingCode?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB',
      actor: userRole === 'owner' ? 'Fadel (Owner)' : userRole === 'admin' ? 'Budi (Admin Lapangan)' : 'Sistem / Konsumen',
      role: userRole === 'owner' ? 'owner' : userRole === 'admin' ? 'admin' : 'system',
      action,
      details,
      bookingCode,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const createBooking = (customer: BookingCustomer): Booking => {
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const bookingCode = `RG-${dateStr}-${randomSuffix}`;
    const publicToken = `tok_${randomSuffix}_${Math.random().toString(36).substring(2, 8)}`;

    const items = cart.map((item) => ({
      bikeId: item.bike.id,
      bikeCode: item.bike.code,
      bikeName: item.bike.name,
      categoryName: item.bike.categoryName,
      hourlyRate: item.bike.hourlyRate,
    }));

    // Calculate hourly total
    const totalHourlyRate = items.reduce((sum, item) => sum + item.hourlyRate, 0);
    const baseAmount = Math.round(totalHourlyRate * bookingFormState.durationHours);
    // Unique nominal code for easy manual transfer reconciliation (101 - 999)
    const uniqueNominalCode = Math.floor(100 + Math.random() * 899);
    const totalAmount = baseAmount + uniqueNominalCode;

    // Calculate end time
    const [startH, startM] = bookingFormState.startTime.split(':').map(Number);
    const totalMinutes = startH * 60 + startM + Math.round(bookingFormState.durationHours * 60);
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      bookingCode,
      publicToken,
      customer,
      items,
      bookingDate: bookingFormState.date,
      startTime: bookingFormState.startTime,
      durationHours: bookingFormState.durationHours,
      endTime,
      baseAmount,
      uniqueNominalCode,
      totalAmount,
      status: 'menunggu_pembayaran',
      createdAt: now.toISOString(),
      paymentExpiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(), // 30 mins
    };

    setBookings((prev) => [newBooking, ...prev]);
    clearCart();

    // Sync to Supabase cloud database
    const client = getSupabaseClient();
    if (client) {
      const itemsPayload = JSON.stringify(items);
      client
        .from('bookings')
        .insert({
          id: newBooking.id,
          booking_code: newBooking.bookingCode,
          public_token: newBooking.publicToken,
          customer_name: newBooking.customer.name,
          customer_whatsapp: newBooking.customer.whatsapp,
          customer_notes: (newBooking.customer.notes || '') + ` __ITEMS__:${itemsPayload}`,
          booking_date: newBooking.bookingDate,
          start_time: newBooking.startTime,
          duration_hours: newBooking.durationHours,
          end_time: newBooking.endTime,
          base_amount: newBooking.baseAmount,
          unique_nominal_code: newBooking.uniqueNominalCode,
          total_amount: newBooking.totalAmount,
          status: newBooking.status,
          payment_expires_at: newBooking.paymentExpiresAt,
        })
        .then(({ error }) => {
          if (error) {
            console.error('Supabase booking insert error:', error.message);
          }
        });
    }

    addAuditLog(
      'Pemesanan Dibuat',
      `Pesanan baru ${bookingCode} oleh ${customer.name} (${items.length} sepeda, durasi ${bookingFormState.durationHours} jam, total Rp${totalAmount.toLocaleString('id-ID')})`,
      bookingCode
    );

    return newBooking;
  };

  const submitPaymentProof = (bookingCode: string, proof: PaymentProof): boolean => {
    let updated = false;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.bookingCode === bookingCode) {
          updated = true;
          return {
            ...b,
            status: 'menunggu_verifikasi',
            paymentProof: proof,
          };
        }
        return b;
      })
    );

    // Sync to Supabase cloud database
    const client = getSupabaseClient();
    if (client) {
      const target = bookings.find((b) => b.bookingCode === bookingCode);
      const bookingId = target ? target.id : `book-${bookingCode}`;

      client
        .from('bookings')
        .update({ status: 'menunggu_verifikasi' })
        .eq('booking_code', bookingCode)
        .then(({ error }) => {
          if (error) console.error('Supabase booking status update error:', error.message);
        });

      client
        .from('payments')
        .insert({
          booking_id: bookingId,
          method: proof.method,
          sender_bank: proof.senderBank || 'QRIS',
          sender_account_name: proof.senderAccountName,
          transfer_time: proof.transferTime,
          nominal_paid: proof.nominalPaid,
          receipt_image: proof.receiptImage,
        })
        .then(({ error }) => {
          if (error) console.error('Supabase payment insert error:', error.message);
        });
    }

    if (updated) {
      addAuditLog(
        'Bukti Pembayaran Diunggah',
        `Bukti bayar diunggah untuk ${bookingCode} via ${proof.method.toUpperCase()} a.n. ${proof.senderAccountName} (Rp${proof.nominalPaid.toLocaleString('id-ID')})`,
        bookingCode
      );
    }
    return updated;
  };

  const verifyPayment = (bookingCode: string, approved: boolean, reason?: string): boolean => {
    let updated = false;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.bookingCode === bookingCode) {
          updated = true;
          return {
            ...b,
            status: approved ? 'terkonfirmasi' : 'menunggu_pembayaran',
            paymentVerifiedAt: approved ? new Date().toISOString() : undefined,
            paymentVerifiedBy: approved ? (userRole === 'owner' ? 'Fadel (Owner)' : 'Budi (Admin)') : undefined,
            rejectionReason: approved ? undefined : reason || 'Nominal atau bukti transfer tidak sesuai.',
          };
        }
        return b;
      })
    );

    // Sync to Supabase cloud database
    const client = getSupabaseClient();
    if (client) {
      client
        .from('bookings')
        .update({
          status: approved ? 'terkonfirmasi' : 'menunggu_pembayaran',
          rental_started_at: approved ? new Date().toISOString() : null,
        })
        .eq('booking_code', bookingCode)
        .then(({ error }) => {
          if (error) console.error('Supabase verifyPayment update error:', error.message);
        });
    }

    if (updated) {
      addAuditLog(
        approved ? 'Pembayaran Disetujui' : 'Pembayaran Ditolak',
        approved
          ? `Pembayaran ${bookingCode} disetujui. Sepeda siap diambil/diserahkan.`
          : `Pembayaran ${bookingCode} ditolak. Alasan: ${reason || 'Bukti tidak sesuai.'}`,
        bookingCode
      );
    }
    return updated;
  };

  const startRental = (bookingCode: string, photoUrl?: string): boolean => {
    let targetBooking: Booking | undefined;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.bookingCode === bookingCode) {
          targetBooking = b;
          return {
            ...b,
            status: 'sedang_disewa',
            rentalStartedAt: new Date().toISOString(),
            rentalCustomerPhoto: photoUrl || 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80',
          };
        }
        return b;
      })
    );

    if (targetBooking) {
      // Update status of bikes in this booking to 'disewa'
      const bikeIds = (targetBooking as Booking).items.map((i) => i.bikeId);
      setBikes((prev) =>
        prev.map((bike) => (bikeIds.includes(bike.id) ? { ...bike, status: 'disewa' } : bike))
      );

      addAuditLog(
        'Sewa Dimulai',
        `Penyewaan ${bookingCode} resmi dimulai. KTP fisik konsumen ditahan di pos admin.`,
        bookingCode
      );
      return true;
    }
    return false;
  };

  const returnBike = (
    bookingCode: string,
    condition: 'baik' | 'lecet_ringan' | 'rusak_berat',
    damageFee: number = 0
  ): { success: boolean; lateFee: number; totalFinal: number } => {
    const booking = bookings.find((b) => b.bookingCode === bookingCode);
    if (!booking) return { success: false, lateFee: 0, totalFinal: 0 };

    // Calculate late fee according to RULES.md & PRD.md:
    // Rp10.000/jam, 10-minute tolerance grace period, rounded DOWN per 30 minutes!
    const now = new Date();
    let lateFee = 0;

    if (booking.rentalStartedAt) {
      const scheduledMinutes = booking.durationHours * 60;
      const started = new Date(booking.rentalStartedAt).getTime();
      const actualMinutesElapsed = Math.floor((now.getTime() - started) / (60 * 1000));
      const excessMinutes = actualMinutesElapsed - scheduledMinutes;

      // Tolerance of 10 minutes
      if (excessMinutes > 10) {
        // Round down per 30 minutes: e.g. 25 min -> 0 extra half-hour; 35 min -> 1 half-hour = Rp5.000; 65 min -> 2 half-hours = Rp10.000
        const chargeableHalfHours = Math.floor(excessMinutes / 30);
        // Rp10.000 per hour = Rp5.000 per 30 min per bike
        lateFee = chargeableHalfHours * 5000 * booking.items.length;
      }
    }

    const totalFinal = (booking.totalAmount || 0) + lateFee + damageFee;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.bookingCode === bookingCode) {
          return {
            ...b,
            status: 'selesai',
            rentalReturnedAt: now.toISOString(),
            returnCondition: condition,
            damageFee,
            lateFee,
            totalPaidFinal: totalFinal,
          };
        }
        return b;
      })
    );

    // Free up bikes
    const bikeIds = booking.items.map((i) => i.bikeId);
    setBikes((prev) =>
      prev.map((bike) =>
        bikeIds.includes(bike.id)
          ? {
              ...bike,
              status: condition === 'rusak_berat' ? 'perawatan' : 'tersedia',
              totalRentals: bike.totalRentals + 1,
            }
          : bike
      )
    );

    addAuditLog(
      'Pengembalian Sepeda',
      `Sepeda untuk ${bookingCode} dikembalikan. Kondisi: ${condition.replace('_', ' ')}. Denda: Rp${lateFee.toLocaleString('id-ID')}, Biaya perbaikan: Rp${damageFee.toLocaleString('id-ID')}. KTP fisik diserahkan kembali.`,
      bookingCode
    );

    return { success: true, lateFee, totalFinal };
  };

  const extendRental = (bookingCode: string, additionalHours: number): boolean => {
    let updated = false;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.bookingCode === bookingCode) {
          updated = true;
          const newDuration = b.durationHours + additionalHours;
          const extraCost = b.items.reduce((sum, item) => sum + item.hourlyRate, 0) * additionalHours;
          return {
            ...b,
            durationHours: newDuration,
            totalAmount: b.totalAmount + extraCost,
          };
        }
        return b;
      })
    );

    if (updated) {
      addAuditLog(
        'Perpanjangan Sewa',
        `Durasi sewa untuk ${bookingCode} diperpanjang +${additionalHours} jam.`,
        bookingCode
      );
    }
    return updated;
  };

  const recordQRScan = (
    qrToken: string,
    lat: number,
    lng: number,
    address: string,
    accuracy?: number,
    speed?: number
  ): QRScanRecord | null => {
    // Find bike by qrToken or code
    const bike = bikes.find(
      (b) => b.qrToken === qrToken || b.code.toUpperCase() === qrToken.toUpperCase()
    );
    if (!bike) return null;

    // Evaluasi batas area CitraRaya City Jambi (radius 2.5 km)
    const geofence = checkCitraRayaGeofence(lat, lng);

    // Find active booking for this bike if any
    const activeBooking = bookings.find(
      (b) => b.status === 'sedang_disewa' && b.items.some((i) => i.bikeId === bike.id)
    );

    const record: QRScanRecord = {
      id: `scan-${Date.now()}`,
      bikeId: bike.id,
      bikeCode: bike.code,
      bookingCode: activeBooking ? activeBooking.bookingCode : 'STATION-CHECK',
      scannedAt: new Date().toISOString(),
      lat,
      lng,
      address: geofence.nearestLandmark ? `${address} (${geofence.nearestLandmark})` : address,
      accuracy,
      isOutOfBounds: !geofence.isInside,
      distanceFromCenterMeters: geofence.distanceMeters,
      scannerRole: userRole === 'consumer' ? 'konsumen' : 'admin',
    };

    // Update bike's last known location in local state
    setBikes((prev) =>
      prev.map((b) =>
        b.id === bike.id
          ? {
              ...b,
              currentLocation: {
                lat,
                lng,
                address: geofence.nearestLandmark ? `${address} (${geofence.nearestLandmark})` : address,
                lastUpdated: 'Baru saja',
                accuracy,
                speed,
                isOutOfBounds: !geofence.isInside,
                distanceFromCenterMeters: geofence.distanceMeters,
              },
            }
          : b
      )
    );

    // Sync to Supabase cloud database
    const client = getSupabaseClient();
    if (client) {
      client
        .from('qr_scans')
        .insert({
          bike_id: bike.id,
          bike_code: bike.code,
          booking_code: activeBooking ? activeBooking.bookingCode : 'LIVE-SCAN',
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          address: geofence.nearestLandmark ? `${address} (${geofence.nearestLandmark})` : address,
          scanner_role: userRole === 'consumer' ? 'konsumen' : 'admin',
          scanned_at: new Date().toISOString(),
        })
        .then(({ data, error }) => {
          if (error) {
            console.error('Supabase qr_scans insert error:', error.message);
          } else {
            console.log('✅ Supabase qr_scans berhasil tersinkron:', bike.code, lat, lng);
          }
        });
    }

    if (!geofence.isInside) {
      addAuditLog(
        'ALARM GEOFENCE KELUAR BATAS',
        `⚠️ Sepeda ${bike.code} terdeteksi di LUAR area operasional CitraRaya City Jambi (${geofence.formattedDistance} dari titik pusat Boulevard CRC)! Titik: ${lat.toFixed(5)}, ${lng.toFixed(5)}.`,
        activeBooking?.bookingCode
      );
    } else {
      addAuditLog(
        'Scan QR Sepeda',
        `QR Code ${bike.code} dipindai di ${address} (${lat.toFixed(5)}, ${lng.toFixed(5)}). Status: Zona Aman CitraRaya City (${geofence.formattedDistance}).`,
        activeBooking?.bookingCode
      );
    }

    return record;
  };

  const updateBikeStatus = (bikeId: string, status: BikeStatus) => {
    setBikes((prev) =>
      prev.map((b) => (b.id === bikeId ? { ...b, status } : b))
    );

    const client = getSupabaseClient();
    if (client) {
      client
        .from('bikes')
        .update({ status })
        .eq('id', bikeId)
        .then(({ error }) => {
          if (error) console.error('Supabase bike status update error:', error.message);
        });
    }

    addAuditLog('Update Status Sepeda', `Status sepeda ID ${bikeId} diubah menjadi ${status}`);
  };

  // Bikes CRUD
  const addBike = (bikeData: Omit<Bike, 'id' | 'totalRentals'>): Bike => {
    const cleanCode = bikeData.code.trim().toUpperCase();
    const generatedToken =
      bikeData.qrToken?.trim() ||
      `rg_qr_${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.random().toString(36).substring(2, 7)}`;

    const newBike: Bike = {
      ...bikeData,
      id: `bike-${Date.now()}`,
      code: cleanCode,
      qrToken: generatedToken,
      totalRentals: 0,
    };

    setBikes((prev) => [newBike, ...prev]);

    // Sync to Supabase cloud if connected
    const client = getSupabaseClient();
    if (client) {
      client
        .from('bikes')
        .insert({
          id: newBike.id,
          code: newBike.code,
          name: newBike.name,
          category_slug: newBike.categorySlug,
          category_name: newBike.categoryName,
          hourly_rate: newBike.hourlyRate,
          status: newBike.status,
          frame_size: newBike.frameSize,
          gears: newBike.gears,
          brakes: newBike.brakes,
          color: newBike.color,
          image: newBike.image,
          qr_token: newBike.qrToken,
          total_rentals: 0,
        })
        .then(({ error }) => {
          if (error) console.error('Supabase bike insert error:', error.message);
        });
    }

    addAuditLog(
      'Tambah Sepeda Baru',
      `Armada baru ditambahkan: [${newBike.code}] ${newBike.name} (${newBike.categoryName}) - Rp${newBike.hourlyRate.toLocaleString('id-ID')}/jam`
    );

    return newBike;
  };

  const updateBike = (bikeId: string, updates: Partial<Bike>): boolean => {
    let updated = false;
    let targetCode = '';

    setBikes((prev) =>
      prev.map((b) => {
        if (b.id === bikeId) {
          updated = true;
          targetCode = updates.code || b.code;
          return { ...b, ...updates };
        }
        return b;
      })
    );

    if (updated) {
      const client = getSupabaseClient();
      if (client) {
        const payload: any = {};
        if (updates.code !== undefined) payload.code = updates.code.trim().toUpperCase();
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.categorySlug !== undefined) payload.category_slug = updates.categorySlug;
        if (updates.categoryName !== undefined) payload.category_name = updates.categoryName;
        if (updates.hourlyRate !== undefined) payload.hourly_rate = updates.hourlyRate;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.frameSize !== undefined) payload.frame_size = updates.frameSize;
        if (updates.gears !== undefined) payload.gears = updates.gears;
        if (updates.brakes !== undefined) payload.brakes = updates.brakes;
        if (updates.color !== undefined) payload.color = updates.color;
        if (updates.image !== undefined) payload.image = updates.image;
        if (updates.qrToken !== undefined) payload.qr_token = updates.qrToken;

        client
          .from('bikes')
          .update(payload)
          .eq('id', bikeId)
          .then(({ error }) => {
            if (error) console.error('Supabase bike update error:', error.message);
          });
      }

      addAuditLog(
        'Perbarui Data Sepeda',
        `Informasi sepeda ${targetCode || bikeId} berhasil diperbarui oleh ${userRole}`
      );
    }
    return updated;
  };

  const deleteBike = (bikeId: string): { success: boolean; message?: string } => {
    const targetBike = bikes.find((b) => b.id === bikeId);
    if (!targetBike) {
      return { success: false, message: 'Sepeda tidak ditemukan.' };
    }

    if (targetBike.status === 'disewa') {
      return {
        success: false,
        message: `Sepeda ${targetBike.code} sedang berstatus "Disewa" oleh pelanggan dan tidak dapat dihapus.`,
      };
    }

    const isCurrentlyBooked = bookings.some(
      (b) =>
        (b.status === 'sedang_disewa' || b.status === 'terkonfirmasi') &&
        b.items.some((i) => i.bikeId === bikeId)
    );
    if (isCurrentlyBooked) {
      return {
        success: false,
        message: `Sepeda ${targetBike.code} terikat dengan pesanan aktif dan tidak dapat dihapus.`,
      };
    }

    setBikes((prev) => prev.filter((b) => b.id !== bikeId));

    const client = getSupabaseClient();
    if (client) {
      client
        .from('bikes')
        .delete()
        .eq('id', bikeId)
        .then(({ error }) => {
          if (error) console.error('Supabase bike delete error:', error.message);
        });
    }

    addAuditLog(
      'Hapus Sepeda',
      `Sepeda [${targetBike.code}] ${targetBike.name} dihapus dari armada oleh ${userRole}`
    );

    return { success: true };
  };

  // Categories CRUD
  const addCategory = (categoryData: Omit<BikeCategory, 'id'>): BikeCategory => {
    const rawSlug = categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cleanSlug = rawSlug.replace(/^-+|-+$/g, '') || `kategori-${Date.now()}`;

    const newCategory: BikeCategory = {
      ...categoryData,
      id: `cat-${cleanSlug}-${Date.now()}`,
      slug: cleanSlug,
    };

    setCategories((prev) => [...prev, newCategory]);

    addAuditLog(
      'Tambah Kategori Sepeda',
      `Kategori baru ditambahkan: "${newCategory.name}" dengan tarif dasar Rp${newCategory.hourlyRate.toLocaleString('id-ID')}/jam oleh ${userRole}`
    );

    return newCategory;
  };

  const updateCategory = (id: string, updates: Partial<BikeCategory>): boolean => {
    let updated = false;
    let oldSlug = '';
    const newSlug = updates.slug || '';
    const newName = updates.name || '';

    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updated = true;
          oldSlug = c.slug;
          return { ...c, ...updates };
        }
        return c;
      })
    );

    if (updated) {
      // Also update bikes belonging to this category
      if (newName || (newSlug && newSlug !== oldSlug)) {
        setBikes((prevBikes) =>
          prevBikes.map((b) => {
            if (b.categorySlug === oldSlug) {
              return {
                ...b,
                categorySlug: newSlug || b.categorySlug,
                categoryName: newName || b.categoryName,
              };
            }
            return b;
          })
        );
      }

      addAuditLog(
        'Perbarui Kategori Sepeda',
        `Kategori "${updates.name || id}" berhasil diperbarui oleh ${userRole}`
      );
    }

    return updated;
  };

  const deleteCategory = (id: string): { success: boolean; message?: string } => {
    const targetCategory = categories.find((c) => c.id === id);
    if (!targetCategory) {
      return { success: false, message: 'Kategori tidak ditemukan.' };
    }

    const bikesInCategory = bikes.filter((b) => b.categorySlug === targetCategory.slug);
    if (bikesInCategory.length > 0) {
      return {
        success: false,
        message: `Gagal menghapus: Masih terdapat ${bikesInCategory.length} sepeda dalam kategori "${targetCategory.name}". Silakan ubah atau hapus sepeda tersebut terlebih dahulu.`,
      };
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));

    addAuditLog(
      'Hapus Kategori Sepeda',
      `Kategori "${targetCategory.name}" dihapus dari sistem oleh ${userRole}`
    );

    return { success: true };
  };

  return (
    <RentalContext.Provider
      value={{
        bikes,
        categories,
        bookings,
        auditLogs,
        userRole,
        setUserRole,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        currentView,
        navigateTo,
        viewParams,
        selectedBikeForDetail,
        setSelectedBikeForDetail,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        bookingFormState,
        setBookingFormState,
        createBooking,
        submitPaymentProof,
        verifyPayment,
        startRental,
        returnBike,
        extendRental,
        recordQRScan,
        updateBikeStatus,
        getBookingByCode,
        addBike,
        updateBike,
        deleteBike,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </RentalContext.Provider>
  );
};

export const useRental = () => {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
};
