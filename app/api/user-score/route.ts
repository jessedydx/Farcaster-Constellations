import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { getCachedUserScore, cacheUserScore } from '@/lib/database';

const neynarClient = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const fidParam = searchParams.get('fid');

        if (!fidParam) {
            return NextResponse.json({
                error: 'Missing fid parameter'
            }, { status: 400 });
        }

        const fid = parseInt(fidParam, 10);
        if (isNaN(fid)) {
            return NextResponse.json({
                error: 'Invalid fid parameter'
            }, { status: 400 });
        }

        // Try to get from cache first
        const cachedScore = await getCachedUserScore(fid);

        if (cachedScore !== null) {
            return NextResponse.json({
                fid,
                score: cachedScore,
                cached: true
            });
        }

        // Cache miss - fetch from Neynar
        console.log(`Cache miss for FID ${fid}, fetching from Neynar...`);

        const userResponse = await neynarClient.fetchBulkUsers({ fids: [fid] });

        if (!userResponse?.users?.[0]) {
            return NextResponse.json({
                error: 'User not found'
            }, { status: 404 });
        }

        const user = userResponse.users[0];
        const score = user.experimental?.neynar_user_score || 0;

        // Cache the score for 7 days
        await cacheUserScore(fid, score);

        return NextResponse.json({
            fid,
            score,
            cached: false
        });

    } catch (error: any) {
        console.error('Error fetching user score:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}
