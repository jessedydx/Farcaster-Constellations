import axios from 'axios';

const PINATA_API_KEY = process.env.PINATA_API_KEY!;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY!;
const PINATA_API_URL = 'https://api.pinata.cloud';

export interface IPFSUploadResult {
    ipfsHash: string;
    pinataUrl: string;
    gatewayUrl: string;
}

// SVG string'i IPFS'e yükle
export async function uploadSVGToIPFS(svgContent: string, filename: string): Promise<IPFSUploadResult> {
    try {
        const formData = new FormData();
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        formData.append('file', blob, filename);

        const metadata = JSON.stringify({
            name: filename,
            keyvalues: {
                type: 'farcaster-constellation',
                createdAt: new Date().toISOString()
            }
        });
        formData.append('pinataMetadata', metadata);

        const response = await axios.post(
            `${PINATA_API_URL}/pinning/pinFileToIPFS`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_KEY
                },
                maxBodyLength: Infinity
            }
        );

        const ipfsHash = response.data.IpfsHash;

        return {
            ipfsHash,
            // Use Cloudflare IPFS gateway (no rate limits, better for Warpcast embeds)
            pinataUrl: `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
            gatewayUrl: `https://ipfs.io/ipfs/${ipfsHash}`
        };
    } catch (error) {
        console.error('IPFS upload error:', error);
        throw new Error('Failed to upload SVG to IPFS');
    }
}

// PNG Buffer'ı IPFS'e yükle
export async function uploadImageToIPFS(imageBuffer: Buffer, filename: string): Promise<IPFSUploadResult> {
    try {
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' });
        formData.append('file', blob, filename);

        const metadata = JSON.stringify({
            name: filename,
            keyvalues: {
                type: 'farcaster-constellation-png',
                createdAt: new Date().toISOString()
            }
        });
        formData.append('pinataMetadata', metadata);

        const response = await axios.post(
            `${PINATA_API_URL}/pinning/pinFileToIPFS`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_KEY
                },
                maxBodyLength: Infinity
            }
        );

        const ipfsHash = response.data.IpfsHash;

        return {
            ipfsHash,
            // Use Cloudflare IPFS gateway (no rate limits, better for Warpcast embeds)
            pinataUrl: `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
            gatewayUrl: `https://ipfs.io/ipfs/${ipfsHash}`
        };
    } catch (error) {
        console.error('IPFS upload error:', error);
        throw new Error('Failed to upload Image to IPFS');
    }
}

// JSON metadata'yı IPFS'e yükle
export async function uploadJSONToIPFS(jsonData: any, filename: string): Promise<IPFSUploadResult> {
    try {
        const response = await axios.post(
            `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
            jsonData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_KEY
                }
            }
        );

        const ipfsHash = response.data.IpfsHash;

        return {
            ipfsHash,
            pinataUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
            gatewayUrl: `https://ipfs.io/ipfs/${ipfsHash}`
        };
    } catch (error) {
        console.error('JSON upload error:', error);
        throw new Error('Failed to upload JSON to IPFS');
    }
}

// NFT metadata oluştur ve yükle
export async function createAndUploadNFTMetadata(
    imageIpfsHash: string,
    centralFid: number,
    nodes: Array<{ fid: number; username: string; interactionScore: number }>
): Promise<string> {
    const metadata = {
        name: `Farcaster Constellation #${centralFid}`,
        description: `A cyber-neon visualization of @fid:${centralFid}'s social constellation on Farcaster. This NFT represents the top 20 connections based on interaction scores from the last 30 days.`,
        image: `ipfs://${imageIpfsHash}`,
        attributes: [
            {
                trait_type: 'Central FID',
                value: centralFid
            },
            {
                trait_type: 'Connection Count',
                value: nodes.length - 1 // Merkez hariç
            },
            {
                trait_type: 'Generation Date',
                value: new Date().toISOString()
            }
        ],
        properties: {
            central_fid: centralFid,
            nodes: nodes.map(n => ({
                fid: n.fid,
                username: n.username,
                interaction_score: n.interactionScore
            })),
            image_ipfs_cid: imageIpfsHash
        }
    };

    const result = await uploadJSONToIPFS(metadata, `constellation-${centralFid}-metadata.json`);
    return result.ipfsHash;
}
