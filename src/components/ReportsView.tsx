import React, { useState, useMemo } from 'react';
import { useBarber } from '../context/BarberContext';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Scissors,
  ArrowUpRight,
  Filter,
  PieChart,
  Award,
  CreditCard,
  Banknote,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { appointments, barbers, services, settings } = useBarber();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (dateFilter === 'today') {
        return apt.date === todayStr;
      }
      if (dateFilter === 'week') {
        const today = new Date();
        const aptDate = new Date(apt.date);
        const diffDays = (today.getTime() - aptDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= -1 && diffDays <= 7;
      }
      if (dateFilter === 'month') {
        const currentMonth = todayStr.substring(0, 7);
        return apt.date.startsWith(currentMonth);
      }
      return true;
    });
  }, [appointments, dateFilter, todayStr]);

  const totalRevenue = useMemo(() => {
    return filteredAppointments
      .filter((a) => a.status === 'completed' || a.status === 'confirmed')
      .reduce((sum, a) => sum + (a.totalPrice || 0), 0);
  }, [filteredAppointments]);

  const completedCount = filteredAppointments.filter((a) => a.status === 'completed').length;
  const confirmedCount = filteredAppointments.filter((a) => a.status === 'confirmed').length;
  const pendingCount = filteredAppointments.filter((a) => a.status === 'pending').length;
  const cancelledCount = filteredAppointments.filter((a) => a.status === 'cancelled').length;

  // Barber breakdown
  const barberStats = useMemo(() => {
    return barbers.map((b) => {
      const bApts = filteredAppointments.filter((a) => a.barberId === b.id);
      const bCompleted = bApts.filter((a) => a.status === 'completed' || a.status === 'confirmed');
      const bRevenue = bCompleted.reduce((sum, a) => sum + (a.totalPrice || 0), 0);
      return {
        barber: b,
        totalApts: bApts.length,
        completedApts: bCompleted.length,
        revenue: bRevenue,
      };
    });
  }, [barbers, filteredAppointments]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <span>Kasa, Gelir & Randevu Raporları</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Salon cirosu, tamamlanan işlemler ve personel bazlı kazanç analizi
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              dateFilter === 'today'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bugün
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              dateFilter === 'week'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bu Hafta
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              dateFilter === 'month'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bu Ay
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              dateFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tüm Zamanlar
          </button>
        </div>
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Estimated Revenue */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/30">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-2">
            <span>Toplam Ciro / Kasa</span>
            <Banknote className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            ₺{totalRevenue.toLocaleString('tr-TR')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {completedCount + confirmedCount} onaylı & biten randevu
          </p>
        </div>

        {/* Completed Count */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-2">
            <span>Tamamlanan Randevu</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {completedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Hizmeti verilen müşteriler</p>
        </div>

        {/* Pending Count */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-2">
            <span>Onay Bekleyen</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {pendingCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Yeni gelen online talepler</p>
        </div>

        {/* Total Personnel */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-blue-400 font-bold mb-2">
            <span>Aktif Berber Kadrosu</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
            {barbers.filter((b) => b.active).length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Göktürk salon kadrosu</p>
        </div>
      </div>

      {/* Staff Performance & Revenue Breakdown Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Personel Performansı ve Kazanç Dağılımı</span>
          </h3>
          <span className="text-xs text-slate-400">
            {barbers.length} Personel
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Personel</th>
                <th className="p-3.5">Unvan</th>
                <th className="p-3.5 text-center">Toplam Randevu</th>
                <th className="p-3.5 text-center">Biten İşlem</th>
                <th className="p-3.5 text-right">Tahmini Ciro (₺)</th>
                <th className="p-3.5 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {barberStats.map(({ barber, totalApts, completedApts, revenue }) => (
                <tr key={barber.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={barber.avatar}
                        alt={barber.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-xl object-cover border border-amber-500/30"
                      />
                      <div>
                        <div className="font-bold text-white">{barber.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{barber.phone}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 text-amber-400 text-xs">
                    {barber.title}
                  </td>

                  <td className="p-3.5 text-center font-mono text-slate-200">
                    {totalApts}
                  </td>

                  <td className="p-3.5 text-center font-mono text-emerald-400 font-bold">
                    {completedApts}
                  </td>

                  <td className="p-3.5 text-right font-mono text-white font-bold text-sm">
                    ₺{revenue.toLocaleString('tr-TR')}
                  </td>

                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        barber.active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {barber.active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
