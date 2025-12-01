import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo, analyzeInteractions, getBulkUserInfo, getVerifiedAddress } from '@/lib/farcaster';
import { createOvalLayout } from '@/lib/layout';
import { renderConstellationSVG } from '@/lib/render';
import { uploadSVGToIPFS, createAndUploadNFTMetadata } from '@/lib/ipfs';
import { sendNotification } from '@/lib/notifications';

const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS!;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // FID kaynağı: Frame v1 (untrustedData) veya Mini App (body.fid)
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

        // 1. Kullanıcı bilgisini ve cüzdan adresini al
        const [centralUser, verifiedAddress] = await Promise.all([
            getUserInfo(fid),
            getVerifiedAddress(fid)
        ]);

        console.log(`✅ User: @${centralUser.username}`);
        console.log(`✅ Verified Address: ${verifiedAddress || 'Not found'}`);

        // 2. Etkileşimleri analiz et
        const interactions = await analyzeInteractions(fid);
        console.log(`✅ Found ${interactions.length} interactions`);

        if (interactions.length === 0) {
            return NextResponse.json({
                error: 'No interactions found. Try again later or interact more on Farcaster!'
            }, { status: 400 });
        }

        // 3. Bağlantılı kullanıcıların bilgisini al
        const connectionFids = interactions.map(i => i.targetFid);
        const connections = await getBulkUserInfo(connectionFids);

        // Skorları ekle
        const connectionsWithScores = connections.map((user, index) => ({
            ...user,
            score: interactions[index].score
        }));

        console.log(`✅ Retrieved ${connectionsWithScores.length} user profiles`);

        // 4. Layout oluştur
        const layoutConfig = {
            width: 1440,
            height: 1920,
            centerX: 720,
            centerY: 960,
            radiusX: 500,
            radiusY: 700,
            minNodeSize: 60,
            maxNodeSize: 120
        };

        const nodes = createOvalLayout(centralUser, connectionsWithScores, layoutConfig);
        console.log(`✅ Layout created with ${nodes.length} nodes`);

        // 5. SVG render
        const renderConfig = {
            width: 1440,
            height: 1920,
            backgroundColor: '#0a0a0f',
            gridColor: '#00ffff',
            neonColor: '#ff00ff'
        };

        const svg = await renderConstellationSVG(nodes, renderConfig);
        console.log(`✅ SVG rendered`);

        // 6. IPFS'e yükle
        const imageUpload = await uploadSVGToIPFS(svg, `constellation-${fid}.svg`);
        console.log(`✅ Image uploaded to IPFS: ${imageUpload.ipfsHash}`);

        // 7. Metadata oluştur ve yükle
        const metadataHash = await createAndUploadNFTMetadata(
            imageUpload.ipfsHash,
            fid,
            nodes.map(n => ({
                fid: n.fid,
                username: n.username,
                interactionScore: n.interactionScore
            }))
        );
        console.log(`✅ Metadata uploaded to IPFS: ${metadataHash}`);

        // 8. Mint bilgilerini döndür
        const tokenURI = `ipfs://${metadataHash}`;

        // 9. Kullanıcıya bildirim gönder (Neynar Managed Notifications)
        // Not: Bu işlem asenkron yapılabilir, cevabı beklemeye gerek yok
        sendNotification({
            fid,
            title: "🌟 Constellation Ready!",
            body: "Your Farcaster constellation map has been generated. Tap to view and mint!",
            targetUrl: `${request.nextUrl.origin}/constellation/${fid}` // Veya ana sayfa
        }).catch(err => console.error('Notification send error:', err));

        console.log(`✅ Ready for minting!`);

        return NextResponse.json({
            success: true,
            message: 'Constellation created! Ready to mint.',
            imageUrl: imageUpload.gatewayUrl,
            metadataUrl: `https://ipfs.io/ipfs/${metadataHash}`,
            tokenURI: tokenURI,
            fid: fid,
            contractAddress: CONTRACT_ADDRESS,
            // Frontend'de kullanılacak bilgiler
            mintData: {
                recipient: verifiedAddress || '{{USER_WALLET_ADDRESS}}', // Varsa verified address, yoksa placeholder
                fid: fid,
                tokenURI: tokenURI
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
