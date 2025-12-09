import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { getAllUniqueFIDs, cacheUserScore } from '@/lib/database';

const neynarClient = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

export async function POST(request: NextRequest) {
    try {
        // Auth check
        const secret = request.headers.get('x-cron-secret');
        if (secret !== process.env.CRON_SECRET) {
            console.error('Unauthorized: Invalid cron secret');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🔄 Starting weekly Neynar score refresh...');

        // Get all unique FIDs
        const fids = await getAllUniqueFIDs();
        console.log(`📊 Found ${fids.length} unique users`);

        if (fids.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No users to refresh',
                updated: 0,
                failed: 0
            });
        }

        let updated = 0;
        let failed = 0;
        const errors: { fid: number; error: string }[] = [];

        // Process in batches with rate limiting
        for (let i = 0; i < fids.length; i++) {
            const fid = fids[i];

            try {
                console.log(`Processing ${i + 1}/${fids.length} - FID: ${fid}`);

                // Fetch user data from Neynar
                const userResponse = await neynarClient.fetchBulkUsers({ fids: [fid] });

                if (userResponse?.users?.[0]) {
                    const user = userResponse.users[0];
                    const score = user.experimental?.neynar_user_score || 0;

                    // Cache the score with 7-day TTL
                    await cacheUserScore(fid, score);
                    updated++;

                    console.log(`✅ Updated FID ${fid}: score = ${score}`);
                } else {
                    failed++;
                    errors.push({ fid, error: 'User not found in Neynar response' });
                    console.warn(`⚠️ No user data for FID ${fid}`);
                }

                // Rate limiting: 100ms between requests
                if (i < fids.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

            } catch (err: any) {
                failed++;
                const errorMsg = err.message || 'Unknown error';
                errors.push({ fid, error: errorMsg });
                console.error(`❌ Failed to update FID ${fid}:`, errorMsg);

                // Continue to next user even if one fails
                continue;
            }
        }

        const result = {
            success: true,
            message: 'Weekly score refresh completed',
            total: fids.length,
            updated,
            failed,
            errors: failed > 0 ? errors.slice(0, 10) : [] // Only show first 10 errors
        };

        console.log('✅ Weekly score refresh completed:', result);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('❌ Weekly score refresh failed:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}
