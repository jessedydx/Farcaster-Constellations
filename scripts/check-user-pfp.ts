import axios from 'axios';
import sharp from 'sharp';
import * as dotenv from 'dotenv';
import path from 'path';

import fs from 'fs';

// Load environment variables manually
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envConfig = envFile.split('\n').reduce((acc, line) => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            acc[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
        }
        return acc;
    }, {} as any);
    process.env.NEYNAR_API_KEY = envConfig.NEYNAR_API_KEY || process.env.NEYNAR_API_KEY;
} catch (e) {
    console.error('Failed to read .env.local', e);
}

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

async function checkUserPFP(username: string) {
    if (!NEYNAR_API_KEY) {
        console.error('❌ NEYNAR_API_KEY not found in .env.local');
        return;
    }
    console.log(`🔑 API Key loaded: ${NEYNAR_API_KEY.substring(0, 5)}...`);


    console.log(`🔍 Checking PFP for user: @${username}`);

    try {
        // 1. Get User Info by Username
        const userUrl = `https://api.neynar.com/v2/farcaster/user/search?q=${username}&viewer_fid=3`;
        const userResponse = await axios.get(userUrl, {
            headers: { 'api_key': NEYNAR_API_KEY }
        });

        const user = userResponse.data.result.users[0];

        if (!user) {
            console.error('❌ User not found');
            return;
        }

        console.log(`✅ User found: ${user.display_name} (FID: ${user.fid})`);
        console.log(`🖼️ PFP URL: ${user.pfp_url}`);

        if (!user.pfp_url) {
            console.error('❌ User has no PFP URL');
            return;
        }

        // 2. Try to fetch the image
        console.log('⬇️ Attempting to download image...');
        try {
            const imageResponse = await axios.get(user.pfp_url, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
                }
            });

            console.log(`✅ Image downloaded. Size: ${imageResponse.data.length} bytes`);
            console.log(`📊 Status: ${imageResponse.status} ${imageResponse.statusText}`);
            console.log(`📝 Content-Type: ${imageResponse.headers['content-type']}`);

            // 3. Try to process with sharp
            console.log('⚙️ Processing with sharp...');
            const metadata = await sharp(imageResponse.data).metadata();
            console.log(`✅ Valid Image! Format: ${metadata.format}, Width: ${metadata.width}, Height: ${metadata.height}`);

        } catch (imgError: any) {
            console.error('❌ Failed to download/process image:');
            if (imgError.response) {
                console.error(`   Status: ${imgError.response.status}`);
                console.error(`   Headers:`, imgError.response.headers);
            } else {
                console.error(`   Error: ${imgError.message}`);
            }
        }

    } catch (error: any) {
        console.error('❌ API Error:', error.message);
        if (error.response) {
            console.error('   Response:', error.response.data);
        }
    }
}

// Check for jesse7.eth as requested
checkUserPFP('jesse7.eth');
