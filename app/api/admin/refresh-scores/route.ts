```typescript
import { NextRequest, NextResponse } from 'next/server';
import { POST as cronRefresh } from '@/app/api/cron/weekly-score-refresh/route';

export async function POST(request: NextRequest) {
    try {
        // Directly call the cron endpoint function
        // Create a mock request with the CRON_SECRET header
        const mockRequest = new NextRequest('http://localhost/api/cron/weekly-score-refresh', {
            method: 'POST',
            headers: {
                'x-cron-secret': process.env.CRON_SECRET || ''
            }
        });

        const response = await cronRefresh(mockRequest);
        const data = await response.json();
        
        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('Admin refresh scores error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}
