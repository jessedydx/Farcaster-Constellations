import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';

// Star coordinates based on the provided image structure (Center, Inner 5, Outer 10)
// These are normalized coordinates (0-1) to be independent of image resolution
// We will adjust these based on the actual image aspect ratio later
const STAR_COORDINATES = [
    // Center Star
    { x: 0.5, y: 0.5, size: 0.30 },

    // Inner Ring (5 stars)
    { x: 0.5, y: 0.23, size: 0.16 },
    { x: 0.757, y: 0.417, size: 0.16 },
    { x: 0.659, y: 0.718, size: 0.16 },
    { x: 0.341, y: 0.718, size: 0.16 },
    { x: 0.243, y: 0.417, size: 0.16 },

    // Outer Ring (10 stars)
    { x: 0.5, y: 0.08, size: 0.12 },
    { x: 0.747, y: 0.16, size: 0.12 },
    { x: 0.899, y: 0.37, size: 0.12 },
    { x: 0.899, y: 0.63, size: 0.12 },
    { x: 0.747, y: 0.84, size: 0.12 },
    { x: 0.5, y: 0.92, size: 0.12 },
    { x: 0.253, y: 0.84, size: 0.12 },
    { x: 0.101, y: 0.63, size: 0.12 },
    { x: 0.101, y: 0.37, size: 0.12 },
    { x: 0.253, y: 0.16, size: 0.12 },

    // Far Outer Ring (5 stars) - Corners & Side
    { x: 0.1, y: 0.1, size: 0.1 },
    { x: 0.9, y: 0.1, size: 0.1 },
    { x: 0.9, y: 0.9, size: 0.1 },
    { x: 0.1, y: 0.9, size: 0.1 },
    { x: 0.05, y: 0.5, size: 0.1 }
];

interface UserNode {
    username: string;
    pfpUrl: string;
    score?: number;
}

async function fetchImage(url: string): Promise<Buffer> {
    // Strategy 1: Simple Fetch (Works for most Farcaster/Cast CDN images)
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 5000
        });
        return await sharp(Buffer.from(response.data)).png().toBuffer();
    } catch (simpleError: any) {
        // Strategy 2: Browser Mode (Works for Imgur, Cloudflare, etc.)
        // Only try this if the first attempt failed (e.g. 403 Forbidden)
        console.warn(`Simple fetch failed for ${url} (${simpleError.message}), trying browser mode...`);

        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
                },
                timeout: 8000
            });
            return await sharp(Buffer.from(response.data)).png().toBuffer();
        } catch (browserError: any) {
            console.error(`All fetch attempts failed for ${url}: ${browserError.message}`);
            throw browserError; // Trigger the fallback (Initials)
        }
    }
}

async function createCircularImage(imageBuffer: Buffer, size: number): Promise<Buffer> {
    const resized = await sharp(imageBuffer)
        .resize(size, size, { fit: 'cover' })
        .toBuffer();

    const circleMask = Buffer.from(
        `<svg><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" /></svg>`
    );

    return await sharp(resized)
        .composite([{ input: circleMask, blend: 'dest-in' }])
        .png()
        .toBuffer();
}

export async function generateConstellationImage(
    centralUser: UserNode,
    interactions: UserNode[]
): Promise<Buffer> {
    const bgPath = path.join(process.cwd(), 'public', 'constellation-bg.jpg');
    const bgImage = sharp(bgPath);
    const metadata = await bgImage.metadata();

    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    const composites: sharp.OverlayOptions[] = [];

    // Combine central user and interactions
    // Ensure central user is always first and has a valid PFP or fallback
    const allUsers = [centralUser, ...interactions];

    // Limit to available star slots
    const usersToRender = allUsers.slice(0, STAR_COORDINATES.length);

    console.log(`Rendering ${usersToRender.length} users. Central: ${centralUser.username}`);

    // Separate central user (index 0) from interactions
    const centralUserNode = usersToRender[0];
    const interactionNodes = usersToRender.slice(1);

    // 1. Render Interactions (Background layers)
    for (let i = 0; i < interactionNodes.length; i++) {
        const user = interactionNodes[i];
        // Interactions start at index 1 in STAR_COORDINATES
        const coord = STAR_COORDINATES[i + 1];

        if (!coord) continue;

        const size = Math.round(Math.min(width, height) * coord.size);
        const x = Math.round(width * coord.x) - Math.round(size / 2);
        const y = Math.round(height * coord.y) - Math.round(size / 2);

        console.log(`Fetching PFP for interaction ${user.username} (Index ${i + 1})`);
        let pfpBuffer: Buffer;
        try {
            if (!user.pfpUrl) throw new Error('No PFP URL');
            pfpBuffer = await fetchImage(user.pfpUrl);
        } catch (e) {
            // Fallback: Purple background with Initial
            const initial = user.username ? user.username[0].toUpperCase() : '?';
            pfpBuffer = await sharp({
                create: {
                    width: 100,
                    height: 100,
                    channels: 4,
                    background: { r: 124, g: 58, b: 237, alpha: 1 } // Purple
                }
            })
                .composite([{
                    input: Buffer.from(`<svg><text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="Arial" font-size="60" fill="white">${initial}</text></svg>`),
                    blend: 'over'
                }])
                .png()
                .toBuffer();
        }

        const circularPfp = await createCircularImage(pfpBuffer, size);
        composites.push({ input: circularPfp, top: y, left: x });
    }

    // 2. Render Central User (Top layer)
    if (centralUserNode) {
        const coord = STAR_COORDINATES[0]; // Center star
        const size = Math.round(Math.min(width, height) * coord.size);
        const x = Math.round(width * coord.x) - Math.round(size / 2);
        const y = Math.round(height * coord.y) - Math.round(size / 2);

        console.log(`Fetching PFP for CENTRAL USER ${centralUserNode.username}`);
        let pfpBuffer: Buffer;
        try {
            if (!centralUserNode.pfpUrl) throw new Error('No PFP URL');
            pfpBuffer = await fetchImage(centralUserNode.pfpUrl);
        } catch (e) {
            console.error(`Failed to fetch Central User PFP, using fallback.`);
            // Fallback: Gold background with Initial
            const initial = centralUserNode.username ? centralUserNode.username[0].toUpperCase() : '?';
            pfpBuffer = await sharp({
                create: {
                    width: 100,
                    height: 100,
                    channels: 4,
                    background: { r: 255, g: 215, b: 0, alpha: 1 } // Gold
                }
            })
                .composite([{
                    input: Buffer.from(`<svg><text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="Arial" font-size="60" fill="white">${initial}</text></svg>`),
                    blend: 'over'
                }])
                .png()
                .toBuffer();
        }

        const circularPfp = await createCircularImage(pfpBuffer, size);
        composites.push({ input: circularPfp, top: y, left: x });
    }

    // Composite all images onto the background
    return await bgImage
        .composite(composites)
        .png()
        .toBuffer();
}
