import React, { useState } from 'react';
import { useBarber } from '../context/BarberContext';
import {
  ShieldAlert,
  Lock,
  X,
  KeyRound,
  ArrowRight,
  Sparkles,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  Scissors,
} from 'lucide-react';

interface ManagerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManagerLoginModal: React.FC<ManagerLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { barbers, loginAsManager, loginAsStaff } = useBarber();

  const [activeTab, setActiveTab] = useState<'manager' | 'staff'>('manager');
  const [managerPinInput, setManagerPinInput] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState<string>(() => {
    const firstActive = barbers.find((b) => b.active);
    return firstActive ? firstActive.id : (barbers[0]?.id || 'b1');
  });
  const [staffPinInput, setStaffPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAsManager(managerPinInput.trim());
    if (success) {
      setErrorMsg(null);
      onSuccess();
      onClose();
    } else {
      setErrorMsg('Hatalı Yönetici Şifresi! Lütfen 1461 şifrenizi girin.');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarberId) {
      setErrorMsg('Lütfen personel seçiniz.');
      return;
    }
    const success = loginAsStaff(selectedBarberId, staffPinInput.trim());
    if (success) {
      setErrorMsg(null);
      onSuccess();
      onClose();
    } else {
      setErrorMsg('Hatalı personel PIN kodu!');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 flex justify-center items-start sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-center my-4 sm:my-8 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
          <KeyRound className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white">Yönetim & Personel Girişi</h3>
        <p className="text-xs text-slate-400 mt-0.5 mb-5">
          Rolünüze uygun giriş seçeneğini belirleyiniz
        </p>

        {/* Role Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('manager');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'manager'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Salon Yöneticisi</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('staff');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'staff'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 -rotate-45" />
            <span>Personel / Stilist</span>
          </button>
        </div>

        {/* TAB 1: MASTER MANAGER LOGIN */}
        {activeTab === 'manager' && (
          <form onSubmit={handleManagerSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Yönetici Şifresi (Master PIN)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  autoFocus
                  placeholder="Yönetici Şifreniz"
                  value={managerPinInput}
                  onChange={(e) => {
                    setManagerPinInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-3 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                *Tüm randevuları, personelleri ve salon ayarlarını tam yetkiyle yönetir.
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md mt-2"
            >
              <span>Yönetici Paneline Giriş Yap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: STAFF INDIVIDUAL LOGIN */}
        {activeTab === 'staff' && (
          <form onSubmit={handleStaffSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Personel / Stilist Seçiniz
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <select
                  value={selectedBarberId}
                  onChange={(e) => setSelectedBarberId(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.title})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Personel PIN Kodu
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="Personel PIN Kodunuz"
                  value={staffPinInput}
                  onChange={(e) => {
                    setStaffPinInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-3 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                *Personel girişi yaptığınızda yalnızca kendi randevularınızı görebilir ve onaylayabilirsiniz.
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md mt-2"
            >
              <span>Personel Takvimine Giriş Yap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
