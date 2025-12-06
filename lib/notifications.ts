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

        // Neynar Managed Notifications Endpoint
        // Docs: https://docs.neynar.com/reference/publish-frame-notifications

        const uuid = crypto.randomUUID();

        const response = await axios.post(
            `${NEYNAR_API_BASE}/farcaster/frame/notifications`,
            {
                uuid,
                sender_gid: 0, // Developer managed notification
                recipient_fids: [fid],
                notification: {
                    title,
                    body,
                    target_url: targetUrl
                }
            },
            {
                headers: {
                    'api_key': NEYNAR_API_KEY,
                    'content-type': 'application/json'
                }
            }
        );

        console.log(`✅ Notification sent to FID ${fid}, UUID: ${uuid}`);
        return true;
    } catch (error: any) {
        console.error('❌ Failed to send notification:', error.response?.data || error.message);
        console.error('Full error:', JSON.stringify(error.response?.data, null, 2));
        return false;
    }
}
