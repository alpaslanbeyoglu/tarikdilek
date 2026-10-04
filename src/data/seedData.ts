import { Barber, Service, Customer, Appointment, BusinessSettings } from '../types';

export const INITIAL_SETTINGS: BusinessSettings = {
  shopName: 'Tarık Dilek',
  phone: '0531 660 52 30',
  address: 'Göktürk Caddesi No:47 C, Eyüp / İstanbul',
  coordinates: {
    lat: 41.1825,
    lng: 28.8935,
  },
  managerPhone: '0531 660 52 30',
  managerPin: '1461', // Belirlenen Master Yönetici Şifresi
  autoConfirmOnline: false,
  soundEnabled: true,
  pushEnabled: true,
  slotIntervalMinutes: 30,
};

export const INITIAL_SERVICES: Service[] = [
  {
    id: 's-sac-kesim',
    name: 'Saç kesim',
    category: 'Saç',
    durationMinutes: 30,
    price: 350,
    description: 'Yüz hatlarına uygun profesyonel makas ve makine saç kesimi, ense temizliği ve stil verme.',
    popular: true,
  },
  {
    id: 's-sakal-kesim',
    name: 'Sakal kesim',
    category: 'Sakal',
    durationMinutes: 20,
    price: 200,
    description: 'Sakal şekillendirme, sıcak havlu kompresi, ustura detayları ve nemlendirici sakal balsamı.',
    popular: true,
  },
  {
    id: 's-sac-sakal-kesim',
    name: 'Saç sakal kesim',
    category: 'Kombin',
    durationMinutes: 60,
    price: 500,
    description: 'Komple saç kesimi, ustura sakal tasarımı, saç yıkama ve sıcak havlu masajı.',
    popular: true,
  },
  {
    id: 's-buhar-cilt-bakimi',
    name: 'Buhar+Cilt bakımı',
    category: 'Bakım & Spa',
    durationMinutes: 30,
    price: 350,
    description: 'Ozonlu sıcak buhar terapisi, derinlemesine gözenek açma, siyah nokta temizliği ve tonik.',
  },
  {
    id: 's-damat-trasi',
    name: 'Damat traşı',
    category: 'Kombin',
    durationMinutes: 90,
    price: 1200,
    description: 'Özel gün damat konsepti: Saç kesimi, sakal tıraşı, ozonlu buhar, cilt maskesi ve özel fön.',
    popular: true,
  },
  {
    id: 's-keratin-bakim',
    name: 'Keratin bakım',
    category: 'Bakım & Spa',
    durationMinutes: 45,
    price: 450,
    description: 'Yıpranmış saçları onaran, elektriklenmeyi ve kabarmayı önleyen yoğun keratin terapisi.',
  },
  {
    id: 's-yikama-fon',
    name: 'Yıkama+fön',
    category: 'Saç',
    durationMinutes: 10,
    price: 150,
    description: 'Özel şampuanlama, kafa derisi masajı ve gün boyu formunu koruyan fön uygulaması.',
  },
  {
    id: 's-cilt-maskesi',
    name: 'Cilt maskesi',
    category: 'Bakım & Spa',
    durationMinutes: 20,
    price: 200,
    description: 'Cilt tipine uygun arındırıcı ve sıkılaştırıcı doğal kil / kolajen maske bakımı.',
  },
  {
    id: 's-sac-bakim',
    name: 'Saç bakım',
    category: 'Bakım & Spa',
    durationMinutes: 30,
    price: 300,
    description: 'Saç köklerini besleyen, dökülme karşıtı vitamin ve mineral takviyeli bakım kompleksi.',
  },
  {
    id: 's-cocuk-trasi',
    name: 'Çocuk traşı',
    category: 'Saç',
    durationMinutes: 30,
    price: 250,
    description: 'Çocuklara özel sabırlı, dikkatli, konforlu ve eğlenceli saç kesimi.',
  },
  {
    id: 's-agda',
    name: 'Ağda',
    category: 'Bakım & Spa',
    durationMinutes: 10,
    price: 100,
    description: 'Kulak, burun ve elmacık kemiği üzeri hassas sıcak ağda uygulaması.',
  },
  {
    id: 's-kas-alimi',
    name: 'Kaş alımı',
    category: 'Bakım & Spa',
    durationMinutes: 15,
    price: 100,
    description: 'İp ve cımbız ile doğal erkek kaş formu düzenleme ve temizleme.',
  },
];

const ALL_SERVICE_IDS = INITIAL_SERVICES.map((s) => s.id);

export const INITIAL_BARBERS: Barber[] = [
  {
    id: 'b1',
    name: 'Tarık Dilek',
    title: 'Kurucu & Baş Berber',
    phone: '0531 660 52 30',
    avatar: '/images/barber_master_ahmet_1791041628892.jpg',
    rating: 5.0,
    experienceYears: 15,
    active: true,
    pin: '1461',
    bio: '15 yıllık berberlik ve saç sanatı tecrübesi, kişiye özel kafa yapısı ve saç analizi.',
    servicesOffered: ALL_SERVICE_IDS,
    workingHours: {
      start: '09:00',
      end: '20:00',
      lunchStart: '13:00',
      lunchEnd: '14:00',
    },
    daysOff: [0], // Pazar kapalı
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [];

// Helper to get formatted date string for today and future days
export function getRelativeDateString(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export const INITIAL_APPOINTMENTS: Appointment[] = [];
