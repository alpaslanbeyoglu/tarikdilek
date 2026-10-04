import React, { useState } from 'react';
import { useBarber } from '../context/BarberContext';
import { Appointment, AppointmentStatus } from '../types';
import {
  X,
  Clock,
  Calendar as CalendarIcon,
  Phone,
  MessageSquare,
  Trash2,
  CheckCircle,
  Clock3,
  XCircle,
  Scissors,
  User,
  ExternalLink,
  Sparkles,
  Send,
  Check,
  CheckCheck,
  Edit3,
} from 'lucide-react';
import {
  buildCustomerConfirmationWhatsAppUrl,
  buildCustomerCancellationWhatsAppUrl,
} from '../services/notificationService';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  onClose,
}) => {
  const {
    appointments,
    barbers,
    services,
    settings,
    updateAppointmentStatus,
    updateAppointment,
    deleteAppointment,
    currentUserRole,
    loggedInBarberId,
  } = useBarber();

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editDate, setEditDate] = useState(appointment?.date || '');
  const [editTime, setEditTime] = useState(appointment?.startTime || '');
  const [editBarberId, setEditBarberId] = useState(appointment?.barberId || '');
  const [justUpdatedStatus, setJustUpdatedStatus] = useState<string | null>(null);

  if (!appointment) return null;

  // Retrieve current fresh state from context
  const currentAppointment = appointments.find((a) => a.id === appointment.id) || appointment;

  const isStaff = currentUserRole === 'staff';
  const canEdit = !isStaff || currentAppointment.barberId === loggedInBarberId;

  const barber = barbers.find((b) => b.id === currentAppointment.barberId);
  const appointmentServices = services.filter((s) => currentAppointment.serviceIds.includes(s.id));
  const serviceNames = appointmentServices.map((s) => s.name).join(', ');

  const customerConfirmationUrl = buildCustomerConfirmationWhatsAppUrl(
    currentAppointment.customerPhone,
    currentAppointment.customerName,
    barber?.name || 'Tarık Dilek',
    currentAppointment.date,
    currentAppointment.startTime,
    serviceNames,
    settings.address
  );

  const customerCancellationUrl = buildCustomerCancellationWhatsAppUrl(
    currentAppointment.customerPhone,
    currentAppointment.customerName,
    currentAppointment.date,
    currentAppointment.startTime,
    'Talebiniz üzerine veya salon yoğunluğu nedeniyle randevunuz güncellenmiştir.'
  );

  const handleStatusChange = (newStatus: AppointmentStatus) => {
    updateAppointmentStatus(currentAppointment.id, newStatus);
    setJustUpdatedStatus(newStatus);
    setTimeout(() => setJustUpdatedStatus(null), 2500);
  };

  const handleSaveReschedule = () => {
    if (!editDate || !editTime || !editBarberId) return;

    // Calculate end time
    const [h, m] = editTime.split(':').map(Number);
    const startMin = h * 60 + m;
    const endMin = startMin + currentAppointment.totalDuration;
    const endH = Math.floor(endMin / 60);
    const endM = endMin % 60;
    const newEndTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    updateAppointment({
      ...currentAppointment,
      date: editDate,
      startTime: editTime,
      endTime: newEndTime,
      barberId: editBarberId,
    });
    setIsEditingTime(false);
  };

  const handleDelete = () => {
    if (window.confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) {
      deleteAppointment(currentAppointment.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Scissors className="w-6 h-6 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{currentAppointment.customerName}</h3>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  currentAppointment.source === 'online'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {currentAppointment.source === 'online' ? 'Online Müşteri' : 'Kasa Kaydı'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              İletişim:{' '}
              <span className="font-mono text-slate-300">{currentAppointment.customerPhone}</span>
            </p>
          </div>
        </div>

        {/* Status Badge & 4-Button Selector */}
        <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Randevu Durumu:</span>
            <div className="flex items-center gap-2">
              {justUpdatedStatus && (
                <span className="text-[11px] text-emerald-400 font-semibold animate-pulse">
                  ✓ Güncellendi
                </span>
              )}
              <span
                className={`font-semibold px-3 py-1 rounded-full text-xs transition-colors ${
                  currentAppointment.status === 'confirmed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : currentAppointment.status === 'pending'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : currentAppointment.status === 'completed'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                }`}
              >
                {currentAppointment.status === 'confirmed'
                  ? 'Onaylandı'
                  : currentAppointment.status === 'pending'
                  ? 'Onay Bekliyor'
                  : currentAppointment.status === 'completed'
                  ? 'Tamamlandı'
                  : 'İptal Edildi'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleStatusChange('confirmed')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                currentAppointment.status === 'confirmed'
                  ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400 scale-[1.02]'
                  : 'bg-slate-900 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Onayla</span>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('pending')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                currentAppointment.status === 'pending'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400 scale-[1.02]'
                  : 'bg-slate-900 text-slate-300 hover:text-amber-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Clock3 className="w-3.5 h-3.5" />
              <span>Beklet</span>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('completed')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                currentAppointment.status === 'completed'
                  ? 'bg-blue-500 text-slate-950 shadow-md ring-2 ring-blue-400 scale-[1.02]'
                  : 'bg-slate-900 text-slate-300 hover:text-blue-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Tamamla</span>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('cancelled')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                currentAppointment.status === 'cancelled'
                  ? 'bg-rose-500 text-white shadow-md ring-2 ring-rose-400 scale-[1.02]'
                  : 'bg-slate-900 text-slate-300 hover:text-rose-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>İptal Et</span>
            </button>
          </div>
        </div>

        {/* WhatsApp Customer Notification Action Card */}
        <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-4 mb-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Müşteri WhatsApp Bildirimi</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-300/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Tek Tıkla Gönder
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {currentAppointment.status === 'confirmed'
              ? 'Randevu onaylandı! Müşteriye tarih, saat, stilist ve Göktürk salon navigasyon linkini içeren WhatsApp onay mesajı gönderin:'
              : currentAppointment.status === 'cancelled'
              ? 'Randevu iptal edildi. Müşteriye WhatsApp üzerinden bilgilendirme mesajı iletin:'
              : 'Randevu durumunu güncelledikten sonra müşteriye anında WhatsApp bilgilendirme mesajı iletebilirsiniz:'}
          </p>

          <a
            href={
              currentAppointment.status === 'cancelled'
                ? customerCancellationUrl
                : customerConfirmationUrl
            }
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {currentAppointment.status === 'cancelled'
                ? 'WhatsApp ile İptal Mesajı İlet'
                : 'WhatsApp ile Onay Mesajı İlet (+90 531 660 52 30)'}
            </span>
          </a>
        </div>

        {/* Details List */}
        <div className="space-y-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Tarih:</span>
            </span>
            <span className="font-mono text-white font-semibold">{currentAppointment.date}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Saat & Süre:</span>
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {currentAppointment.startTime} - {currentAppointment.endTime} ({currentAppointment.totalDuration} dk)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Hizmet Veren Stilist:</span>
            </span>
            <span className="font-bold text-white flex items-center gap-1.5">
              {barber && (
                <img
                  src={barber.avatar}
                  alt={barber.name}
                  className="w-5 h-5 rounded-full object-cover border border-amber-500/40"
                />
              )}
              <span>{barber?.name || 'Berber'}</span>
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 pt-1 border-t border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-slate-500" />
              <span>Seçilen Hizmetler:</span>
            </span>
            <span className="text-right text-slate-200 font-medium leading-relaxed">
              {serviceNames}
            </span>
          </div>

          {currentAppointment.notes && (
            <div className="pt-2 border-t border-slate-800 text-slate-400">
              <span className="font-semibold text-slate-300 block mb-1">Müşteri Notu:</span>
              <p className="italic bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                "{currentAppointment.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Reschedule Editor Form */}
        {isEditingTime ? (
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 mb-5 text-xs">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4" />
              <span>Randevuyu Yeniden Saatle / Personel Değiştir</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Tarih</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Başlangıç Saati</label>
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Berber / Stilist</label>
              <select
                value={editBarberId}
                onChange={(e) => setEditBarberId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
              >
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.title})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingTime(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleSaveReschedule}
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold shadow-md"
              >
                Saati Kaydet
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setEditDate(currentAppointment.date);
                setEditTime(currentAppointment.startTime);
                setEditBarberId(currentAppointment.barberId);
                setIsEditingTime(true);
              }}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Tarih / Saat Değiştir</span>
            </button>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            <span>Randevuyu Sil</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Pencereyi Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
