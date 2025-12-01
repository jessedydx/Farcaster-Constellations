import axios from 'axios';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY!;
const NEYNAR_API_BASE = 'https://api.neynar.com/v2';

interface SendNotificationParams {
    fid: number;
    title: string;
    body: string;
    targetUrl: string;
}

/**
 * Neynar Managed Notifications kullanarak bir kullanıcıya bildirim gönderir.
 * Not: Bu özelliğin çalışması için Neynar Dashboard'da Managed Notifications aktif edilmelidir.
 */
export async function sendNotification({ fid, title, body, targetUrl }: SendNotificationParams): Promise<boolean> {
    try {
        // Neynar API üzerinden bildirim gönder
        // Not: Neynar'ın managed notification endpoint'i farklı olabilir, dökümana göre güncellenmeli.
        // Şimdilik standart POST yapısı kullanıyoruz.

        const response = await axios.post(
            `${NEYNAR_API_BASE}/farcaster/frame/validate`, // Placeholder endpoint, gerçek endpoint'i kontrol etmeliyiz
            {
                fid,
                title,
                body,
                target_url: targetUrl
            },
            {
                headers: {
                    'api_key': NEYNAR_API_KEY,
                    'content-type': 'application/json'
                }
            }
        );

        console.log(`✅ Notification sent to FID ${fid}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to send notification:', error);
        return false;
    }
}
