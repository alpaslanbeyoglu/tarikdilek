import React, { useState, useRef, useMemo } from 'react';
import { getAssetUrl } from '../utils/assetHelper';
import { useBarber } from '../context/BarberContext';
import { Barber } from '../types';
import {
  Users,
  Plus,
  Star,
  Clock,
  Phone,
  Calendar,
  CheckCircle2,
  X,
  Edit2,
  Power,
  Scissors,
  Trash2,
  Upload,
  Image as ImageIcon,
  KeyRound,
  ShieldAlert,
  UserCheck,
  Sparkles,
  AlertCircle,
  Search,
  Check,
  Camera,
  Link as LinkIcon,
} from 'lucide-react';

const PRESET_AVATARS = [
  './images/barber_master_ahmet_1791041628892.jpg',
  './images/barber_stylist_serkan_1791041638829.jpg',
  './images/barber_fade_can_1791041648901.jpg',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
];

// Helper to compress images to < 30KB so localStorage never exceeds quota
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 320;
        const MAX_HEIGHT = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.8 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        } else {
          resolve(readerEvent.target?.result as string);
        }
      };
      img.onerror = () => resolve(readerEvent.target?.result as string);
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const BarbersView: React.FC = () => {
  const {
    barbers,
    appointments,
    addBarber,
    updateBarber,
    deleteBarber,
    toggleBarberActive,
    currentUserRole,
    loggedInBarberId,
    currentUser,
    services,
  } = useBarber();

  const isStaff = currentUserRole === 'staff';

  const myProfile = useMemo(() => {
    if (loggedInBarberId) {
      return barbers.find((b) => b.id === loggedInBarberId);
    }
    if (currentUser?.barberId) {
      return barbers.find((b) => b.id === currentUser.barberId);
    }
    return null;
  }, [barbers, loggedInBarberId, currentUser]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Add / Edit
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('/images/barber_stylist_serkan_1791041638829.jpg');
  const [pin, setPin] = useState('1234');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('20:00');
  const [lunchStart, setLunchStart] = useState('13:00');
  const [lunchEnd, setLunchEnd] = useState('14:00');
  const [selectedDaysOff, setSelectedDaysOff] = useState<number[]>([0]);
  const [commissionRate, setCommissionRate] = useState<number>(50);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const daysLabels = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredBarbers = barbers.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.phone.includes(searchQuery)
  );

  const openAddModal = () => {
    setEditingBarber(null);
    setName('');
    setTitle('Saç & Sakal Stilisti');
    setPhone('0531 660 52 30');
    setAvatar('/images/barber_stylist_serkan_1791041638829.jpg');
    setPin('1234');
    setBio('Özenli saç kesimi, modern fade teknikleri ve sakal şekillendirme uzmanı.');
    setExperienceYears(4);
    setWorkStart('09:30');
    setWorkEnd('19:30');
    setLunchStart('13:00');
    setLunchEnd('14:00');
    setSelectedDaysOff([0]);
    setCommissionRate(50);
    setShowUrlInput(false);
    setCustomPhotoUrl('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (b: Barber) => {
    setEditingBarber(b);
    setName(b.name);
    setTitle(b.title);
    setPhone(b.phone);
    setAvatar(b.avatar);
    setPin(b.pin || '1234');
    setBio(b.bio || '');
    setExperienceYears(b.experienceYears);
    setWorkStart(b.workingHours.start);
    setWorkEnd(b.workingHours.end);
    setLunchStart(b.workingHours.lunchStart);
    setLunchEnd(b.workingHours.lunchEnd);
    setSelectedDaysOff(b.daysOff);
    setCommissionRate(b.commissionRate ?? 50);
    setShowUrlInput(false);
    setCustomPhotoUrl('');
    setIsAddModalOpen(true);
  };

  const toggleDayOff = (dayIndex: number) => {
    setSelectedDaysOff((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploadingPhoto(true);
        const compressedDataUrl = await compressImage(file);
        setAvatar(compressedDataUrl);
        showToast('✓ Fotoğraf başarıyla yüklendi');
      } catch (err) {
        console.error('Fotoğraf işleme hatası', err);
        showToast('Fotoğraf işlenirken hata oluştu');
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const handleApplyCustomUrl = () => {
    if (customPhotoUrl.trim()) {
      setAvatar(customPhotoUrl.trim());
      setShowUrlInput(false);
      showToast('✓ Fotoğraf linki uygulandı');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim()) return;

    // Staff cannot alter commission rate %, preserve existing rate
    const finalCommissionRate = isStaff && editingBarber
      ? (editingBarber.commissionRate || 50)
      : (Number(commissionRate) || 50);

    if (editingBarber) {
      updateBarber({
        ...editingBarber,
        name: name.trim(),
        title: title.trim(),
        phone: phone.trim(),
        avatar,
        pin: pin.trim() || '1234',
        bio: bio.trim(),
        experienceYears,
        workingHours: {
          start: workStart,
          end: workEnd,
          lunchStart,
          lunchEnd,
        },
        daysOff: selectedDaysOff,
        commissionRate: finalCommissionRate,
      });
      showToast(`✓ ${name.trim()} profil bilgileri güncellendi`);
    } else {
      if (isStaff) return; // Staff cannot create new staff members
      addBarber({
        name: name.trim(),
        title: title.trim(),
        phone: phone.trim() || '0531 660 52 30',
        avatar,
        pin: pin.trim() || '1234',
        bio: bio.trim(),
        rating: 4.9,
        experienceYears,
        active: true,
        servicesOffered: ['s1', 's2', 's3', 's4'],
        workingHours: {
          start: workStart,
          end: workEnd,
          lunchStart,
          lunchEnd,
        },
        daysOff: selectedDaysOff,
        commissionRate: finalCommissionRate,
      });
      showToast(`✓ Yeni personel ${name.trim()} kadroya eklendi`);
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const target = barbers.find((b) => b.id === id);
    deleteBarber(id);
    setDeleteConfirmId(null);
    if (editingBarber && editingBarber.id === id) {
      setIsAddModalOpen(false);
    }
    showToast(`✓ ${target?.name || 'Personel'} kadrodan çıkarıldı`);
  };

  const activeCount = barbers.filter((b) => b.active).length;
  const barberToDelete = barbers.find((b) => b.id === deleteConfirmId);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. EĞER PERSONEL GİRİŞ YAPTIYSA: SADECE KENDİ PROFİLİ GÖRÜNÜR VE DÜZENLENEBİLİR */}
      {isStaff ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-white">Profilim & Kişisel Bilgilerim</h2>
                <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold font-mono">
                  ✂️ Personel Hesabı
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Online randevu sisteminde müşterilerin göreceği profil fotoğrafınızı, unvanınızı, telefonunuzu ve mesai saatlerinizi buradan güncelleyebilirsiniz.
              </p>
            </div>

            {myProfile && (
              <button
                onClick={() => openEditModal(myProfile)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0"
              >
                <Camera className="w-4 h-4" />
                <span>Fotoğrafımı & Bilgilerimi Düzenle</span>
              </button>
            )}
          </div>

          {/* Dedicated Profile Card */}
          {myProfile ? (
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
              {/* Top Photo & Bio Card */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-800">
                <div
                  onClick={() => openEditModal(myProfile)}
                  className="relative group/avatar cursor-pointer shrink-0"
                  title="Fotoğrafımı Değiştir"
                >
                  <img
                    src={getAssetUrl(myProfile.avatar)}
                    alt={myProfile.name}
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-amber-500/40 group-hover/avatar:border-amber-400 transition-colors shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 rounded-3xl opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-amber-400 font-bold text-xs transition-opacity flex-col gap-1">
                    <Camera className="w-6 h-6" />
                    <span>Değiştir</span>
                  </div>
                </div>

                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-bold text-white">{myProfile.name}</h3>
                    <span className="text-xs text-amber-400 font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      {myProfile.title}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {myProfile.experienceYears} Yıl Deneyim
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {myProfile.bio || 'Modern saç ve sakal teknikleri uzmanı.'}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-500" />
                      <strong className="text-slate-200 font-mono">{myProfile.phone}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid of Profile Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Giriş PIN Kodu */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Giriş PIN Kodu</span>
                    </span>
                    <button
                      onClick={() => openEditModal(myProfile)}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Değiştir
                    </button>
                  </div>
                  <div className="font-mono text-base font-bold text-white tracking-widest">
                    {myProfile.pin || '1234'}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Personel paneline giriş şifreniz</span>
                </div>

                {/* Prim / Hakediş Oranı (Locked) */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Prim / Hakediş Oranı</span>
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                      🔒 Yönetici
                    </span>
                  </div>
                  <div className="font-mono text-base font-extrabold text-amber-400">
                    %{myProfile.commissionRate ?? 50}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Sadece salon yöneticisi değiştirebilir</span>
                </div>

                {/* Mesai Saatleri */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Mesai & Mola</span>
                    </span>
                    <button
                      onClick={() => openEditModal(myProfile)}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Düzenle
                    </button>
                  </div>
                  <div className="font-mono text-sm font-bold text-white">
                    {myProfile.workingHours.start} - {myProfile.workingHours.end}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Mola: {myProfile.workingHours.lunchStart} - {myProfile.workingHours.lunchEnd}
                  </span>
                </div>

                {/* Haftalık İzin Günü */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Haftalık İzin</span>
                    </span>
                    <button
                      onClick={() => openEditModal(myProfile)}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Düzenle
                    </button>
                  </div>
                  <div className="text-sm font-bold text-rose-400 truncate">
                    {myProfile.daysOff.length === 0
                      ? 'İzin günü yok'
                      : myProfile.daysOff.map((d) => daysLabels[d]).join(', ')}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Bu günlerde randevu alınamaz</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-3xl border border-slate-800">
              Profil bilgileriniz yükleniyor...
            </div>
          )}
        </div>
      ) : (
        /* 2. YÖNETİCİ GÖRÜNÜMÜ: SALON YÖNETİCİSİ TAM HAKİMİYET */
        <>
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <span>Personel Kadrosu & Yetki Yönetimi ({barbers.length} Personel)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeCount} aktif çalışan · Yeni personel ekleyin, silin, fotoğraflarını, prim oranlarını ve mesai saatlerini yönetin
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Personel ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-36 sm:w-48 rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Yeni Personel Ekle</span>
              </button>
            </div>
          </div>

          {/* Barbers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBarbers.map((barber) => {
              const barberApts = appointments.filter((a) => a.barberId === barber.id);
              const completedApts = barberApts.filter((a) => a.status === 'completed' || a.status === 'confirmed');
              const completedCount = completedApts.length;
              const totalRevenue = completedApts.reduce((sum, a) => {
                if (typeof a.totalPrice === 'number' && a.totalPrice > 0) return sum + a.totalPrice;
                const sPrice = (a.serviceIds || []).reduce((sSum, sId) => {
                  const s = services.find((item) => item.id === sId);
                  return sSum + (s?.price || 0);
                }, 0);
                return sum + sPrice;
              }, 0);
              const earnedHakedis = Math.round((totalRevenue * (barber.commissionRate ?? 50)) / 100);

              return (
                <div
                  key={barber.id}
                  className={`rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between group ${
                    barber.active
                      ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md'
                      : 'bg-slate-950/50 border-slate-900 opacity-60'
                  }`}
                >
                  <div>
                    {/* Header with Photo & Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative group/avatar cursor-pointer" onClick={() => openEditModal(barber)}>
                          <img
                            src={getAssetUrl(barber.avatar)}
                            alt={barber.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/30 group-hover/avatar:border-amber-500 transition-colors"
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                              barber.active ? 'bg-emerald-500' : 'bg-slate-500'
                            }`}
                            title={barber.active ? 'Aktif Çalışıyor' : 'Pasif'}
                          />
                          <div className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-[10px] text-white font-semibold transition-opacity">
                            Değiştir
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <span>{barber.name}</span>
                            {barber.id === 'b1' && (
                              <span className="text-[9px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 rounded">
                                Kurucu
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-amber-400 font-medium">{barber.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{barber.rating}</span>
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{barber.experienceYears} yıl deneyim</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(barber)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Profili & Fotoğrafı Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => toggleBarberActive(barber.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            barber.active
                              ? 'text-emerald-400 hover:bg-emerald-500/10'
                              : 'text-slate-500 hover:bg-slate-800'
                          }`}
                          title={barber.active ? 'Aktif (Pasife Al)' : 'Pasif (Aktife Al)'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(barber.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Personeli Çıkar / Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>Telefon:</span>
                        </span>
                        <span className="font-mono text-slate-200">{barber.phone}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Mesai:</span>
                        </span>
                        <span className="font-mono text-slate-200">
                          {barber.workingHours.start} - {barber.workingHours.end}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>İzin Günü:</span>
                        </span>
                        <span className="text-rose-400 font-medium">
                          {barber.daysOff.length === 0
                            ? 'Haftalık izin yok'
                            : barber.daysOff.map((d) => daysLabels[d]).join(', ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <KeyRound className="w-3 h-3 text-slate-500" />
                          <span>Giriş PIN Kodu:</span>
                        </span>
                        <span className="font-mono text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {barber.pin || '1234'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Prim / Hakediş:</span>
                        </span>
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          %{barber.commissionRate ?? 50}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-mono">
                          <strong className="text-white">{barberApts.length}</strong> randevu
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          <strong>{completedCount}</strong> bitti
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Ciro: <strong className="text-white">₺{totalRevenue.toLocaleString('tr-TR')}</strong>
                        <span className="mx-1 text-slate-600">|</span>
                        Hakediş: <strong className="text-amber-400">₺{earnedHakedis.toLocaleString('tr-TR')}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(barber)}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                      >
                        <span>Düzenle</span>
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Big Add Staff Card */}
            <button
              onClick={openAddModal}
              className="rounded-2xl border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-900/30 hover:bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center transition-all group min-h-[260px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                Yeni Personel Ekle
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Kadronuza yeni bir saç/sakal stilisti veya berber ekleyin, online randevuları başlatın
              </p>
            </button>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && barberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold text-white">Personeli Çıkarmak İstiyor Musunuz?</h4>
            
            <div className="my-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-left">
              <img
                src={barberToDelete.avatar}
                alt={barberToDelete.name}
                className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{barberToDelete.name}</div>
                <div className="text-[11px] text-amber-500 truncate">{barberToDelete.title}</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Bu personelin kaydı silinecek ve online randevu listesinden kaldırılacaktır.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-all shadow-md shadow-rose-600/20"
              >
                Evet, Personeli Çıkar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Barber Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start sm:items-center">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl relative my-4 sm:my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsAddModalOpen(false)}
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
                  {editingBarber ? 'Personel & Fotoğraf Düzenle' : 'Yeni Personel Ekle'}
                </h3>
                <p className="text-xs text-slate-400">Fotoğraf, unvan, mesai saatleri ve giriş şifresi</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Photo Upload & Avatar Selection */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Personel Fotoğrafı
                </label>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={avatar}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover border-2 border-amber-500/50 shrink-0"
                      />
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-slate-950/70 rounded-xl flex items-center justify-center text-[10px] text-amber-400 font-bold">
                          Yükleniyor...
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold transition-colors shadow-sm"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Fotoğraf Yükle (Galeri / Kamera)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>URL Linki</span>
                        </button>
                      </div>

                      {showUrlInput && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <input
                            type="url"
                            placeholder="https://... görsel linki"
                            value={customPhotoUrl}
                            onChange={(e) => setCustomPhotoUrl(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCustomUrl}
                            className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                          >
                            Uygula
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preset Avatars */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block mb-1.5">
                      Veya Hazır Berber Avatarlarından Seçin:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {PRESET_AVATARS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(preset)}
                          className={`w-9 h-9 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                            avatar === preset
                              ? 'ring-2 ring-amber-400 border-amber-400 scale-105'
                              : 'border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <img
                            src={preset}
                            alt={`preset ${idx}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Name & Title */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Ad Soyad <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Mehmet Can"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Unvan / Uzmanlık <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Saç Stilisti & Fade Uzmanı"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone, Staff PIN & Prim Oranı */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    placeholder="0531 660 52 30"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Giriş PIN Kodu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: 1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-amber-400 font-medium">
                      Prim / Hakediş Oranı (%)
                    </label>
                    {isStaff && (
                      <span className="text-[10px] text-slate-400 font-normal bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                        🔒 Yönetici Yetkisi
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      disabled={isStaff}
                      placeholder="50"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className={`w-full rounded-xl bg-slate-950 border border-amber-500/40 px-3 py-2 text-white font-mono font-bold focus:border-amber-400 focus:outline-none pr-8 ${
                        isStaff ? 'opacity-60 cursor-not-allowed bg-slate-900 border-slate-700 text-slate-300' : ''
                      }`}
                      title={isStaff ? 'Prim / Hakediş oranı yalnızca Salon Yöneticisi tarafından güncellenebilir' : 'Prim oranı'}
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-amber-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Kısa Biyografi & Uzmanlık Açıklaması
                </label>
                <textarea
                  rows={2}
                  placeholder="Personelin deneyimi, uzmanlaştığı saç/sakal teknikleri..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              {/* Working Hours */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-3">
                <span className="text-slate-300 font-semibold block">Mesai Saatleri</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Mesai Başlangıç</label>
                    <input
                      type="time"
                      value={workStart}
                      onChange={(e) => setWorkStart(e.target.value)}
                      className="w-full rounded-lg bg-slate-900 border border-slate-800 px-2 py-1.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Mesai Bitiş</label>
                    <input
                      type="time"
                      value={workEnd}
                      onChange={(e) => setWorkEnd(e.target.value)}
                      className="w-full rounded-lg bg-slate-900 border border-slate-800 px-2 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Days Off */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Haftalık İzin Günleri
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {daysLabels.map((dayName, idx) => {
                    const isSelected = selectedDaysOff.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDayOff(idx)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-colors ${
                          isSelected
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {dayName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                {editingBarber ? (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(editingBarber.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors font-medium text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Personeli Çıkar</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md"
                  >
                    {editingBarber ? 'Değişiklikleri Kaydet' : 'Personeli Kaydet'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
