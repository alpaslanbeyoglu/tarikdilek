import React, { useState } from 'react';
import { useBarber } from '../context/BarberContext';
import { ShopLocationBadge } from './ShopLocationBadge';
import { GalleryView } from './GalleryView';
import { HairCareGuide } from './HairCareGuide';
import { AboutSalon } from './AboutSalon';
import { CustomerBookingPortal } from './CustomerBookingPortal';
import { ManagerLoginModal } from './ManagerLoginModal';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Scissors,
  Calendar,
  Sparkles,
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  Lock,
  ChevronDown,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  Instagram,
  BookOpen,
  Info,
  Check,
  Images,
} from 'lucide-react';
import { SHOP_COORDINATES } from '../utils/location';

interface CustomerLandingPageProps {
  onOpenManager: () => void;
}

export type CustomerTabType = 'booking' | 'services' | 'team' | 'gallery' | 'guide' | 'contact';

export const CustomerLandingPage: React.FC<CustomerLandingPageProps> = ({ onOpenManager }) => {
  const { settings, services, barbers, setActiveMode } = useBarber();
  const [activeTab, setActiveTab] = useState<CustomerTabType>('booking');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const whatsappUrl = `https://wa.me/905316605230?text=${encodeURIComponent(
    'Merhaba Tarık Bey, Göktürk salonunuz için randevu ve bilgi almak istiyorum.'
  )}`;

  const handleSelectServiceForBooking = (serviceId: string) => {
    setActiveTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBarberForBooking = (barberId: string) => {
    setActiveTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-32 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div
            onClick={() => setActiveTab('booking')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Scissors className="h-5 w-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold tracking-tight text-white">
                  Tarık Dilek
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Göktürk
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Erkek Kuaförü & Saç Tasarım
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Tabs */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/80 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'booking'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Hızlı Randevu Al</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'services'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Scissors className="h-3.5 w-3.5" />
              <span>Hizmetlerimiz ({services.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'team'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Ekibimiz ({barbers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'gallery'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Images className="h-3.5 w-3.5" />
              <span>Galeri</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'guide'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Saç Rehberi</span>
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'contact'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Konum & İletişim</span>
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <a
              href="tel:+905316605230"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>0531 660 52 30</span>
            </a>

            <PWAInstallButton />

            {/* Subtle Manager Login Button */}
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-900 transition-colors"
              title="Personel & Yönetici Paneli Girişi"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Tabbed Content */}
      <main className="flex-1">
        {/* ========================================================= */}
        {/* TAB 1: HIZLI RANDEVU AL (PRIMARY & DEFAULT)               */}
        {/* ========================================================= */}
        {activeTab === 'booking' && (
          <div className="animate-in fade-in duration-200">
            {/* Compact Salon Hero Header */}
            <section className="relative border-b border-slate-800 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>GÖKTÜRK CADDESİ NO:47 C · RANDEVULU ÇALIŞMA SİSTEMİ</span>
                </div>

                <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Tarık Dilek <br className="sm:hidden" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-white">
                    Erkek Kuaförü & Saç Tasarım
                  </span>
                </h1>

                <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                  Sıra beklemeden, dilediğiniz gün ve saatte usta stilistlerimizden anında randevunuzu oluşturun.
                </p>

                {/* Quick Feature Badges */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-full">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Anında Onay</span>
                  </span>
                  <span className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-full">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>WhatsApp Bildirimi</span>
                  </span>
                  <span className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-full">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>15 Yıllık Deneyim</span>
                  </span>
                </div>
              </div>
            </section>

            {/* Direct Booking Wizard */}
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
              <CustomerBookingPortal />
            </div>

            {/* Quick Contact Box */}
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-10">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Özel Randevu veya Sorularınız mı Var?</h4>
                    <p className="text-slate-400 text-[11px]">
                      Tarık Dilek'e doğrudan WhatsApp üzerinden ulaşabilirsiniz (+90 531 660 52 30)
                    </p>
                  </div>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors whitespace-nowrap text-center shadow-md"
                >
                  WhatsApp'tan Yazın →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: HİZMETLERİMİZ & BAKIM MENÜSÜ                       */}
        {/* ========================================================= */}
        {activeTab === 'services' && (
          <div className="animate-in fade-in duration-200 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Kişiye Özel Bakım Menüsü
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Hizmetlerimiz ve İşlem Süreleri
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Tarık Dilek salonunda uygulanan saç, sakal, cilt ve kafa derisi bakım hizmetleri
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between hover:border-amber-500/40 transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                        {s.name}
                      </h3>
                      {s.popular && (
                        <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                          Popüler
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {s.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{s.durationMinutes} dakika</span>
                    </div>

                    <button
                      onClick={() => handleSelectServiceForBooking(s.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                    >
                      <span>Randevu Al</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick action bar */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setActiveTab('booking')}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold transition-all shadow-lg shadow-amber-500/10 inline-flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Hemen Online Randevu Sihirbazına Geç →</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: EKİBİMİZ / BERBERLER                                */}
        {/* ========================================================= */}
        {activeTab === 'team' && (
          <div className="animate-in fade-in duration-200 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Usta Stilist Kadromuz
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Berberlerimiz & Saç Sanatçıları
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Her biri alanında uzman, kişiye özel saç ve sakal tasarımı uygulayan ekibimiz
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {barbers.map((barber) => (
                <div
                  key={barber.id}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between hover:border-amber-500/40 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={barber.avatar}
                        alt={barber.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/30 shrink-0"
                      />
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                          <span>{barber.name}</span>
                          {barber.id === 'b1' && (
                            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 rounded">
                              Kurucu
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-amber-400 font-semibold">{barber.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{barber.rating}</span>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{barber.experienceYears} yıl tecrübe</span>
                        </div>
                      </div>
                    </div>

                    {barber.bio && (
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {barber.bio}
                      </p>
                    )}

                    <div className="space-y-1.5 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span>Mesai Saatleri:</span>
                        <span className="font-mono text-slate-200">
                          {barber.workingHours.start} - {barber.workingHours.end}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end">
                    <button
                      onClick={() => handleSelectBarberForBooking(barber.id)}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{barber.name.split(' ')[0]} ile Randevu Al</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SALON & SAÇ MODELLERİ GALERİSİ                     */}
        {/* ========================================================= */}
        {activeTab === 'gallery' && (
          <div className="animate-in fade-in duration-200">
            <GalleryView
              onSelectModelForBooking={(model) => {
                setActiveTab('booking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SAÇ SAĞLIĞI & BAKIM REHBERİ                        */}
        {/* ========================================================= */}
        {activeTab === 'guide' && (
          <div className="animate-in fade-in duration-200">
            <HairCareGuide />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: KONUM, ULAŞIM & HAKKIMIZDA                         */}
        {/* ========================================================= */}
        {activeTab === 'contact' && (
          <div className="animate-in fade-in duration-200 space-y-8 py-8">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <ShopLocationBadge />
            </div>
            <AboutSalon />
          </div>
        )}
      </main>

      {/* Customer Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Scissors className="w-4 h-4 text-amber-400 -rotate-45" />
              <span>Tarık Dilek Erkek Kuaförü · Göktürk Caddesi No:47 C</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <a href="tel:+905316605230" className="hover:text-amber-400 font-mono">
                +90 531 660 52 30
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://www.instagram.com/kuafortarikdilek?stkn=MXVwa3JzaTRlbm85cQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-400 font-semibold"
              >
                @kuafortarikdilek
              </a>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-slate-600 hover:text-slate-300"
              >
                Yönetici Girişi
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Sticky for Smartphone Users) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => {
            setActiveTab('booking');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'booking'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[10px]">Randevu</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('services');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'services'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span className="text-[10px]">Hizmetler</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('team');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'team'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px]">Ekibimiz</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('gallery');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'gallery'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Images className="w-4 h-4" />
          <span className="text-[10px]">Galeri</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('contact');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'contact'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="text-[10px]">Konum</span>
        </button>
      </div>

      {/* Staff & Manager Login Modal */}
      <ManagerLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          setActiveMode('manager');
        }}
      />
    </div>
  );
};
