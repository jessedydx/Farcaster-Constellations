import { NextRequest, NextResponse } from 'next/server';
import { markAsMinted } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const { fid, txHash } = await request.json();

        if (!fid || !txHash) {
            return NextResponse.json({ error: 'FID and txHash required' }, { status: 400 });
        }

        await markAsMinted(fid, txHash);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Track mint error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
