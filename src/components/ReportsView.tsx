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
  PlusCircle,
  Receipt,
  Trash2,
  AlertCircle,
  PiggyBank,
  ArrowDownRight,
  UserCheck,
} from 'lucide-react';
import { formatLocalDateToISO, parseISODateToLocal } from '../utils/dateHelper';
import { Expense, StaffPayout } from '../types';

export const ReportsView: React.FC = () => {
  const {
    appointments,
    barbers,
    updateBarber,
    settings,
    expenses,
    staffPayouts,
    addExpense,
    deleteExpense,
    addStaffPayout,
    deleteStaffPayout,
  } = useBarber();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [editingCommissionId, setEditingCommissionId] = useState<string | null>(null);
  const [tempCommissionRate, setTempCommissionRate] = useState<number>(50);

  // New Expense Modal / Form State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('Malzeme/Kozmetik');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');

  // New Staff Payout Modal / Form State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutBarberId, setPayoutBarberId] = useState<string>('');
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [payoutNote, setPayoutNote] = useState<string>('');

  const todayStr = formatLocalDateToISO(new Date());

  // Filter Appointments by Date
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

  // Filter Expenses by Date
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      if (dateFilter === 'today') return exp.date === todayStr;
      if (dateFilter === 'week') {
        const today = new Date();
        const expDate = parseISODateToLocal(exp.date);
        const diffDays = (today.getTime() - expDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= -1 && diffDays <= 7;
      }
      if (dateFilter === 'month') {
        return exp.date.startsWith(todayStr.substring(0, 7));
      }
      return true;
    });
  }, [expenses, dateFilter, todayStr]);

  // Filter Staff Payouts by Date
  const filteredPayouts = useMemo(() => {
    return staffPayouts.filter((pay) => {
      if (dateFilter === 'today') return pay.date === todayStr;
      if (dateFilter === 'week') {
        const today = new Date();
        const payDate = parseISODateToLocal(pay.date);
        const diffDays = (today.getTime() - payDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= -1 && diffDays <= 7;
      }
      if (dateFilter === 'month') {
        return pay.date.startsWith(todayStr.substring(0, 7));
      }
      return true;
    });
  }, [staffPayouts, dateFilter, todayStr]);

  // 1. KASANIN TOPLAM CİROSU (TOTAL REVENUE)
  const totalRevenue = useMemo(() => {
    return filteredAppointments
      .filter((a) => a.status === 'completed' || a.status === 'confirmed')
      .reduce((sum, a) => sum + (a.totalPrice || 0), 0);
  }, [filteredAppointments]);

  const completedCount = filteredAppointments.filter((a) => a.status === 'completed' || a.status === 'confirmed').length;

  // Barber Breakdown: Earnings, Paid Advances, Remaining
  const barberStats = useMemo(() => {
    return barbers.map((b) => {
      const bApts = filteredAppointments.filter((a) => a.barberId === b.id);
      const bCompleted = bApts.filter((a) => a.status === 'completed' || a.status === 'confirmed');
      const bRevenue = bCompleted.reduce((sum, a) => sum + (a.totalPrice || 0), 0);
      const rate = b.commissionRate ?? 50;

      // Toplam Hakediş
      const totalEarned = Math.round((bRevenue * rate) / 100);

      // Ödenen Avans / Prim
      const bPayouts = filteredPayouts.filter((p) => p.barberId === b.id);
      const paidAmount = bPayouts.reduce((sum, p) => sum + p.amount, 0);

      // Kalan Borç / Hakediş
      const remainingAmount = totalEarned - paidAmount;

      return {
        barber: b,
        totalApts: bApts.length,
        completedApts: bCompleted.length,
        revenue: bRevenue,
        commissionRate: rate,
        totalEarned,
        paidAmount,
        remainingAmount,
      };
    });
  }, [barbers, filteredAppointments, filteredPayouts]);

  // 2. PERSONELİN TOPLAM HAKEDİŞİ, ÖDENEN VE KALAN
  const totalStaffEarnings = useMemo(() => {
    return barberStats.reduce((sum, b) => sum + b.totalEarned, 0);
  }, [barberStats]);

  const totalStaffPaid = useMemo(() => {
    return barberStats.reduce((sum, b) => sum + b.paidAmount, 0);
  }, [barberStats]);

  const totalStaffRemaining = useMemo(() => {
    return barberStats.reduce((sum, b) => sum + b.remainingAmount, 0);
  }, [barberStats]);

  // 3. HARCAMALAR / GİDERLER (TOTAL EXPENSES)
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // 4. NET KASA BAKİYESİ (NET CASH BALANCE & NET SALON PROFIT)
  // Fiili Elde Kalan Kasa = Toplam Ciro - (Ödenen Personel + Harcamalar)
  const netCashInHand = useMemo(() => {
    return totalRevenue - (totalStaffPaid + totalExpenses);
  }, [totalRevenue, totalStaffPaid, totalExpenses]);

  // Net Salon Karı (Tahakkuk Karı) = Toplam Ciro - (Toplam Personel Hakedişi + Harcamalar)
  const netSalonProfit = useMemo(() => {
    return totalRevenue - (totalStaffEarnings + totalExpenses);
  }, [totalRevenue, totalStaffEarnings, totalExpenses]);

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

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(expenseAmount);
    if (!expenseDescription.trim() || isNaN(amountNum) || amountNum <= 0) return;

    addExpense({
      category: expenseCategory,
      description: expenseDescription.trim(),
      amount: amountNum,
      date: todayStr,
    });

    setExpenseDescription('');
    setExpenseAmount('');
    setShowExpenseModal(false);
  };

  const handleCreatePayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(payoutAmount);
    if (!payoutBarberId || isNaN(amountNum) || amountNum <= 0) return;

    addStaffPayout({
      barberId: payoutBarberId,
      amount: amountNum,
      date: todayStr,
      note: payoutNote.trim() || undefined,
    });

    setPayoutBarberId('');
    setPayoutAmount('');
    setPayoutNote('');
    setShowPayoutModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-500" />
            <span>Kasa, Hakediş & Harcama Yönetim Paneli</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Brüt ciro, personel hakedişleri, ödenen avanslar, giderler ve net kasa bakiyesi
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-full scrollbar-none shrink-0">
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

      {/* 4 MAIN FINANCIAL KPI CARDS (USER EXACT SPECIFICATION) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. KASANIN TOPLAM CİROSU */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-amber-500" />
              <span>1. Kasanın Toplam Cirosu</span>
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
              Brüt Gelir
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            ₺{totalRevenue.toLocaleString('tr-TR')}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
            <span>Tamamlanan Tıraş:</span>
            <strong className="text-emerald-400 font-mono">{completedCount} İşlem</strong>
          </div>
        </div>

        {/* 2. PERSONEL HAKEDİŞİ (TOPLAM, ÖDENEN VE KALAN) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>2. Personel Hakedişi</span>
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
              Prim Dağılımı
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            ₺{totalStaffEarnings.toLocaleString('tr-TR')}
            <span className="text-xs font-normal text-slate-400 ml-1.5">(Toplam)</span>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-800 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Ödenen Avans/Prim:</span>
              <strong className="text-emerald-400 font-mono">₺{totalStaffPaid.toLocaleString('tr-TR')}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Kalan Ödenecek:</span>
              <strong className={`font-mono ${totalStaffRemaining > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                ₺{totalStaffRemaining.toLocaleString('tr-TR')}
              </strong>
            </div>
          </div>
        </div>

        {/* 3. HARCAMALAR / GİDERLER */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs text-rose-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-rose-400" />
              <span>3. Harcamalar (Giderler)</span>
            </span>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 transition-colors flex items-center gap-1"
            >
              <PlusCircle className="w-3 h-3" />
              <span>Gider Ekle</span>
            </button>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            ₺{totalExpenses.toLocaleString('tr-TR')}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
            <span>Kayıtlı Gider Sayısı:</span>
            <strong className="text-slate-200 font-mono">{filteredExpenses.length} Kalem</strong>
          </div>
        </div>

        {/* 4. NET KASA BAKİYESİ */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <PiggyBank className="w-4 h-4 text-emerald-400" />
              <span>4. Net Kasa Bakiyesi</span>
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Elde Kalan Nitelik
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            ₺{netCashInHand.toLocaleString('tr-TR')}
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-800 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Fiili Kasa (Ciro - Ödenen - Gider):</span>
              <strong className="text-emerald-400 font-mono">₺{netCashInHand.toLocaleString('tr-TR')}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Net Salon Kârı (Tahakkuk):</span>
              <strong className="text-emerald-300 font-mono">₺{netSalonProfit.toLocaleString('tr-TR')}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: STAFF EARNINGS, PAID ADVANCES & REMAINING TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl space-y-0">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Personel Hakediş, Ödenen & Kalan Takip Tablosu</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Her çalışanın prim oranını değiştirebilir, toplam hakedişini, verilen avansları ve kalan borcu görebilirsiniz.
            </p>
          </div>

          <button
            onClick={() => setShowPayoutModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Personel Avans / Ödeme Kaydet</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3.5">Personel / Berber</th>
                <th className="p-3.5 text-center">Tıraş</th>
                <th className="p-3.5 text-right">Ürettiği Ciro (₺)</th>
                <th className="p-3.5 text-center">Prim Oranı (%)</th>
                <th className="p-3.5 text-right">Toplam Hakediş (₺)</th>
                <th className="p-3.5 text-right text-emerald-400">Ödenen (Avans) (₺)</th>
                <th className="p-3.5 text-right text-amber-400">Kalan Borç (₺)</th>
                <th className="p-3.5 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {barberStats.map(
                ({ barber, completedApts, revenue, commissionRate, totalEarned, paidAmount, remainingAmount }) => {
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
                            title="Prim oranını değiştirmek için tıklayın"
                          >
                            <Percent className="w-3 h-3" />
                            <span>%{commissionRate}</span>
                            <Edit3 className="w-3 h-3 text-slate-400 opacity-70" />
                          </button>
                        )}
                      </td>

                      <td className="p-3.5 text-right font-mono text-white font-black text-sm bg-slate-950/40">
                        ₺{totalEarned.toLocaleString('tr-TR')}
                      </td>

                      <td className="p-3.5 text-right font-mono text-emerald-400 font-bold text-sm bg-emerald-500/5">
                        ₺{paidAmount.toLocaleString('tr-TR')}
                      </td>

                      <td className="p-3.5 text-right font-mono text-amber-400 font-black text-sm bg-amber-500/5">
                        ₺{remainingAmount.toLocaleString('tr-TR')}
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            setPayoutBarberId(barber.id);
                            setShowPayoutModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold transition-all flex items-center gap-1 mx-auto"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>Ödeme Ekle</span>
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: EXPENSES LIST & MANAGEMENT */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Gider & Harcama Kayıtları</h3>
              <p className="text-xs text-slate-400">
                Kira, elektrik/su, havlu, kozmetik, çay/kahve ve diğer işletme harcamaları
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Harcama Gir</span>
          </button>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <Receipt className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-60" />
            <span>Bu tarih aralığında kayıtlı harcama bulunmamaktadır.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{exp.category}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{exp.date}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-snug">{exp.description}</p>
                </div>

                <div className="flex flex-col items-end justify-between shrink-0 h-full">
                  <span className="font-mono font-black text-rose-400 text-sm">
                    ₺{exp.amount.toLocaleString('tr-TR')}
                  </span>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors mt-2"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: NEW EXPENSE FORM */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 flex justify-center items-start sm:items-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 my-4 sm:my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-400" />
                <span>Yeni Harcama / Gider Ekle</span>
              </h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Gider Kategorisi</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as Expense['category'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="Malzeme/Kozmetik">Malzeme/Kozmetik (Şampuan, Sprey, vb.)</option>
                  <option value="Mutfak/İkram">Mutfak/İkram (Kahve, Çay, Soda)</option>
                  <option value="Fatura (Elektrik/Su/İnternet)">Fatura (Elektrik, Su, İnternet)</option>
                  <option value="Kira">Salon Kirası</option>
                  <option value="Bakım/Onarım">Bakım / Onarım / Havlu</option>
                  <option value="Diğer">Diğer İşletme Gideri</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Harcama Açıklaması</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 5 Kutu Saç Spreyi ve Havlu Yıkama"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tutar (₺)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Örn: 750"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-400"
                >
                  Gideri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW STAFF PAYOUT / ADVANCE FORM */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 flex justify-center items-start sm:items-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 my-4 sm:my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Personel Avans / Ödeme Kaydı</span>
              </h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePayout} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Personel Seçin</label>
                <select
                  required
                  value={payoutBarberId}
                  onChange={(e) => setPayoutBarberId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Personel Seçiniz --</option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Ödenen Tutar (₺)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Örn: 1000"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Not / Açıklama (Opsiyonel)</label>
                <input
                  type="text"
                  placeholder="Örn: Haftalık Avans Ödemesi"
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                >
                  Ödemeyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
