import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo, analyzeInteractions, getBulkUserInfo, getVerifiedAddress } from '@/lib/farcaster';
import { createOvalLayout } from '@/lib/layout';
import { renderConstellationSVG } from '@/lib/render';
import { uploadSVGToIPFS, uploadImageToIPFS, createAndUploadNFTMetadata } from '@/lib/ipfs';
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
        // Note: Assuming uploadImageToIPFS is the correct function name now, replacing uploadSVGToIPFS
        const imageUpload = await uploadImageToIPFS(imageBuffer, `constellation-${fid}.png`);
        console.log(`✅ Image uploaded to IPFS: ${imageUpload.ipfsHash}`);

        // Get verified address for the user
        const verifiedAddress = await getVerifiedAddress(fid);

        // 6. Metadata oluştur ve yükle
        // Note: We need to adapt createAndUploadNFTMetadata or just pass the hash
        // The original code passed 'nodes' which we don't have in the same format from generateConstellationImage
        // But we have 'connectionsWithScores' which is similar.

        const metadataHash = await createAndUploadNFTMetadata(
            imageUpload.ipfsHash,
            fid,
            connectionsWithScores.map(n => ({
                fid: n.fid,
                username: n.username,
                interactionScore: n.score || 0
            }))
        );
        console.log(`✅ Metadata uploaded to IPFS: ${metadataHash}`);

        // 7. Mint bilgilerini döndür
        const tokenURI = `ipfs://${metadataHash}`;

        // 8. Kullanıcıya bildirim gönder
        sendNotification({
            fid,
            title: "🌟 Constellation Ready!",
            body: "Your Farcaster constellation map has been generated. Tap to view and mint!",
            targetUrl: `${request.nextUrl.origin}/constellation/${fid}`
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
                recipient: verifiedAddress || '{{USER_WALLET_ADDRESS}}',
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
