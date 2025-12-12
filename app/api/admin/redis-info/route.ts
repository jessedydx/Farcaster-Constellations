import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('📊 Fetching Redis memory info...');

        // Get Redis INFO
        const info = await redis.info('memory');

        // Parse memory info
        const lines = info.split('\r\n');
        const memoryData: Record<string, string> = {};

        lines.forEach(line => {
            if (line && !line.startsWith('#')) {
                const [key, value] = line.split(':');
                if (key && value) {
                    memoryData[key] = value;
                }
            }
        });

        // Get key count
        const totalKeys = await redis.dbsize();

        return NextResponse.json({
            success: true,
            memory: {
                usedMemory: memoryData.used_memory_human || 'N/A',
                usedMemoryRss: memoryData.used_memory_rss_human || 'N/A',
                usedMemoryPeak: memoryData.used_memory_peak_human || 'N/A',
                memFragmentationRatio: memoryData.mem_fragmentation_ratio || 'N/A',
            },
            totalKeys,
            rawInfo: memoryData
        });
    } catch (error: any) {
        console.error('Redis memory info error:', error);

        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
