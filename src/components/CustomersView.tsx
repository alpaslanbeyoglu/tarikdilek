import React, { useState, useMemo } from 'react';
import { useBarber } from '../context/BarberContext';
import { Customer } from '../types';
import {
  UserCheck,
  Search,
  Plus,
  Phone,
  MessageSquare,
  Edit2,
  Calendar,
  X,
  CheckCircle2,
  Sparkles,
  Trash2,
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, appointments, addCustomer, updateCustomer, deleteCustomer, settings, currentUserRole } = useBarber();

  const isStaff = currentUserRole === 'staff';

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirmCustomer, setDeleteConfirmCustomer] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [vipStatus, setVipStatus] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        (c.notes && c.notes.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('05');
    setEmail('');
    setNotes('');
    setVipStatus(false);
    setIsAddModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setNotes(c.notes || '');
    setVipStatus(!!c.vipStatus);
    setIsAddModalOpen(true);
  };

  const handleDeleteCustomer = (c: Customer) => {
    setDeleteConfirmCustomer(c);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
        vipStatus,
      });
    } else {
      addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
        vipStatus,
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            <span>Müşteri Kayıtları & CRM ({customers.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Müşteri geçmişi, tıraş tercihleri, özel notlar ve harcama istatistikleri
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="İsim veya telefon ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-64 rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Yeni Müşteri</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
             <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Müşteri</th>
                <th className="py-3 px-4">Telefon</th>
                <th className="py-3 px-4">Tıraş Tercihleri / Notlar</th>
                <th className="py-3 px-4 text-center">Ziyaret</th>
                <th className="py-3 px-4 text-right">Son Ziyaret</th>
                <th className="py-3 px-4 text-right sticky right-0 bg-slate-950 z-10 shadow-[-5px_0_10px_rgba(0,0,0,0.5)]">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Arama kriterine uygun müşteri bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const custAppointments = appointments.filter(
                    (a) => a.customerPhone.replace(/\D/g, '') === cust.phone.replace(/\D/g, '')
                  );

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs uppercase">
                            {cust.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{cust.name}</span>
                              {cust.vipStatus && (
                                <span className="text-[9px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 rounded">
                                  VIP
                                </span>
                              )}
                            </div>
                            {cust.email && (
                              <div className="text-[11px] text-slate-500">{cust.email}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {cust.phone}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        {cust.notes ? (
                          <div className="text-slate-300 italic text-[11px] line-clamp-2">
                            "{cust.notes}"
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">Özel not girilmemiş</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 text-slate-300">
                          {cust.visitCount} kez
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {cust.lastVisitDate || 'Yeni Müşteri'}
                      </td>

                      <td className="py-3.5 px-4 text-right sticky right-0 bg-slate-900/95 backdrop-blur z-10 shadow-[-5px_0_10px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`tel:${cust.phone}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Ara"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-500" />
                          </a>

                          <a
                            href={`https://wa.me/90${cust.phone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(
                              `Merhaba ${cust.name}, ${settings.shopName} olarak size keyifli günler dileriz!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-600/20 transition-colors"
                            title="WhatsApp Mesaj Gönder"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          </a>

                          <button
                            onClick={() => openEditModal(cust)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Düzenle / Not Ekle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {!isStaff && (
                            <button
                              onClick={() => setDeleteConfirmCustomer(cust)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Müşteriyi Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingCustomer ? 'Müşteri Kaydını Düzenle' : 'Yeni Müşteri Kaydet'}
                </h3>
                <p className="text-xs text-slate-400">İletişim ve stil tercihleri</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Müşteri Ad Soyad</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Burak Aydın"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Telefon Numarası</label>
                <input
                  type="tel"
                  required
                  placeholder="05xx xxx xx xx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">E-Posta (Opsiyonel)</label>
                <input
                  type="email"
                  placeholder="ornek@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Tıraş Tercihleri & Özel Notlar
                </label>
                <textarea
                  rows={3}
                  placeholder="Örn: Hassas cilt, yanlar 1 numara fade, saçın sağında döner var..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="vipCheckbox"
                  checked={vipStatus}
                  onChange={(e) => setVipStatus(e.target.checked)}
                  className="rounded border-slate-800 text-amber-500 focus:ring-amber-500 bg-slate-950"
                />
                <label htmlFor="vipCheckbox" className="text-slate-300 cursor-pointer">
                  VIP Müşteri Statüsü Tanımla
                </label>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
                {!isStaff && editingCustomer ? (
                  <button
                    type="button"
                    onClick={() => {
                      const toDelete = editingCustomer;
                      setIsAddModalOpen(false);
                      setDeleteConfirmCustomer(toDelete);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-semibold"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Müşteriyi Sil</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingCustomer ? 'Güncelle' : 'Kaydet'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Müşteri Kaydını Sil</h4>
            <p className="text-xs text-slate-400 my-3 leading-relaxed">
              <strong>{deleteConfirmCustomer.name}</strong> isimli müşterinin tüm geçmiş kayıtları silinecektir. Emin misiniz?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCustomer(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCustomer(deleteConfirmCustomer.id);
                  setDeleteConfirmCustomer(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
