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
  Layers,
  Clock,
  Sliders,
  CheckCircle,
  Image as ImageIcon,
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
import { sendTelegramNotification } from '../services/telegramService';

type SettingsTab = 'all' | 'business' | 'notifications' | 'appearance' | 'backup';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, triggerTestPushNotification, resetToDefaultData, currentUserRole } = useBarber();

  const isStaff = currentUserRole === 'staff';

  const [activeTab, setActiveTab] = useState<SettingsTab>('all');
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [shopName, setShopName] = useState(settings.shopName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [managerPhone, setManagerPhone] = useState(settings.managerPhone);
  const [autoConfirm, setAutoConfirm] = useState(settings.autoConfirmOnline);
  const [slotInterval, setSlotInterval] = useState(settings.slotIntervalMinutes || 30);
  const [telegramBotToken, setTelegramBotToken] = useState(settings.telegramBotToken || '');
  const [telegramChatId, setTelegramChatId] = useState(settings.telegramChatId || '');
  const [testTgStatus, setTestTgStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [iconUploadFeedback, setIconUploadFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

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
      slotIntervalMinutes: Number(slotInterval) || 30,
      telegramBotToken: telegramBotToken.trim(),
      telegramChatId: telegramChatId.trim(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const [tgFeedback, setTgFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleTestTelegram = async () => {
    if (!telegramBotToken.trim() || !telegramChatId.trim()) {
      setTgFeedback({
        type: 'error',
        message: 'Lütfen önce Telegram Bot Token ve Chat ID alanlarını doldurunuz.',
      });
      setTimeout(() => setTgFeedback(null), 4000);
      return;
    }
    setTestTgStatus('sending');
    setTgFeedback(null);
    const success = await sendTelegramNotification(
      telegramBotToken.trim(),
      telegramChatId.trim(),
      `🤖 <b>Tarık Dilek Kuaför - Telegram Test Mesajı</b>\n\n` +
      `✅ Telegram bildirim entegrasyonu başarıyla aktif!\n\n` +
      `📌 <b>Neler Bildirilecek?</b>\n` +
      `• Yeni randevu alındığında müşteri, berber ve saat bilgileri\n` +
      `• Müşteri veya salon tarafından randevu iptal edildiğinde anında iptal uyarısı\n\n` +
      `<i>Uygulama kapalı olsa dahi mesajlar cebinize sesli olarak iletilecektir.</i>`
    );
    if (success) {
      setTestTgStatus('success');
      setTgFeedback({
        type: 'success',
        message: '✓ Test mesajı Telegram hesabınıza başarıyla iletildi! Randevu ve iptal bildirimleri aktif.',
      });
    } else {
      setTestTgStatus('error');
      setTgFeedback({
        type: 'error',
        message: '⚠️ Mesaj gönderilemedi. Lütfen Bot Token ve Chat ID doğruluğunu kontrol edin. (Botunuza önce /start mesajı atmış olmalısınız)',
      });
    }
    setTimeout(() => {
      setTestTgStatus('idle');
      setTimeout(() => setTgFeedback(null), 3000);
    }, 3000);
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

  const handleCustomIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setIconUploadFeedback({
        type: 'error',
        text: 'Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WebP).',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, 512, 512);

            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;
            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 512, 512);

            const processedDataUrl = canvas.toDataURL('image/png', 0.95);
            updateSettings({ customAppIcon: processedDataUrl });
            setIconUploadFeedback({
              type: 'success',
              text: '✓ Yeni uygulama ikonu kaydedildi! Ana ekran ve tarayıcı simgesi güncellendi.',
            });
            setTimeout(() => setIconUploadFeedback(null), 5000);
          }
        } catch {
          updateSettings({ customAppIcon: dataUrl });
          setIconUploadFeedback({
            type: 'success',
            text: '✓ Yeni uygulama ikonu kaydedildi!',
          });
          setTimeout(() => setIconUploadFeedback(null), 5000);
        }
      };
      img.onerror = () => {
        setIconUploadFeedback({
          type: 'error',
          text: 'Görsel işlenirken bir sorun oluştu.',
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadCurrentIcon = () => {
    const current = settings.customAppIcon || '/apple-touch-icon.png';
    const a = document.createElement('a');
    a.href = current;
    a.download = 'tarik_dilek_app_icon.png';
    a.click();
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

  const TABS = [
    {
      id: 'all' as const,
      label: 'Tüm Ayarlar',
      desc: 'Tüm modüller',
      icon: Layers,
    },
    {
      id: 'business' as const,
      label: 'İşletme & Randevu',
      desc: 'Salon & Çalışma',
      icon: Store,
    },
    {
      id: 'notifications' as const,
      label: 'Bildirimler & Bot',
      desc: 'Telegram, Push & WhatsApp',
      icon: Bell,
    },
    {
      id: 'appearance' as const,
      label: 'Logo & Görünüm',
      desc: 'Sol Üst Logo, İkon & Renk',
      icon: Palette,
    },
    {
      id: 'backup' as const,
      label: 'Yedekleme & Bulut',
      desc: 'Google Drive & JSON',
      icon: Cloud,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in">
      {/* Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <span>Yönetici & Sistem Ayarları</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            İşletme parametreleri, kesintisiz Telegram bildirimleri, salon teması ve veri güvenliği modülleri
          </p>
        </div>

        {saveSuccess && (
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tüm Değişiklikler Kaydedildi!</span>
          </span>
        )}
      </div>

      {/* MODULE GROUP NAVIGATION TABS */}
      <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl backdrop-blur flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-lg">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center sm:justify-start ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <div className="text-left">
                <span className="block leading-none">{tab.label}</span>
                <span className={`text-[10px] hidden sm:block mt-0.5 font-normal ${isActive ? 'text-slate-900/80 font-medium' : 'text-slate-500'}`}>
                  {tab.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODÜL 1: İŞLETME BİLGİLERİ VE RANDEVU POLİTİKASI */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'business') && (
        <form onSubmit={handleSaveSettings} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-5 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">İşletme Bilgileri & Randevu Davranışı</h3>
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Modül 1
                  </span>
                </div>
                <p className="text-xs text-slate-400">Salon adı, iletişim kanalları, adres ve randevu periyotları</p>
              </div>
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

          {/* Slot Interval Settings */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Randevu Saat Dilimi Aralığı</span>
              </label>
              <span className="text-[11px] font-mono text-amber-400 font-bold">{slotInterval} Dakika</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSlotInterval(mins)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                    slotInterval === mins
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {mins} dk
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                id="autoConfirmCheckbox"
                checked={autoConfirm}
                onChange={(e) => setAutoConfirm(e.target.checked)}
                className="rounded border-slate-800 text-amber-500 focus:ring-amber-500 bg-slate-950"
              />
              <label htmlFor="autoConfirmCheckbox" className="text-slate-300 cursor-pointer">
                Online randevuları otomatik "Onaylandı" yap (Kapalıysa "Onay Bekliyor" olarak düşer)
              </label>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kaydedildi!</span>
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
              >
                İşletme Ayarlarını Kaydet
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODÜL 2: BİLDİRİMLER & ENTEGRASYONLAR */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'notifications') && (
        <div className="space-y-4 animate-in fade-in">
          {activeTab === 'all' && (
            <div className="flex items-center gap-2 pt-2">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono px-2">
                Modül 2: Bildirim & Entegrasyon Kanalları
              </span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>
          )}

          {/* TELEGRAM BOT NOTIFICATION CARD */}
          <div className="rounded-2xl border border-sky-500/30 bg-slate-900/80 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Telegram Botu ile Kesintisiz Bildirim</span>
                    <span className="text-[10px] font-semibold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-500/30">
                      ⚡ %100 Ücretsiz & Randevular + İptaller
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tarayıcı veya uygulama tamamen kapalı olsa dahi yeni randevular ve iptaller Telegram hesabınıza anında sesli bildirim olarak iletilir
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <h4 className="font-semibold text-white">Telegram Bot Bilgileri</h4>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Bot Token (BotFather'dan Alınan)</label>
                  <input
                    type="text"
                    placeholder="Örn: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Chat ID (Sohbet ID'niz)</label>
                  <input
                    type="text"
                    placeholder="Örn: 987654321"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>

                {tgFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                      tgFeedback.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <span>{tgFeedback.message}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={testTgStatus === 'sending'}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{testTgStatus === 'sending' ? 'Gönderiliyor...' : 'Telegram Test Mesajı Gönder'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
                  >
                    Bilgileri Kaydet
                  </button>
                </div>
              </div>

              <div className="space-y-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-[11px] leading-relaxed text-slate-300">
                <h4 className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>1 Dakikada Ücretsiz Telegram Botu Kurulumu:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                  <li>Telegram'da arama çubuğuna <strong className="text-white">@BotFather</strong> yazıp sohbeti başlatın ve <code className="text-sky-400">/newbot</code> komutunu gönderin.</li>
                  <li>Botunuza bir isim ve kullanıcı adı verin. BotFather size bir <strong className="text-sky-300">HTTP API Token</strong> verecektir; bunu soldaki ilk kutuya yapıştırın.</li>
                  <li>Oluşturduğunuz yeni botunuzun sohbetine Telegram'da gidip ilk mesajı (<code className="text-sky-400">/start</code>) gönderin.</li>
                  <li>Telegram'da <strong className="text-white">@userinfobot</strong> ile konuşarak kendi <strong className="text-sky-300">Chat ID</strong>'nizi öğrenin ve soldaki ikinci kutuya yapıştırın.</li>
                  <li>Kaydedin ve test mesajı gönderin! Artık uygulama kapalıyken bile randevular cebinize gelsin.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* PUSH NOTIFICATIONS FOR IPHONE & ANDROID */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">iPhone & Android Anlık Web Push Bildirimleri</h3>
                  <p className="text-xs text-slate-400">Müşteri randevu aldığında cihazınıza tarayıcı bildirimi ve zil sesi gönderir</p>
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
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <h4 className="font-semibold text-white">Bildirim İzni ve Sınama</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Müşteri randevuyu tamamladığında cihazınızın kilit ekranına ve bildirim paneline anlık uyarı yollar.
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

              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <h4 className="font-semibold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Telefon Uyumluluk Rehberi</span>
                </h4>
                <ul className="text-slate-400 text-[11px] space-y-1.5 leading-relaxed list-disc list-inside">
                  <li><strong className="text-white">Android:</strong> Chrome veya Edge tarayıcısında "İzin Ver" dedikten sonra anında çalışır.</li>
                  <li><strong className="text-white">iPhone (iOS 16.4+):</strong> Safari'de <strong className="text-amber-400">Paylaş → Ana Ekrana Ekle</strong> yaparak PWA olarak açtığınızda kilit ekranı bildirimleri etkinleşir.</li>
                  <li><strong className="text-white">Çoklu Cihaz:</strong> Sistem sekmeler ve cihazlar arasında anlık Broadcast senkronizasyonu sağlar.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* SAFARI NOTIFICATION GUIDE */}
          <SafariNotificationGuide />

          {/* WHATSAPP NOTIFICATION INTEGRATION */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Çift Yönlü WhatsApp Entegrasyonu</h3>
                <p className="text-xs text-slate-400">
                  1) Randevu anında yöneticiye WhatsApp bildirimi · 2) Randevu onayında müşteriye hazır teyit mesajı
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">1. Yönetici WhatsApp Bildirim Hattı:</span>
                  <div className="text-base font-bold text-emerald-400 font-mono">{settings.managerPhone}</div>
                  <p className="text-[11px] text-slate-500">Müşteri randevu aldığında hazır şablonla bu numaraya WhatsApp mesajı iletebilir.</p>
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
                    Randevu "Onayla" yapıldığında, müşteriye tarih, saat, berber ve Göktürk salon navigasyon linkini içeren WhatsApp onay mesajı oluşturulur.
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODÜL 3: GÖRÜNÜM & SALON TEMA KOMBİNASYONU */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'appearance') && (
        <div className="space-y-4 animate-in fade-in">
          {activeTab === 'all' && (
            <div className="flex items-center gap-2 pt-2">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono px-2">
                Modül 3: Görünüm & Tema Stili
              </span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Salon Tema & Renk Kombinasyonu</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                      🔒 Yönetici Seçimi
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Tüm uygulama ve müşteri portalı genelinde aktif olan renk paletini belirleyin</p>
                </div>
              </div>
            </div>

            {/* 4 Theme Cards */}
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300 font-mono">{theme.badge}</span>
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

                      <p className="text-xs text-slate-400 leading-relaxed">{theme.subtitle}</p>
                    </div>

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
                            <span>Seçili Tema</span>
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

          {/* UYGULAMA İKONU & ANA EKRAN LOGO YÖNETİMİ */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Uygulama İkonu & Ana Ekran Logosu</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                      iOS & Android & Favicon
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    iPhone Safari "Ana Ekrana Ekle" menüsünde, telefon ana ekranında ve tarayıcı sekmesinde görünen ikon
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={iconInputRef}
                  onChange={handleCustomIconUpload}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Kendi Logonuzu Yükleyin</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCurrentIcon}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                  title="Mevcut ikonu PNG olarak indir"
                >
                  <Download className="w-3.5 h-3.5 text-slate-300" />
                  <span className="hidden sm:inline">İndir</span>
                </button>
              </div>
            </div>

            {iconUploadFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
                  iconUploadFeedback.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {iconUploadFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{iconUploadFeedback.text}</span>
              </div>
            )}

            {/* Live Visual Mockup & Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* iPhone iOS Springboard Mockup & Sol Üst Header Önizlemesi */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between space-y-4 relative overflow-hidden group">
                {/* 1. iOS Ana Ekran İkonu */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                    iPhone "Ana Ekrana Ekle" İkonu
                  </div>
                  <div className="relative my-1">
                    <div className="w-16 h-16 rounded-[22%] overflow-hidden border border-amber-500/30 shadow-2xl bg-slate-900 ring-2 ring-slate-800 transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={settings.customAppIcon || '/apple-touch-icon.png'}
                        alt="Uygulama İkonu"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="text-xs font-bold text-white tracking-wide">Tarık Dilek</div>
                </div>

                {/* 2. Sol Üst Menü / Header Önizlemesi */}
                <div className="pt-3 border-t border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono text-center mb-2">
                    Sol Üst Menü / Header Görünümü
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 shadow-inner">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900 border border-amber-500/40 shrink-0 flex items-center justify-center">
                      <img
                        src={settings.customAppIcon || '/apple-touch-icon.png'}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">Tarık Dilek</div>
                      <div className="text-[10px] text-amber-400 font-medium">Sol Üst İkon</div>
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] w-full">
                  <Check className="w-3 h-3 text-amber-400" />
                  <span>Şu An Aktif Olan Logo</span>
                </div>
              </div>

              {/* Ready Presets Grid */}
              <div className="md:col-span-2 bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hazır Özel Berber Logolarından Seçin</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Tek tıkla değiştirin</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Preset 1: Luxury Gold Monogram TD */}
                  <div
                    onClick={() => {
                      updateSettings({ customAppIcon: '/apple-touch-icon.png' });
                      setIconUploadFeedback({
                        type: 'success',
                        text: '✓ Lüks Altın TD Monogramı aktif edildi!',
                      });
                      setTimeout(() => setIconUploadFeedback(null), 3500);
                    }}
                    className={`cursor-pointer p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                      !settings.customAppIcon || settings.customAppIcon === '/apple-touch-icon.png'
                        ? 'border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/40'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-[20%] overflow-hidden border border-amber-500/30 bg-slate-950 shrink-0">
                      <img src="/apple-touch-icon.png" alt="Lüks TD" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Lüks Altın TD</span>
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-semibold">Önerilen</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">Altın monogram & makas motifi</p>
                    </div>
                  </div>

                  {/* Preset 2: Tarık Dilek Fotoğrafı */}
                  <div
                    onClick={() => {
                      updateSettings({ customAppIcon: '/images/tarik_dilek_ig_avatar_1791055932043.jpg' });
                      setIconUploadFeedback({
                        type: 'success',
                        text: '✓ Tarık Dilek Profil Fotoğrafı aktif edildi!',
                      });
                      setTimeout(() => setIconUploadFeedback(null), 3500);
                    }}
                    className={`cursor-pointer p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                      settings.customAppIcon === '/images/tarik_dilek_ig_avatar_1791055932043.jpg'
                        ? 'border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/40'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-[20%] overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                      <img src="/images/tarik_dilek_ig_avatar_1791055932043.jpg" alt="Tarık Dilek Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white">Tarık Dilek Fotoğrafı</div>
                      <p className="text-[11px] text-slate-400 truncate">Kişisel marka & salon kurucusu</p>
                    </div>
                  </div>

                  {/* Preset 3: Modern Fade Model */}
                  <div
                    onClick={() => {
                      updateSettings({ customAppIcon: '/images/barber_fade_can_1791041648901.jpg' });
                      setIconUploadFeedback({
                        type: 'success',
                        text: '✓ Modern Model Kesim görseli aktif edildi!',
                      });
                      setTimeout(() => setIconUploadFeedback(null), 3500);
                    }}
                    className={`cursor-pointer p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                      settings.customAppIcon === '/images/barber_fade_can_1791041648901.jpg'
                        ? 'border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/40'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-[20%] overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                      <img src="/images/barber_fade_can_1791041648901.jpg" alt="Fade Stili" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white">Kuaför Kesim Tasarımı</div>
                      <p className="text-[11px] text-slate-400 truncate">Profesyonel fade saç modeli</p>
                    </div>
                  </div>

                  {/* Preset 4: Salon Atmosferi */}
                  <div
                    onClick={() => {
                      updateSettings({ customAppIcon: '/images/barbershop_hero_atmosphere_1791041617667.jpg' });
                      setIconUploadFeedback({
                        type: 'success',
                        text: '✓ Salon Atmosferi görseli aktif edildi!',
                      });
                      setTimeout(() => setIconUploadFeedback(null), 3500);
                    }}
                    className={`cursor-pointer p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                      settings.customAppIcon === '/images/barbershop_hero_atmosphere_1791041617667.jpg'
                        ? 'border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/40'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-[20%] overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                      <img src="/images/barbershop_hero_atmosphere_1791041617667.jpg" alt="Salon Atmosferi" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white">Lüks Salon Atmosferi</div>
                      <p className="text-[11px] text-slate-400 truncate">Işıklı kuaför koltuğu & ayna</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* iOS Safari Guide Box */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>iPhone'da İkon Değişikliğini Görme Adımları (Safari)</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Safari, ana ekrana eklenen simgeleri önbelleğinde (cache) saklar. İkonu değiştirdikten sonra telefonunuzda güncel halini görmek için:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-amber-400 block mb-0.5">1. Eski İkonu Kaldırın</span>
                  <span className="text-slate-400">Telefonunuzun ana ekranında eski simge varsa basılı tutup "Sil" deyin.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-amber-400 block mb-0.5">2. Sayfayı Yenileyin</span>
                  <span className="text-slate-400">Safari'de web sitenizi açıp yenile (refresh) butonuna basarak önbelleği tazeleyin.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-amber-400 block mb-0.5">3. Ana Ekrana Ekleyin</span>
                  <span className="text-slate-400">Paylaş simgesi → "Ana Ekrana Ekle" dediğinizde yeni logonuz sol üstte görünecektir.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODÜL 4: BULUT SENKRONİZASYONU & YEDEKLEME */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'backup') && (
        <div className="space-y-4 animate-in fade-in">
          {activeTab === 'all' && (
            <div className="flex items-center gap-2 pt-2">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono px-2">
                Modül 4: Bulut Senkronizasyonu & Veri Güvenliği
              </span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Google Hesabı ile Otomatik Bulut Senkronizasyonu</h3>
                  <p className="text-xs text-slate-400">Verilerinizi Google Drive hesabınızda güvenle yedekleyin ve senkronize edin</p>
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

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Yedekten Geri Yükle (Dosyadan)</span>
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Daha önce indirdiğiniz JSON yedek dosyasını sisteme yükleyin.
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
        </div>
      )}

      {/* BLOCKED NOTIFICATION MODAL */}
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
              <h3 className="text-base font-extrabold text-white">Tarayıcı Bildirim İzni Engellenmiş</h3>
              <p className="text-xs text-slate-400 mt-1">
                Tarayıcınız veya telefonunuz bu site için bildirim iznini daha önce engellemiş.
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3 text-xs text-slate-300">
              <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>iPhone Safari (iOS 16.4+) İçin:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Safari'de alt menüdeki <strong>Paylaş</strong> simgesine dokunun ve <strong>'Ana Ekrana Ekle'</strong> seçeneğini seçin.
              </p>

              <div className="font-semibold text-amber-400 flex items-center gap-1.5 pt-2 border-t border-slate-800">
                <Globe className="w-4 h-4" />
                <span>Android & Masaüstü Chrome İçin:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Adres çubuğundaki kilit 🔒 simgesine dokunun ve <strong>'Bildirimler'</strong> iznini <strong>'İzin Ver'</strong> yapın.
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
