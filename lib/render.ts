import { Node } from './layout';
import axios from 'axios';

export interface RenderConfig {
    width: number;
    height: number;
    backgroundColor: string;
    gridColor: string;
    neonColor: string;
}

// Cyber-neon SVG oluştur
export async function renderConstellationSVG(
    nodes: Node[],
    config: RenderConfig
): Promise<string> {
    // PFP'leri base64'e çevir
    const pfpDataPromises = nodes.map(async (node) => {
        try {
            const response = await axios.get(node.pfpUrl, {
                responseType: 'arraybuffer',
                timeout: 10000
            });
            const base64 = Buffer.from(response.data).toString('base64');
            const mimeType = response.headers['content-type'] || 'image/png';
            return `data:${mimeType};base64,${base64}`;
        } catch (error) {
            console.error(`Failed to load PFP for ${node.username}:`, error);
            // Fallback placeholder
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPjwvc3ZnPg==';
        }
    });

    const pfpData = await Promise.all(pfpDataPromises);

    // SVG başlangıcı
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${config.width}" height="${config.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
`;

    // Gradient tanımları
    svg += `
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0f;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#1a0a2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0a0a0f;stop-opacity:1" />
    </linearGradient>
    
    <radialGradient id="neonGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#00ffff;stop-opacity:0.8" />
      <stop offset="50%" style="stop-color:#ff00ff;stop-opacity:0.4" />
      <stop offset="100%" style="stop-color:#0000ff;stop-opacity:0" />
    </radialGradient>
    
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <filter id="strongGlow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
`;

    // Her node için clipPath tanımla
    nodes.forEach((node, index) => {
        svg += `
    <clipPath id="clip${index}">
      <circle cx="${node.x}" cy="${node.y}" r="${node.size / 2}" />
    </clipPath>
`;
    });

    svg += `
  </defs>
  
  <!-- Background -->
  <rect width="${config.width}" height="${config.height}" fill="url(#bgGradient)" />
  
  <!-- Cyber Grid -->
`;

    // Grid çizgileri
    const gridSpacing = 50;
    for (let x = 0; x <= config.width; x += gridSpacing) {
        svg += `  <line x1="${x}" y1="0" x2="${x}" y2="${config.height}" stroke="${config.gridColor}" stroke-width="0.5" opacity="0.2" />\n`;
    }
    for (let y = 0; y <= config.height; y += gridSpacing) {
        svg += `  <line x1="0" y1="${y}" x2="${config.width}" y2="${y}" stroke="${config.gridColor}" stroke-width="0.5" opacity="0.2" />\n`;
    }

    svg += `\n  <!-- Connection Lines -->\n`;

    // Merkez node (index 0)
    const centerNode = nodes[0];

    //Her node'dan merkeze bağlantı çiz
    nodes.forEach((node, index) => {
        if (index === 0) return; // Merkez node'u atla

        // Bezier curve kontrolü
        const midX = (centerNode.x + node.x) / 2;
        const midY = (centerNode.y + node.y) / 2;
        const controlX = midX + (Math.random() - 0.5) * 100;
        const controlY = midY + (Math.random() - 0.5) * 100;

        // Skor yüksekse çizgi kalın
        const lineWidth = 0.5 + (node.interactionScore / 100) * 2;
        const opacity = 0.3 + (node.interactionScore / 100) * 0.4;

        svg += `  <path d="M ${centerNode.x},${centerNode.y} Q ${controlX},${controlY} ${node.x},${node.y}" 
      stroke="url(#neonGlow)" 
      stroke-width="${lineWidth}" 
      fill="none" 
      opacity="${opacity}"
      filter="url(#glow)" />\n`;
    });

    svg += `\n  <!-- Nodes -->\n`;

    // Node'ları çiz
    nodes.forEach((node, index) => {
        const isCenter = index === 0;
        const glowColor = isCenter ? '#00ffff' : '#ff00ff';

        // Outer glow circle
        svg += `  <circle cx="${node.x}" cy="${node.y}" r="${node.size / 2 + 8}" fill="${glowColor}" opacity="0.3" filter="url(#strongGlow)" />\n`;

        // Neon border
        svg += `  <circle cx="${node.x}" cy="${node.y}" r="${node.size / 2 + 3}" fill="none" stroke="${glowColor}" stroke-width="2" opacity="0.8" filter="url(#glow)" />\n`;

        // PFP image
        svg += `  <image x="${node.x - node.size / 2}" y="${node.y - node.size / 2}" width="${node.size}" height="${node.size}" xlink:href="${pfpData[index]}" clip-path="url(#clip${index})" />\n`;

        // Inner neon ring
        svg += `  <circle cx="${node.x}" cy="${node.y}" r="${node.size / 2}" fill="none" stroke="${glowColor}" stroke-width="1.5" opacity="0.6" />\n`;

        // Username label
        if (isCenter) {
            svg += `  <text x="${node.x}" y="${node.y + node.size / 2 + 25}" text-anchor="middle" fill="#00ffff" font-family="monospace" font-size="18" font-weight="bold" filter="url(#glow)">@${node.username}</text>\n`;
        }
    });

    svg += `\n</svg>`;

    return svg;
}
