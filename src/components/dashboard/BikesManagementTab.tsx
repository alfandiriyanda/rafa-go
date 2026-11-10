/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useRental } from '../../lib/context/RentalContext';
import { Bike, BikeCategory, BikeStatus } from '../../types/rental';
import { BIKE_IMAGES } from '../../lib/data/bikes';
import {
  Bike as BikeIcon,
  Search,
  QrCode,
  Edit,
  Trash2,
  Plus,
  Printer,
  X,
  AlertTriangle,
  Clock,
  Compass,
  Zap,
  Smile,
  BatteryCharging,
  Trophy,
  Shield,
  Navigation,
  Wind,
  CheckCircle2,
  Layers,
  Sparkles,
  ExternalLink,
  Tag,
  Download,
  Copy,
  Check,
} from 'lucide-react';

export const BikesManagementTab: React.FC = () => {
  const {
    bikes,
    categories,
    updateBikeStatus,
    addBike,
    updateBike,
    deleteBike,
    addCategory,
    updateCategory,
    deleteCategory,
    userRole,
  } = useRental();

  // Active sub-tab: 'bikes' or 'categories'
  const [activeSubTab, setActiveSubTab] = useState<'bikes' | 'categories'>('bikes');

  // Filter & Search state for bikes
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal States
  const [bikeModalOpen, setBikeModalOpen] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BikeCategory | null>(null);

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: 'bike' | 'category';
    item: Bike | BikeCategory | null;
  }>({
    isOpen: false,
    type: 'bike',
    item: null,
  });

  const [viewingQrBike, setViewingQrBike] = useState<Bike | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const [customDomain, setCustomDomain] = useState<string>(() => {
    try {
      return localStorage.getItem('rafa_go_custom_domain') || '';
    } catch {
      return '';
    }
  });
  const [domainInput, setDomainInput] = useState<string>(customDomain);
  const [showDomainEditor, setShowDomainEditor] = useState<boolean>(false);

  // Helper to get the canonical public HTTPS URL for QR scanning from physical phones (accessible by all users)
  const getPublicScanUrl = (bikeCode: string): string => {
    // 1. Jika admin menetapkan domain kustom (misal Vercel / domain sendiri)
    if (customDomain && customDomain.trim()) {
      const cleanBase = customDomain.trim().replace(/\/+$/, '');
      return `${cleanBase}/s?token=${encodeURIComponent(bikeCode)}`;
    }

    const SHARED_APP_URL = 'https://ais-pre-rx3j7qzk7cr2zftkadfllb-437834277067.asia-southeast1.run.app';
    const envUrl = import.meta.env.VITE_APP_URL || import.meta.env.APP_URL || '';
    let baseUrl = envUrl;

    if (!baseUrl && typeof window !== 'undefined') {
      const origin = window.location.origin;
      const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('10.');

      if (!isLocal && origin.startsWith('https://')) {
        baseUrl = origin.replace('ais-dev-', 'ais-pre-');
      }
    }

    if (!baseUrl) {
      baseUrl = SHARED_APP_URL;
    }

    // Pastikan QR code selalu mengarah ke domain publik (ais-pre-...) bukan domain dev internal (ais-dev-...)
    if (baseUrl.includes('ais-dev-')) {
      baseUrl = baseUrl.replace('ais-dev-', 'ais-pre-');
    }

    return `${baseUrl}/s?token=${encodeURIComponent(bikeCode)}`;
  };

  const handleSaveCustomDomain = () => {
    const clean = domainInput.trim().replace(/\/+$/, '');
    setCustomDomain(clean);
    try {
      if (clean) {
        localStorage.setItem('rafa_go_custom_domain', clean);
        showFeedback('success', `Domain QR berhasil diubah ke: ${clean}`);
      } else {
        localStorage.removeItem('rafa_go_custom_domain');
        showFeedback('success', 'Domain QR dikembalikan ke default AI Studio Shared URL.');
      }
    } catch {}
    setShowDomainEditor(false);
  };

  // Generate Real Scannable 2D QR Code when a bike tag is opened
  useEffect(() => {
    if (!viewingQrBike) {
      setQrDataUrl('');
      return;
    }

    const targetUrl = getPublicScanUrl(viewingQrBike.code);

    QRCode.toDataURL(targetUrl, {
      width: 480,
      margin: 1,
      color: {
        dark: '#12202F',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
      });
  }, [viewingQrBike]);

  // Handle Download High-Res PNG of the physical bike tag
  const handleDownloadTagImage = async () => {
    if (!viewingQrBike || !qrDataUrl) return;
    setIsDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1120;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Card Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 800, 1120);

      // Dashed outer border
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 12]);
      ctx.strokeRect(36, 36, 728, 1048);
      ctx.setLineDash([]);

      // Load and draw Official Logo
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = '/RAFA_GO_Logo.svg';
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });

      if (logoImg.complete && logoImg.naturalWidth > 0) {
        const logoAspect = logoImg.naturalWidth / logoImg.naturalHeight;
        const logoW = 260;
        const logoH = logoW / logoAspect;
        ctx.drawImage(logoImg, (800 - logoW) / 2, 70, logoW, logoH);
      } else {
        ctx.fillStyle = '#12202F';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('RAFA GO', 400, 130);
      }

      // Subtitle
      ctx.fillStyle = '#475569';
      ctx.font = '600 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Rental Sepeda Per Jam • CitraRaya City Jambi', 400, 205);

      // Draw QR Code
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((resolve) => {
        qrImg.onload = resolve;
      });
      ctx.drawImage(qrImg, 180, 250, 440, 440);

      // Bike Code
      ctx.fillStyle = '#12202F';
      ctx.font = 'bold 56px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(viewingQrBike.code, 400, 755);

      // Bike Name
      ctx.fillStyle = '#334155';
      ctx.font = '600 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(viewingQrBike.name, 400, 805);

      // Token
      ctx.fillStyle = '#94A3B8';
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Token: ${viewingQrBike.qrToken}`, 400, 845);

      // Footer Box
      ctx.fillStyle = '#EBF9FA';
      ctx.fillRect(70, 890, 660, 140);
      ctx.strokeStyle = '#4FC3C8';
      ctx.lineWidth = 2;
      ctx.strokeRect(70, 890, 660, 140);

      ctx.fillStyle = '#00696D';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ARAHKAN KAMERA HP UNTUK MULAI SEWA', 400, 940);

      ctx.fillStyle = '#475569';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Kamera otomatis membuka pelacakan GPS & status operasional', 400, 980);

      // Download trigger
      const link = document.createElement('a');
      link.download = `Tag-Sepeda-${viewingQrBike.code}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showFeedback('success', `Tag fisik ${viewingQrBike.code} berhasil diunduh dalam format PNG HD.`);
    } catch (err) {
      console.error('Download error:', err);
      showFeedback('error', 'Gagal memproses pengunduhan gambar tag.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Print Action
  const handlePrintTag = () => {
    if (!viewingQrBike || !qrDataUrl) return;

    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Tag Sepeda ${viewingQrBike.code} - RAFA GO</title>
            <style>
              @page { size: portrait; margin: 10mm; }
              body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 90vh; margin: 0; background: #fff; }
              .tag-card { width: 340px; padding: 24px; border: 2px dashed #94a3b8; border-radius: 20px; text-align: center; }
              img.logo { height: 50px; max-width: 85%; margin: 0 auto 8px; display: block; object-fit: contain; }
              .subtitle { font-size: 11px; color: #64748b; font-weight: 600; margin: 0 0 16px; }
              img.qr { width: 230px; height: 230px; margin: 0 auto 12px; display: block; }
              .code { font-size: 32px; font-weight: 900; color: #12202f; margin: 0; line-height: 1.1; }
              .name { font-size: 13px; color: #475569; font-weight: 600; margin: 4px 0 0; }
              .token { font-size: 10px; color: #94a3b8; font-family: monospace; margin: 4px 0 0; }
              .footer { margin-top: 16px; padding: 10px; background: #ebf9fa; border: 1px solid #4fc3c8; border-radius: 12px; font-size: 11px; color: #00696d; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="tag-card">
              <img class="logo" src="${window.location.origin}/RAFA_GO_Logo.svg" alt="RAFA GO" />
              <div class="subtitle">Rental Sepeda Per Jam • CitraRaya City Jambi</div>
              <img class="qr" src="${qrDataUrl}" alt="QR Code" />
              <div class="code">${viewingQrBike.code}</div>
              <div class="name">${viewingQrBike.name}</div>
              <div class="token">Token: ${viewingQrBike.qrToken}</div>
              <div class="footer">Arahkan Kamera HP untuk Mulai Sewa & Pelacakan GPS</div>
            </div>
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
        return;
      }
    } catch {
      // Fallback if popup blocked
    }

    // Direct window.print()
    window.print();
  };

  // Handle Copy Scan URL
  const handleCopyScanUrl = () => {
    if (!viewingQrBike) return;
    const targetUrl = getPublicScanUrl(viewingQrBike.code);
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    showFeedback('success', `Tautan QR ${viewingQrBike.code} berhasil disalin ke papan klip.`);
  };

  // Filtered bikes
  const filteredBikes = bikes.filter((b) => {
    if (selectedCategory !== 'all' && b.categorySlug !== selectedCategory) return false;
    if (selectedStatus !== 'all' && b.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.code.toLowerCase().includes(q) || b.name.toLowerCase().includes(q);
    }
    return true;
  });

  // Bike Form State
  const [bikeFormData, setBikeFormData] = useState<{
    code: string;
    name: string;
    categorySlug: string;
    hourlyRate: number;
    status: BikeStatus;
    frameSize: string;
    gears: string;
    brakes: string;
    color: string;
    image: string;
    qrToken: string;
  }>({
    code: '',
    name: '',
    categorySlug: categories[0]?.slug || 'city',
    hourlyRate: categories[0]?.hourlyRate || 35000,
    status: 'tersedia',
    frameSize: 'M',
    gears: '7-Speed Shimano',
    brakes: 'Rem Cakram Hidrolik',
    color: 'Teal Aqua',
    image: BIKE_IMAGES.city?.[0] || '',
    qrToken: '',
  });

  // Category Form State
  const [categoryFormData, setCategoryFormData] = useState<{
    name: string;
    slug: string;
    hourlyRate: number;
    description: string;
    features: string;
    recommendedFor: string;
    iconName: string;
  }>({
    name: '',
    slug: '',
    hourlyRate: 35000,
    description: '',
    features: '',
    recommendedFor: '',
    iconName: 'Bike',
  });

  // Open Bike Modal for Create
  const handleOpenAddBike = () => {
    const defaultCat = categories[0] || { slug: 'city', name: 'City Bike', hourlyRate: 35000 };
    // Suggest code based on defaultCat
    const nextNumber = bikes.filter((b) => b.categorySlug === defaultCat.slug).length + 1;
    const prefix = defaultCat.slug.toUpperCase().slice(0, 3);
    const suggestedCode = `${prefix}-${String(nextNumber).padStart(2, '0')}`;

    setEditingBike(null);
    setBikeFormData({
      code: suggestedCode,
      name: `${defaultCat.name} ${suggestedCode}`,
      categorySlug: defaultCat.slug,
      hourlyRate: defaultCat.hourlyRate,
      status: 'tersedia',
      frameSize: 'M',
      gears: '7-Speed Shimano',
      brakes: 'Rem Cakram Hidrolik',
      color: 'Teal Aqua',
      image: BIKE_IMAGES[defaultCat.slug]?.[0] || BIKE_IMAGES.city?.[0] || '',
      qrToken: `rg_qr_${suggestedCode.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.random().toString(36).substring(2, 6)}`,
    });
    setBikeModalOpen(true);
  };

  // Open Bike Modal for Edit
  const handleOpenEditBike = (bike: Bike) => {
    setEditingBike(bike);
    setBikeFormData({
      code: bike.code,
      name: bike.name,
      categorySlug: bike.categorySlug,
      hourlyRate: bike.hourlyRate,
      status: bike.status,
      frameSize: bike.frameSize,
      gears: bike.gears,
      brakes: bike.brakes,
      color: bike.color,
      image: bike.image,
      qrToken: bike.qrToken,
    });
    setBikeModalOpen(true);
  };

  // Handle Category Change in Bike Form (auto update hourlyRate and suggested photo)
  const handleBikeCategoryChange = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug);
    const presetImg = BIKE_IMAGES[slug]?.[0] || bikeFormData.image;
    setBikeFormData((prev) => ({
      ...prev,
      categorySlug: slug,
      hourlyRate: cat ? cat.hourlyRate : prev.hourlyRate,
      image: prev.image && !editingBike ? presetImg : prev.image,
    }));
  };

  // Auto suggest code
  const handleAutoSuggestCode = () => {
    const catSlug = bikeFormData.categorySlug;
    const bikesInCat = bikes.filter((b) => b.categorySlug === catSlug);
    const prefix = catSlug.toUpperCase().slice(0, 3);
    const nextNum = bikesInCat.length + 1;
    const suggested = `${prefix}-${String(nextNum).padStart(2, '0')}`;
    setBikeFormData((prev) => ({
      ...prev,
      code: suggested,
      name: prev.name.includes(prev.code) ? prev.name.replace(prev.code, suggested) : prev.name,
      qrToken: `rg_qr_${suggested.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.random().toString(36).substring(2, 6)}`,
    }));
  };

  // Save Bike Submit
  const handleSaveBike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bikeFormData.code.trim() || !bikeFormData.name.trim()) {
      showFeedback('error', 'Kode sepeda dan nama sepeda wajib diisi.');
      return;
    }

    const matchedCat = categories.find((c) => c.slug === bikeFormData.categorySlug);
    const categoryName = matchedCat ? matchedCat.name : bikeFormData.categorySlug;

    if (editingBike) {
      // Update
      const success = updateBike(editingBike.id, {
        code: bikeFormData.code,
        name: bikeFormData.name,
        categorySlug: bikeFormData.categorySlug,
        categoryName,
        hourlyRate: Number(bikeFormData.hourlyRate),
        status: bikeFormData.status,
        frameSize: bikeFormData.frameSize,
        gears: bikeFormData.gears,
        brakes: bikeFormData.brakes,
        color: bikeFormData.color,
        image: bikeFormData.image || BIKE_IMAGES.city?.[0],
        qrToken: bikeFormData.qrToken,
      });

      if (success) {
        showFeedback('success', `Sepeda [${bikeFormData.code}] berhasil diperbarui.`);
        setBikeModalOpen(false);
      } else {
        showFeedback('error', 'Gagal memperbarui sepeda.');
      }
    } else {
      // Check for code uniqueness
      const existing = bikes.find((b) => b.code.toLowerCase() === bikeFormData.code.trim().toLowerCase());
      if (existing) {
        showFeedback('error', `Kode sepeda "${bikeFormData.code}" sudah digunakan oleh unit lain.`);
        return;
      }

      addBike({
        code: bikeFormData.code,
        name: bikeFormData.name,
        categorySlug: bikeFormData.categorySlug,
        categoryName,
        hourlyRate: Number(bikeFormData.hourlyRate),
        status: bikeFormData.status,
        frameSize: bikeFormData.frameSize,
        gears: bikeFormData.gears,
        brakes: bikeFormData.brakes,
        color: bikeFormData.color,
        image: bikeFormData.image || BIKE_IMAGES.city?.[0],
        qrToken: bikeFormData.qrToken,
      });

      showFeedback('success', `Sepeda baru [${bikeFormData.code}] berhasil ditambahkan ke armada.`);
      setBikeModalOpen(false);
    }
  };

  // Open Category Modal for Create
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      slug: '',
      hourlyRate: 35000,
      description: '',
      features: 'Rem Cakram Hidrolik, Frame Alloy Ringan, Nyaman untuk Gowes Santai',
      recommendedFor: 'Wisata santai keliling kota, taman, dan pesisir',
      iconName: 'Bike',
    });
    setCategoryModalOpen(true);
  };

  // Open Category Modal for Edit
  const handleOpenEditCategory = (cat: BikeCategory) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name,
      slug: cat.slug,
      hourlyRate: cat.hourlyRate,
      description: cat.description,
      features: cat.features.join(', '),
      recommendedFor: cat.recommendedFor,
      iconName: cat.iconName || 'Bike',
    });
    setCategoryModalOpen(true);
  };

  // Save Category Submit
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      showFeedback('error', 'Nama kategori wajib diisi.');
      return;
    }

    const rawSlug = categoryFormData.slug.trim() || categoryFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cleanSlug = rawSlug.replace(/^-+|-+$/g, '') || `kategori-${Date.now()}`;
    const featureList = categoryFormData.features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: categoryFormData.name.trim(),
        slug: cleanSlug,
        hourlyRate: Number(categoryFormData.hourlyRate),
        description: categoryFormData.description.trim(),
        features: featureList,
        recommendedFor: categoryFormData.recommendedFor.trim(),
        iconName: categoryFormData.iconName,
      });
      showFeedback('success', `Kategori "${categoryFormData.name}" berhasil diperbarui.`);
      setCategoryModalOpen(false);
    } else {
      // Check slug uniqueness
      const existingSlug = categories.find((c) => c.slug === cleanSlug);
      if (existingSlug) {
        showFeedback('error', `Slug kategori "${cleanSlug}" sudah digunakan.`);
        return;
      }

      addCategory({
        name: categoryFormData.name.trim(),
        slug: cleanSlug,
        hourlyRate: Number(categoryFormData.hourlyRate),
        description: categoryFormData.description.trim(),
        features: featureList,
        recommendedFor: categoryFormData.recommendedFor.trim(),
        iconName: categoryFormData.iconName,
      });
      showFeedback('success', `Kategori baru "${categoryFormData.name}" berhasil dibuat.`);
      setCategoryModalOpen(false);
    }
  };

  // Confirm Delete Action
  const handleConfirmDelete = () => {
    if (!deleteModalState.item) return;

    if (deleteModalState.type === 'bike') {
      const bike = deleteModalState.item as Bike;
      const res = deleteBike(bike.id);
      if (res.success) {
        showFeedback('success', `Sepeda [${bike.code}] berhasil dihapus dari armada.`);
      } else {
        showFeedback('error', res.message || 'Gagal menghapus sepeda.');
      }
    } else {
      const cat = deleteModalState.item as BikeCategory;
      const res = deleteCategory(cat.id);
      if (res.success) {
        showFeedback('success', `Kategori "${cat.name}" berhasil dihapus.`);
      } else {
        showFeedback('error', res.message || 'Gagal menghapus kategori.');
      }
    }

    setDeleteModalState({ isOpen: false, type: 'bike', item: null });
  };

  // Helper icon render
  const renderCategoryIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Compass':
        return <Compass className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Smile':
        return <Smile className={className} />;
      case 'BatteryCharging':
        return <BatteryCharging className={className} />;
      case 'Trophy':
        return <Trophy className={className} />;
      case 'Shield':
        return <Shield className={className} />;
      case 'Navigation':
        return <Navigation className={className} />;
      case 'Wind':
        return <Wind className={className} />;
      case 'Bike':
      default:
        return <BikeIcon className={className} />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert Feedback */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-sm transition-all animate-in fade-in slide-in-from-top-2 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-slate-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Header with Sub-tabs navigation & Action Button */}
      <div className="bg-white p-6 rounded-3xl border border-[#E2EBF0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4FC3C8]/15 text-[#248287] text-xs font-bold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Manajemen Master Data Armada &amp; Tarif</span>
          </div>
          <h2 className="font-heading font-black text-2xl text-[#12202F]">
            Armada Sepeda &amp; Kategori
          </h2>
          <p className="text-xs text-[#5B7083] mt-1 max-w-xl">
            Kelola inventaris armada sepeda, tambah unit baru, atur kategori dan tarif sewa per jam secara fleksibel.
          </p>
        </div>

        {/* Sub-Tabs Switcher & Quick Add Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center">
            <button
              type="button"
              onClick={() => setActiveSubTab('bikes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'bikes'
                  ? 'bg-white text-[#12202F] shadow-sm'
                  : 'text-slate-600 hover:text-[#12202F]'
              }`}
            >
              <BikeIcon className="w-4 h-4 text-[#248287]" />
              <span>Unit Sepeda ({bikes.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('categories')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'categories'
                  ? 'bg-white text-[#12202F] shadow-sm'
                  : 'text-slate-600 hover:text-[#12202F]'
              }`}
            >
              <Tag className="w-4 h-4 text-[#248287]" />
              <span>Kategori &amp; Tarif ({categories.length})</span>
            </button>
          </div>

          {activeSubTab === 'bikes' ? (
            <button
              onClick={handleOpenAddBike}
              className="px-4 py-2.5 bg-[#4FC3C8] hover:bg-[#3db0ba] text-[#12202F] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Sepeda Baru</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddCategory}
              className="px-4 py-2.5 bg-[#12202F] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#4FC3C8]" />
              <span>Tambah Kategori Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: DAFTAR ARMADA SEPEDA (CRUD BIKES) */}
      {/* ======================================================== */}
      {activeSubTab === 'bikes' && (
        <div className="space-y-6">
          {/* Quick Stats Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[11px] font-medium">Total Armada</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">{bikes.length} Unit</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <BikeIcon className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[11px] font-medium">Tersedia Siap Pakai</p>
                <p className="text-xl font-black text-emerald-600 mt-0.5">
                  {bikes.filter((b) => b.status === 'tersedia').length} Unit
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[11px] font-medium">Sedang Disewa</p>
                <p className="text-xl font-black text-amber-600 mt-0.5">
                  {bikes.filter((b) => b.status === 'disewa').length} Unit
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[11px] font-medium">Perawatan Bengkel</p>
                <p className="text-xl font-black text-slate-600 mt-0.5">
                  {bikes.filter((b) => b.status === 'perawatan').length} Unit
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E2EBF0] shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kode (CB-01), merk sepeda, warna..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-[#12202F] focus:ring-2 focus:ring-[#4FC3C8] font-medium"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[#12202F] font-medium"
                >
                  <option value="all">Semua Kategori ({bikes.length} Unit)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name} ({bikes.filter((b) => b.categorySlug === c.slug).length} unit)
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[#12202F] font-medium"
                >
                  <option value="all">Semua Status Fisik</option>
                  <option value="tersedia">Tersedia (Siap Sewa)</option>
                  <option value="disewa">Sedang Disewa Pelanggan</option>
                  <option value="perawatan">Dalam Perawatan (Bengkel)</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bikes Table */}
          <div className="bg-white rounded-3xl border border-[#E2EBF0] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#12202F]">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4">Kode &amp; Spesifikasi Sepeda</th>
                    <th className="px-4 py-4">Kategori</th>
                    <th className="px-4 py-4">Tarif Sewa</th>
                    <th className="px-4 py-4">Status Fisik</th>
                    <th className="px-4 py-4 text-center">Riwayat</th>
                    <th className="px-5 py-4 text-right">Aksi Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBikes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <BikeIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">Tidak ada sepeda yang cocok dengan filter</p>
                        <p className="text-xs text-slate-400 mt-0.5">Silakan ganti kata kunci pencarian atau tambah sepeda baru</p>
                      </td>
                    </tr>
                  ) : (
                    filteredBikes.map((bike) => (
                      <tr key={bike.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Bike Info */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={bike.image || BIKE_IMAGES.city?.[0]}
                              alt={bike.name}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 bg-slate-100"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-[#12202F] text-white">
                                  {bike.code}
                                </span>
                                <span className="font-bold text-[#12202F] text-sm">{bike.name}</span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Size {bike.frameSize} • {bike.color} • {bike.gears}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                QR: {bike.qrToken}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                            {bike.categoryName}
                          </span>
                        </td>

                        {/* Rate */}
                        <td className="px-4 py-3.5 font-bold text-[#12202F]">
                          Rp{bike.hourlyRate.toLocaleString('id-ID')}/jam
                        </td>

                        {/* Status Switcher */}
                        <td className="px-4 py-3.5">
                          <select
                            value={bike.status}
                            onChange={(e) => updateBikeStatus(bike.id, e.target.value as BikeStatus)}
                            className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border cursor-pointer transition-all ${
                              bike.status === 'tersedia'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : bike.status === 'disewa'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : bike.status === 'perawatan'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                          >
                            <option value="tersedia">Tersedia (Siap Sewa)</option>
                            <option value="disewa">Sedang Disewa</option>
                            <option value="perawatan">Dalam Perawatan</option>
                            <option value="nonaktif">Nonaktif</option>
                          </select>
                        </td>

                        {/* Total Rentals */}
                        <td className="px-4 py-3.5 text-center font-bold text-slate-600">
                          {bike.totalRentals}x
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEditBike(bike)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-[#EBF9FA] text-slate-700 hover:text-[#248287] transition-colors cursor-pointer"
                              title="Edit Informasi Sepeda"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Print QR */}
                            <button
                              onClick={() => setViewingQrBike(bike)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-[#EBF9FA] text-slate-700 hover:text-[#248287] transition-colors cursor-pointer"
                              title="Cetak Tag QR Fisik"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteModalState({ isOpen: true, type: 'bike', item: bike })}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Hapus Sepeda dari Armada"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: KATEGORI & TARIF SEWA (CRUD CATEGORIES) */}
      {/* ======================================================== */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => {
              const bikesCount = bikes.filter((b) => b.categorySlug === cat.slug).length;
              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group"
                >
                  <div className="space-y-4">
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#4FC3C8]/15 text-[#248287] flex items-center justify-center shrink-0">
                          {renderCategoryIcon(cat.iconName, 'w-6 h-6')}
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-lg text-[#12202F]">
                            {cat.name}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            slug: {cat.slug}
                          </span>
                        </div>
                      </div>

                      <span className="font-bold text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {bikesCount} Unit
                      </span>
                    </div>

                    {/* Hourly Rate Highlight */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Tarif Sewa Default</span>
                      <span className="font-heading font-black text-base text-[#12202F]">
                        Rp{cat.hourlyRate.toLocaleString('id-ID')}
                        <span className="text-xs font-normal text-slate-500"> / jam</span>
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>

                    {/* Features Tags */}
                    {cat.features && cat.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cat.features.slice(0, 4).map((f, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600"
                          >
                            {f}
                          </span>
                        ))}
                        {cat.features.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{cat.features.length - 4} lainnya
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">
                      Rekomendasi: {cat.recommendedFor.slice(0, 30)}...
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#EBF9FA] text-slate-700 hover:text-[#248287] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setDeleteModalState({ isOpen: true, type: 'category', item: cat })}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-all cursor-pointer"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH / EDIT SEPEDA */}
      {/* ======================================================== */}
      {bikeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12202F]/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-[#248287] uppercase tracking-wider">
                  {editingBike ? 'Edit Master Data Sepeda' : 'Registrasi Unit Baru'}
                </span>
                <h3 className="font-heading font-black text-xl text-[#12202F] mt-0.5">
                  {editingBike ? `Edit Sepeda [${editingBike.code}]` : 'Tambah Sepeda ke Armada'}
                </h3>
              </div>
              <button
                onClick={() => setBikeModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBike} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kode Sepeda */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Kode Sepeda *
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoSuggestCode}
                      className="text-[11px] font-semibold text-[#248287] hover:underline cursor-pointer"
                    >
                      Saran Kode
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: CB-16, MTB-13"
                    value={bikeFormData.code}
                    onChange={(e) => setBikeFormData({ ...bikeFormData, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:ring-2 focus:ring-[#4FC3C8] uppercase"
                  />
                </div>

                {/* Kategori Sepeda */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kategori Sepeda *
                  </label>
                  <select
                    value={bikeFormData.categorySlug}
                    onChange={(e) => handleBikeCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-[#4FC3C8]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name} (Default: Rp{c.hourlyRate.toLocaleString('id-ID')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nama Sepeda */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap / Tipe Sepeda *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Polygon Sierra City CB-16"
                  value={bikeFormData.name}
                  onChange={(e) => setBikeFormData({ ...bikeFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-[#4FC3C8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tarif per Jam */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tarif Sewa per Jam (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={bikeFormData.hourlyRate}
                    onChange={(e) => setBikeFormData({ ...bikeFormData, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-[#4FC3C8]"
                  />
                </div>

                {/* Status Awal */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status Fisik Sepeda *
                  </label>
                  <select
                    value={bikeFormData.status}
                    onChange={(e) => setBikeFormData({ ...bikeFormData, status: e.target.value as BikeStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-[#4FC3C8]"
                  >
                    <option value="tersedia">Tersedia (Siap Disewa)</option>
                    <option value="perawatan">Dalam Perawatan (Bengkel)</option>
                    <option value="disewa">Sedang Disewa</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Spesifikasi Teknis */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Ukuran Frame</label>
                  <input
                    type="text"
                    value={bikeFormData.frameSize}
                    onChange={(e) => setBikeFormData({ ...bikeFormData, frameSize: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                    placeholder="M, L, S"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Warna Sepeda</label>
                  <input
                    type="text"
                    value={bikeFormData.color}
                    onChange={(e) => setBikeFormData({ ...bikeFormData, color: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                    placeholder="Teal, Hitam"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Gigi / Shifter</label>
                  <input
                    type="text"
                    value={bikeFormData.gears}
                    onChange={(e) => setBikeFormData({ ...bikeFormData, gears: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                    placeholder="7-Speed Shimano"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Sistem Rem</label>
                  <input
                    type="text"
                    value={bikeFormData.brakes}
                    onChange={(e) => setBikeFormData({ ...bikeFormData, brakes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                    placeholder="Cakram Hidrolik"
                  />
                </div>
              </div>

              {/* Foto Sepeda Preset & URL */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Foto Unit Sepeda (URL Gambar)
                </label>
                <div className="flex gap-3 items-center">
                  <img
                    src={bikeFormData.image || BIKE_IMAGES.city?.[0]}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={bikeFormData.image}
                      onChange={(e) => setBikeFormData({ ...bikeFormData, image: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                    {/* Quick presets */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Pilihan cepat:</span>
                      {(BIKE_IMAGES[bikeFormData.categorySlug] || BIKE_IMAGES.city || []).slice(0, 3).map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setBikeFormData({ ...bikeFormData, image: img })}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                            bikeFormData.image === img
                              ? 'bg-[#12202F] text-white border-[#12202F]'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          Preset {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Token */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Token QR Code Unik
                </label>
                <input
                  type="text"
                  value={bikeFormData.qrToken}
                  onChange={(e) => setBikeFormData({ ...bikeFormData, qrToken: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50"
                  placeholder="rg_qr_..."
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBikeModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#4FC3C8] hover:bg-[#3db0ba] text-[#12202F] text-xs font-bold cursor-pointer transition-all shadow-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingBike ? 'Simpan Perubahan' : 'Tambahkan ke Armada'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH / EDIT KATEGORI SEPEDA */}
      {/* ======================================================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12202F]/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-[#248287] uppercase tracking-wider">
                  {editingCategory ? 'Edit Kategori Sepeda' : 'Buat Kategori Baru'}
                </span>
                <h3 className="font-heading font-black text-xl text-[#12202F] mt-0.5">
                  {editingCategory ? `Edit Kategori: ${editingCategory.name}` : 'Tambah Kategori & Tarif'}
                </h3>
              </div>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Kategori */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Kategori *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sepeda Gravel, Road Bike"
                    value={categoryFormData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCategoryFormData({
                        ...categoryFormData,
                        name: val,
                        slug: editingCategory ? categoryFormData.slug : val.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-[#4FC3C8]"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Slug URL / Kode Unik *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="gravel, road"
                    value={categoryFormData.slug}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-[#4FC3C8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tarif per Jam */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tarif Dasar per Jam (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={categoryFormData.hourlyRate}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-[#4FC3C8]"
                  />
                </div>

                {/* Ikon Kategori */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ikon Kategori
                  </label>
                  <select
                    value={categoryFormData.iconName}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, iconName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-[#4FC3C8]"
                  >
                    <option value="Bike">Bike (Standard)</option>
                    <option value="Compass">Compass (MTB/Adventure)</option>
                    <option value="Zap">Zap (Lipat/Lincah)</option>
                    <option value="Smile">Smile (Sepeda Anak)</option>
                    <option value="BatteryCharging">BatteryCharging (E-Bike)</option>
                    <option value="Trophy">Trophy (Sport/Racing)</option>
                    <option value="Wind">Wind (Kecepatan/Aero)</option>
                    <option value="Shield">Shield (Kokoh/Tangguh)</option>
                  </select>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Deskripsi Kategori *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Jelaskan kenyamanan, kegunaan, dan keunggulan sepeda tipe ini..."
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:ring-2 focus:ring-[#4FC3C8]"
                />
              </div>

              {/* Fitur Utama */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Fitur Unggulan (Pisahkan dengan tanda koma)
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Contoh: Suspensi Depan, Ban 27.5 Inci, 8-Speed Shimano"
                  value={categoryFormData.features}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, features: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#4FC3C8]"
                />
              </div>

              {/* Rekomendasi Penggunaan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Rekomendasi Rute / Pengguna
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rute aspal kota, jalan berkerikil, atau car free day"
                  value={categoryFormData.recommendedFor}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, recommendedFor: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#4FC3C8]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#12202F] hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-all shadow-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#4FC3C8]" />
                  <span>{editingCategory ? 'Simpan Perubahan' : 'Buat Kategori'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: KONFIRMASI HAPUS (SEPEDA / KATEGORI) */}
      {/* ======================================================== */}
      {deleteModalState.isOpen && deleteModalState.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12202F]/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">
                Konfirmasi Hapus {deleteModalState.type === 'bike' ? 'Sepeda' : 'Kategori'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {deleteModalState.type === 'bike' ? (
                  <>
                    Apakah Anda yakin ingin menghapus sepeda{' '}
                    <strong className="text-slate-800">
                      [{(deleteModalState.item as Bike).code}] {(deleteModalState.item as Bike).name}
                    </strong>{' '}
                    dari sistem armada? Tindakan ini tidak dapat dibatalkan.
                  </>
                ) : (
                  <>
                    Apakah Anda yakin ingin menghapus kategori{' '}
                    <strong className="text-slate-800">"{(deleteModalState.item as BikeCategory).name}"</strong>?
                    Pastikan tidak ada unit sepeda yang terhubung ke kategori ini.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalState({ isOpen: false, type: 'bike', item: null })}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-all shadow-sm"
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CETAK QR CODE TAG FISIK SEPEDA */}
      {/* ======================================================== */}
      {viewingQrBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12202F]/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4 my-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-mono font-bold text-xs bg-[#12202F] text-white px-2.5 py-0.5 rounded">
                TAG QR RESMI RAFA GO
              </span>
              <button
                onClick={() => setViewingQrBike(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Tag Visual (Target for @media print) */}
            <div
              id="printable-qr-tag"
              className="border-2 border-dashed border-slate-300 p-6 rounded-2xl bg-white space-y-3 shadow-xs"
            >
              {/* Official RAFA GO Logo */}
              <div className="flex justify-center items-center py-1">
                <img
                  src="/RAFA_GO_Logo.svg"
                  alt="RAFA GO"
                  className="h-12 max-w-[220px] w-auto object-contain"
                />
              </div>

              <p className="text-[11px] text-slate-500 font-semibold tracking-wide">
                Rental Sepeda Per Jam • CitraRaya City Jambi
              </p>

              {/* Real 2D Matrix Scannable QR Code */}
              <div className="w-52 h-52 bg-white p-2.5 border-2 border-slate-200 rounded-2xl mx-auto flex items-center justify-center shadow-xs">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code ${viewingQrBike.code}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    <QrCode className="w-8 h-8 animate-pulse text-[#4FC3C8]" />
                    <span className="text-[11px] font-medium">Membuat QR Code...</span>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <span className="font-heading font-black text-3xl text-[#12202F] tracking-tight block">
                  {viewingQrBike.code}
                </span>
                <span className="text-xs font-bold text-slate-700 block mt-0.5">
                  {viewingQrBike.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">
                  Token: {viewingQrBike.qrToken}
                </span>
              </div>

              {/* Scan target preview and instructions */}
              <div className="p-2.5 rounded-xl bg-[#EBF9FA] border border-[#4FC3C8]/40 text-[#00696D] text-[11px] font-medium leading-relaxed">
                <p className="font-bold text-xs text-[#12202F]">
                  Arahkan Kamera HP ke QR untuk Mulai Gowes
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Membuka sistem pelacakan GPS live & panduan batas sewa CitraRaya City Jambi.
                </p>
              </div>
            </div>

            {/* Encoded URL Box with Direct Test & Copy Link */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Tautan Public (Scannable HP):
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  HTTPS Live
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <code className="text-[11px] font-mono text-[#00696D] truncate font-semibold bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 flex-1">
                  {getPublicScanUrl(viewingQrBike.code)}
                </code>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={getPublicScanUrl(viewingQrBike.code)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-[#00696D] hover:bg-[#005256] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Buka halaman ini untuk menguji deteksi GPS HP"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka / Uji GPS</span>
                  </a>
                  <button
                    onClick={handleCopyScanUrl}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Domain Customizer */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-[#00696D]" />
                  <span>Domain Publik untuk Konsumen Umum</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowDomainEditor(!showDomainEditor)}
                  className="text-[11px] text-[#00696D] hover:underline font-bold cursor-pointer"
                >
                  {showDomainEditor ? 'Batal' : 'Ganti Domain'}
                </button>
              </div>

              {showDomainEditor ? (
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Jika website Anda sudah di-deploy ke Vercel, Netlify, atau domain sendiri (misal: <code className="font-mono text-slate-700">https://rafago.vercel.app</code>), masukkan URL-nya di sini agar kode QR otomatis terhubung:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://rafago.vercel.app"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomDomain}
                      className="px-3 py-1.5 bg-[#00696D] hover:bg-[#005256] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Simpan
                    </button>
                  </div>
                  {customDomain && (
                    <button
                      type="button"
                      onClick={() => {
                        setDomainInput('');
                        setCustomDomain('');
                        try {
                          localStorage.removeItem('rafa_go_custom_domain');
                        } catch {}
                        showFeedback('success', 'Domain direset ke bawaan.');
                        setShowDomainEditor(false);
                      }}
                      className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Reset ke bawaan AI Studio
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  {customDomain ? (
                    <span className="text-emerald-700 font-medium">
                      Aktif: <strong className="font-mono">{customDomain}</strong>
                    </span>
                  ) : (
                    <span>
                      Domain default: <strong className="font-mono text-slate-600">AI Studio Preview</strong>.
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Action Buttons: Download PNG HD & Print Direct */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleDownloadTagImage}
                disabled={isDownloading || !qrDataUrl}
                className="w-full py-2.5 rounded-xl bg-[#12202F] hover:bg-[#1E3246] text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-[#4FC3C8]" />
                <span>{isDownloading ? 'Menyiapkan...' : 'Unduh Tag (PNG HD)'}</span>
              </button>

              <button
                onClick={handlePrintTag}
                disabled={!qrDataUrl}
                className="w-full py-2.5 rounded-xl btn-primary text-xs font-bold cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Printer className="w-4 h-4 text-[#12202F]" />
                <span>Cetak Tag Fisik</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              💡 Rekomendasi: Klik <strong>Unduh Tag (PNG HD)</strong> untuk menyimpan gambar jernih siap cetak/laminating pada stiker stang sepeda.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
