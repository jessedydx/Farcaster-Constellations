import axios from 'axios';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY!;
const NEYNAR_API_BASE = 'https://api.neynar.com/v2';

interface SendNotificationParams {
    fid: number;
    title: string;
    body: string;
    targetUrl: string;
}

interface SendResult {
    success: boolean;
    latency: number;
    error?: string;
    attempt?: number;
}

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
    baseDelay: 250, // 4 req/sec (Neynar limit: 5)
    maxRetries: 3,
    retryDelays: [1000, 2000, 4000] // Exponential backoff
};

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Neynar Managed Notifications kullanarak bir kullanıcıya bildirim gönderir.
 * Not: Bu özelliğin çalışması için Neynar Dashboard'da Managed Notifications aktif edilmelidir.
 */
export async function sendNotification({ fid, title, body, targetUrl }: SendNotificationParams): Promise<boolean> {
    const startTime = Date.now();

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
                target_fids: [fid],  // Changed from recipient_fids
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

        const latency = Date.now() - startTime;
        console.log(`✅ Notification sent to FID ${fid} (${latency}ms), UUID: ${uuid}`);
        return true;
    } catch (error: any) {
        const latency = Date.now() - startTime;
        console.error(`❌ Failed to send notification to FID ${fid} (${latency}ms):`, error.response?.data || error.message);
        if (error.response?.data?.errors) {
            console.error('API Errors:', JSON.stringify(error.response.data.errors, null, 2));
        }
        return false;
    }
}

/**
 * Send notification with retry logic and exponential backoff
 */
export async function sendNotificationWithRetry(
    params: SendNotificationParams,
    maxRetries: number = RATE_LIMIT_CONFIG.maxRetries
): Promise<SendResult> {
    const { fid, title, body, targetUrl } = params;
    let lastError: string = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const startTime = Date.now();

        try {
            const uuid = crypto.randomUUID();

            const response = await axios.post(
                `${NEYNAR_API_BASE}/farcaster/frame/notifications`,
                {
                    target_fids: [fid],
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
                    },
                    timeout: 10000 // 10 second timeout
                }
            );

            const latency = Date.now() - startTime;
            console.log(`✅ [${attempt}/${maxRetries}] Notification sent to FID ${fid} (${latency}ms)`);

            return {
                success: true,
                latency,
                attempt
            };
        } catch (error: any) {
            const latency = Date.now() - startTime;
            const statusCode = error.response?.status;
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';

            lastError = `[${statusCode || 'NETWORK'}] ${errorMessage}`;

            console.error(`❌ [${attempt}/${maxRetries}] Failed to send to FID ${fid} (${latency}ms): ${lastError}`);

            // Don't retry on certain errors
            if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
                // Client errors - no point in retrying
                return {
                    success: false,
                    latency,
                    error: lastError,
                    attempt
                };
            }

            // Last attempt failed
            if (attempt === maxRetries) {
                return {
                    success: false,
                    latency,
                    error: lastError,
                    attempt
                };
            }

            // Wait before retry (exponential backoff)
            const delay = RATE_LIMIT_CONFIG.retryDelays[attempt - 1] || 4000;
            console.log(`⏳ Waiting ${delay}ms before retry ${attempt + 1}...`);
            await sleep(delay);
        }
    }

    // Should never reach here, but TypeScript needs it
    return {
        success: false,
        latency: 0,
        error: lastError || 'Max retries exceeded',
        attempt: maxRetries
    };
}

/**
 * Adaptive delay based on consecutive errors
 */
export function getAdaptiveDelay(consecutiveErrors: number): number {
    if (consecutiveErrors === 0) {
        return RATE_LIMIT_CONFIG.baseDelay;
    }

    // Increase delay exponentially for errors
    const multiplier = Math.pow(2, Math.min(consecutiveErrors, 4));
    return RATE_LIMIT_CONFIG.baseDelay * multiplier;
}
