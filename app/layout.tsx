import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Farcaster Constellation NFT',
    description: 'Transform your Farcaster social network into a cyber-neon constellation NFT',
    other: {
        'fc:miniapp': JSON.stringify({
            version: 'next',
            imageUrl: 'https://farcaster-constellations-w425.vercel.app/preview.png',
            button: {
                title: 'Create Your Constellation',
                action: {
                    type: 'launch_miniapp',
                    name: 'Social Constellation NFT',
                    url: 'https://farcaster-constellations-w425.vercel.app'
                }
            }
        })
    }
}

import { Providers } from './providers'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
