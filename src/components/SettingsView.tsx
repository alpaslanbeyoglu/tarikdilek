import React, { useState, useEffect, useRef } from 'react';
import { useBarber } from '../context/BarberContext';
import {
  ShieldAlert,
  Bell,
  Smartphone,
  MessageSquare,
  Volume2,
  Store,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  ExternalLink,
  Download,
  Upload,
  Database,
  ShieldCheck,
  Cloud,
  Check,
  UserCheck,
  X,
  Globe,
  Palette,
} from 'lucide-react';
import { SALON_THEMES, ThemeId } from '../utils/themeHelper';
import { SafariNotificationGuide } from './SafariNotificationGuide';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  playNotificationSound,
  triggerHapticFeedback,
  buildManagerWhatsAppUrl,
  buildCustomerWhatsAppUrl,
} from '../services/notificationService';
import {
  initGoogleAuth,
  signInWithGoogleDrive,
  signOutGoogle,
  getGoogleAccessToken,
  uploadBackupToGoogleDrive,
  downloadBackupFromGoogleDrive,
} from '../services/googleDriveSync';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, triggerTestPushNotification, resetToDefaultData, currentUserRole } = useBarber();

  const isStaff = currentUserRole === 'staff';

  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [shopName, setShopName] = useState(settings.shopName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [managerPhone, setManagerPhone] = useState(settings.managerPhone);
  const [autoConfirm, setAutoConfirm] = useState(settings.autoConfirmOnline);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Drive Sync State
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);
  const [isDriveSyncing, setIsDriveSyncing] = useState<boolean>(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<string | null>(null);
  const [showDeniedModal, setShowDeniedModal] = useState<boolean>(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
    const unsubscribe = initGoogleAuth(
      (user) => setGoogleUserEmail(user.email),
      () => setGoogleUserEmail(null)
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsDriveSyncing(true);
      const res = await signInWithGoogleDrive();
      setGoogleUserEmail(res.user.email);
      setLastSyncStatus('Google hesabına başarıyla bağlandı.');
      // Auto backup right after sign in
      const token = getGoogleAccessToken();
      if (token) {
        const payload = {
          app: 'Tarık Dilek Erkek Kuaförü',
          timestamp: new Date().toISOString(),
          barbers: localStorage.getItem('barber_barbers'),
          services: localStorage.getItem('barber_services'),
          appointments: localStorage.getItem('barber_appointments'),
          customers: localStorage.getItem('barber_customers'),
          settings: localStorage.getItem('barber_settings'),
        };
        await uploadBackupToGoogleDrive(token, payload);
        setLastSyncStatus('Google Drive ile otomatik senkronize edildi ✓');
      }
    } catch (err: any) {
      alert('Google ile oturum açılamadı: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await signOutGoogle();
    setGoogleUserEmail(null);
    setLastSyncStatus('Google hesabı bağlantısı kesildi.');
  };

  const handleSyncToDriveNow = async () => {
    const token = getGoogleAccessToken();
    if (!token) {
      alert('Lütfen önce Google hesabınızla oturum açın.');
      return;
    }
    try {
      setIsDriveSyncing(true);
      const payload = {
        app: 'Tarık Dilek Erkek Kuaförü',
        timestamp: new Date().toISOString(),
        barbers: localStorage.getItem('barber_barbers'),
        services: localStorage.getItem('barber_services'),
        appointments: localStorage.getItem('barber_appointments'),
        customers: localStorage.getItem('barber_customers'),
        settings: localStorage.getItem('barber_settings'),
      };
      const success = await uploadBackupToGoogleDrive(token, payload);
      if (success) {
        setLastSyncStatus(`Son Senkronizasyon: ${new Date().toLocaleTimeString('tr-TR')} (Google Drive) ✓`);
        alert('Verileriniz Google Drive hesabınıza başarıyla kaydedildi!');
      } else {
        alert('Google Drive yükleme başarısız oldu.');
      }
    } catch (err) {
      alert('Senkronizasyon hatası.');
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const handleRestoreFromDriveNow = async () => {
    const token = getGoogleAccessToken();
    if (!token) {
      alert('Lütfen önce Google hesabınızla oturum açın.');
      return;
    }
    if (!window.confirm('Google Drive üzerindeki yedek cihazınıza indirilsin mi? Mevcut yerel veriler güncellenecektir.')) {
      return;
    }
    try {
      setIsDriveSyncing(true);
      const data = await downloadBackupFromGoogleDrive(token);
      if (data) {
        if (data.barbers) localStorage.setItem('barber_barbers', data.barbers);
        if (data.services) localStorage.setItem('barber_services', data.services);
        if (data.appointments) localStorage.setItem('barber_appointments', data.appointments);
        if (data.customers) localStorage.setItem('barber_customers', data.customers);
        if (data.settings) localStorage.setItem('barber_settings', data.settings);
        alert('Google Drive yedeği başarıyla geri yüklendi! Sayfa yenileniyor...');
        window.location.reload();
      } else {
        alert('Google Drive üzerinde kayıtlı yedek bulunamadı.');
      }
    } catch (err) {
      alert('Geri yükleme hatası.');
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const handleRequestPermission = async () => {
    if (getNotificationPermission() === 'denied') {
      setShowDeniedModal(true);
      return;
    }
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'denied') {
      setShowDeniedModal(true);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      shopName,
      phone,
      address,
      managerPhone,
      autoConfirmOnline: autoConfirm,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestChime = () => {
    playNotificationSound();
    triggerHapticFeedback();
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        app: 'Tarık Dilek Erkek Kuaförü',
        version: '1.0',
        timestamp: new Date().toISOString(),
        barbers: localStorage.getItem('barber_barbers'),
        services: localStorage.getItem('barber_services'),
        appointments: localStorage.getItem('barber_appointments'),
        customers: localStorage.getItem('barber_customers'),
        settings: localStorage.getItem('barber_settings'),
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tarik_dilek_salon_yedegi_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Yedek dışa aktarılırken hata oluştu.');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.barbers) localStorage.setItem('barber_barbers', json.barbers);
        if (json.services) localStorage.setItem('barber_services', json.services);
        if (json.appointments) localStorage.setItem('barber_appointments', json.appointments);
        if (json.customers) localStorage.setItem('barber_customers', json.customers);
        if (json.settings) localStorage.setItem('barber_settings', json.settings);
        alert('Yedek başarıyla yüklendi! Sayfa yenileniyor...');
        window.location.reload();
      } catch (err) {
        alert('Geçersiz yedek dosyası!');
      }
    };
    reader.readAsText(file);
  };

  if (isStaff) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center max-w-xl mx-auto space-y-4 my-12 shadow-2xl animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Yönetici Yetkisi Gereklidir</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Salon çalışma saatleri, bildirim ayarları, yedekleme ve tema yönetimi sadece <strong>Salon Yöneticisi</strong> yetkisindedir.
        </p>
        <p className="text-xs text-slate-500">
          Kendi profil bilgilerinizi, vesikalık fotoğrafınızı ve PIN kodunuzu güncellemek için <strong>Profilim</strong> sayfasını kullanabilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <span>Yönetici Bildirim ve İşletme Ayarları</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          iPhone / Android kilit ekranı bildirimleri, WhatsApp anlık entegrasyonu ve mağaza parametreleri
        </p>
      </div>

      {/* SECTION 0: SALON COLOR THEME SELECTION (ADMIN ONLY) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Salon Tema & Renk Kombinasyonu</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  🔒 Sadece Yönetici
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tüm uygulama ve müşteri randevu portalı genelinde aktif olan renk paletini seçin
              </p>
            </div>
          </div>
        </div>

        {/* 4 Theme Options Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(SALON_THEMES) as ThemeId[]).map((key) => {
            const theme = SALON_THEMES[key];
            const isSelected = (settings.themeId || 'gold') === key;

            return (
              <div
                key={key}
                onClick={() => updateSettings({ themeId: key })}
                className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between space-y-4 relative ${
                  isSelected
                    ? `${theme.cardBorder} bg-slate-900 ring-2 ring-amber-500/40 shadow-xl`
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                {/* Theme Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 font-mono">
                      {theme.badge}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Aktif</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0 inline-block shadow-sm"
                      style={{ backgroundColor: theme.primaryHex }}
                    />
                    <span>{theme.name}</span>
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {theme.subtitle}
                  </p>
                </div>

                {/* Theme Color Preview Swatch & Button */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 h-3 rounded-full shadow-inner"
                      style={{
                        background: `linear-gradient(90deg, ${theme.primaryHex} 0%, ${theme.accentHex} 100%)`,
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSettings({ themeId: key });
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Seçili Tema (Aktif)</span>
                      </>
                    ) : (
                      <span>Bu Temaya Geç</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: PUSH NOTIFICATIONS FOR IPHONE & ANDROID */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                iPhone & Android Anlık Web Push Bildirimleri
              </h3>
              <p className="text-xs text-slate-400">
                Müşteri dışarıdan randevu aldığında telefonunuza anında sesli bildirim düşer
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              permission === 'granted'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : permission === 'denied'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {permission === 'granted'
              ? 'Bildirim İzni Aktif ✓'
              : permission === 'denied'
              ? 'İzin Engellendi ✕'
              : 'İzin Bekleniyor'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Permission & Test Controls */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-semibold text-white">Bildirim İzni ve Sınama</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Dışarıdan müşteri boş saatlerden birini seçip randevuyu onayladığında, tarayıcınız kilit ekranına ve bildirim paneline anlık uyarı yollar.
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              {permission !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                >
                  Tarayıcı Bildirim İznini Etkinleştir
                </button>
              )}

              <button
                type="button"
                onClick={triggerTestPushNotification}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Bildirimi Gönder</span>
              </button>

              <button
                type="button"
                onClick={handleTestChime}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs border border-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Zil Sesini Çal</span>
              </button>
            </div>
          </div>

          {/* Mobile OS Compatibility Info */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>iPhone & Android Telefon Rehberi</span>
            </h4>
            <ul className="text-slate-400 text-[11px] space-y-1.5 leading-relaxed list-disc list-inside">
              <li>
                <strong className="text-white">Android:</strong> Chrome veya Edge tarayıcısında "İzin Ver" dedikten sonra anında çalışır.
              </li>
              <li>
                <strong className="text-white">iPhone (iOS 16.4+):</strong> Apple kuralları gereği Safari'de <strong className="text-amber-400">Paylaş → Ana Ekrana Ekle</strong> yaparak uygulamayı ana ekranınıza eklediğinizde anlık kilit ekranı bildirimleri tam olarak etkinleşir.
              </li>
              <li>
                <strong className="text-white">Çoklu Cihaz:</strong> Sistem sekmeler ve cihazlar arasında anlık Broadcast senkronizasyonu sağlar.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* SAFARI & IPHONE BACKGROUND NOTIFICATION SETUP GUIDE */}
      <SafariNotificationGuide />

      {/* SECTION 2: WHATSAPP INSTANT MANAGER NOTIFICATION */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Çift Yönlü WhatsApp Entegrasyonu
            </h3>
            <p className="text-xs text-slate-400">
              1) Yeni randevularda yöneticiye anlık bildirim · 2) Randevu onaylandığında müşteriye otomatik teyit mesajı
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">1. Yönetici WhatsApp Bildirim Hattı:</span>
              <div className="text-base font-bold text-emerald-400 font-mono">
                {settings.managerPhone}
              </div>
              <p className="text-[11px] text-slate-500">
                Online randevu tamamlandığında müşteri bu numaraya randevu detaylarını hazır WhatsApp şablonuyla iletir.
              </p>
            </div>

            <a
              href={buildManagerWhatsAppUrl(
                settings.managerPhone,
                'Örnek Müşteri (Murat Bey)',
                '0532 999 88 77',
                'Saç Kesimi & Sakal Tasarımı',
                'Tarık Dilek',
                'Bugün',
                '14:30'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shrink-0 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Yönetici Bildirimini Test Et</span>
            </a>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">2. Müşteriye Giden Onay Bildirimi:</span>
              <p className="text-[11px] text-slate-300">
                Yönetici takvimden veya randevu detayından "Onayla" dediğinde, müşteriye tarih, saat, berber ve Göktürk salon navigasyon linkini içeren WhatsApp onay mesajı oluşturulur.
              </p>
            </div>

            <a
              href={buildCustomerWhatsAppUrl(
                '05329998877',
                'Örnek Müşteri (Murat Bey)',
                'Tarık Dilek',
                'Bugün',
                '14:30',
                'Saç Kesimi & Sakal Tasarımı',
                settings.address
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-colors shrink-0 shadow-md"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Müşteri Onay Şablonunu Gör</span>
            </a>
          </div>
        </div>
      </div>

      {/* SECTION 3: BUSINESS & SHOP PARAMETERS */}
      <form onSubmit={handleSaveSettings} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">İşletme Bilgileri ve Randevu Davranışı</h3>
            <p className="text-xs text-slate-400">Mağaza adı, iletişim ve randevu onay politikası</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Berber / Kuaför Adı</label>
            <input
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Yönetici Bildirim Telefonu (WhatsApp)</label>
            <input
              type="tel"
              required
              value={managerPhone}
              onChange={(e) => setManagerPhone(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Dükkan Sabit Telefonu</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Açık Adres</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              id="autoConfirmCheckbox"
              checked={autoConfirm}
              onChange={(e) => setAutoConfirm(e.target.checked)}
              className="rounded border-slate-800 text-amber-500 focus:ring-amber-500 bg-slate-950"
            />
            <label htmlFor="autoConfirmCheckbox" className="text-slate-300 cursor-pointer">
              Online randevuları otomatik "Onaylandı" yap (Açık değilse "Onay Bekliyor" olarak düşer)
            </label>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Kaydedildi!</span>
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              Ayarları Kaydet
            </button>
          </div>
        </div>
      </form>

      {/* SECTION 4: GOOGLE DRIVE CLOUD SYNC & DATA SECURITY */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Google Hesabı ile Otomatik Bulut Senkronizasyonu</h3>
              <p className="text-xs text-slate-400">
                Yönetici modunda Google hesabınıza bağlanarak verilerinizi Google Drive'da güvenle saklayın
              </p>
            </div>
          </div>

          {googleUserEmail ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{googleUserEmail}</span>
              </span>
              <button
                type="button"
                onClick={handleGoogleSignOut}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Çıkış Yap
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isDriveSyncing}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md"
            >
              <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.19v3.15C3.17 21.36 7.23 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.19C.43 8.13 0 9.87 0 12s.43 3.87 1.19 5.4l4.09-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.64 1.19 6.6l4.09 3.15c.95-2.84 3.6-4.95 6.72-4.95z"/>
              </svg>
              <span>Google Hesabı ile Bağlan</span>
            </button>
          )}
        </div>

        {googleUserEmail && (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <h4 className="font-semibold text-white">Google Drive Bulut Senkronizasyonu</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {lastSyncStatus || 'Google Drive hesabınızda salon verileriniz güvende.'}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSyncToDriveNow}
                disabled={isDriveSyncing}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Drive'a Şimdi Yedekle</span>
              </button>

              <button
                type="button"
                onClick={handleRestoreFromDriveNow}
                disabled={isDriveSyncing}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Drive'dan Geri Yükle</span>
              </button>
            </div>
          </div>
        )}

        {/* Local JSON Backup / Restore Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          {/* Export Backup */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Yerel Dosya Yedekle (JSON)</span>
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Tüm randevuları ve müşteri kayıtlarını cihazınıza manuel yedek dosyası olarak indirin.
            </p>
            <button
              type="button"
              onClick={handleExportBackup}
              className="mt-2 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Yedeği Bilgisayara İndir (.json)</span>
            </button>
          </div>

          {/* Import Backup */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Yedekten Geri Yükle (Dosyadan)</span>
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Daha önce indirdiğiniz JSON yedek dosyasını yükleyerek verileri geri getirin.
            </p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Dosyadan Geri Yükle</span>
            </button>
          </div>
        </div>
      </div>

      {/* BLOCKED NOTIFICATION PERMISSION GUIDANCE MODAL */}
      {showDeniedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowDeniedModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">
                Tarayıcı Bildirim İzni Engellenmiş
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Tarayıcınız veya telefonunuz bu site için bildirim iznini daha önce engellemiş. Güvenlik kuralları gereği tarayıcılar engellenen izinleri otomatik tekrar isteyemez.
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3 text-xs text-slate-300">
              <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>iPhone Safari (iOS 16.4+) İçin:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Safari'de alt menüdeki <strong>Paylaş</strong> simgesine dokunun ve <strong>'Ana Ekrana Ekle'</strong> seçeneğini seçin. Uygulamayı ana ekranınızdaki simgeden açtığınızda bildirim izni temizlenmiş olarak tekrar sorulacaktır.
              </p>

              <div className="font-semibold text-amber-400 flex items-center gap-1.5 pt-2 border-t border-slate-800">
                <Globe className="w-4 h-4" />
                <span>Android & Masaüstü Chrome / Safari İçin:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Adres çubuğunun solundaki kilit 🔒 veya site ayarları simgesine dokunun. <strong>'Bildirimler'</strong> iznini <strong>'İzin Ver'</strong> olarak değiştirin ve sayfayı yenileyin.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowDeniedModal(false)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg"
              >
                Anladım, Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
