import React, { useState, useMemo } from 'react';
import { useBarber } from '../context/BarberContext';
import { getAssetUrl } from '../utils/assetHelper';
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
  Percent,
  Sparkles,
  Calculator,
  Building2,
  Wallet,
  Edit3,
  Check,
} from 'lucide-react';

import { formatLocalDateToISO, parseISODateToLocal } from '../utils/dateHelper';

export const ReportsView: React.FC = () => {
  const { appointments, barbers, updateBarber, settings } = useBarber();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [editingCommissionId, setEditingCommissionId] = useState<string | null>(null);
  const [tempCommissionRate, setTempCommissionRate] = useState<number>(50);

  const todayStr = formatLocalDateToISO(new Date());

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (dateFilter === 'today') {
        return apt.date === todayStr;
      }
      if (dateFilter === 'week') {
        const today = new Date();
        const aptDate = parseISODateToLocal(apt.date);
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

  // Barber breakdown & Commission calculation
  const barberStats = useMemo(() => {
    return barbers.map((b) => {
      const bApts = filteredAppointments.filter((a) => a.barberId === b.id);
      const bCompleted = bApts.filter((a) => a.status === 'completed' || a.status === 'confirmed');
      const bRevenue = bCompleted.reduce((sum, a) => sum + (a.totalPrice || 0), 0);
      const rate = b.commissionRate ?? 50;
      const commissionPayout = Math.round((bRevenue * rate) / 100);
      const salonNetShare = bRevenue - commissionPayout;

      return {
        barber: b,
        totalApts: bApts.length,
        completedApts: bCompleted.length,
        revenue: bRevenue,
        commissionRate: rate,
        commissionPayout,
        salonNetShare,
      };
    });
  }, [barbers, filteredAppointments]);

  const totalCommissionPayout = useMemo(() => {
    return barberStats.reduce((sum, b) => sum + b.commissionPayout, 0);
  }, [barberStats]);

  const totalNetSalonShare = useMemo(() => {
    return totalRevenue - totalCommissionPayout;
  }, [totalRevenue, totalCommissionPayout]);

  const handleSaveCommissionRate = (barberId: string) => {
    const targetBarber = barbers.find((b) => b.id === barberId);
    if (targetBarber) {
      updateBarber({
        ...targetBarber,
        commissionRate: Math.max(0, Math.min(100, Number(tempCommissionRate) || 50)),
      });
    }
    setEditingCommissionId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-500" />
            <span>Kasa, Gelir & Çalışan Prim/Hakediş Paneli</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Brüt ciro, berber prim oranları, çalışan hakedişleri ve salon net kâr hesaplaması
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              dateFilter === 'today'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bugün
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              dateFilter === 'week'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bu Hafta
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              dateFilter === 'month'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bu Ay
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              dateFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tüm Zamanlar
          </button>
        </div>
      </div>

      {/* Main Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Toplam Brüt Ciro */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-amber-500" />
              <span>Kasa Brüt Ciro</span>
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
              Toplam Toplanan
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            ₺{totalRevenue.toLocaleString('tr-TR')}
          </div>
          <p className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Tamamlanan İşlemler:</span>
            <strong className="text-emerald-400 font-mono">{completedCount + confirmedCount} Tıraş</strong>
          </p>
        </div>

        {/* 2. Toplam Çalışan Primleri */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>Toplam Berber Primleri</span>
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
              Hakediş Ödemesi
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            ₺{totalCommissionPayout.toLocaleString('tr-TR')}
          </div>
          <p className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Çalışanlara Verilecek Pay:</span>
            <strong className="text-amber-400 font-mono">Personel Hakedişi</strong>
          </p>
        </div>

        {/* 3. Net Salon Kasa Payı */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Net Salon Kasası</span>
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Salon Payı
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            ₺{totalNetSalonShare.toLocaleString('tr-TR')}
          </div>
          <p className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Salona Kalan Net Tutar:</span>
            <strong className="text-emerald-400 font-mono">%100 Net Kasa</strong>
          </p>
        </div>
      </div>

      {/* Staff Commission Breakdown Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Çalışan Prim / Hakediş & Ciro Dağılım Tablosu</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Her çalışanın prim oranını değiştirebilir, ürettiği ciroyu ve alacağı hakediş tutarını anında hesaplayabilirsiniz.
            </p>
          </div>
          <span className="text-xs text-amber-400 font-mono bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            {barbers.length} Personel Kayıtlı
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3.5">Personel / Berber</th>
                <th className="p-3.5 text-center">Tıraş Sayısı</th>
                <th className="p-3.5 text-right">Ürettiği Ciro (₺)</th>
                <th className="p-3.5 text-center">Prim Oranı (%)</th>
                <th className="p-3.5 text-right">Berber Prim Hakedişi (₺)</th>
                <th className="p-3.5 text-right">Salona Kalan Net (₺)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {barberStats.map(({ barber, completedApts, revenue, commissionRate, commissionPayout, salonNetShare }) => {
                const isEditingThis = editingCommissionId === barber.id;

                return (
                  <tr key={barber.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={getAssetUrl(barber.avatar)}
                          alt={barber.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover border border-amber-500/30 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{barber.name}</span>
                            {barber.id === 'b1' && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                                Kurucu
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{barber.title}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold text-emerald-400 text-sm">
                      {completedApts} Tıraş
                    </td>

                    <td className="p-3.5 text-right font-mono text-white font-black text-sm">
                      ₺{revenue.toLocaleString('tr-TR')}
                    </td>

                    <td className="p-3.5 text-center">
                      {isEditingThis ? (
                        <div className="inline-flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-amber-500">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={tempCommissionRate}
                            onChange={(e) => setTempCommissionRate(Number(e.target.value))}
                            className="w-14 bg-slate-900 border border-slate-700 text-white font-mono font-bold px-2 py-1 rounded text-center text-xs focus:outline-none"
                          />
                          <span className="text-amber-400 font-bold text-xs">%</span>
                          <button
                            onClick={() => handleSaveCommissionRate(barber.id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-1 rounded-lg transition-colors"
                            title="Kaydet"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCommissionId(barber.id);
                            setTempCommissionRate(commissionRate);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono font-bold transition-all hover:scale-105"
                          title="Prim oranını düzenlemek için tıklayın"
                        >
                          <Percent className="w-3 h-3" />
                          <span>%{commissionRate}</span>
                          <Edit3 className="w-3 h-3 text-slate-400 opacity-70" />
                        </button>
                      )}
                    </td>

                    <td className="p-3.5 text-right font-mono text-amber-400 font-black text-sm bg-amber-500/5">
                      ₺{commissionPayout.toLocaleString('tr-TR')}
                    </td>

                    <td className="p-3.5 text-right font-mono text-emerald-400 font-black text-sm bg-emerald-500/5">
                      ₺{salonNetShare.toLocaleString('tr-TR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
