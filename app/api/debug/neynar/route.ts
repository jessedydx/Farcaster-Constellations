import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const fid = 328997; // Admin FID
        const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

        const response = await axios.get(`https://api.neynar.com/v2/farcaster/user/bulk`, {
            headers: { 'api_key': NEYNAR_API_KEY },
            params: { fids: fid.toString() }
        });

        return NextResponse.json({
            userKeys: Object.keys(response.data.users[0]),
            user: response.data.users[0]
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
