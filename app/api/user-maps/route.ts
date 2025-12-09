import { NextRequest, NextResponse } from 'next/server';
import { getUserMintedConstellations } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const fid = searchParams.get('fid');

        if (!fid) {
            return NextResponse.json(
                { error: 'FID is required' },
                { status: 400 }
            );
        }

        const constellations = await getUserMintedConstellations(parseInt(fid), 10);

        return NextResponse.json({
            success: true,
            constellations
        });
    } catch (error: any) {
        console.error('User maps error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
