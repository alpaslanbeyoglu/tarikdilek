/**
 * Notification Service for Barbershop Management
 * Handles Web Audio alerts, Browser Push / Service Worker Notifications,
 * Mobile Vibration, and WhatsApp Instant Manager Alerts.
 */

// Synthesize pleasant luxury notification chime using Web Audio API
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First harmonic tone: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Second harmonic tone: A5 (880.00 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.3, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.7);

    // Third high pleasant bell tone: D6 (1174.66 Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1174.66, now + 0.25);
    gain3.gain.setValueAtTime(0.2, now + 0.25);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.25);
    osc3.stop(now + 0.9);
  } catch (err) {
    console.warn('Audio chime playback failed:', err);
  }
}

// Mobile vibration alert
export function triggerHapticFeedback() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 200]);
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }
}

// Check if push notifications are supported
export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission {
  if (!isPushNotificationSupported()) return 'denied';
  return Notification.permission;
}

// Request permission from user
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

// Send instant notification via Service Worker or Web Notification API
export async function sendInstantNotification(title: string, body: string, appointmentId?: string) {
  // Always trigger sound and haptic for in-app alert
  playNotificationSound();
  triggerHapticFeedback();

  if (!isPushNotificationSupported()) return;

  if (Notification.permission === 'granted') {
    // Attempt through active service worker first (required for background & iOS 16.4+ Web Push)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        appointmentId,
      });
      return;
    }

    // Try service worker ready registration
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          const opts: Record<string, unknown> = {
            body,
            icon: '/pwa-192x192.png',
            badge: '/icon.svg',
            vibrate: [200, 100, 200, 100, 200],
            data: { appointmentId, url: '/' },
          };
          registration.showNotification(title, opts as NotificationOptions);
          return;
        }
      } catch (e) {
        console.warn('Service worker showNotification fallback:', e);
      }
    }

    // Fallback to standard web notification
    try {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/icon.svg',
      });
    } catch (e) {
      console.warn('Direct notification fallback:', e);
    }
  }
}

// Format any phone number into international WhatsApp format (e.g. 905316605230)
export function formatWhatsAppPhone(phone: string): string {
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '90' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('90') && cleanPhone.length === 10) {
    cleanPhone = '90' + cleanPhone;
  }
  return cleanPhone;
}

// Generate direct WhatsApp alert URL to manager (+90 531 660 52 30)
export function buildManagerWhatsAppUrl(
  managerPhone: string,
  customerName: string,
  customerPhone: string,
  serviceNames: string,
  barberName: string,
  date: string,
  time: string,
  totalPrice?: number
): string {
  const cleanPhone = formatWhatsAppPhone(managerPhone);

  const message = `💈 *TARIK DİLEK - YENİ RANDEVU BİLDİRİMİ* 💈\n\n` +
    `👤 *Müşteri:* ${customerName}\n` +
    `📞 *Müşteri Telefon:* ${customerPhone}\n` +
    `✂️ *Tercih Edilen Berber:* ${barberName}\n` +
    `🗓 *Tarih:* ${date}\n` +
    `⏰ *Saat:* ${time}\n` +
    `💈 *Hizmetler:* ${serviceNames}\n` +
    `📍 *Konum:* Göktürk Caddesi No:47 C, Eyüp / İstanbul\n\n` +
    `👉 Yönetici Panelinden randevuyu onaylayabilir veya müşteriyi arayabilirsiniz.\n` +
    `_Tarık Dilek Berber Yönetim Sistemi_`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// Generate customer appointment confirmation WhatsApp message (Manager -> Customer)
export function buildCustomerConfirmationWhatsAppUrl(
  customerPhone: string,
  customerName: string,
  barberName: string,
  date: string,
  time: string,
  serviceNames: string,
  shopAddress: string = 'Göktürk Caddesi No:47 C, Eyüp / İstanbul'
): string {
  const cleanPhone = formatWhatsAppPhone(customerPhone);
  const mapsLink = 'https://maps.google.com/?q=G%C3%B6kt%C3%BCrk+Caddesi+No:47+C+Ey%C3%BCp+%C4%B0stanbul';

  const message = `Merhaba Sayın *${customerName}*,\n\n` +
    `✅ *TARIK DİLEK ERKEK KUAFÖRÜ* randevunuz *BAŞARIYLA ONAYLANMIŞTIR*.\n\n` +
    `🗓 *Tarih:* ${date}\n` +
    `⏰ *Saat:* ${time}\n` +
    `👤 *Stilist / Berber:* ${barberName}\n` +
    `💈 *Hizmetler:* ${serviceNames}\n` +
    `📍 *Salon Adresi:* ${shopAddress}\n\n` +
    `🗺 *Haritada Yol Tarifi:* ${mapsLink}\n\n` +
    `Randevu saatinizden 5-10 dakika önce gelmenizi rica eder, keyifli ve konforlu bir bakım dileriz!\n\n` +
    `📞 İletişim Hattımız: +90 531 660 52 30\n` +
    `_Tarık Dilek Erkek Kuaförü_`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// Generate customer appointment cancellation/reschedule WhatsApp message
export function buildCustomerCancellationWhatsAppUrl(
  customerPhone: string,
  customerName: string,
  date: string,
  time: string,
  reason?: string
): string {
  const cleanPhone = formatWhatsAppPhone(customerPhone);

  const message = `Merhaba Sayın *${customerName}*,\n\n` +
    `Tarık Dilek Erkek Kuaförü'ndeki *${date}* saat *${time}* randevunuz güncellenmiştir.\n` +
    (reason ? `Not: ${reason}\n\n` : `\n`) +
    `Yeni bir saat belirlemek veya sorularınız için bu mesaj üzerinden bize doğrudan yazabilirsiniz.\n\n` +
    `📞 İletişim: +90 531 660 52 30\n` +
    `_Tarık Dilek Erkek Kuaförü_`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// Backward compatibility alias
export const buildCustomerWhatsAppUrl = buildCustomerConfirmationWhatsAppUrl;
