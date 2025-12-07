import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const fid = 3; // dwr.eth (likely has a score)
        const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY!;

        const response = await axios.get(`https://api.neynar.com/v2/farcaster/user/bulk`, {
            headers: { 'api_key': NEYNAR_API_KEY },
            params: { fids: fid.toString() }
        });

        const user = response.data.users[0];

        return NextResponse.json({
            experimental: user.experimental,
            score: user.score,
            allKeys: Object.keys(user),
            fullUser: user
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
