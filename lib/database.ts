import { kv } from '@vercel/kv';

export interface NotificationToken {
    fid: number;
    notificationToken: string;
    notificationUrl: string;
    addedAt: number;
    lastNotifiedAt: number | null;
}

// Notification token'ı kaydet
export async function saveNotificationToken(
    fid: number,
    token: string,
    url: string
): Promise<void> {
    const data: NotificationToken = {
        fid,
        notificationToken: token,
        notificationUrl: url,
        addedAt: Date.now(),
        lastNotifiedAt: null,
    };

    await kv.set(`notification:${fid}`, data);
    console.log(`✅ Notification token saved for FID ${fid}`);
}

// Notification token'ı getir
export async function getNotificationToken(fid: number): Promise<NotificationToken | null> {
    const data = await kv.get<NotificationToken>(`notification:${fid}`);
    return data;
}

// Tüm notification token'larını getir
export async function getAllNotificationTokens(): Promise<NotificationToken[]> {
    const keys = await kv.keys('notification:*');
    const tokens: NotificationToken[] = [];

    for (const key of keys) {
        const data = await kv.get<NotificationToken>(key);
        if (data) {
            tokens.push(data);
        }
    }

    return tokens;
}

// Notification token'ı sil
export async function removeNotificationToken(fid: number): Promise<void> {
    await kv.del(`notification:${fid}`);
    console.log(`🗑️ Notification token removed for FID ${fid}`);
}

// Son bildirim zamanını güncelle
export async function updateLastNotifiedAt(fid: number): Promise<void> {
    const data = await getNotificationToken(fid);
    if (data) {
        data.lastNotifiedAt = Date.now();
        await kv.set(`notification:${fid}`, data);
    }
}

// Kullanıcı bildirim alabilir mi? (rate limit kontrolü)
export async function canSendNotification(fid: number): Promise<boolean> {
    const data = await getNotificationToken(fid);
    if (!data) return false;

    if (!data.lastNotifiedAt) return true;

    // Son bildirimden 30 saniye geçmiş mi?
    const thirtySecondsAgo = Date.now() - (30 * 1000);
    return data.lastNotifiedAt < thirtySecondsAgo;
}
