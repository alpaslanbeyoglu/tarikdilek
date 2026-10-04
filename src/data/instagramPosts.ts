export interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  commentsCount: number;
  date: string;
  tags: string[];
  haircutStyle: string;
}

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'ig-1',
    imageUrl: '/src/assets/images/instagram_fade_haircut_1791042332349.jpg',
    caption: "Göktürk'te haftaya kusursuz bir low-skin fade kesim ile başladık. Saçın doğal yapısına uygun doku çalışması ve net kontürler.",
    likes: 348,
    commentsCount: 29,
    date: 'Dün',
    tags: ['#GöktürkBerber', '#SkinFade', '#TarıkDilek', '#MenHaircut', '#İstanbulKuaför'],
    haircutStyle: 'Modern Textured Skin Fade',
  },
  {
    id: 'ig-2',
    imageUrl: '/src/assets/images/instagram_beard_grooming_1791042341207.jpg',
    caption: 'Sakal kontüründe milimetrik hatlar ve sıcak havlu terapisi. Ciltte batık ve tahrişi sıfıra indiren doğal okaliptüs balsamı.',
    likes: 425,
    commentsCount: 38,
    date: '3 gün önce',
    tags: ['#SakalTasarımı', '#UsturaTıraşı', '#BeardCare', '#Göktürk', '#ErkekBakımı'],
    haircutStyle: 'Ustura Sakal Şekillendirme & Buhar Terapisi',
  },
  {
    id: 'ig-3',
    imageUrl: '/src/assets/images/instagram_scalp_treatment_1791042362114.jpg',
    caption: 'Kafa derisi gözeneklerini derinlemesine arındıran ozonlu buhar ve doğal kil maskesi seansımız. Kepek ve dökülmeye karşı kök masajı.',
    likes: 512,
    commentsCount: 44,
    date: '5 gün önce',
    tags: ['#KafaDerisiBakımı', '#ScalpHealth', '#SaçDetoksu', '#GöktürkBakım', '#Spa'],
    haircutStyle: 'Ozonlu Buhar & Kafa Derisi Detoks Terapisi',
  },
  {
    id: 'ig-4',
    imageUrl: '/src/assets/images/instagram_classic_pompadour_1791042353628.jpg',
    caption: 'Kişiye özel yüz anatomisi analizi sonrası şekillendirilen zamansız bir klasik kesim. Tarzınız karakterinizdir.',
    likes: 295,
    commentsCount: 22,
    date: '1 hafta önce',
    tags: ['#ClassicCut', '#Pompadour', '#GöktürkKuaför', '#TarıkDilekBarbershop'],
    haircutStyle: 'Klasik Yan Ayrım & Doğal Hacimli Fön',
  },
  {
    id: 'ig-5',
    imageUrl: '/src/assets/images/barbershop_hero_atmosphere_1791041617667.jpg',
    caption: "Göktürk Caddesi No:47'de sıcak kahvenizi yudumlarken kendinize vakit ayırın. Randevulu çalışma sistemi ile beklemeden hizmet alırsınız.",
    likes: 640,
    commentsCount: 56,
    date: '1 hafta önce',
    tags: ['#GöktürkCaddesi', '#Eyüpİstanbul', '#TarıkDilek', '#GentlemenLounge'],
    haircutStyle: 'Salon Atmosferi & VIP Hizmet Alanı',
  },
  {
    id: 'ig-6',
    imageUrl: '/src/assets/images/barber_master_ahmet_1791041628892.jpg',
    caption: '15 yıllık zanaat, titizlik ve sürekli yenilenen modern teknikler. Kurucumuz Tarık Dilek ile saç ve sakalınız emin ellerde.',
    likes: 480,
    commentsCount: 34,
    date: '2 hafta önce',
    tags: ['#MasterBarber', '#TarıkDilek', '#UstaBerber', '#Göktürk'],
    haircutStyle: 'Tarık Dilek - Kurucu & Baş Berber',
  },
];
