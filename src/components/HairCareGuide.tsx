import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Droplets,
  HelpCircle,
  Scissors,
  CheckCircle2,
  ChevronDown,
  Flame,
  Award,
} from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  shortDesc: string;
  icon: React.ReactNode;
  content: {
    lead: string;
    tips: { title: string; desc: string }[];
    barberAdvice: string;
  };
}

export const HairCareGuide: React.FC = () => {
  const [activeTopicId, setActiveTopicId] = useState<string>('scalp');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const topics: Topic[] = [
    {
      id: 'scalp',
      title: 'Kafa Derisi Sağlığı & Kepek Önleme',
      shortDesc: 'Kafa derisi gözenekleri, sebum dengesi ve arındırma yöntemleri',
      icon: <Droplets className="w-4 h-4" />,
      content: {
        lead: 'Sağlıklı, gür ve parlak saçların temeli temiz ve nefes alan bir kafa derisidir. Saç kökleri tıkanmış bir deride saç zayıflar, incelir ve kepeklenme başlar.',
        tips: [
          {
            title: 'Sıcak Su Tuzağından Kaçının',
            desc: 'Aşırı sıcak su kafa derisinin koruyucu doğal yağ katmanını (sebum) eritir ve derinin aşırı kurumasına, ardından tepki olarak fazla yağ üretmesine ve kepeğe neden olur. Her zaman ılık su tercih edin.',
          },
          {
            title: 'Haftalık Ozonlu Buhar & Deri Detoksu',
            desc: 'Salonumuzda uyguladığımız ozonlu buhar ve doğal kil maskesi, gözeneklerdeki jöle, sprey ve kireç kalıntılarını arındırır, derinin oksijen almasını sağlar.',
          },
          {
            title: 'Dairesel Masaj Tekniği',
            desc: 'Şampuanlarken tırnaklarla kazımak yerine, parmak uçlarınızın etli kısmıyla dairesel hareketlerle 2 dakika masaj yapın. Bu, saç köklerine giden mikro kan akışını %40 artırır.',
          },
        ],
        barberAdvice: 'Tarık Dilek Tavsiyesi: "Kepek problemi yaşıyorsanız piyasa kepek şampuanlarını her gün kullanmak yerine, kafa derinizi salonumuzda profesyonel buharla arındırıp haftada 2-3 kez sülfatsız arındırıcı şampuan kullanın."',
      },
    },
    {
      id: 'facematch',
      title: 'Yüz Tipine Göre Saç & Sakal Uyumu',
      shortDesc: 'Kare, oval, yuvarlak ve uzun yüz hatlarına göre altın oran stilleri',
      icon: <Scissors className="w-4 h-4" />,
      content: {
        lead: 'Her saç kesimi her yüze yakışmaz. Kesim, yüz kemiklerinizin güçlü yönlerini öne çıkarmalı, orantısız bölgeleri dengelemelidir.',
        tips: [
          {
            title: 'Kare ve Köşeli Yüzler',
            desc: 'Güçlü çene hattına sahipsiniz. Yanları kısa (fade), tepeyi doğal dokulu bırakarak maskülen hatlarınızı vurgulayın. Sakalda ise çene ucunu hafif sivrilterek denge kurun.',
          },
          {
            title: 'Yuvarlak Yüzler',
            desc: 'Yüzü daha ince ve uzun göstermek için yanları çok basık tutmalı, tepeye hacim (quiff/pompadour) verilmelidir. Çene altında toplanan uzun sakal yüzü dikey gösterir.',
          },
          {
            title: 'Oval Yüzler (İdeal Anatomi)',
            desc: 'Hemen hemen tüm saç modellerini rahatlıkla taşır. Alnı açıkta bırakan yan ayrımlı veya geriye taranmış modeller yüz simetrisini en iyi yansıtan tercihlerdir.',
          },
          {
            title: 'Uzun / Dikdörtgen Yüzler',
            desc: 'Tepeyi aşırı dikmek yüzü daha da uzatır. Yanlarda biraz dolgunluk bırakmalı ve favori/sakal geçişleriyle yatay genişlik kazandırılmalıdır.',
          },
        ],
        barberAdvice: 'Tarık Dilek Tavsiyesi: "Salonumuza geldiğinizde aklınızdaki modeli yüz anatominize, saçınızın döner yönüne ve alın çizgisine göre birlikte uyarlıyoruz."',
      },
    },
    {
      id: 'hairloss',
      title: 'Saç Dökülmesini Yavaşlatma & Kök Besleme',
      shortDesc: 'Mevsimsel ve genetik dökülmeye karşı kökleri güçlendiren adımlar',
      icon: <ShieldCheck className="w-4 h-4" />,
      content: {
        lead: 'Günde 50-100 tel saç dökülmesi biyolojik bir yenilenmedir. Ancak kökler inceliyorsa ve dökülenlerin yerine yenisi gelmiyorsa erken müdahale şarttır.',
        tips: [
          {
            title: 'Islak Saçı Asla Sert Havluyla Çitilemeyin',
            desc: 'Saç ıslandığında keratin bağları esner ve kırılmaya en açık haline gelir. Havluyu kafanıza vurarak kurulamak yerine mikrofiber havluyla bastırarak suyunu alın.',
          },
          {
            title: 'Doğru Kurutma Mesafesi',
            desc: 'Fön makinesini saçınıza 15 cm’den yakın tutmayın ve en yüksek ısıda sabit bırakmayın. Mümkünse orta sıcaklık ve soğuk hava şokuyla fiksleyin.',
          },
          {
            title: 'Keratin ve Biotin Desteği',
            desc: 'Saç teli proteinden oluşur. Yetersiz su tüketimi ve aşırı stres saç foliküllerini dinlenme (telogen) evresine sokar. Bol su ve dengeli beslenme esastır.',
          },
        ],
        barberAdvice: 'Tarık Dilek Tavsiyesi: "Dökülme fark ettiğinizde panikle internetteki rastgele kimyasallara yönelmeyin. Önce saç derisi sağlığınızı analiz ettirin."',
      },
    },
    {
      id: 'beard',
      title: 'Sakal Bakımı & Ustura Tahrişini Önleme',
      shortDesc: 'Batık kıllar, kaşıntı ve kızarıklık olmadan kusursuz sakal tasarımı',
      icon: <Flame className="w-4 h-4" />,
      content: {
        lead: 'Sakal sert, kaba kıllardan oluşurken altındaki yüz derisi son derece hassastır. Sakalın altındaki deriyi nemlendirmezseniz pul pul dökülme ve batık kaçınılmazdır.',
        tips: [
          {
            title: 'Tıraş Öncesi Sıcak Kompres',
            desc: 'Salonumuzdaki ritüelin temeli olan sıcak buharlı havlu kompresi, kıl köklerini yumuşatır ve cilt gözeneklerini açarak usturanın kaymasını sağlar.',
          },
          {
            title: 'Kıl Yönüne Tıraş (Tersine Tıraşa Son)',
            desc: 'Kılların çıkış yönünün tersine ustura vurmak kıl kökünü derinin altına gömer ve batığa (folikülit) yol açar. Her zaman çıkış açısına saygı duyulmalıdır.',
          },
          {
            title: 'Sakal Yağı ve Balsam Kullanımı',
            desc: 'Duştan hemen sonra hafif nemli sakala 3-4 damla doğal argan ve jojoba yağı masajla yedirilmelidir. Bu, sakal altındaki kaşıntıyı anında keser.',
          },
        ],
        barberAdvice: 'Tarık Dilek Tavsiyesi: "Sakal tıraşı sonrası alkol oranı yüksek kolonyalar yerine, cildi yatıştıran seramid ve E vitamini içeren balsamları tercih ediyoruz."',
      },
    },
  ];

  const faqs = [
    {
      q: 'Saçımı her gün yıkamak zararlı mıdır?',
      a: 'Evet, özellikle şampuanla her gün yıkamak kafa derisinin koruyucu lipit tabakasını yok eder ve derinin aşırı yağlanmasına ya da kurumasına sebep olur. İdeal yıkama sıklığı haftada 3-4 keredir.',
    },
    {
      q: 'Wax mı, pomad mı, yoksa deniz tuzu spreyi mi kullanmalıyım?',
      a: 'Doğal, mat ve hacimli saçlar için deniz tuzu spreyi + mat kil wax harikadır. Klasik, parlak ve net taranmış modeller için ise su bazlı pomad tercih edilmelidir.',
    },
    {
      q: 'Kafa derisinde kepek ve kaşıntı için salonunuzda hangi işlem uygulanıyor?',
      a: 'Ozonlu sıcak buhar terapisi ile gözenekler açılır, ardından peeling etkili doğal kil maskesi ve kafa derisi masajı uygulanır. İlk seansta dahi kafa derinizde derin bir ferahlık hissedersiniz.',
    },
    {
      q: 'Sakal tıraşından sonra boynumda çıkan kırmızı sivilceler nasıl geçer?',
      a: 'Bu durum genellikle ters tıraş veya kör jilet kullanımından kaynaklanan kıl dönmesidir. Salonumuzda tek kullanımlık jiletler, buhar hazırlığı ve tıraş sonrası antiseptik soğuk havlu kompresi uygulayarak bu sorunu engelliyoruz.',
    },
  ];

  const currentTopic = topics.find((t) => t.id === activeTopicId) || topics[0];

  return (
    <section id="sac-kafa-derisi-rehberi" className="py-12 border-t border-slate-800/80 bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TARIK DİLEK BİLGİLENDİRME MERKEZİ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Erkekler İçin Saç & Kafa Derisi Bakım Rehberi
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Saç sağlığı sadece kesimle değil, kafa derinizin bakım kalitesiyle başlar. Salonumuzun zanaatkâr tecrübesiyle derlediğimiz pratik ipuçları.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {topics.map((topic) => {
            const isActive = activeTopicId === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setActiveTopicId(topic.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/10 font-bold'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{topic.icon}</span>
                <span>{topic.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Topic Content Card */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                {currentTopic.icon}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {currentTopic.title}
                </h3>
                <p className="text-xs text-amber-400/90 font-medium">
                  {currentTopic.shortDesc}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed py-3 border-y border-slate-800/80 mb-6">
              {currentTopic.content.lead}
            </p>

            {/* Tips Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {currentTopic.content.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {tip.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    {tip.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Tarık Dilek Expert Quote Box */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3">
              <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200 leading-relaxed italic">
                {currentTopic.content.barberAdvice}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Sıkça Sorulan Sorular & Merak Edilenler
            </h3>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left p-4 flex items-center justify-between text-xs font-bold text-white hover:text-amber-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-amber-400' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
