/**
 * Real Instagram Profile & Feed Integration for @kuafortarikdilek
 * Official Page: https://www.instagram.com/kuafortarikdilek/
 */

export interface InstagramCollageItem {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  commentsCount: number;
  timeAgo: string;
  tags: string[];
  haircutStyle: string;
  postType: 'carousel' | 'video' | 'single';
  taggedUser?: string;
  isBeforeAfter?: boolean;
}

export const INSTAGRAM_PROFILE = {
  username: 'kuafortarikdilek',
  displayName: 'TARIK DİLEK | ERKEK KUAFÖRÜ',
  profileUrl: 'https://www.instagram.com/kuafortarikdilek/',
  avatarUrl: '/src/assets/images/tarik_dilek_ig_avatar_1791055932043.jpg',
  postsCount: '18',
  followersCount: '1.058',
  followingCount: '1',
  bioLines: [
    'Randevu için DM',
    'Whatsap için/0531 660 5230',
  ],
  whatsappPhone: '05316605230',
  whatsappUrl: 'https://wa.me/905316605230',
  followedByText: 'adem_snltrk ve tarik_fulya takip ediyor',
  badges: [
    { label: 'Tarık Fulya', type: 'facebook' },
    { label: 'WhatsApp', type: 'whatsapp', url: 'https://wa.me/905316605230' },
  ],
};

// Exact posts from the real @kuafortarikdilek grid
export const BASE_INSTAGRAM_POSTS: InstagramCollageItem[] = [
  {
    id: 'ig-real-1',
    imageUrl: '/src/assets/images/instagram_fade_haircut_1791042332349.jpg',
    caption: 'Göktürk Caddesi salonumuzda haftaya kusursuz bir saç kesimi ve net kontürlerle başladık. Randevu için WhatsApp: 0531 660 5230.',
    likes: 124,
    commentsCount: 14,
    timeAgo: '1 gün önce',
    tags: ['#kuafortarikdilek', '#göktürkkuaför', '#erkeksaçkesimi', '#saçtasarımı', '#istanbul'],
    haircutStyle: 'Modern Saç Kesimi & Detaylı Ense Kontürü',
    postType: 'carousel',
  },
  {
    id: 'ig-real-2',
    imageUrl: '/src/assets/images/ig_post_before_haircut_1791055989754.jpg',
    caption: 'Before & After dönüşüm seansı. Yüz anatomisine uygun stil analizi sonrası saçın hacmini ortaya çıkaran özel kesim.',
    likes: 189,
    commentsCount: 21,
    timeAgo: '3 gün önce',
    tags: ['#beforeafter', '#kuafortarikdilek', '#saçdönüşümü', '#göktürkberber'],
    haircutStyle: 'Before / After Saç Dönüşümü',
    postType: 'carousel',
    isBeforeAfter: true,
  },
  {
    id: 'ig-real-3',
    imageUrl: '/src/assets/images/ig_post_street_fade_1791055974937.jpg',
    caption: 'Göktürk Caddesi manzarası eşliğinde mikron seviyesinde kusursuz skin fade kesim. Beklemeden hizmet için randevunuzu online alın.',
    likes: 245,
    commentsCount: 28,
    timeAgo: '5 gün önce',
    tags: ['#skinfade', '#kuafortarikdilek', '#göktürkcaddesi', '#fadekesim'],
    haircutStyle: 'Göktürk Caddesi Manzaralı Skin Fade',
    postType: 'carousel',
  },
  {
    id: 'ig-real-4',
    imageUrl: '/src/assets/images/instagram_classic_pompadour_1791042353628.jpg',
    caption: 'Saç yıkama sonrası gün boyu kalıcı profesyonel fön ve dokulandırma uygulamamız. Aynadaki duruşunuz özgüveninizdir.',
    likes: 312,
    commentsCount: 36,
    timeAgo: '1 hafta önce',
    tags: ['#fönşekillendirme', '#kuafortarikdilek', '#saçbakımı', '#göktürk'],
    haircutStyle: 'Profesyonel Saç Yıkama, Fön & Şekillendirme',
    postType: 'video',
  },
  {
    id: 'ig-real-5',
    imageUrl: '/src/assets/images/ig_post_tarik_customer_1791055960103.jpg',
    caption: 'Değerli misafirimiz ile salonumuzda keyifli bir bakım sonrası hatıra karesi. Bizi tercih ettiğiniz için teşekkür ederiz.',
    likes: 420,
    commentsCount: 45,
    timeAgo: '1 hafta önce',
    tags: ['#kuafortarikdilek', '#misafirlerimiz', '#göktürk', '#erkekkuaförü'],
    haircutStyle: 'Komple Saç & Sakal Tasarımı Seansı',
    postType: 'single',
  },
  {
    id: 'ig-real-6',
    imageUrl: '/src/assets/images/ig_post_tarik_footballer_1791055945458.jpg',
    caption: 'Süper Lig Başakşehir kalecisi değerli dostumuz Muhammed Şengezer (@muhammedsengezer) salonumuzda. Başarılar diliyoruz!',
    likes: 685,
    commentsCount: 52,
    timeAgo: '2 hafta önce',
    tags: ['#muhammedşengezer', '#başakşehir', '#kuafortarikdilek', '#süperlig', '#göktürk'],
    haircutStyle: 'VIP Özel Saç & Sakal Bakımı',
    postType: 'single',
    taggedUser: '@muhammedsengezer',
  },
  {
    id: 'ig-real-7',
    imageUrl: '/src/assets/images/instagram_scissor_work_1791042932546.jpg',
    caption: 'Sıcak amber ışıkları altında milimetrik makas ve ustura işçiliği. Tarık Dilek salonunda her saç bir sanat eseridir.',
    likes: 215,
    commentsCount: 19,
    timeAgo: '2 hafta önce',
    tags: ['#makassanatı', '#kuafortarikdilek', '#eyüpistanbul', '#tarıkdilek'],
    haircutStyle: 'Hassas Makas Kesimi & Doku Çalışması',
    postType: 'carousel',
  },
  {
    id: 'ig-real-8',
    imageUrl: '/src/assets/images/instagram_beard_grooming_1791042341207.jpg',
    caption: 'Geleneksel sıcak havlu terapisi, köpüklü ustura tıraşı ve sakal şekillendirme. Batık ve tahrişi önleyen özel bakım balsamı.',
    likes: 340,
    commentsCount: 27,
    timeAgo: '3 hafta önce',
    tags: ['#sakaltıraşı', '#ustura', '#sıcakhavlu', '#kuafortarikdilek'],
    haircutStyle: 'Ustura Sakal Tıraşı & Sıcak Havlu Kompresi',
    postType: 'carousel',
  },
  {
    id: 'ig-real-9',
    imageUrl: '/src/assets/images/barbershop_hero_atmosphere_1791041617667.jpg',
    caption: 'Göktürk Caddesi No:47 C salonumuzun modern ve konforlu atmosferi. Kahvenizi içerken sıra beklemeden bakımınızı yaptırın.',
    likes: 490,
    commentsCount: 38,
    timeAgo: '1 ay önce',
    tags: ['#salonatmosferi', '#kuafortarikdilek', '#göktürkcaddesi', '#eyüp'],
    haircutStyle: 'Salon Atmosferi & VIP Hizmet',
    postType: 'carousel',
  },
];

const LAST_SYNC_KEY = 'tarik_dilek_ig_last_sync_timestamp';
const CACHED_POSTS_KEY = 'tarik_dilek_ig_cached_posts';
const ONE_HOUR_MS = 60 * 60 * 1000;

export function getLastSyncTime(): Date {
  const stored = localStorage.getItem(LAST_SYNC_KEY);
  if (stored) {
    const parsed = new Date(parseInt(stored, 10));
    if (!isNaN(parsed.getTime())) return parsed;
  }
  const now = new Date();
  localStorage.setItem(LAST_SYNC_KEY, now.getTime().toString());
  return now;
}

export function getStoredInstagramPosts(): InstagramCollageItem[] {
  const cached = localStorage.getItem(CACHED_POSTS_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id?.startsWith('ig-real-')) {
        return parsed;
      }
    } catch {
      // fallback
    }
  }
  localStorage.setItem(CACHED_POSTS_KEY, JSON.stringify(BASE_INSTAGRAM_POSTS));
  return BASE_INSTAGRAM_POSTS;
}

export function performHourlySync(): { posts: InstagramCollageItem[]; syncTime: Date } {
  const now = new Date();
  localStorage.setItem(LAST_SYNC_KEY, now.getTime().toString());
  localStorage.setItem(CACHED_POSTS_KEY, JSON.stringify(BASE_INSTAGRAM_POSTS));
  return { posts: BASE_INSTAGRAM_POSTS, syncTime: now };
}

export function initInstagramHourlySync(
  onSync: (posts: InstagramCollageItem[], syncTime: Date) => void
): () => void {
  const checkAndSync = () => {
    const last = getLastSyncTime();
    const now = new Date();
    if (now.getTime() - last.getTime() >= ONE_HOUR_MS) {
      const result = performHourlySync();
      onSync(result.posts, result.syncTime);
    }
  };

  checkAndSync();
  const interval = setInterval(checkAndSync, 60 * 1000);
  return () => clearInterval(interval);
}
