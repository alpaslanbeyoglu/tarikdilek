import React, { useState, useMemo } from 'react';
import { useBarber } from '../context/BarberContext';
import {
  X,
  Plus,
  Clock,
  User,
  Phone,
  Calendar,
  CheckCircle,
} from 'lucide-react';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBarberId?: string;
  initialDate?: string;
  initialTime?: string;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  initialBarberId,
  initialDate,
  initialTime,
}) => {
  const {
    barbers,
    services,
    customers,
    selectedDate: globalDate,
    getAvailableSlots,
    bookAppointment,
  } = useBarber();

  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [selectedBarberId, setSelectedBarberId] = useState<string>(
    initialBarberId || barbers[0]?.id || 'b1'
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['s1']);
  const [date, setDate] = useState<string>(initialDate || globalDate);
  const [time, setTime] = useState<string>(initialTime || '11:00');
  const [notes, setNotes] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState<boolean>(false);

  // Filter existing customers for quick autofill
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return [];
    const query = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.phone.replace(/\D/g, '').includes(query.replace(/\D/g, ''))
    );
  }, [customers, customerSearch]);

  const selectExistingCustomer = (c: { name: string; phone: string; notes?: string }) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    if (c.notes) setNotes(c.notes);
    setShowCustomerDropdown(false);
    setCustomerSearch('');
  };

  const selectedServices = useMemo(() => {
    return services.filter((s) => selectedServiceIds.includes(s.id));
  }, [services, selectedServiceIds]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [selectedServices]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  // Available slots for the selected date & barber
  const availableSlots = useMemo(() => {
    return getAvailableSlots(selectedBarberId, date, totalDuration);
  }, [selectedBarberId, date, totalDuration, getAvailableSlots]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !time) return;

    await bookAppointment({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      barberId: selectedBarberId,
      serviceIds: selectedServiceIds,
      date,
      startTime: time,
      notes: notes.trim() || undefined,
      source: 'manual',
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Yeni Randevu Kaydı (Kasa / Telefon)</h3>
            <p className="text-xs text-slate-400">Yönetici tarafından randevu ekleme</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Fast Customer Autofill Search */}
          <div className="relative">
            <label className="block text-slate-300 font-medium mb-1">
              Kayıtlı Müşteri Ara (Hızlı Doldur)
            </label>
            <input
              type="text"
              placeholder="İsim veya telefon yazın..."
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setShowCustomerDropdown(true);
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
            {showCustomerDropdown && filteredCustomers.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-xl bg-slate-800 border border-slate-700 shadow-xl">
                {filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectExistingCustomer(c)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-700/80 text-xs flex justify-between items-center transition-colors border-b border-slate-700/50 last:border-none"
                  >
                    <div>
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.phone}</div>
                    </div>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      {c.visitCount} ziyaret
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Müşteri Ad Soyad <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Müşteri Adı"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Telefon Numarası <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="tel"
                  required
                  placeholder="05xx xxx xx xx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Barber Selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Berber / Stilist</label>
            <div className="grid grid-cols-2 gap-2">
              {barbers.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBarberId(b.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-colors ${
                    selectedBarberId === b.id
                      ? 'bg-amber-500/10 border-amber-500 text-white font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={b.avatar}
                    alt={b.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs">{b.name}</div>
                    <div className="text-[10px] text-amber-500/80 truncate">{b.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Hizmetler (Toplam: {totalDuration} dakika)
            </label>
            <div className="max-h-36 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 p-2 space-y-1">
              {services.map((s) => {
                const checked = selectedServiceIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleService(s.id)}
                    className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                      checked ? 'bg-amber-500/20 text-white' : 'hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span className="truncate">{s.name} ({s.durationMinutes} dk)</span>
                    <span className="text-slate-400 text-[11px]">{s.category}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Tarih
              </label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Saat
              </label>
              <div className="relative">
                <Clock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Slot Suggestions if available */}
          {availableSlots.length > 0 && (
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Önerilen Müsait Saatler:</span>
              <div className="flex flex-wrap gap-1">
                {availableSlots.slice(0, 8).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                      time === slot ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Not / Hatırlatma</label>
            <input
              type="text"
              placeholder="Örn: Nakit ödeyecek, özel kesim..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Randevuyu Ekle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
