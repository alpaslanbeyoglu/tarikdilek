import React, { useState, useEffect } from 'react';
import { BarberProvider, useBarber } from './context/BarberContext';
import { Navbar, ManagerTabType } from './components/Navbar';
import { CalendarView } from './components/CalendarView';
import { BarbersView } from './components/BarbersView';
import { ServicesView } from './components/ServicesView';
import { CustomersView } from './components/CustomersView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { CustomerLandingPage } from './components/CustomerLandingPage';
import { NotificationDrawer } from './components/NotificationDrawer';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { AppointmentDetailModal } from './components/AppointmentDetailModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Appointment } from './types';
import {
  Calendar,
  Users,
  Scissors,
  UserCheck,
  TrendingUp,
  Settings,
} from 'lucide-react';

function MainApp() {
  const { activeMode, setActiveMode, appointments, currentUserRole, logout } = useBarber();
  const [currentTab, setCurrentTab] = useState<ManagerTabType>('calendar');
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [selectedAppointmentForDetail, setSelectedAppointmentForDetail] = useState<Appointment | null>(null);

  const isStaff = currentUserRole === 'staff';

  // Register service worker on mount for PWA & push notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => {
          console.log('Barbershop Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('Service Worker registration skipped:', err);
        });

      // Handle message from service worker when notification is clicked
      const handleSwMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
          if (event.data.appointmentId) {
            const found = appointments.find((a) => a.id === event.data.appointmentId);
            if (found) {
              setSelectedAppointmentForDetail(found);
            }
          }
        }
      };

      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      };
    }
  }, [appointments]);

  const handleSelectAppointmentFromNotification = (appointmentId: string) => {
    const found = appointments.find((a) => a.id === appointmentId);
    if (found) {
      setSelectedAppointmentForDetail(found);
    }
  };

  // If in Customer Mode: render dedicated public customer landing page
  if (activeMode === 'customer') {
    return (
      <>
        <CustomerLandingPage onOpenManager={() => setActiveMode('manager')} />
        <OfflineIndicator />
      </>
    );
  }

  // Manager Mode: Full Management Suite
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 pb-16 md:pb-0">
      {/* Top Navigation for Manager */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenNewAppointment={() => setIsNewAppointmentModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {currentTab === 'calendar' && <CalendarView />}
          {currentTab === 'barbers' && <BarbersView />}
          {currentTab === 'services' && <ServicesView />}
          {currentTab === 'customers' && <CustomersView />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* Manager Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">
              {isStaff ? 'Personel Randevu Takip Paneli' : 'Tarık Dilek Yönetim Paneli'}
            </span>
            <span aria-hidden="true">·</span>
            <span>Göktürk Caddesi No:47 C, Eyüp / İstanbul</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={logout}
              className="text-amber-400 hover:underline font-semibold"
            >
              Çıkış Yap (Müşteri Sayfasına Dön) →
            </button>
            <span aria-hidden="true">·</span>
            <span>Web Push & WhatsApp Aktif</span>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Navigation for Manager */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => {
            setCurrentTab('calendar');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            currentTab === 'calendar'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[10px]">Randevu</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('barbers');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            currentTab === 'barbers'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px]">{isStaff ? 'Profilim' : 'Personel'}</span>
        </button>

        {!isStaff && (
          <button
            onClick={() => {
              setCurrentTab('services');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
              currentTab === 'services'
                ? 'text-amber-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span className="text-[10px]">Hizmetler</span>
          </button>
        )}

        <button
          onClick={() => {
            setCurrentTab('customers');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            currentTab === 'customers'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span className="text-[10px]">Müşteriler</span>
        </button>

        {!isStaff && (
          <button
            onClick={() => {
              setCurrentTab('reports');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
              currentTab === 'reports'
                ? 'text-amber-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px]">Kasa</span>
          </button>
        )}

        {!isStaff && (
          <button
            onClick={() => {
              setCurrentTab('settings');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
              currentTab === 'settings'
                ? 'text-amber-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[10px]">Ayarlar</span>
          </button>
        )}
      </div>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        onSelectAppointment={handleSelectAppointmentFromNotification}
      />

      {/* New Appointment Modal */}
      <NewAppointmentModal
        isOpen={isNewAppointmentModalOpen}
        onClose={() => setIsNewAppointmentModalOpen(false)}
      />

      {/* Detail Modal */}
      {selectedAppointmentForDetail && (
        <AppointmentDetailModal
          appointment={selectedAppointmentForDetail}
          onClose={() => setSelectedAppointmentForDetail(null)}
        />
      )}

      {/* Offline PWA Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <BarberProvider>
      <MainApp />
    </BarberProvider>
  );
}
