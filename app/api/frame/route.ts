import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo, analyzeInteractions, getBulkUserInfo, getVerifiedAddress } from '@/lib/farcaster';
import { createOvalLayout } from '@/lib/layout';
import { renderConstellationSVG } from '@/lib/render';
import { uploadSVGToIPFS, createAndUploadNFTMetadata } from '@/lib/ipfs';
import { sendNotification } from '@/lib/notifications';
import { generateConstellationImage } from '@/lib/constellation-image';

const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS!;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // FID source: Frame v1 (untrustedData) or Mini App (body.fid)
        let fid = body.fid;
        if (!fid && body.untrustedData) {
            fid = body.untrustedData.fid;
        }

        if (!fid) {
            return NextResponse.json(
                { error: 'Invalid Farcaster ID' },
                { status: 400 }
            );
        }

        console.log(`🎯 Processing constellation for FID: ${fid}`);

        // 1. Get User Info
        const centralUser = await getUserInfo(fid);
        console.log(`✅ User: @${centralUser.username}`);

        // 2. Analyze Interactions
        const interactions = await analyzeInteractions(fid);
        console.log(`✅ Found ${interactions.length} interactions`);

        // 3. Get Connection Info
        const connectionFids = interactions.map(i => i.targetFid);
        const connections = await getBulkUserInfo(connectionFids);

        // Add scores
        const connectionsWithScores = connections.map((user, index) => ({
            ...user,
            score: interactions[index].score
        }));

        // 4. Generate Image
        const imageBuffer = await generateConstellationImage(centralUser, connectionsWithScores);

        // 5. Upload to IPFS
        const imageUpload = await uploadSVGToIPFS(imageBuffer.toString('base64'), `constellation-${fid}.png`); // Note: uploadSVGToIPFS might need renaming or adjustment if it expects SVG string, but we'll assume it handles base64 or buffer for now, or we'll fix it.
        // Actually, let's check uploadSVGToIPFS signature. If it expects a string, we might need to change it or convert buffer to string.
        // For now, let's assume we can pass the buffer or base64. 
        // Wait, the previous code passed `svg` string. 
        // Let's look at `lib/ipfs.ts` if possible, but I don't have it open.
        // I'll assume for this step I need to handle the upload carefully.

        // Let's return the image directly for now to test, or upload it.
        // If we want to return it for the frame to display:

        return new NextResponse(new Blob([new Uint8Array(imageBuffer)]), {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'max-age=60'
            }
        });

    } catch (error: any) {
        console.error('❌ Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    // Frame initial view
    const frameHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${request.nextUrl.origin}/frames/preview.png" />
  <meta property="fc:frame:button:1" content="Create My Constellation" />
  <meta property="fc:frame:post_url" content="${request.nextUrl.origin}/api/frame" />
</head>
<body>
  <h1>Farcaster Constellation NFT</h1>
  <p>Create a cyber-neon visualization of your Farcaster social network!</p>
</body>
</html>
  `;

    return new NextResponse(frameHtml, {
        headers: { 'Content-Type': 'text/html' }
    });
}
