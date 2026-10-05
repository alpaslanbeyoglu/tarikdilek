import React, { useState } from 'react';
import { useBarber } from '../context/BarberContext';
import { Service } from '../types';
import {
  Scissors,
  Plus,
  Clock,
  Edit2,
  Trash2,
  Sparkles,
  X,
  CheckCircle,
  AlertCircle,
  Tag,
  Search,
} from 'lucide-react';

export const ServicesView: React.FC = () => {
  const { services, addService, updateService, deleteService, currentUserRole } = useBarber();

  const isStaff = currentUserRole === 'staff';

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Saç' | 'Sakal' | 'Kombin' | 'Bakım & Spa'>('Saç');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [price, setPrice] = useState<number>(350);
  const [description, setDescription] = useState('');
  const [popular, setPopular] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categories = ['all', 'Saç', 'Sakal', 'Kombin', 'Bakım & Spa'];

  const filteredServices = services.filter((s) => {
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openAddModal = () => {
    setEditingService(null);
    setName('');
    setCategory('Saç');
    setDurationMinutes(30);
    setPrice(350);
    setDescription('');
    setPopular(false);
    setIsModalOpen(true);
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setName(s.name);
    setCategory(s.category);
    setDurationMinutes(s.durationMinutes);
    setPrice(s.price || 0);
    setDescription(s.description);
    setPopular(!!s.popular);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingService) {
      updateService({
        ...editingService,
        name: name.trim(),
        category,
        durationMinutes: Number(durationMinutes),
        price: Number(price) || 0,
        description: description.trim(),
        popular,
      });
    } else {
      addService({
        name: name.trim(),
        category,
        durationMinutes: Number(durationMinutes),
        price: Number(price) || 0,
        description: description.trim(),
        popular,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteService(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Information Banner regarding Manager Price Determination & Staff Hakediş */}
      {!isStaff ? (
        <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-amber-400 text-sm">
              Yönetici Hizmet Fiyat Politikası & Personel Hakediş Sistemi
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Hizmet fiyatlarını yalnızca siz (Salon Yöneticisi) belirlersiniz. Personeller fiyatlara müdahale edemez. Kasa cirosu, online randevular ve berberlerin kişisel hakedişleri (% primleri üzerinden) doğrudan burada belirlediğiniz fiyatlar baz alınarak hesaplanır.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-start gap-3 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Tag className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-white flex items-center gap-2 text-sm">
              <span>Hizmet & Fiyat Listesi (Personel Görüntüleme Modu)</span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                Yönetici Tarifesi
              </span>
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Hizmet fiyatları salon yöneticiniz tarafından belirlenmektedir. Tamamladığınız her randevuda hakedişiniz bu resmi fiyat tarifesi ve prim oranınız üzerinden otomatik olarak hesabınıza yansıtılır.
            </p>
          </div>
        </div>
      )}

      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Scissors className="w-5 h-5 text-amber-500 -rotate-45" />
            <span>Hizmet ve Fiyat Yönetimi ({services.length} Hizmet)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hizmet fiyatlarını belirleyin. Personel hakedişleri ve kasa cirosu bu fiyatlar üzerinden hesaplanır.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Hizmet adı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 sm:w-56 rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {!isStaff && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Yeni Hizmet Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat === 'all' ? 'Tüm Hizmetler' : cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{service.name}</h3>
                    {service.popular && (
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        Popüler
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block text-[10px] font-medium text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      {service.category}
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{service.durationMinutes} dk</span>
                    </span>
                  </div>
                </div>

                {!isStaff && (
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Hizmeti & Fiyatı Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(service.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Hizmeti Sil / Çıkar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mt-2">
                {service.description}
              </p>
            </div>

            {/* Bottom Price & Quick Action */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-amber-400 font-mono">
                    ₺{service.price}
                  </span>
                  <span className="text-[10px] text-slate-400">/ işlem</span>
                </div>

                {!isStaff ? (
                  <button
                    onClick={() => openEditModal(service)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>Fiyat & Süre Değiştir</span>
                    <span>→</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                    Yönetici Tarifesi
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="p-10 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
          Arama kriterine uygun hizmet bulunamadı.
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-center">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Hizmeti Silmek İstiyor Musunuz?</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Bu hizmet menüden ve online randevu seçeneklerinden kaldırılacaktır.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Vazgeç
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Scissors className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingService ? 'Hizmeti & Süreyi Düzenle' : 'Yeni Hizmet Ekle'}
                </h3>
                <p className="text-xs text-slate-400">Hizmet adı, kategorisi ve ayrılacak süre</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Hizmet Adı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Özel Saç Kesimi & Yıkama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Saç">Saç</option>
                    <option value="Sakal">Sakal</option>
                    <option value="Kombin">Kombin</option>
                    <option value="Bakım & Spa">Bakım & Spa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    İşlem Süresi (Dakika) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="number"
                      min={5}
                      max={180}
                      step={5}
                      required
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Duration Chips */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">Hızlı Süre Seçimi:</span>
                <div className="flex items-center gap-1.5">
                  {[15, 20, 30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-colors ${
                        durationMinutes === mins
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {mins} dk
                    </button>
                  ))}
                </div>
              </div>

              {/* Fiyat Girişi & Hakediş Bilgilendirmesi */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                <div>
                  <label className="block font-medium mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                      <span>Hizmet Fiyatı (₺)</span>
                      <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-slate-300 font-normal">
                      Personel hakedişleri bu fiyata göre hesaplanır
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-base font-extrabold text-amber-400 font-mono">₺</span>
                    <input
                      type="number"
                      min={0}
                      step={10}
                      required
                      placeholder="350"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full rounded-xl bg-slate-950 border border-amber-500/50 pl-8 pr-3 py-2 text-white font-mono font-black text-base focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Price Chips */}
                <div>
                  <span className="text-[10px] text-amber-300/80 font-medium block mb-1">Hızlı Fiyat Seçimi:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[100, 150, 200, 250, 300, 350, 450, 500, 750, 1000, 1200].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPrice(p)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                          price === p
                            ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400 scale-105'
                            : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800'
                        }`}
                      >
                        ₺{p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Hizmet Açıklaması & Yapılan İşlemler
                </label>
                <textarea
                  rows={3}
                  placeholder="Hizmetin detayları, kullanılan teknikler..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <label htmlFor="popularCheck" className="text-slate-300 cursor-pointer">
                  Öne Çıkan / Popüler Hizmet Olarak İşaretle
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md"
                >
                  {editingService ? 'Değişiklikleri Kaydet' : 'Hizmeti Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
