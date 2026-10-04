import React from 'react';
import { useBarber } from '../context/BarberContext';
import {
  X,
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { playNotificationSound } from '../services/notificationService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAppointment?: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectAppointment,
}) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    triggerTestPushNotification,
  } = useBarber();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Yönetici Bildirimleri</h3>
                <p className="text-xs text-slate-400">Anlık randevu talepleri ve uyarılar</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between py-3 border-b border-slate-800 text-xs">
            <button
              onClick={() => {
                triggerTestPushNotification();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Test Uyarısı Çal</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={markAllNotificationsAsRead}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                title="Tümünü Okundu Say"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tümü Okundu</span>
              </button>

              <button
                onClick={clearAllNotifications}
                className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                title="Tümünü Temizle"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                <Bell className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                <span>Henüz yeni bildirim bulunmuyor.</span>
              </div>
            ) : (
              notifications.map((item, idx) => {
                return (
                  <div
                    key={`${item.id || 'notif'}-${idx}`}
                    onClick={() => {
                      markNotificationAsRead(item.id);
                      if (item.appointmentId && onSelectAppointment) {
                        onSelectAppointment(item.appointmentId);
                        onClose();
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all duration-150 ${
                      item.read
                        ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                        : 'bg-amber-500/10 border-amber-500/40 text-slate-200 ring-1 ring-amber-500/20 shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                        )}
                        <h4 className="font-bold text-white text-xs leading-snug">
                          {item.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                      {item.body}
                    </p>

                    {item.appointmentId && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>Randevuyu Takvimde İncele</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer test sound */}
          <div className="pt-3 border-t border-slate-800 text-center">
            <button
              onClick={() => playNotificationSound()}
              className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Bildirim Zil Sesini Önizle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
