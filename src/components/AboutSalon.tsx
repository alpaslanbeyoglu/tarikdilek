import React from 'react';
import { getAssetUrl } from '../utils/assetHelper';
import {
  Scissors,
  Award,
  Sparkles,
  Coffee,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  Instagram,
} from 'lucide-react';
import { SHOP_COORDINATES } from '../utils/location';

export const AboutSalon: React.FC = () => {
  const instagramUrl = 'https://www.instagram.com/kuafortarikdilek?stkn=MXVwa3JzaTRlbm85cQ==';
  const whatsappUrl = `https://wa.me/905316605230?text=${encodeURIComponent(
    'Merhaba Tarık Bey, Göktürk salonunuz için bilgi almak ve randevu oluşturmak istiyorum.'
  )}`;

  return (
    <section id="hakkimizda" className="py-14 border-t border-slate-800/80 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Visual Showcase */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              <img
                src={getAssetUrl('/images/barbershop_hero_atmosphere_1791041617667.jpg')}
                alt="Tarık Dilek Göktürk Salonu"
                referrerPolicy="no-referrer"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Master Barber Badge */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={getAssetUrl('/images/barber_master_ahmet_1791041628892.jpg')}
                    alt="Tarık Dilek"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-amber-500/60"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">Tarık Dilek</h4>
                    <p className="text-xs text-amber-400">Kurucu & Baş Berber</p>
                    <span className="text-[11px] text-slate-400 font-mono">15 Yıllık Ustalık Deneyimi</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-500 uppercase block">Konum</span>
                  <span className="text-xs font-semibold text-white">Göktürk / Eyüp</span>
                </div>
              </div>
            </div>

            {/* Floating Quality Badge */}
            <div className="absolute -top-3 -right-3 rounded-2xl bg-amber-500 text-slate-950 p-3 shadow-xl font-bold text-xs flex items-center gap-2 border-2 border-slate-950">
              <Award className="w-4 h-4 stroke-[2.5]" />
              <span>%100 Randevulu & Hijyenik</span>
            </div>
          </div>

          {/* Story & Philosophy */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
                <Scissors className="w-3.5 h-3.5 -rotate-45" />
                <span>ZANAAT, DİSİPLİN VE KİŞİSEL STİL</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Göktürk'te Sıradan Bir Tıraş Değil, Size Özel Bir Ritüel
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tarık Dilek olarak, berberliği yalnızca saç kesmek olarak görmüyoruz. Yüz kemiklerinizin yapısına, saçınızın doğal dönerine ve kafa derinizin sağlığına saygı duyan zanaatkar bir yaklaşım sunuyoruz.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>Sıra Bekleme Yok</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Randevu saatinizde koltuğunuz hazırdır; vaktiniz bizim için değerlidir.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Kişisel Hijyen Paketi</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Her misafirimiz için tek kullanımlık jilet, sterilize makas ve tekil havlular.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Kafa Derisi Terapisi</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Ozonlu sıcak buhar, doğal kil maskesi ve kök masajıyla derin arınma.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <Coffee className="w-4 h-4" />
                  <span>Özel İkram & Konfor</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Özel harman İtalyan espressosu, taze demlenmiş çay ve dinlendirici atmosfer.
                </p>
              </div>
            </div>

            {/* Direct Contact Bar */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">İletişim & WhatsApp Hattı</span>
                  <a
                    href="tel:+905316605230"
                    className="font-bold text-white font-mono hover:text-amber-400 transition-colors"
                  >
                    +90 531 660 52 30
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 text-white font-bold transition-all shadow-md text-xs hover:opacity-95"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>@kuafortarikdilek</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-md text-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href="#online-randevu"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors shadow-md text-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Randevu Al</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
