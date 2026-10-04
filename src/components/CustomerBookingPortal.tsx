import React, { useState, useMemo } from 'react';
import { getAssetUrl } from '../utils/assetHelper';
import { useBarber } from '../context/BarberContext';
import { Service, Barber } from '../types';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  Scissors,
  User,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Phone,
  MessageSquare,
  AlertCircle,
  MapPin,
  Star,
  Check,
} from 'lucide-react';
import { buildManagerWhatsAppUrl, buildCustomerWhatsAppUrl } from '../services/notificationService';
import { ShopLocationBadge } from './ShopLocationBadge';
import { formatLocalDateToISO } from '../utils/dateHelper';

export const CustomerBookingPortal: React.FC = () => {
  const {
    barbers,
    services,
    settings,
    appointments,
    getAvailableSlots,
    bookAppointment,
    updateAppointmentStatus,
    setActiveMode,
  } = useBarber();

  // Active appointment for this browser
  const activeAppointmentId = typeof window !== 'undefined' ? localStorage.getItem('tarik_dilek_my_active_appointment_id') : null;
  const myActiveAppointment = useMemo(() => {
    if (!activeAppointmentId) return null;
    const found = appointments.find((a) => a.id === activeAppointmentId);
    if (!found || found.status === 'cancelled' || found.status === 'completed') {
      localStorage.removeItem('tarik_dilek_my_active_appointment_id');
      return null;
    }
    return found;
  }, [activeAppointmentId, appointments]);

  const handleCancelMyAppointment = (id: string) => {
    updateAppointmentStatus(id, 'cancelled');
    localStorage.removeItem('tarik_dilek_my_active_appointment_id');
  };

  const getRemainingTime = (dateStr: string, timeStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, mins] = timeStr.split(':').map(Number);
      const aptDate = new Date(year, month - 1, day, hours, mins);
      const now = new Date();
      const diffMs = aptDate.getTime() - now.getTime();
      if (diffMs <= 0) return 'Randevu saatiniz geldi';
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHrs / 24);
      const remHrs = diffHrs % 24;
      const remMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      if (diffDays > 0) return `${diffDays} gün ${remHrs} saat kaldı`;
      if (diffHrs > 0) return `${diffHrs} saat ${remMins} dakika kaldı`;
      return `${remMins} dakika kaldı`;
    } catch {
      return '';
    }
  };

  // Wizard Steps: 1: Service, 2: Barber, 3: Date & Slot, 4: Contact Info, 5: Success
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['s3']); // Default Saç & Sakal
  const [selectedBarberId, setSelectedBarberId] = useState<string>('b1');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return formatLocalDateToISO(new Date());
  });
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedAppointment, setCompletedAppointment] = useState<{
    id: string;
    customerName: string;
    customerPhone: string;
    barberName: string;
    serviceNames: string;
    date: string;
    time: string;
    totalPrice: number;
  } | null>(null);

  // Filtered Services
  const filteredServices = useMemo(() => {
    if (categoryFilter === 'all') return services;
    return services.filter((s) => s.category === categoryFilter);
  }, [services, categoryFilter]);

  // Selected Services objects
  const selectedServices = useMemo(() => {
    return services.filter((s) => selectedServiceIds.includes(s.id));
  }, [services, selectedServiceIds]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [selectedServices]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  // Calculate available slots
  const availableSlots = useMemo(() => {
    if (!selectedBarberId || !selectedDate || totalDuration === 0) return [];
    return getAvailableSlots(selectedBarberId, selectedDate, totalDuration);
  }, [selectedBarberId, selectedDate, totalDuration, getAvailableSlots]);

  // Generate next 10 days for date picker
  const upcomingDates = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const iso = formatLocalDateToISO(d);
      const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
      ];
      list.push({
        iso,
        dayNumber: d.getDate(),
        dayName: i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : dayNames[d.getDay()],
        monthName: monthNames[d.getMonth()],
        dayOfWeek: d.getDay(),
      });
    }
    return list;
  }, []);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
    setSelectedTime(''); // Reset time if duration changes
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const barber = barbers.find((b) => b.id === selectedBarberId);
      const appointment = await bookAppointment({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        barberId: selectedBarberId,
        serviceIds: selectedServiceIds,
        date: selectedDate,
        startTime: selectedTime,
        notes: notes.trim() || undefined,
        source: 'online',
      });

      setCompletedAppointment({
        id: appointment.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        barberName: barber ? barber.name : 'Berber',
        serviceNames: selectedServices.map((s) => s.name).join(', '),
        date: selectedDate,
        time: selectedTime,
        totalPrice,
      });

      localStorage.setItem('tarik_dilek_my_active_appointment_id', appointment.id);

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97706', '#ffffff', '#1e293b'],
      });

      setStep(5);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedTime('');
    setNotes('');
    setCompletedAppointment(null);
  };

  const selectedBarber = barbers.find((b) => b.id === selectedBarberId);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 pb-36">
      {/* Hero Atmosphere Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden border-b border-slate-800">
        <img
          src={getAssetUrl('/images/barbershop_hero_atmosphere_1791041617667.jpg')}
          alt="Tarık Dilek Barbershop Atmosferi"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
        
        <div className="absolute inset-0 mx-auto max-w-5xl px-4 sm:px-6 flex flex-col justify-end pb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>PREMIUM ERKEK KUAFÖRÜ & RANDEVU SİSTEMİ</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {settings.shopName}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{settings.address}</span>
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 space-y-4">
        {/* Salon Location, Distance & Directions Badge */}
        <ShopLocationBadge />

        {/* ACTIVE APPOINTMENT TRACKER FOR THIS BROWSER */}
        {myActiveAppointment && step < 5 ? (
          <div className="rounded-3xl bg-slate-900/95 border border-amber-500/40 p-6 sm:p-8 backdrop-blur shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Tarayıcınızda Aktif Randevunuz Bulunuyor</span>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                myActiveAppointment.status === 'confirmed'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {myActiveAppointment.status === 'confirmed' ? 'Onaylandı ✓' : 'Onay Bekliyor ⏳'}
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Aktif Randevu Takip Paneli
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Bu tarayıcı üzerinden aktif bir randevunuz olduğu için yeni randevu alımı geçici olarak kilitlenmiştir. Randevunuzu iptal ederseniz yeniden yeni randevu oluşturabilirsiniz.
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-center space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">Randevunuza Kalan Süre</span>
              <div className="text-lg sm:text-xl font-extrabold font-mono text-white">
                {getRemainingTime(myActiveAppointment.date, myActiveAppointment.startTime)}
              </div>
            </div>

            {/* Receipt Card */}
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs space-y-2.5 text-left">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Randevu Kodu:</span>
                <span className="font-mono text-amber-400 font-bold">#{myActiveAppointment.id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Ad Soyad:</span>
                <span className="text-white font-semibold">{myActiveAppointment.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Berber / Stilist:</span>
                <span className="text-white font-semibold">
                  {barbers.find((b) => b.id === myActiveAppointment.barberId)?.name || 'Berber'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Tarih & Saat:</span>
                <span className="text-amber-400 font-mono font-bold">{myActiveAppointment.date} - {myActiveAppointment.startTime}</span>
              </div>
            </div>

            {/* Cancel Button */}
            <div className="pt-2">
              <button
                onClick={() => handleCancelMyAppointment(myActiveAppointment.id)}
                className="w-full py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Randevuyu İptal Et ve Yeni Randevu Almayı Aktifleştir</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Indicator */}
            {step < 5 && (
          <div className="mb-6 rounded-2xl bg-slate-900/90 border border-slate-800 p-3 sm:p-4 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between text-xs font-medium">
              <button
                onClick={() => setStep(1)}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 1 ? 'text-amber-400 font-bold' : step > 1 ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 1 ? 'bg-amber-500 text-slate-950 font-bold' : step > 1 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </span>
                <span className="hidden sm:inline">Hizmet Seçimi</span>
              </button>

              <span className="h-0.5 w-6 sm:w-12 bg-slate-800" />

              <button
                onClick={() => step > 2 && setStep(2)}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 2 ? 'text-amber-400 font-bold' : step > 2 ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 2 ? 'bg-amber-500 text-slate-950 font-bold' : step > 2 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {step > 2 ? '✓' : '2'}
                </span>
                <span className="hidden sm:inline">Stilist / Berber</span>
              </button>

              <span className="h-0.5 w-6 sm:w-12 bg-slate-800" />

              <button
                onClick={() => step > 3 && setStep(3)}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 3 ? 'text-amber-400 font-bold' : step > 3 ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 3 ? 'bg-amber-500 text-slate-950 font-bold' : step > 3 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {step > 3 ? '✓' : '3'}
                </span>
                <span className="hidden sm:inline">Tarih & Boş Saat</span>
              </button>

              <span className="h-0.5 w-6 sm:w-12 bg-slate-800" />

              <div
                className={`flex items-center gap-1.5 ${
                  step === 4 ? 'text-amber-400 font-bold' : 'text-slate-500'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 4 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  4
                </span>
                <span className="hidden sm:inline">Bilgiler & Onay</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: SERVICE SELECTION */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Almak İstediğiniz Hizmetleri Seçin</h2>
                <p className="text-xs text-slate-400 mt-0.5">Birden fazla hizmet seçebilirsiniz</p>
              </div>

              {/* Category Filter Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-900 rounded-xl border border-slate-800">
                {(['all', 'Kombin', 'Saç', 'Sakal', 'Bakım & Spa'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      categoryFilter === cat
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'Tümü' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Service Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredServices.map((service) => {
                const isSelected = selectedServiceIds.includes(service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border text-left flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{service.name}</h3>
                          {service.popular && (
                            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              Popüler
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">{service.description}</p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'border border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-slate-300 font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{service.durationMinutes} dakika</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {service.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Bar: Selection Summary & Proceed */}
            <div className="sticky bottom-4 z-20 rounded-2xl bg-slate-900/95 border border-slate-800 p-4 backdrop-blur shadow-2xl flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">
                  Seçilen Hizmetler: <strong className="text-amber-400">{selectedServices.length} işlem</strong>
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tahmini Süre: <strong className="font-mono text-amber-400">{totalDuration} dakika</strong></span>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={selectedServiceIds.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                <span>Berber Seçimine Geç</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BARBER SELECTION */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Tercih Ettiğiniz Berber / Stilisti Seçin</h2>
                <p className="text-xs text-slate-400 mt-0.5">Dilediğiniz uzmanı seçebilir veya ilk müsait berberi işaretleyebilirsiniz</p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Geri Dön</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {barbers.map((barber) => {
                const isSelected = selectedBarberId === barber.id;
                return (
                  <div
                    key={barber.id}
                    onClick={() => {
                      setSelectedBarberId(barber.id);
                      setSelectedTime(''); // Reset time slot
                    }}
                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border relative ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={getAssetUrl(barber.avatar)}
                          alt={barber.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                        />
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{barber.name}</h3>
                        <p className="text-xs text-amber-400/90 truncate">{barber.title}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {barber.rating}
                          </span>
                          <span>·</span>
                          <span>{barber.experienceYears} yıl tecrübe</span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Çalışma Saatleri:</span>
                      <span className="text-slate-300 font-mono">{barber.workingHours.start} - {barber.workingHours.end}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Hizmetlere Dön</span>
              </button>

              <button
                onClick={() => setStep(3)}
                disabled={!selectedBarberId}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                <span>Tarih & Saat Seçimine Geç</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DATE & AVAILABLE TIME SLOTS */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Randevu Tarihi ve Boş Saati Belirleyin</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedBarber?.name} için müsait olan saatler gerçek zamanlı hesaplanmaktadır
                </p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Geri Dön</span>
              </button>
            </div>

            {/* Horizontal Date Picker */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Tarih Seçimi</span>
              </label>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {upcomingDates.map((item) => {
                  const isSelected = selectedDate === item.iso;
                  const isDayOff = selectedBarber?.daysOff.includes(item.dayOfWeek);

                  return (
                    <button
                      key={item.iso}
                      disabled={isDayOff}
                      onClick={() => {
                        setSelectedDate(item.iso);
                        setSelectedTime(''); // Reset time on date change
                      }}
                      className={`flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] py-3 px-2 rounded-2xl border transition-all ${
                        isDayOff
                          ? 'opacity-30 border-slate-900 bg-slate-950 cursor-not-allowed text-slate-600'
                          : isSelected
                          ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg font-bold'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                        {item.dayName}
                      </span>
                      <span className="text-lg font-extrabold font-mono my-0.5">
                        {item.dayNumber}
                      </span>
                      <span className={`text-[10px] ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                        {item.monthName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-white">Müsait Saat Dilimleri</h3>
                  <span className="text-xs text-slate-400 font-mono">({totalDuration} dk süre için)</span>
                </div>
                {availableSlots.length > 0 && (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {availableSlots.length} boş saat
                  </span>
                )}
              </div>

              {availableSlots.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 text-amber-500/60 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-300">Bu tarihte uygun boş randevu saati kalmadı</p>
                  <p className="text-xs text-slate-500 mt-1">Lütfen yukarıdan başka bir gün seçiniz veya farklı bir stilist deneyiniz.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all border text-center ${
                          isSelected
                            ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md ring-2 ring-amber-400/30'
                            : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/50 hover:bg-slate-900'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Berbere Dön</span>
              </button>

              <button
                onClick={() => setStep(4)}
                disabled={!selectedTime}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                <span>İletişim Bilgilerine Geç</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CONTACT INFO & SUBMISSION */}
        {step === 4 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">İletişim Bilgileriniz</h2>
                <p className="text-xs text-slate-400 mt-0.5">Randevu onayı ve yönetici anlık bildirimi için gereklidir</p>
              </div>
              <button
                onClick={() => setStep(3)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Saate Dön</span>
              </button>
            </div>

            {/* Order Summary Card */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Randevu Özeti</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Stilist:</span>
                  <p className="font-semibold text-white">{selectedBarber?.name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Tarih & Saat:</span>
                  <p className="font-semibold text-white font-mono">{selectedDate} - {selectedTime}</p>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-800">
                  <span className="text-slate-500">Hizmetler:</span>
                  <p className="font-semibold text-white">{selectedServices.map((s) => s.name).join(', ')}</p>
                </div>
                <div className="col-span-2 flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Tahmini Toplam Süre:</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">{totalDuration} dakika</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Adınız ve Soyadınız <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Örn: Ahmet Güneş"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Cep Telefonu Numaranız <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    placeholder="05xx xxx xx xx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Randevu teyidi ve anlık SMS/WhatsApp hatırlatması için kullanılacaktır.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  E-Posta Adresi (Opsiyonel)
                </label>
                <input
                  type="email"
                  placeholder="ornek@mail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Özel Notunuz veya İstediğiniz Model (Opsiyonel)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <textarea
                    rows={2}
                    placeholder="Örn: Saçımın sol tarafında döner var, yanlar kısa üstler uzun kalsın..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2.5 text-xs text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Randevuyu onayladığınız anda sistem yöneticisinin iPhone veya Android telefonuna anlık sesli push bildirimi iletilecek ve takvime kaydedilecektir.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Geri</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !customerName.trim() || !customerPhone.trim()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Kaydediliyor & Bildirim Gönderiliyor...' : 'Randevuyu Onayla ve Gönder'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
          </>
        )}

        {/* STEP 5: BOOKING CONFIRMATION & SUCCESS SCREEN */}
        {step === 5 && completedAppointment && (
          <div className="max-w-xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 backdrop-blur shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Randevunuz Alındı!
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                Teşekkür Ederiz, Sayın {completedAppointment.customerName}
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Randevunuz başarıyla oluşturuldu ve berber yönetim sistemine kaydedildi.
              </p>
            </div>

            {/* Notification Delivered Badge */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 text-xs text-amber-200 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>
                <strong>Yöneticiye Anlık Bildirim İletildi:</strong> Randevu saatiniz berber takvimine işlendi.
              </span>
            </div>

            {/* Receipt Card */}
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800/80 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Randevu Kodu:</span>
                <span className="font-mono text-amber-400 font-bold">#{completedAppointment.id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Stilist / Berber:</span>
                <span className="text-white font-semibold">{completedAppointment.barberName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Tarih:</span>
                <span className="text-white font-mono">{completedAppointment.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Saat:</span>
                <span className="text-white font-mono font-bold">{completedAppointment.time}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Hizmetler:</span>
                <span className="text-white font-medium text-right max-w-[200px] truncate">{completedAppointment.serviceNames}</span>
              </div>
              <div className="flex justify-between py-1.5 text-xs font-semibold">
                <span className="text-slate-400">Rezervasyon Durumu:</span>
                <span className="text-emerald-400 font-bold">Onaylandı ✓</span>
              </div>
            </div>

            {/* Salon Directions for the Customer */}
            <div className="text-left">
              <ShopLocationBadge />
            </div>

            {/* Quick Actions */}
            <div className="space-y-2.5 pt-2">
              {/* WhatsApp direct notification to Tarık Dilek */}
              <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-3.5 space-y-2 text-left">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Randevuyu WhatsApp ile Tarık Dilek'e Bildirin:</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Aşağıdaki butona dokunduğunuzda salon yöneticimize hazır WhatsApp mesajı iletilir ve randevunuz anında onay sırasına alınır.
                </p>
                <a
                  href={buildManagerWhatsAppUrl(
                    settings.managerPhone,
                    completedAppointment.customerName,
                    completedAppointment.customerPhone,
                    completedAppointment.serviceNames,
                    completedAppointment.barberName,
                    completedAppointment.date,
                    completedAppointment.time
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-emerald-600/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp ile Yöneticiye Gönder (+90 531 660 52 30)</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetBooking}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Yeni Bir Randevu Oluştur
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
