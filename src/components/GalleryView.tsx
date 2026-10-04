import React, { useState } from 'react';
import { getAssetUrl } from '../utils/assetHelper';
import {
  Sparkles,
  Scissors,
  Calendar,
  X,
  Eye,
  CheckCircle2,
  Filter,
  Check,
  Zap,
  Star,
  Award,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

export interface HaircutModelItem {
  id: string;
  name: string;
  category: 'Kısa & Fade' | 'Klasik & Hacim' | 'Modern & Trend';
  imageUrl: string;
  faceShape: string; // e.g. "Oval, Köşeli & Dikdörtgen Yüzler"
  maintenance: 'Düşük' | 'Orta' | 'Yüksek';
  stylingProduct: string; // e.g. "Mat Kil / Toz Wax"
  description: string;
  cutDetails: string[];
  recommendedBarberName: string;
  serviceId: string;
}

export const HAIRCUT_MODELS: HaircutModelItem[] = [
  {
    id: 'model-crop-fade',
    name: 'Textured French Crop & High Skin Fade',
    category: 'Kısa & Fade',
    imageUrl: '/images/model_textured_crop_fade_1791057409913.jpg',
    faceShape: 'Oval, Köşeli ve Yuvarlak Yüzler',
    maintenance: 'Düşük',
    stylingProduct: 'Mat Doku Tozu & Deniz Tuzu Spreyi',
    description: 'Ön kısımda mikro dokulu düz kesim, yanlarda sıfırdan başlayan pürüzsüz yüksek skin fade geçişi. Günlük hayatta minimum şekillendirme gerektiren modern ve dinamik bir kesim.',
    cutDetails: [
      'Yanlar: 0 numara yüksek skin fade kontür',
      'Üstler: Makas ile dokulandırılmış katlı saç',
      'Ön Hat: Düz mikro kakül & net saç çizgisi',
      'Yıkama sonrası sadece hafif havlu kurulaması yeterlidir',
    ],
    recommendedBarberName: 'Tarık Dilek & Ekibi',
    serviceId: 's1', // Saç Kesimi
  },
  {
    id: 'model-pompadour',
    name: 'Classic Pompadour & Clean Taper Fade',
    category: 'Klasik & Hacim',
    imageUrl: '/images/model_classic_pompadour_1791057425082.jpg',
    faceShape: 'Oval ve Dikdörtgen Yüzler',
    maintenance: 'Orta',
    stylingProduct: 'Su Bazlı Pomad & Fön Köpüğü',
    description: 'Zamansız İtalyan beyefendi tarzı. Hacimli geriye taranmış üst yapı, doğal yan ayrım ve kulak arkasında netleşen temiz taper fade bitiş.',
    cutDetails: [
      'Yanlar: 1.5 - 2 numara kademeli geçiş',
      'Üstler: 8-10 cm hacimli kat kesimi',
      'Fön: Yuvarlak fırça ile hacim verilerek şekillendirilir',
      'Resmi ve iş ortamları için kusursuz karizma',
    ],
    recommendedBarberName: 'Tarık Dilek',
    serviceId: 's1',
  },
  {
    id: 'model-quiff',
    name: 'Modern Textured Quiff & Mid Fade',
    category: 'Modern & Trend',
    imageUrl: '/images/model_textured_quiff_1791057439395.jpg',
    faceShape: 'Tüm Yüz Tipleri (Özellikle Yuvarlak & Kare)',
    maintenance: 'Orta',
    stylingProduct: 'Mat Doku Kili (Matte Clay)',
    description: 'Yukarı ve hafif yana doğru yönlendirilen doğal dalgalı doku. Saçı olduğundan daha gür ve enerjik gösteren çağdaş saç tasarımı.',
    cutDetails: [
      'Yanlar: Orta seviye (Mid) degrade fade',
      'Üstler: Derin makas ara kesimleri ile ayrık doku',
      'Bitiş: Parlama yapmayan doğal mat görünüm',
      'Gün boyu bozulmayan esnek tutuş',
    ],
    recommendedBarberName: 'Serkan Demir',
    serviceId: 's1',
  },
  {
    id: 'model-buzz-cut',
    name: 'Masculine Buzz Cut & Razor Sharp Lineup',
    category: 'Kısa & Fade',
    imageUrl: '/images/model_buzz_cut_fade_1791057453561.jpg',
    faceShape: 'Köşeli, Elmas ve Güçlü Çene Hatları',
    maintenance: 'Düşük',
    stylingProduct: 'Sakal & Kafa Derisi Bakım Yağı',
    description: 'Keskin alın ve şakak hatları, üstte homojen kısa kesim ve yanlarda ustura seviyesinde geçiş. Bakım gerektirmeyen en maskülen ve net stil.',
    cutDetails: [
      'Üstler: 2 - 3 numara homojen uzunluk',
      'Yanlar: 0.5 numaradan sıfıra düşen degradeli tıraş',
      'Kontür: Tek bıçak ustura ile lazer hassasiyetinde çizgi',
      'Sporcular ve yoğun çalışanlar için ideal',
    ],
    recommendedBarberName: 'Can Öztürk',
    serviceId: 's1',
  },
  {
    id: 'model-slicked-back',
    name: 'Slicked Back Undercut & Beard Fade',
    category: 'Klasik & Hacim',
    imageUrl: '/images/model_slicked_back_1791057467573.jpg',
    faceShape: 'Oval ve Uzun Yüzler',
    maintenance: 'Orta',
    stylingProduct: 'Doğal Parlak Wax veya Klasik Briyantin',
    description: 'Geriye doğru pürüzsüzce taranmış üstler ile yanların ayrık (undercut) kontrastı. Kirli sakal ile birleştiğinde güçlü bir duruş sağlar.',
    cutDetails: [
      'Üstler: Geriye yatırılabilen uzun katlar',
      'Yanlar: Kısa ayrık undercut veya düşük fade',
      'Sakal: Saç çizgisiyle bağlantılı kademeli sakal geçişi',
      'Özel geceler ve takım elbise için vazgeçilmez',
    ],
    recommendedBarberName: 'Tarık Dilek',
    serviceId: 's3', // Saç & Sakal
  },
  {
    id: 'model-wavy-drop',
    name: 'Natural Wavy Volume & Low Drop Fade',
    category: 'Modern & Trend',
    imageUrl: '/images/model_wavy_drop_fade_1791057481082.jpg',
    faceShape: 'Geniş Alın ve Oval / Üçgen Yüzler',
    maintenance: 'Orta',
    stylingProduct: 'Bukle Belirginleştirici Krem & Tuz Spreyi',
    description: 'Saçın doğal dalgasını ve bukle yapısını ön plana çıkaran, enseye doğru kavisli inen (drop fade) rahat ve havalı saç kesimi.',
    cutDetails: [
      'Üstler: Doğal bukleleri destekleyen katlı kesim',
      'Yanlar & Ense: Kavisli düşük drop fade',
      'Hacim: Saçı basık göstermeyen hafif dokulandırma',
      'Genç ve modern sokak stili',
    ],
    recommendedBarberName: 'Murat Kaya',
    serviceId: 's1',
  },
];

interface GalleryViewProps {
  onSelectModelForBooking?: (model: HaircutModelItem) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ onSelectModelForBooking }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<HaircutModelItem | null>(null);

  const categories = [
    { id: 'all', label: 'Tüm Kesim Stilleri (6)' },
    { id: 'Kısa & Fade', label: 'Kısa & Skin Fade' },
    { id: 'Klasik & Hacim', label: 'Klasik & Hacimli' },
    { id: 'Modern & Trend', label: 'Modern & Trend' },
  ];

  const filteredModels = HAIRCUT_MODELS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handleBookModel = (model: HaircutModelItem) => {
    setActiveModalItem(null);
    if (onSelectModelForBooking) {
      onSelectModelForBooking(model);
    } else {
      const el = document.getElementById('online-randevu');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ERKEK SAÇ KESİM KATALOĞU & MODEL SEÇİMİ</span>
        </div>
        
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
          Yüz Tipinize Özel Saç Kesim Stilleri
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Stüdyomuzdaki mankenimiz üzerinde uygulanan farklı saç tıraşı modellerini inceleyin. Beğendiğiniz saç modeline tıklayarak doğrudan o kesim için randevunuzu oluşturabilirsiniz.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Passport-Style Haircut Model Collage Grid (Clean & Neutral Studio Portraits) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            onClick={() => setActiveModalItem(model)}
            className="group rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl hover:border-amber-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1"
          >
            {/* Passport-Style Studio Headshot Container */}
            <div className="relative aspect-square bg-[#e2e4e8] overflow-hidden">
              <img
                src={getAssetUrl(model.imageUrl)}
                alt={model.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />

              {/* Minimal Category Tag */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-bold text-amber-400">
                {model.category}
              </div>

              {/* Maintenance Tag */}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono font-semibold text-slate-300">
                Bakım: {model.maintenance}
              </div>

              {/* Hover Lookbook Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="w-full py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold text-center shadow-lg flex items-center justify-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Kesim Detaylarını Gör & Seç</span>
                </span>
              </div>
            </div>

            {/* Model Card Info */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors leading-snug">
                  {model.name}
                </h3>
                
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {model.description}
                </p>
              </div>

              {/* Key Specs */}
              <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Yüz Uyumu:</span>
                  <span className="text-slate-200 font-medium truncate max-w-[170px]">
                    {model.faceShape.split(',')[0]}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Önerilen Ürün:</span>
                  <span className="text-amber-400 font-medium truncate max-w-[170px]">
                    {model.stylingProduct.split('&')[0]}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookModel(model);
                }}
                className="w-full mt-2 py-2.5 rounded-xl bg-slate-800 group-hover:bg-amber-500 text-slate-200 group-hover:text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Scissors className="w-3.5 h-3.5 -rotate-45" />
                <span>Bu Modeli Seç & Randevu Al</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Guide Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">
              Hangi Saç Kesiminin Size Yakışacağından Emin Değil Misiniz?
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Salonumuza geldiğinizde Tarık Dilek ve stilistlerimiz kafa yapınızı, saç yönünüzü ve yüz hatlarınızı analiz ederek size en çok yakışan modeli birlikte belirler.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (onSelectModelForBooking) {
              onSelectModelForBooking(HAIRCUT_MODELS[0]);
            } else {
              const el = document.getElementById('online-randevu');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="w-full md:w-auto px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          <span>Hemen Randevu Oluştur →</span>
        </button>
      </div>

      {/* Detailed Modal for Selected Model */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/70 text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Passport Headshot Image (Left Side) */}
            <div className="md:w-1/2 bg-[#e2e4e8] flex items-center justify-center relative overflow-hidden">
              <img
                src={getAssetUrl(activeModalItem.imageUrl)}
                alt={activeModalItem.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover max-h-[50vh] md:max-h-[80vh]"
              />

              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-bold text-amber-400">
                {activeModalItem.category}
              </div>
            </div>

            {/* Details & Action (Right Side) */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[80vh] space-y-4">
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                    Saç Modeli Rehberi
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5">
                    {activeModalItem.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {activeModalItem.description}
                  </p>
                </div>

                {/* Specs Box */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Uygun Yüz Şekli:</span>
                    <span className="font-semibold text-white text-right">
                      {activeModalItem.faceShape}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bakım İhtiyacı:</span>
                    <span className="font-semibold text-amber-400">
                      {activeModalItem.maintenance}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tavsiye Şekillendirici:</span>
                    <span className="font-semibold text-white text-right">
                      {activeModalItem.stylingProduct}
                    </span>
                  </div>
                </div>

                {/* Cut Details Checklist */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Kesim Özellikleri:
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {activeModalItem.cutDetails.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => handleBookModel(activeModalItem)}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Scissors className="w-4 h-4 -rotate-45" />
                  <span>Bu Modeli Seç & Hemen Randevu Al</span>
                </button>

                <p className="text-[10px] text-center text-slate-500">
                  Randevunuz oluşturulduğunda stilistiniz bu saç modeline göre hazırlık yapacaktır.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
