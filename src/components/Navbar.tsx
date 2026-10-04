import React from 'react';
import { useBarber } from '../context/BarberContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Bell,
  Calendar,
  Users,
  Scissors,
  UserCheck,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  LogOut,
  Layers,
  TrendingUp,
  Settings,
} from 'lucide-react';

export type ManagerTabType = 'calendar' | 'barbers' | 'services' | 'customers' | 'reports' | 'settings';

interface NavbarProps {
  currentTab: ManagerTabType;
  setCurrentTab: (tab: ManagerTabType) => void;
  onOpenNotifications: () => void;
  onOpenNewAppointment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNotifications,
  onOpenNewAppointment,
}) => {
  const {
    activeMode,
    setActiveMode,
    notifications,
    appointments,
    currentUser,
    currentUserRole,
    logout,
  } = useBarber();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isStaff = currentUserRole === 'staff';
  const pendingCount = appointments.filter((a) => {
    if (isStaff && currentUser?.barberId) {
      return a.status === 'pending' && a.barberId === currentUser.barberId;
    }
    return a.status === 'pending';
  }).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        
        {/* Brand & User Role Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Scissors className="h-5 w-5 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base sm:text-lg font-bold tracking-tight text-white">
                Tarık Dilek
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isStaff
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {isStaff ? `✂️ ${currentUser?.name?.split(' ')[0]}` : '👑 Yönetici'}
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-400">
              {isStaff ? 'Personel Randevu Takip Paneli' : 'Salon & Randevu Yönetimi'}
            </p>
          </div>
        </div>

        {/* Desktop & Tablet Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/80 p-1 border border-slate-800">
          <button
            onClick={() => setCurrentTab('calendar')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'calendar'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>{isStaff ? 'Randevularım' : 'Randevu Takvimi'}</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                currentTab === 'calendar' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          {/* Barbers / Staff */}
          {!isStaff && (
            <button
              onClick={() => setCurrentTab('barbers')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                currentTab === 'barbers'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Personel Kadrosu</span>
            </button>
          )}

          {/* Services & Duration */}
          {!isStaff && (
            <button
              onClick={() => setCurrentTab('services')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                currentTab === 'services'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Scissors className="h-3.5 w-3.5" />
              <span>Hizmetler & Fiyatlar</span>
            </button>
          )}

          {/* Customers CRM */}
          <button
            onClick={() => setCurrentTab('customers')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'customers'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Müşteriler</span>
          </button>

          {/* Reports & Cash Flow */}
          {!isStaff && (
            <button
              onClick={() => setCurrentTab('reports')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                currentTab === 'reports'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Kasa & Raporlar</span>
            </button>
          )}

          {/* Settings */}
          {!isStaff && (
            <button
              onClick={() => setCurrentTab('settings')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                currentTab === 'settings'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Ayarlar</span>
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Manual New Appointment */}
          <button
            onClick={onOpenNewAppointment}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Randevu Ekle</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Bildirimler & Anlık Uyarılar"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 ring-2 ring-slate-950 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            title="Müşteri Sayfasına Geç"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Müşteri Sayfası</span>
          </button>
        </div>
      </div>
    </header>
  );
};
