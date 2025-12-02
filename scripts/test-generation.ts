import { generateConstellationImage } from '../lib/constellation-image';
import fs from 'fs/promises';
import path from 'path';

async function testGeneration() {
    console.log('Starting test generation...');

    const centralUser = {
        username: 'testuser',
        pfpUrl: 'https://github.com/shadcn.png', // Reliable placeholder
        score: 100
    };

    const interactions = Array(20).fill(null).map((_, i) => ({
        username: `user${i}`,
        pfpUrl: `https://github.com/vercel.png`, // Another reliable placeholder
        score: 100 - i * 5
    }));

    try {
        const imageBuffer = await generateConstellationImage(centralUser, interactions);
        const outputPath = path.join(process.cwd(), 'public', 'test-constellation.png');
        await fs.writeFile(outputPath, imageBuffer);
        console.log(`✅ Test image generated at: ${outputPath}`);
    } catch (error) {
        console.error('❌ Error generating image:', error);
    }
}

testGeneration();
