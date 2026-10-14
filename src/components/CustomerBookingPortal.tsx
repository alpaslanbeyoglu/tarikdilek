import React, { useState, useMemo, useEffect } from 'react';
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
  X,
  Search,
  CalendarPlus,
  Navigation,
  Download,
  Users,
  Sun,
  Moon,
  Sunrise,
  ShieldCheck,
  CornerDownRight,
  RefreshCw,
} from 'lucide-react';
import { buildManagerWhatsAppUrl, buildCustomerWhatsAppUrl } from '../services/notificationService';
import { ShopLocationBadge } from './ShopLocationBadge';
import { formatLocalDateToISO, parseISODateToLocal, formatISODateToTurkish } from '../utils/dateHelper';

interface CustomerBookingPortalProps {
  initialServiceId?: string;
  initialBarberId?: string;
}

export const CustomerBookingPortal: React.FC<CustomerBookingPortalProps> = ({
  initialServiceId,
  initialBarberId,
}) => {
  const {
    barbers,
    services,
    settings,
    appointments,
    getAvailableSlots,
    bookAppointment,
    updateAppointmentStatus,
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
    if (window.confirm('Mevcut randevunuzu iptal etmek ve yeni randevu almayı aktifleştirmek istediğinizden emin misiniz?')) {
      updateAppointmentStatus(id, 'cancelled');
      localStorage.removeItem('tarik_dilek_my_active_appointment_id');
    }
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

  // Wizard Steps:
  // 1: Hizmet Seçimi (Services)
  // 2: Berber / Stilist Seçimi (Stylist)
  // 3: Tarih & Saat Seçimi (Date & Slot)
  // 4: Bilgiler & Onay (Customer Info & Review)
  // 5: Başarı & Takvim (Success)
  const [step, setStep] = useState<number>(1);
  const [modalPhotoUrl, setModalPhotoUrl] = useState<string | null>(null);

  // Form State
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() => {
    return initialServiceId ? [initialServiceId] : ['s-sac-sakal-kesim'];
  });

  // 'any' denotes "Fark Etmez / İlk Müsait Uzman"
  const [isAnyBarber, setIsAnyBarber] = useState<boolean>(false);
  const [selectedBarberId, setSelectedBarberId] = useState<string>(() => {
    return initialBarberId || 'b1';
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return formatLocalDateToISO(new Date());
  });
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState<string>('');
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
    duration: number;
  } | null>(null);

  // Sync initial props if they change
  useEffect(() => {
    if (initialServiceId) {
      setSelectedServiceIds([initialServiceId]);
    }
  }, [initialServiceId]);

  useEffect(() => {
    if (initialBarberId) {
      setSelectedBarberId(initialBarberId);
      setIsAnyBarber(false);
    }
  }, [initialBarberId]);

  // Sync selectedBarberId if current is inactive
  useEffect(() => {
    if (barbers.length > 0 && !isAnyBarber) {
      const activeBarber = barbers.find((b) => b.id === selectedBarberId && b.active);
      if (!activeBarber) {
        const firstActive = barbers.find((b) => b.active) || barbers[0];
        if (firstActive && firstActive.id !== selectedBarberId) {
          setSelectedBarberId(firstActive.id);
        }
      }
    }
  }, [barbers, selectedBarberId, isAnyBarber]);

  // Filtered Services based on search and category
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat = categoryFilter === 'all' || s.category === categoryFilter;
      const matchSearch =
        !serviceSearchQuery.trim() ||
        s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(serviceSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, categoryFilter, serviceSearchQuery]);

  // Selected Services objects
  const selectedServices = useMemo(() => {
    const list = services.filter((s) => selectedServiceIds.includes(s.id));
    if (list.length === 0 && services.length > 0) {
      return [services.find((s) => s.popular) || services[0]];
    }
    return list;
  }, [services, selectedServiceIds]);

  const totalDuration = useMemo(() => {
    const duration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
    return Math.max(20, duration || 30);
  }, [selectedServices]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  // Active barbers list
  const activeBarbers = useMemo(() => {
    return barbers.filter((b) => b.active);
  }, [barbers]);

  // Effective Barber object (for UI display)
  const currentBarber = useMemo(() => {
    if (isAnyBarber) {
      return {
        id: 'any',
        name: 'İlk Müsait Uzman',
        title: 'En Hızlı Randevu',
        avatar: '/apple-touch-icon.png',
        rating: 5.0,
        experienceYears: 15,
        active: true,
        daysOff: [] as number[],
        workingHours: { start: '09:00', end: '20:30' },
      };
    }
    return barbers.find((b) => b.id === selectedBarberId) || barbers[0];
  }, [isAnyBarber, selectedBarberId, barbers]);

  // Calculate available slots
  const availableSlots = useMemo(() => {
    if (!selectedDate || totalDuration === 0) return [];

    if (isAnyBarber) {
      // Union of available slots across ALL active barbers
      const slotSet = new Set<string>();
      activeBarbers.forEach((b) => {
        const slots = getAvailableSlots(b.id, selectedDate, totalDuration);
        slots.forEach((s) => slotSet.add(s));
      });
      return Array.from(slotSet).sort();
    } else {
      if (!selectedBarberId) return [];
      return getAvailableSlots(selectedBarberId, selectedDate, totalDuration);
    }
  }, [isAnyBarber, activeBarbers, selectedBarberId, selectedDate, totalDuration, getAvailableSlots]);

  // Group slots into time-of-day buckets for ease of scanning
  const slotGroups = useMemo(() => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    availableSlots.forEach((slot) => {
      if (slot < '12:00') {
        morning.push(slot);
      } else if (slot < '17:00') {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  }, [availableSlots]);

  // Generate next 14 days for date picker
  const upcomingDates = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const iso = formatLocalDateToISO(d);
      const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
      ];
      list.push({
        iso,
        dayNumber: d.getDate(),
        dayName: i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : dayNames[d.getDay()],
        fullDayName: dayNames[d.getDay()],
        monthName: monthNames[d.getMonth()],
        dayOfWeek: d.getDay(),
      });
    }
    return list;
  }, []);

  // Helper to find earliest date with available slots
  const firstAvailableDate = useMemo(() => {
    if (totalDuration === 0 || upcomingDates.length === 0) return null;

    return (
      upcomingDates.find((item) => {
        if (isAnyBarber) {
          const hasAny = activeBarbers.some((b) => {
            const isOff = (b.daysOff || []).includes(item.dayOfWeek);
            if (isOff) return false;
            return getAvailableSlots(b.id, item.iso, totalDuration).length > 0;
          });
          return hasAny;
        } else {
          const barber = barbers.find((b) => b.id === selectedBarberId);
          const isOff = (barber?.daysOff || []).includes(item.dayOfWeek);
          if (isOff) return false;
          const slots = getAvailableSlots(selectedBarberId, item.iso, totalDuration);
          return slots.length > 0;
        }
      }) || null
    );
  }, [isAnyBarber, activeBarbers, selectedBarberId, totalDuration, upcomingDates, barbers, getAvailableSlots]);

  // If selectedDate has 0 slots or is day-off, advance automatically if first available exists
  useEffect(() => {
    if (!firstAvailableDate) return;
    const isDayOff = !isAnyBarber && (currentBarber.daysOff || []).includes(parseISODateToLocal(selectedDate).getDay());
    if (availableSlots.length === 0 || isDayOff) {
      if (firstAvailableDate.iso !== selectedDate) {
        setSelectedDate(firstAvailableDate.iso);
        setSelectedTime('');
      }
    }
  }, [firstAvailableDate, selectedDate, availableSlots.length, isAnyBarber, currentBarber.daysOff]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one service
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
    setSelectedTime(''); // Reset selected time if duration changed
  };

  // Turkish phone formatter helper (e.g. 0532 123 45 67)
  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length > 11) {
      formatted = digits.slice(0, 11);
    }
    if (formatted.length > 7) {
      formatted = `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7, 9)} ${formatted.slice(9, 11)}`;
    } else if (formatted.length > 4) {
      formatted = `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7)}`;
    }
    setCustomerPhone(formatted.trim());
  };

  // Quick notes tags
  const quickNoteTags = [
    '✂️ Yanlar kısa, üstler doğal kalsın',
    '🧔 Sakal tasarımı ve düzeltme',
    '🤫 Dinlendirici / Sessiz randevu',
    '☕ Türk kahvesi ikramı',
    '💈 Yeni saç stili danışmak istiyorum',
    '🧴 Saç dökülmesi & bakım tavsiyesi',
  ];

  const toggleQuickNote = (tag: string) => {
    if (notes.includes(tag)) {
      setNotes((prev) => prev.replace(tag, '').replace(/\n\s*\n/g, '\n').trim());
    } else {
      setNotes((prev) => (prev ? `${prev} • ${tag}` : tag));
    }
  };

  // Appointment Submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !selectedTime) return;

    setIsSubmitting(true);
    try {
      // Determine final assigned barber if "isAnyBarber" was selected
      let finalBarberId = selectedBarberId;
      if (isAnyBarber) {
        const matchingBarber = activeBarbers.find((b) => {
          const slots = getAvailableSlots(b.id, selectedDate, totalDuration);
          return slots.includes(selectedTime);
        });
        finalBarberId = matchingBarber?.id || activeBarbers[0]?.id || 'b1';
      }

      const assignedBarber = barbers.find((b) => b.id === finalBarberId);

      const appointment = await bookAppointment({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        barberId: finalBarberId,
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
        barberName: assignedBarber ? assignedBarber.name : 'Tarık Dilek',
        serviceNames: selectedServices.map((s) => s.name).join(', '),
        date: selectedDate,
        time: selectedTime,
        totalPrice,
        duration: totalDuration,
      });

      localStorage.setItem('tarik_dilek_my_active_appointment_id', appointment.id);

      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97706', '#10b981', '#ffffff'],
      });

      setStep(5);
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download .ics file for iPhone & Android calendar
  const handleDownloadICS = () => {
    if (!completedAppointment) return;
    try {
      const [year, month, day] = completedAppointment.date.split('-').map(Number);
      const [hours, mins] = completedAppointment.time.split(':').map(Number);
      const startDate = new Date(year, month - 1, day, hours, mins);
      const endDate = new Date(startDate.getTime() + totalDuration * 60000);

      const pad = (n: number) => String(n).padStart(2, '0');
      const formatICSDate = (d: Date) =>
        `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Tarik Dilek Erkek Kuaförü//TR',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `SUMMARY:Tarık Dilek Kuaför Randevusu (${completedAppointment.serviceNames})`,
        `DESCRIPTION:Tarık Dilek Erkek Kuaförü Randevusu\\nStilist: ${completedAppointment.barberName}\\nHizmetler: ${completedAppointment.serviceNames}\\nAdres: ${settings.address}\\nTel: +90 531 660 52 30`,
        `LOCATION:${settings.address}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tarik-dilek-randevu-${completedAppointment.date}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn('ICS creation failed:', err);
    }
  };

  // Google Calendar URL generator
  const googleCalendarUrl = useMemo(() => {
    if (!completedAppointment) return '#';
    try {
      const [year, month, day] = completedAppointment.date.split('-').map(Number);
      const [hours, mins] = completedAppointment.time.split(':').map(Number);
      const startDate = new Date(year, month - 1, day, hours, mins);
      const endDate = new Date(startDate.getTime() + totalDuration * 60000);

      const pad = (n: number) => String(n).padStart(2, '0');
      const formatCal = (d: Date) =>
        `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

      const title = encodeURIComponent(`Tarık Dilek Kuaför Randevusu (${completedAppointment.serviceNames})`);
      const details = encodeURIComponent(
        `Berber / Stilist: ${completedAppointment.barberName}\nHizmetler: ${completedAppointment.serviceNames}\nAdres: ${settings.address}\nİletişim: +90 531 660 52 30`
      );
      const location = encodeURIComponent(settings.address);
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatCal(startDate)}/${formatCal(endDate)}&details=${details}&location=${location}`;
    } catch {
      return '#';
    }
  }, [completedAppointment, totalDuration, settings.address]);

  const resetBooking = () => {
    setStep(1);
    setSelectedTime('');
    setNotes('');
    setCompletedAppointment(null);
  };

  // Step names & descriptions
  const stepDefinitions = [
    {
      num: 1,
      title: 'Hizmet Seçimi',
      shortTitle: '1. Hizmet',
      subtitle: 'Almak istediğiniz işlemleri belirleyin',
      badge: `${selectedServices.length} Hizmet Seçildi`,
    },
    {
      num: 2,
      title: 'Uzman Tercihi',
      shortTitle: '2. Uzman',
      subtitle: 'Stilistinizi seçin veya ilk müsait berberi tercih edin',
      badge: isAnyBarber ? 'İlk Müsait' : currentBarber.name,
    },
    {
      num: 3,
      title: 'Tarih & Saat',
      shortTitle: '3. Zaman',
      subtitle: 'Müsait gün ve saat dilimini belirleyin',
      badge: selectedTime ? `${selectedDate.slice(5)} ${selectedTime}` : 'Saat Seçilmedi',
    },
    {
      num: 4,
      title: 'Bilgiler & Onay',
      shortTitle: '4. Onay',
      subtitle: 'İletişim bilgilerinizi girip randevunuzu tamamlayın',
      badge: 'Son Adım',
    },
  ];

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* ACTIVE APPOINTMENT ALERT (IF CUSTOMER ALREADY HAS AN UPCOMING APPOINTMENT) */}
      {myActiveAppointment && step < 5 && (
        <div className="rounded-3xl bg-slate-900/95 border border-amber-500/40 p-5 sm:p-7 backdrop-blur-xl shadow-2xl space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/30">
              <Sparkles className="w-4 h-4 animate-pulse text-amber-400" />
              <span>Aktif Randevunuz Bulunuyor</span>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                myActiveAppointment.status === 'confirmed'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {myActiveAppointment.status === 'confirmed' ? 'Onaylandı ✓' : 'Onay Bekliyor ⏳'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">Randevu Takip Paneli</h2>
              <p className="text-xs text-slate-400 mt-1">
                Sayın <strong>{myActiveAppointment.customerName}</strong>, randevunuz sistemde kayıtlıdır. Randevunuzu iptal ederek yeni bir randevu seçebilirsiniz.
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-slate-950 border border-amber-500/30 p-3.5 text-center flex flex-col justify-center">
              <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">Kalan Süre</span>
              <div className="text-lg font-extrabold font-mono text-white mt-0.5">
                {getRemainingTime(myActiveAppointment.date, myActiveAppointment.startTime)}
              </div>
            </div>
          </div>

          {/* Receipt Card */}
          <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-500 block text-[11px]">Randevu Kodu</span>
              <span className="font-mono text-amber-400 font-bold text-sm">
                #{myActiveAppointment.id.slice(-6).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Stilist</span>
              <span className="text-white font-semibold">
                {barbers.find((b) => b.id === myActiveAppointment.barberId)?.name || 'Tarık Dilek'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Tarih & Saat</span>
              <span className="text-amber-400 font-mono font-bold">
                {myActiveAppointment.date} · {myActiveAppointment.startTime}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Durum</span>
              <span className="text-emerald-400 font-semibold">Aktif Rezervasyon</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => handleCancelMyAppointment(myActiveAppointment.id)}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Randevuyu İptal Et ve Yeni Randevu Al</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ENHANCED STEPPER NAVIGATION HEADER (MOBILE & DESKTOP OPTIMIZED)           */}
      {/* ========================================================================= */}
      {step < 5 && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-4">
          {/* Top Info Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black text-xs shadow-md">
                {step}
              </span>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{stepDefinitions[step - 1].title}</span>
                  <span className="text-[11px] text-amber-400 font-normal">
                    (Adım {step} / 4)
                  </span>
                </h3>
                <p className="text-xs text-slate-400 hidden sm:block">
                  {stepDefinitions[step - 1].subtitle}
                </p>
              </div>
            </div>

            {/* Quick Summary Pill */}
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Toplam: {totalDuration} dk</span>
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="relative w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          {/* Interactive Steps Grid */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {stepDefinitions.map((item) => {
              const isCurrent = step === item.num;
              const isPassed = step > item.num;
              const isClickable = isPassed;

              return (
                <button
                  key={item.num}
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && setStep(item.num)}
                  className={`group flex flex-col items-center sm:items-start text-left p-2 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-amber-500/10 border border-amber-500/30'
                      : isPassed
                      ? 'bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 cursor-pointer'
                      : 'opacity-40 border border-transparent cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPassed ? '✓' : item.num}
                    </span>
                    <span
                      className={`text-xs font-bold truncate hidden sm:inline ${
                        isCurrent
                          ? 'text-amber-400'
                          : isPassed
                          ? 'text-slate-200 group-hover:text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  {/* Subtext on desktop */}
                  <span className="text-[10px] text-slate-400 truncate mt-1 hidden md:block pl-6">
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: HİZMET SEÇİMİ (SERVICES)                                         */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header & Quick Tip */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Almak İstediğiniz Hizmetleri Seçin</span>
                <span className="text-xs font-normal text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Çoklu Seçim Aktif
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Aynı randevuda dilediğiniz kadar hizmeti birleştirebilirsiniz (Örn: Saç Kesimi + Sakal Tıraşı).
              </p>
            </div>

            {/* Instant Search Bar */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Hizmet ara (örn: saç, sakal...)"
                value={serviceSearchQuery}
                onChange={(e) => setServiceSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
              />
              {serviceSearchQuery && (
                <button
                  onClick={() => setServiceSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Tüm Hizmetler', icon: Sparkles },
              { id: 'Kombin', label: '✨ Kombin Paketler', icon: Scissors },
              { id: 'Saç', label: '✂️ Saç Kesim & Tasarım', icon: Scissors },
              { id: 'Sakal', label: '🧔 Sakal & Tıraş', icon: Scissors },
              { id: 'Bakım & Spa', label: '💆 Bakım & Spa', icon: Sparkles },
            ].map((cat) => {
              const isActive = categoryFilter === cat.id;
              const count =
                cat.id === 'all'
                  ? services.length
                  : services.filter((s) => s.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredServices.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`group cursor-pointer rounded-2xl p-4 sm:p-5 transition-all duration-200 border text-left flex flex-col justify-between select-none relative ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                          {service.name}
                        </h3>
                        {service.popular && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                            Popüler Tercih
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Checkbox indicator */}
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all border ${
                        isSelected
                          ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md scale-105'
                          : 'border-slate-700 bg-slate-950 text-transparent group-hover:border-slate-500'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300 font-mono">
                      <span className="flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{service.durationMinutes} dakika</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-md">
                        {service.category}
                      </span>
                      {isSelected && (
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                          Seçildi ✓
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <div className="py-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <Scissors className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-300 font-bold">Aradığınız kriterde hizmet bulunamadı</p>
              <button
                onClick={() => {
                  setServiceSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="text-xs text-amber-400 underline font-semibold"
              >
                Tüm filtreleri temizle
              </button>
            </div>
          )}

          {/* Sticky Bottom Bar */}
          <div className="sticky bottom-4 z-30 rounded-2xl bg-slate-900/95 border border-slate-800 p-3.5 sm:p-4 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-400">
                Seçilen: <strong className="text-amber-400">{selectedServices.length} işlem</strong>
                <span className="hidden sm:inline text-slate-500"> ({selectedServices.map((s) => s.name).join(', ')})</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Tahmini Toplam Süre: <strong className="font-mono text-amber-400">{totalDuration} dakika</strong></span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={selectedServiceIds.length === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-extrabold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 shrink-0"
            >
              <span>İleri: Berber Seçimi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: STİLİST / BERBER SEÇİMİ (BARBER)                                  */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Tercih Ettiğiniz Berber / Stilisti Seçin</h2>
              <p className="text-xs text-slate-400 mt-1">
                İster özel stilistinizi belirleyin, isterseniz en erken randevu için "İlk Müsait Uzman"ı seçin.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 border border-slate-800 px-3 py-1.5 rounded-xl bg-slate-950"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Geri Dön</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* VIP OPTION: FARK ETMEZ / İLK MÜSAİT UZMAN */}
            <div
              onClick={() => {
                setIsAnyBarber(true);
                setSelectedTime('');
              }}
              className={`rounded-2xl p-4 sm:p-5 transition-all duration-200 border cursor-pointer relative select-none flex flex-col justify-between ${
                isAnyBarber
                  ? 'bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-black text-xl shadow-md border border-amber-400">
                      <Sparkles className="w-7 h-7 text-slate-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-white">İlk Müsait Berber</h3>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                          En Hızlı
                        </span>
                      </div>
                      <p className="text-xs text-amber-400 font-medium">Fark Etmez / İlk Boş Koltuk</p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      isAnyBarber ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-700 bg-slate-950'
                    }`}
                  >
                    {isAnyBarber && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  Belirli bir berber tercihiniz yoksa, seçtiğiniz saatte en erken müsait olan usta stilistimiz atanır.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center justify-between font-semibold">
                <span>⚡ En Erken Randevu İmkânı</span>
                {isAnyBarber && <span>Seçildi ✓</span>}
              </div>
            </div>

            {/* BARBERS LIST */}
            {barbers.map((barber) => {
              const isSelected = !isAnyBarber && selectedBarberId === barber.id;
              const isInactive = !barber.active;

              return (
                <div
                  key={barber.id}
                  onClick={() => {
                    if (isInactive) return;
                    setIsAnyBarber(false);
                    setSelectedBarberId(barber.id);
                    setSelectedTime('');
                  }}
                  className={`rounded-2xl p-4 sm:p-5 transition-all duration-200 border relative select-none flex flex-col justify-between ${
                    isInactive
                      ? 'bg-slate-950/70 border-slate-900 opacity-50 grayscale cursor-not-allowed'
                      : isSelected
                      ? 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40 cursor-pointer'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900 cursor-pointer'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3.5">
                      <div
                        className="relative cursor-pointer group/avatar shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalPhotoUrl(barber.avatar);
                        }}
                        title="Fotoğrafı büyütmek için tıklayın"
                      >
                        <img
                          src={getAssetUrl(barber.avatar)}
                          alt={barber.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-700 group-hover/avatar:border-amber-400 transition-colors shadow-md"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                            isInactive ? 'bg-slate-600' : 'bg-emerald-500'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-sm sm:text-base font-bold text-white truncate">
                            {barber.name}
                          </h3>
                          {!isInactive && (
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                                isSelected ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-700 bg-slate-950'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-amber-400/90 truncate font-medium">{barber.title}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {barber.rating}
                          </span>
                          <span>·</span>
                          <span>{barber.experienceYears} yıl tecrübe</span>
                        </div>
                      </div>
                    </div>

                    {isInactive && barber.inactiveNote && (
                      <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 font-medium">
                        ⚠️ {barber.inactiveNote}
                      </div>
                    )}
                  </div>

                  {!isInactive && (
                    <div className="mt-3.5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{barber.workingHours.start} - {barber.workingHours.end}</span>
                      </span>
                      {isSelected ? (
                        <span className="text-amber-400 font-bold">Seçildi ✓</span>
                      ) : (
                        <span className="text-slate-500">Müsait</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sticky Navigation */}
          <div className="sticky bottom-4 z-30 rounded-2xl bg-slate-900/95 border border-slate-800 p-3.5 sm:p-4 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Hizmetlere Dön</span>
            </button>

            <button
              onClick={() => {
                if (firstAvailableDate && availableSlots.length === 0) {
                  setSelectedDate(firstAvailableDate.iso);
                  setSelectedTime('');
                }
                setStep(3);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-extrabold transition-all shadow-lg shadow-amber-500/20"
            >
              <span>İleri: Tarih & Saat Seçimi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: TARİH VE MÜSAİT SAAT SEÇİMİ (DATE & TIME)                        */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Randevu Tarihi ve Saatini Belirleyin</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                <strong>{isAnyBarber ? 'İlk Müsait Berber' : currentBarber.name}</strong> için {totalDuration} dakikalık işlem aralığı hesaplanmaktadır.
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 border border-slate-800 px-3 py-1.5 rounded-xl bg-slate-950 shrink-0 self-start sm:self-auto"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Berberi Değiştir</span>
            </button>
          </div>

          {/* Quick Earliest Slot Alert (if today is booked or off) */}
          {firstAvailableDate && firstAvailableDate.iso !== selectedDate && (
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3 sm:p-4 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  En yakın müsait gün: <strong>{firstAvailableDate.dayName} ({firstAvailableDate.dayNumber} {firstAvailableDate.monthName})</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(firstAvailableDate.iso);
                  setSelectedTime('');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1 shadow-md"
              >
                <span>Bu Güne Geç</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Horizontal 14-Day Date Carousel */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Önümüzdeki 14 Gün İçinden Tarih Seçin</span>
            </label>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {upcomingDates.map((item) => {
                const isSelected = selectedDate === item.iso;
                const isDayOff =
                  !isAnyBarber && (currentBarber?.daysOff || []).includes(item.dayOfWeek);

                // Slot count for badge
                const daySlotsCount = isDayOff
                  ? 0
                  : isAnyBarber
                  ? (() => {
                      const s = new Set<string>();
                      activeBarbers.forEach((b) => {
                        getAvailableSlots(b.id, item.iso, totalDuration).forEach((sl) => s.add(sl));
                      });
                      return s.size;
                    })()
                  : getAvailableSlots(selectedBarberId, item.iso, totalDuration).length;

                const isFull = !isDayOff && daySlotsCount === 0;

                return (
                  <button
                    key={item.iso}
                    disabled={isDayOff}
                    onClick={() => {
                      setSelectedDate(item.iso);
                      setSelectedTime('');
                    }}
                    className={`flex flex-col items-center justify-center min-w-[76px] sm:min-w-[86px] py-3 px-2 rounded-2xl border transition-all text-center select-none ${
                      isDayOff
                        ? 'opacity-35 border-slate-900 bg-slate-950/60 cursor-not-allowed text-slate-600'
                        : isSelected
                        ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 font-bold scale-[1.03]'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-slate-950' : 'text-slate-400'}`}>
                      {item.dayName}
                    </span>
                    <span className="text-xl font-extrabold font-mono my-0.5">
                      {item.dayNumber}
                    </span>
                    <span className={`text-[10px] ${isSelected ? 'text-slate-950' : 'text-slate-400'}`}>
                      {item.monthName}
                    </span>
                    <span
                      className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-slate-950/20 text-slate-950'
                          : isDayOff
                          ? 'text-slate-600'
                          : isFull
                          ? 'text-rose-400 bg-rose-500/10'
                          : 'text-emerald-400 bg-emerald-500/10'
                      }`}
                    >
                      {isDayOff ? 'İzinli' : isFull ? 'Dolu' : `${daySlotsCount} saat`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Divided by Time-of-Day */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-white">Müsait Saat Dilimleri</h3>
                <span className="text-xs text-slate-400 font-mono">({formatISODateToTurkish(selectedDate)})</span>
              </div>
              {availableSlots.length > 0 && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  {availableSlots.length} boş randevu
                </span>
              )}
            </div>

            {availableSlots.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-3">
                <AlertCircle className="w-9 h-9 text-amber-500/60 mx-auto" />
                <p className="text-sm font-bold text-slate-200">Bu tarihte uygun boş randevu saati kalmadı</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Seçilen berber bu tarihte izinli olabilir veya tüm saatler dolmuş olabilir. Lütfen takvimden diğer günleri seçiniz.
                </p>
                {firstAvailableDate && firstAvailableDate.iso !== selectedDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(firstAvailableDate.iso);
                      setSelectedTime('');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>İlk Müsait Güne Git ({firstAvailableDate.dayName} {firstAvailableDate.dayNumber} {firstAvailableDate.monthName})</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. SABAH DİLİMİ (09:00 - 12:00) */}
                {slotGroups.morning.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400/90">
                      <Sunrise className="w-4 h-4" />
                      <span>Sabah Saatleri (09:00 - 12:00)</span>
                      <span className="text-[10px] text-slate-500 font-mono">({slotGroups.morning.length} saat)</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {slotGroups.morning.map((slot) => {
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all border text-center ${
                              isSelected
                                ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md ring-2 ring-amber-400/30 font-black'
                                : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/50 hover:bg-slate-900'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. ÖĞLEDEN SONRA DİLİMİ (12:00 - 17:00) */}
                {slotGroups.afternoon.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400/90">
                      <Sun className="w-4 h-4" />
                      <span>Öğleden Sonra (12:00 - 17:00)</span>
                      <span className="text-[10px] text-slate-500 font-mono">({slotGroups.afternoon.length} saat)</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {slotGroups.afternoon.map((slot) => {
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all border text-center ${
                              isSelected
                                ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md ring-2 ring-amber-400/30 font-black'
                                : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/50 hover:bg-slate-900'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. AKŞAM DİLİMİ (17:00 - 20:30) */}
                {slotGroups.evening.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400/90">
                      <Moon className="w-4 h-4" />
                      <span>Akşam Saatleri (17:00 - 20:30)</span>
                      <span className="text-[10px] text-slate-500 font-mono">({slotGroups.evening.length} saat)</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {slotGroups.evening.map((slot) => {
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all border text-center ${
                              isSelected
                                ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md ring-2 ring-amber-400/30 font-black'
                                : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/50 hover:bg-slate-900'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Navigation */}
          <div className="sticky bottom-4 z-30 rounded-2xl bg-slate-900/95 border border-slate-800 p-3.5 sm:p-4 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Berbere Dön</span>
            </button>

            <div className="flex items-center gap-3">
              {selectedTime ? (
                <span className="text-xs text-amber-400 font-mono font-bold hidden sm:inline">
                  Seçilen: {selectedTime}
                </span>
              ) : (
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Lütfen saat seçin
                </span>
              )}

              <button
                onClick={() => setStep(4)}
                disabled={!selectedTime}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-extrabold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                <span>İleri: Bilgiler & Onay</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: BİLGİLER VE RANDEVU ONAYI (CONTACT INFO & SUBMIT)                  */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="space-y-5 max-w-3xl mx-auto animate-in fade-in duration-200">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">İletişim Bilgileriniz & Randevu Özeti</h2>
              <p className="text-xs text-slate-400 mt-1">
                Lütfen randevu özetinizi inceleyip ad ve telefon bilgilerinizi giriniz.
              </p>
            </div>
            <button
              onClick={() => setStep(3)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 border border-slate-800 px-3 py-1.5 rounded-xl bg-slate-950"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Saate Dön</span>
            </button>
          </div>

          {/* DIGITAL APPOINTMENT TICKET / RECEIPT */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-amber-500/40 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>RANDEVU BİLETİ ÖNİZLEMESİ</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {settings.shopName} · Göktürk
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Stilist / Berber
                </span>
                <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-500" />
                  <span>{isAnyBarber ? 'İlk Müsait Berber' : currentBarber.name}</span>
                </p>
                <p className="text-xs text-amber-400/80">{currentBarber.title}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Tarih & Randevu Saati
                </span>
                <p className="text-sm font-extrabold text-white font-mono flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>{formatISODateToTurkish(selectedDate)}</span>
                </p>
                <p className="text-xs font-mono text-amber-400 font-bold">
                  Saat: {selectedTime} ({totalDuration} dk)
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Salon Adresi
                </span>
                <p className="text-xs text-white leading-relaxed flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </p>
              </div>
            </div>

            {/* Selected Services Row */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-400">Seçilen Hizmetler: </span>
                <strong className="text-white">{selectedServices.map((s) => s.name).join(' + ')}</strong>
              </div>
              <div className="text-amber-400 font-bold font-mono">
                Toplam Süre: {totalDuration} Dakika
              </div>
            </div>
          </div>

          {/* CONTACT FORM */}
          <form onSubmit={handleBookingSubmit} className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-7 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              <span>İletişim Bilgileri</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cep Telefonu Numaranız <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    placeholder="05xx xxx xx xx"
                    value={customerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Randevu teyidi ve anlık SMS/WhatsApp hatırlatması için kullanılacaktır.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-Posta Adresi (İsteğe Bağlı)
              </label>
              <input
                type="email"
                placeholder="ornek@mail.com (Takvim daveti almak isterseniz)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Quick Note Tags & Textarea */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Özel İstek veya Model Notu (İsteğe Bağlı)
              </label>

              {/* Clickable Quick Tags */}
              <div className="flex flex-wrap gap-1.5">
                {quickNoteTags.map((tag) => {
                  const isChecked = notes.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleQuickNote(tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        isChecked
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {tag} {isChecked && '✓'}
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <textarea
                  rows={2}
                  placeholder="Eklemek istediğiniz özel bir not varsa buraya yazabilirsiniz..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Reassurance Banner */}
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 flex items-start gap-2.5 text-xs text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Anında Takvim Kaydı:</strong> Randevunuzu onayladığınızda salon yöneticimize anlık bildirim iletilir, randevu saatiniz rezerve edilir ve WhatsApp üzerinden kolayca teyit alabilirsiniz.
              </p>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Geri</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !customerName.trim() || !customerPhone.trim()}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-extrabold transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Kaydediliyor & Bildirim Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Randevuyu Onayla ve Gönder (Ücretsiz Rezervasyon)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: BAŞARI, DİJİTAL FİŞ VE TAKVİM İMKÂNLARI (SUCCESS SCREEN)           */}
      {/* ========================================================================= */}
      {step === 5 && completedAppointment && (
        <div className="max-w-2xl mx-auto rounded-3xl bg-slate-900/95 border border-amber-500/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              Randevunuz Başarıyla Alındı!
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              Teşekkür Ederiz, Sayın {completedAppointment.customerName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
              Randevunuz salon sistemine kaydedildi ve berber takvimine işlendi.
            </p>
          </div>

          {/* DIGITAL RECEIPT TICKET */}
          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 text-left space-y-2.5 text-xs shadow-inner">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Randevu Referans Kodu:</span>
              <span className="font-mono text-amber-400 font-bold text-sm">
                #{completedAppointment.id.slice(-6).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Stilist / Berber:</span>
              <span className="text-white font-semibold">{completedAppointment.barberName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Randevu Tarihi:</span>
              <span className="text-white font-mono font-semibold">
                {formatISODateToTurkish(completedAppointment.date)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Randevu Saati:</span>
              <span className="text-amber-400 font-mono font-bold text-sm">
                {completedAppointment.time} ({completedAppointment.duration} dk)
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Hizmetler:</span>
              <span className="text-white font-medium text-right max-w-[240px] truncate">
                {completedAppointment.serviceNames}
              </span>
            </div>
            <div className="flex justify-between py-1.5 text-xs font-semibold">
              <span className="text-slate-400">Rezervasyon Durumu:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Onaylandı & Rezerve Edildi</span>
              </span>
            </div>
          </div>

          {/* CONVENIENT ACTION BUTTONS: WHATSAPP, GOOGLE CALENDAR, ICS DOWNLOAD */}
          <div className="space-y-3 pt-1">
            {/* WhatsApp to Tarık Dilek */}
            <a
              href={buildManagerWhatsAppUrl(
                settings.managerPhone,
                completedAppointment.customerName,
                completedAppointment.customerPhone,
                completedAppointment.serviceNames,
                completedAppointment.barberName,
                completedAppointment.date,
                completedAppointment.time,
                completedAppointment.totalPrice
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-extrabold transition-all shadow-lg shadow-emerald-600/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp ile Tarık Dilek'e Bildir (+90 531 660 52 30)</span>
            </a>

            {/* Calendar Integration Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-700"
              >
                <CalendarPlus className="w-4 h-4 text-amber-400" />
                <span>Google Takvim'e Ekle</span>
              </a>

              <button
                type="button"
                onClick={handleDownloadICS}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-700"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Apple / Telefona Ekle (.ICS)</span>
              </button>
            </div>

            {/* Directions & Salon Location */}
            <ShopLocationBadge />

            <div className="pt-2">
              <button
                onClick={resetBooking}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors border border-slate-800"
              >
                Yeni Bir Randevu Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Barber Photo Zoom */}
      {modalPhotoUrl && (
        <div
          onClick={() => setModalPhotoUrl(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-2xl text-center space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">Stilist Profil Fotoğrafı</h4>
              <button
                onClick={() => setModalPhotoUrl(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 p-2">
              <img
                src={getAssetUrl(modalPhotoUrl)}
                alt="Enlarged Staff"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl mx-auto shadow-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
