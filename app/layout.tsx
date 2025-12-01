import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Farcaster Constellation NFT',
    description: 'Transform your Farcaster social network into a cyber-neon constellation NFT',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
