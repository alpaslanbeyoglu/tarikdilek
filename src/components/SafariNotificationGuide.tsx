import React, { useState } from 'react';
import {
  Smartphone,
  Share2,
  PlusSquare,
  Bell,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  X,
  Volume2,
  Sparkles,
} from 'lucide-react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendInstantNotification,
  playNotificationSound,
} from '../services/notificationService';

interface SafariNotificationGuideProps {
  onClose?: () => void;
}

export const SafariNotificationGuide: React.FC<SafariNotificationGuideProps> = ({ onClose }) => {
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [testSent, setTestSent] = useState(false);

  const handleEnablePermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      sendInstantNotification(
        '💈 Bildirimler Aktif!',
        'Safari ve kilit ekranında anlık randevu bildirimleri başarıyla kuruldu.'
      );
    }
  };

  const handleTestNotification = () => {
    playNotificationSound();
    sendInstantNotification(
      '🔔 Test Randevu Bildirimi',
      'Ahmet Yılmaz (0532 100 20 30) yarın 14:30 için Saç & Sakal randevusu aldı!'
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute -right-10 -top-10 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Safari / iPhone Sayfa Kapalıyken Bildirim Alma</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                iOS 16.4+ Uyumlu
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Safari veya telefon kilitliyken ekran kapalı olsa dahi anlık sesli randevu uyarısı alın
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Apple Safari Rules Explanation Banner */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="font-semibold text-amber-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Apple iPhone & Safari Bildirim Kuralı:</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Apple kuralları gereği, iPhone Safari tarayıcısı <strong className="text-white">sayfa ve ekran kapalıyken</strong> bildirim göndermek için uygulamanın iPhone Ana Ekranına eklenmesini şart koşar. Aşağıdaki 3 adımı bir kez uygulayarak 7/24 kesintisiz kilit ekranı bildirimi alabilirsiniz:
        </p>
      </div>

      {/* 3 Step Setup Visual Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Step 1 */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <span>1. Adım</span>
            <Share2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-bold text-white text-xs">Paylaş Simgesine Basın</div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Safari tarayıcısının en alt çubuğundaki <strong className="text-amber-300">Paylaş (Share)</strong> simgesine dokunun.
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <span>2. Adım</span>
            <PlusSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-bold text-white text-xs">Ana Ekrana Ekle</div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Açılan menüde aşağı kaydırıp <strong className="text-amber-300">"Ana Ekrana Ekle"</strong> seçeneğine tıklayın.
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <span>3. Adım</span>
            <Bell className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-bold text-white text-xs">Bildirime İzin Verin</div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Ana ekrana eklenen simgeye dokunup açın ve ekrandaki <strong className="text-emerald-400">"İzin Ver"</strong> butonuna basın.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {permission !== 'granted' ? (
            <button
              onClick={handleEnablePermission}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>Bildirim İznini Etkinleştir</span>
            </button>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Safari Bildirim İzni Aktif ✓</span>
            </span>
          )}

          <button
            onClick={handleTestNotification}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Kilit Ekranı Testi Yap</span>
          </button>
        </div>

        {testSent && (
          <span className="text-xs text-amber-400 font-medium animate-in fade-in">
            🔔 Test uyarısı gönderildi!
          </span>
        )}
      </div>
    </div>
  );
};
