export interface TelegramAppointmentData {
  customerName: string;
  customerPhone: string;
  barberName: string;
  serviceNames: string;
  date: string;
  startTime: string;
  endTime?: string;
  totalPrice: number;
  status: string;
  notes?: string;
  source?: string;
  cancelReason?: string;
}

export async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  message: string
): Promise<boolean> {
  if (!botToken || !chatId || !botToken.trim() || !chatId.trim()) {
    return false;
  }
  try {
    const url = `https://api.telegram.org/bot${botToken.trim()}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: message,
        parse_mode: 'HTML',
      }),
    });
    const data = await res.json();
    return data.ok === true;
  } catch (err) {
    console.error('Telegram notification error:', err);
    return false;
  }
}

export async function sendTelegramNewAppointmentNotification(
  botToken: string,
  chatId: string,
  data: TelegramAppointmentData
): Promise<boolean> {
  const statusBadge =
    data.status === 'confirmed' ? '✅ Onaylandı' : '⏳ Onay Bekliyor';
  const sourceBadge =
    data.source === 'online' ? '🌐 Müşteri Portalı (Online)' : '💼 Salon Kasası (Manuel)';

  const lines = [
    `🔔 <b>YENİ RANDEVU ALINDI!</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👤 <b>Müşteri:</b> ${data.customerName}`,
    `📞 <b>Telefon:</b> ${data.customerPhone}`,
    `✂️ <b>Personel:</b> ${data.barberName}`,
    `💆 <b>Hizmetler:</b> ${data.serviceNames}`,
    `📅 <b>Tarih:</b> ${data.date}`,
    `⏰ <b>Saat:</b> ${data.startTime}${data.endTime ? ` - ${data.endTime}` : ''}`,
    `💰 <b>Tutar:</b> ₺${data.totalPrice}`,
    `📌 <b>Durum:</b> ${statusBadge}`,
    `📍 <b>Kaynak:</b> ${sourceBadge}`,
  ];

  if (data.notes && data.notes.trim()) {
    lines.push(`📝 <b>Müşteri Notu:</b> <i>${data.notes.trim()}</i>`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━`);
  lines.push(
    `🕒 <i>${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} itibariyle sisteme kaydedildi</i>`
  );

  return sendTelegramNotification(botToken, chatId, lines.join('\n'));
}

export async function sendTelegramCancellationNotification(
  botToken: string,
  chatId: string,
  data: TelegramAppointmentData
): Promise<boolean> {
  const lines = [
    `❌ <b>RANDEVU İPTAL EDİLDİ!</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👤 <b>Müşteri:</b> ${data.customerName}`,
    `📞 <b>Telefon:</b> ${data.customerPhone}`,
    `✂️ <b>Personel:</b> ${data.barberName}`,
    `💆 <b>Hizmetler:</b> ${data.serviceNames}`,
    `📅 <b>İptal Edilen Tarih:</b> ${data.date}`,
    `⏰ <b>Saat:</b> ${data.startTime}${data.endTime ? ` - ${data.endTime}` : ''}`,
    `💰 <b>Tutar:</b> ₺${data.totalPrice}`,
    `🚫 <b>Durum:</b> İPTAL EDİLDİ`,
  ];

  if (data.cancelReason && data.cancelReason.trim()) {
    lines.push(`⚠️ <b>İptal Açıklaması:</b> <i>${data.cancelReason.trim()}</i>`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━`);
  lines.push(
    `🕒 <i>${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} itibariyle iptal işlendi</i>`
  );

  return sendTelegramNotification(botToken, chatId, lines.join('\n'));
}
