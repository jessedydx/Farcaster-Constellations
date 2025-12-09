```
import './globals.css'
import type { Metadata } from 'next'
import Head from 'next/head'

export const metadata: Metadata = {
    title: 'Farcaster Constellation NFT',
    description: 'Transform your Farcaster social network into a cyber-neon constellation NFT',
}

import { Providers } from './providers'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <meta name="fc:miniapp" content={JSON.stringify({
                    version: 'next',
                    imageUrl: 'https://farcaster-constellations-w425.vercel.app/preview.png?v=1733781100',
                    button: {
                        title: 'Create Your Constellation',
                        action: {
                            type: 'launch_miniapp',
                            name: 'Social Constellation NFT',
                            url: 'https://farcaster-constellations-w425.vercel.app'
                        }
                    }
                })} />
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}

```
