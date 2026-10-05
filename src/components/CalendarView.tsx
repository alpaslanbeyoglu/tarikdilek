import React, { useState, useMemo } from 'react';
import { useBarber } from '../context/BarberContext';
import { Appointment, AppointmentStatus } from '../types';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import { NewAppointmentModal } from './NewAppointmentModal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Filter,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  LayoutGrid,
  List,
  Sparkles,
  Phone,
  MessageSquare,
  CheckCircle,
  Scissors,
  Check,
  XCircle,
  MoreHorizontal,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { buildCustomerConfirmationWhatsAppUrl } from '../services/notificationService';
import { formatISODateToTurkish, formatLocalDateToISO, parseISODateToLocal } from '../utils/dateHelper';

export const CalendarView: React.FC = () => {
  const {
    barbers,
    services,
    settings,
    appointments,
    updateAppointmentStatus,
    deleteAppointment,
    refreshAppointments,
    selectedDate,
    setSelectedDate,
    selectedBarberFilter,
    setSelectedBarberFilter,
    statusFilter,
    setStatusFilter,
    currentUserRole,
    loggedInBarberId,
  } = useBarber();

  const isStaff = currentUserRole === 'staff' && !!loggedInBarberId;
  const staffBarber = isStaff ? barbers.find((b) => b.id === loggedInBarberId) : null;

  const [viewType, setViewType] = useState<'list' | 'timeline'>('list');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [initialSlotForNew, setInitialSlotForNew] = useState<{
    barberId?: string;
    time?: string;
  }>({});

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    const ok = await refreshAppointments();
    setIsSyncing(false);
    if (ok) {
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2500);
    }
  };

  // Effective Barber Filter
  const effectiveBarberFilter = isStaff ? (loggedInBarberId as string) : selectedBarberFilter;

  // Filter appointments for the selected date with strict ID deduplication
  const dateAppointments = useMemo(() => {
    const seenIds = new Set<string>();
    return appointments.filter((apt) => {
      if (!apt || !apt.id || seenIds.has(apt.id)) return false;
      seenIds.add(apt.id);
      const dateMatch = apt.date === selectedDate;
      const barberMatch =
        effectiveBarberFilter === 'all' || apt.barberId === effectiveBarberFilter;
      const statusMatch =
        statusFilter === 'all' || apt.status === statusFilter;
      return dateMatch && barberMatch && statusMatch;
    });
  }, [appointments, selectedDate, effectiveBarberFilter, statusFilter]);

  // Daily Statistics
  const stats = useMemo(() => {
    const dayApts = appointments.filter((a) => {
      const dateMatch = a.date === selectedDate;
      const barberMatch = !isStaff || a.barberId === loggedInBarberId;
      return dateMatch && barberMatch;
    });
    const total = dayApts.length;
    const pending = dayApts.filter((a) => a.status === 'pending').length;
    const confirmed = dayApts.filter((a) => a.status === 'confirmed').length;
    const completed = dayApts.filter((a) => a.status === 'completed').length;
    const totalMinutes = dayApts
      .filter((a) => a.status !== 'cancelled')
      .reduce((sum, a) => sum + a.totalDuration, 0);

    return { total, pending, confirmed, completed, totalMinutes };
  }, [appointments, selectedDate, isStaff, loggedInBarberId]);

  // Günlük Personel Cirosu ve Hakedişi (Yöneticinin belirlediği hizmet fiyatları ve prim oranına göre)
  const dailyStaffRevenue = useMemo(() => {
    if (!isStaff || !loggedInBarberId) return 0;
    return appointments
      .filter(
        (a) =>
          a.barberId === loggedInBarberId &&
          a.date === selectedDate &&
          (a.status === 'completed' || a.status === 'confirmed')
      )
      .reduce((sum, a) => {
        const sTotal = (a.serviceIds || []).reduce((sSum, sId) => {
          const s = services.find((item) => item.id === sId);
          return sSum + (s?.price || 0);
        }, 0);
        return sum + (sTotal > 0 ? sTotal : (a.totalPrice || 0));
      }, 0);
  }, [isStaff, loggedInBarberId, appointments, selectedDate, services]);

  const dailyStaffEarnings = useMemo(() => {
    if (!staffBarber) return 0;
    const rate = staffBarber.commissionRate ?? 50;
    return Math.round((dailyStaffRevenue * rate) / 100);
  }, [dailyStaffRevenue, staffBarber]);

  // Helper for local date YYYY-MM-DD without timezone shifts
  const getLocalDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Navigate date
  const changeDate = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const current = new Date(y, m - 1, d);
    current.setDate(current.getDate() + days);
    setSelectedDate(getLocalDateString(current));
  };

  const setToday = () => {
    setSelectedDate(getLocalDateString(new Date()));
  };

  // Generate horizontal scrollable days strip (30 days: 10 past, 20 future centered around selected date)
  const weekDaysStrip = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const centerDate = new Date(y, m - 1, d);
    const days = [];
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const todayIso = getLocalDateString(new Date());

    for (let i = -10; i <= 20; i++) {
      const target = new Date(centerDate);
      target.setDate(centerDate.getDate() + i);
      const isoDate = getLocalDateString(target);
      const count = appointments.filter((a) => a.date === isoDate && a.status !== 'cancelled').length;
      days.push({
        iso: isoDate,
        dayName: dayNames[target.getDay()],
        dayNumber: target.getDate(),
        monthName: target.toLocaleDateString('tr-TR', { month: 'short' }),
        isToday: isoDate === todayIso,
        isSelected: isoDate === selectedDate,
        count,
      });
    }
    return days;
  }, [selectedDate, appointments]);

  // Timeline hours from 09:00 to 20:00
  const hours = useMemo(() => {
    const list = [];
    for (let h = 9; h <= 20; h++) {
      list.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return list;
  }, []);

  // Filter barbers to show
  const activeBarbers = useMemo(() => {
    if (isStaff && staffBarber) {
      return [staffBarber];
    }
    if (selectedBarberFilter !== 'all') {
      return barbers.filter((b) => b.id === selectedBarberFilter);
    }
    return barbers.filter((b) => b.active);
  }, [barbers, selectedBarberFilter, isStaff, staffBarber]);

  // Helper to format date for display
  const formattedDateTitle = useMemo(() => {
    return formatISODateToTurkish(selectedDate);
  }, [selectedDate]);

  const handleSlotClick = (barberId: string, time: string) => {
    setInitialSlotForNew({ barberId, time });
    setIsNewModalOpen(true);
  };

  const sortedAppointments = useMemo(() => {
    return [...dateAppointments].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [dateAppointments]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. TOP HEADER & DATE BAR (COMPACT & FIT) */}
      <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4 rounded-2xl backdrop-blur space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Date Picker & Jump Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => changeDate(-1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Önceki Gün"
            >
              <ChevronLeft className="w-4 h-4 pointer-events-none" />
            </button>

            <button
              type="button"
              onClick={setToday}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 transition-colors cursor-pointer"
            >
              Bugün
            </button>

            <button
              type="button"
              onClick={() => changeDate(1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Sonraki Gün"
            >
              <ChevronRight className="w-4 h-4 pointer-events-none" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
            />

            <span className="text-xs font-bold text-slate-200 ml-1 hidden md:inline-block">
              {formattedDateTitle}
            </span>
          </div>

          {/* View Toggle & New Appointment Button */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewType('list')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  viewType === 'list'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Ajanda Liste Görünümü"
              >
                <List className="w-3.5 h-3.5" />
                <span>Ajanda Liste</span>
              </button>

              <button
                onClick={() => setViewType('timeline')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  viewType === 'timeline'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Saat Izgarası Çizelgesi"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Saat Izgarası</span>
              </button>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                syncSuccess
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Buluttan Eşitle & Yenile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : syncSuccess ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Eşitleniyor...' : syncSuccess ? 'Eşitlendi ✓' : 'Bulut Eşitle'}
              </span>
            </button>

            <button
              onClick={() => {
                setInitialSlotForNew({});
                setIsNewModalOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Yeni Randevu</span>
            </button>
          </div>
        </div>

        {/* 2. HORIZONTAL SCROLLABLE DAYS STRIP (YATAY HAREKETLİ GÜN SEÇİCİ) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none border-t border-slate-800/80">
          {weekDaysStrip.map((day) => (
            <button
              key={day.iso}
              onClick={() => setSelectedDate(day.iso)}
              className={`py-2 px-3 rounded-xl text-center transition-all flex flex-col items-center justify-center shrink-0 min-w-[64px] relative ${
                day.isSelected
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md ring-2 ring-amber-400/40'
                  : 'bg-slate-950/70 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
              }`}
            >
              <span className="text-[10px] uppercase font-semibold opacity-85">
                {day.dayName}
              </span>
              <span className="text-sm sm:text-base font-extrabold font-mono mt-0.5">
                {day.dayNumber}
              </span>
              <span className="text-[9px] opacity-75 font-medium">
                {day.monthName}
              </span>
              {day.count > 0 && (
                <span
                  className={`mt-1 text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    day.isSelected
                      ? 'bg-slate-950 text-amber-400'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {day.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* STAFF PERSONAL DAILY EARNINGS & APPOINTMENT BANNER */}
      {isStaff && staffBarber && (
        <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <img
              src={staffBarber.avatar}
              alt={staffBarber.name}
              className="w-11 h-11 rounded-2xl object-cover border border-amber-500/40 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">{staffBarber.name}</span>
                <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold font-mono">
                  %{staffBarber.commissionRate || 50} Prim (Yönetici)
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                  {stats.completed + stats.confirmed} Aktif Randevu
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {formattedDateTitle} tarihli randevularınız ve yönetici hizmet fiyat tarifesine göre günlük hakedişiniz
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-xs shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 block">Üretilen Ciro:</span>
              <span className="font-mono font-bold text-white">₺{dailyStaffRevenue.toLocaleString('tr-TR')}</span>
            </div>
            <div className="w-px h-7 bg-slate-800" />
            <div>
              <span className="text-[10px] text-amber-400 font-semibold block">Günün Hakedişi:</span>
              <span className="font-mono font-extrabold text-amber-400 text-sm">₺{dailyStaffEarnings.toLocaleString('tr-TR')}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. BARBER SELECTOR CHIPS & STATUS FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
        {/* Barber Filter Chips */}
        {!isStaff && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedBarberFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedBarberFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Tüm Berberler ({appointments.filter((a) => a.date === selectedDate).length})
            </button>

            {barbers.map((b) => {
              const bApts = appointments.filter(
                (a) => a.date === selectedDate && a.barberId === b.id && a.status !== 'cancelled'
              );
              const bCount = bApts.length;
              const bookedMinutes = bApts.reduce((sum, a) => sum + (a.totalDuration || 30), 0);
              const maxCapacityMins = 480; // 8 hours active capacity
              const occupancyPct = Math.min(100, Math.round((bookedMinutes / maxCapacityMins) * 100));

              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBarberFilter(b.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex flex-col gap-1.5 min-w-[130px] ${
                    selectedBarberFilter === b.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                  title={`${b.name} Günlük Doluluk: %${occupancyPct}`}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={b.avatar}
                        alt={b.name}
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                      />
                      <span>{b.name.split(' ')[0]}</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold">
                      %{occupancyPct}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${selectedBarberFilter === b.id ? 'bg-slate-950/30' : 'bg-slate-800'}`}>
                    <div
                      className={`h-full transition-all duration-300 ${
                        selectedBarberFilter === b.id
                          ? 'bg-slate-950'
                          : occupancyPct > 80
                          ? 'bg-rose-500'
                          : occupancyPct > 50
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.max(6, occupancyPct)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tümü ({stats.total})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            Onay Bekleyen ({stats.pending})
          </button>
          <button
            onClick={() => setStatusFilter('confirmed')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'confirmed'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            Onaylı ({stats.confirmed})
          </button>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA: FIT-TO-SCREEN VIEWS */}

      {/* VIEW 1: PRATİK AJANDA LİSTE GÖRÜNÜMÜ (FULL FIT & EASY TO READ) */}
      {viewType === 'list' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
          {sortedAppointments.length === 0 ? (
            <div className="py-14 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">
                Bu tarihte randevu kaydı bulunmuyor
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {formattedDateTitle} için yeni bir müşteri randevusu ekleyebilirsiniz.
              </p>
              <button
                onClick={() => {
                  setInitialSlotForNew({});
                  setIsNewModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Yeni Randevu Ekle</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {sortedAppointments.map((apt) => {
                const barber = barbers.find((b) => b.id === apt.barberId);
                const aptServices = services.filter((s) => apt.serviceIds.includes(s.id));
                const sNames = aptServices.map((s) => s.name).join(' + ');

                const isPending = apt.status === 'pending';
                const isConfirmed = apt.status === 'confirmed';
                const isCompleted = apt.status === 'completed';

                const whatsappUrl = buildCustomerConfirmationWhatsAppUrl(
                  apt.customerPhone,
                  apt.customerName,
                  barber?.name || 'Tarık Dilek',
                  apt.date,
                  apt.startTime,
                  sNames || 'Saç/Sakal Bakımı',
                  settings.address
                );

                return (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    className="p-3.5 sm:p-4 hover:bg-slate-800/30 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Left Info */}
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Time Badge */}
                      <div className="text-center min-w-[65px] py-1.5 px-2 bg-slate-950 rounded-xl border border-slate-800 font-mono shrink-0">
                        <div className="text-xs font-bold text-amber-400">{apt.startTime}</div>
                        <div className="text-[10px] text-slate-500">{apt.endTime}</div>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                            {apt.customerName}
                          </h4>

                          {/* Status Badge */}
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              isConfirmed
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : isPending
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                                : isCompleted
                                ? 'bg-slate-800 text-slate-300 border-slate-700'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {isConfirmed
                              ? 'Onaylandı'
                              : isPending
                              ? 'Onay Bekliyor'
                              : isCompleted
                              ? 'Tamamlandı'
                              : 'İptal Edildi'}
                          </span>

                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                              apt.source === 'online'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {apt.source === 'online' ? 'Online' : 'Kasa'}
                          </span>
                        </div>

                        {/* Service Names and Stylist */}
                        <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-semibold text-amber-300/90">{sNames || 'Hizmet'}</span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <img
                              src={barber?.avatar}
                              alt={barber?.name}
                              className="w-3.5 h-3.5 rounded-full object-cover inline"
                            />
                            <span>{barber?.name}</span>
                          </span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="font-mono text-slate-400">{apt.totalDuration} dk</span>
                          {(() => {
                            const sCalculated = (apt.serviceIds || []).reduce((sum, sId) => {
                              const s = services.find((item) => item.id === sId);
                              return sum + (s?.price || 0);
                            }, 0);
                            const aptPrice = sCalculated > 0 ? sCalculated : (apt.totalPrice || 0);
                            const commRate = barber?.commissionRate ?? 50;
                            const hakedisAmt = Math.round((aptPrice * commRate) / 100);

                            return aptPrice > 0 ? (
                              <>
                                <span aria-hidden="true" className="text-slate-600">·</span>
                                <span className="font-mono font-bold text-amber-400">₺{aptPrice}</span>
                                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                  Hakediş: ₺{hakedisAmt}
                                </span>
                              </>
                            ) : null;
                          })()}
                        </div>

                        {apt.notes && (
                          <p className="text-[11px] text-amber-400/80 italic line-clamp-1">
                            Not: {apt.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div
                      className="flex items-center gap-1.5 self-end sm:self-center shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* WhatsApp */}
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all"
                        title="Müşteriye WhatsApp Onayı Gönder"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>

                      {/* Phone Call */}
                      <a
                        href={`tel:${apt.customerPhone}`}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Müşteriyi Ara"
                      >
                        <Phone className="w-4 h-4 text-amber-400" />
                      </a>

                      {/* Quick Status Buttons */}
                      {isPending && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Onayla</span>
                        </button>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Tamamla</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedAppointment(apt)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Detay & Düzenle"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {!isStaff && (
                        <button
                          onClick={() => setAppointmentToDelete(apt)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Randevuyu Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: EKRANA TAM SIĞAN SAAT IZGARASI (FIT-TO-SCREEN TIMELINE) */}
      {viewType === 'timeline' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
          {/* Barber Column Headers (Responsive Grid) */}
          <div
            className="grid border-b border-slate-800 bg-slate-950 sticky top-0 z-20"
            style={{
              gridTemplateColumns: `56px repeat(${activeBarbers.length}, 1fr)`,
            }}
          >
            <div className="p-2.5 text-[10px] font-mono text-slate-400 border-r border-slate-800 flex items-center justify-center bg-slate-950">
              Saat
            </div>
            {activeBarbers.map((barber) => {
              const bCount = dateAppointments.filter(
                (a) => a.barberId === barber.id && a.status !== 'cancelled'
              ).length;

              return (
                <div
                  key={barber.id}
                  className="p-2.5 border-r border-slate-800 last:border-none flex items-center justify-between gap-1.5 bg-slate-950 min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={barber.avatar}
                      alt={barber.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-lg object-cover border border-amber-500/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {barber.name}
                      </div>
                      <div className="text-[10px] text-amber-400/90 truncate">
                        {barber.title}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded shrink-0">
                    {bCount}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Hourly Rows */}
          <div className="divide-y divide-slate-800/60">
            {hours.map((hour) => {
              return (
                <div
                  key={hour}
                  className="grid min-h-[56px]"
                  style={{
                    gridTemplateColumns: `56px repeat(${activeBarbers.length}, 1fr)`,
                  }}
                >
                  {/* Hour Tag */}
                  <div className="p-2 text-[11px] font-mono text-slate-400 border-r border-slate-800 bg-slate-950 flex items-start justify-center">
                    {hour}
                  </div>

                  {/* Barber Cells */}
                  {activeBarbers.map((barber) => {
                    const cellApts = dateAppointments.filter((apt) => {
                      if (apt.barberId !== barber.id) return false;
                      const [aptH] = apt.startTime.split(':').map(Number);
                      const [currH] = hour.split(':').map(Number);
                      return aptH === currH;
                    });

                    return (
                      <div
                        key={`${barber.id}-${hour}`}
                        onClick={() => handleSlotClick(barber.id, hour)}
                        className="p-1 border-r border-slate-800/60 last:border-none relative group hover:bg-slate-800/30 transition-colors cursor-pointer min-h-[56px]"
                      >
                        {cellApts.map((apt) => {
                          const isPending = apt.status === 'pending';
                          const isConfirmed = apt.status === 'confirmed';
                          const isCompleted = apt.status === 'completed';

                          return (
                            <div
                              key={apt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppointment(apt);
                              }}
                              className={`p-1.5 rounded-lg border text-[11px] shadow-sm mb-1 transition-transform hover:scale-[1.01] ${
                                isPending
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                                  : isConfirmed
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                                  : isCompleted
                                  ? 'bg-slate-800 border-slate-700 text-slate-400'
                                  : 'bg-rose-500/20 border-rose-500 text-rose-300'
                              }`}
                            >
                              <div className="flex items-center justify-between font-mono text-[9px] font-bold">
                                <span>{apt.startTime}</span>
                                <span>{apt.totalDuration}dk</span>
                              </div>
                              <div className="font-bold text-white truncate leading-tight mt-0.5">
                                {apt.customerName}
                              </div>
                            </div>
                          );
                        })}

                        {cellApts.length === 0 && (
                          <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center h-full text-[10px] text-slate-500 transition-opacity">
                            + Ekle
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}

      {appointmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Randevuyu Sil</h4>
            <p className="text-xs text-slate-400 my-3 leading-relaxed">
              <strong>{appointmentToDelete.customerName}</strong> ({appointmentToDelete.date} saat {appointmentToDelete.startTime}) randevusunu silmek istediğinize emin misiniz?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAppointmentToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAppointment(appointmentToDelete.id);
                  setAppointmentToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {isNewModalOpen && (
        <NewAppointmentModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          initialBarberId={initialSlotForNew.barberId}
          initialTime={initialSlotForNew.time}
        />
      )}
    </div>
  );
};
