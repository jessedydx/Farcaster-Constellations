import { generateConstellationImage } from '../lib/constellation-image';
import fs from 'fs';
import path from 'path';

// Mock data with invalid PFP URL to trigger fallback
const mockCentralUser = {
    fid: 123456,
    username: 'testuser',
    displayName: 'Test User',
    pfpUrl: 'https://invalid-url.com/image.png', // Invalid URL
    bio: 'Test bio'
};

const mockInteractions = Array(20).fill(null).map((_, i) => ({
    fid: i + 1,
    username: `user${i + 1}`,
    displayName: `User ${i + 1}`,
    pfpUrl: 'https://warpcast.com/avatar.png', // Valid URL
    bio: 'Bio',
    score: 100 - i
}));

async function runDebug() {
    console.log('🧪 Starting debug generation...');
    try {
        const buffer = await generateConstellationImage(mockCentralUser, mockInteractions);
        const outputPath = path.join(process.cwd(), 'public', 'debug-constellation.png');
        fs.writeFileSync(outputPath, buffer);
        console.log(`✅ Debug image generated at: ${outputPath}`);
        console.log('👉 Check if the center star is a purple square (fallback) instead of gray/empty.');
    } catch (error) {
        console.error('❌ Generation failed:', error);
    }
}

runDebug();
