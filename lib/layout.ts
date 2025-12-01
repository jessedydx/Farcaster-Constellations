export interface Node {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
    x: number;
    y: number;
    size: number;
    interactionScore: number;
}

export interface LayoutConfig {
    width: number;
    height: number;
    centerX: number;
    centerY: number;
    radiusX: number; // Oval genişliği
    radiusY: number; // Oval yüksekliği
    minNodeSize: number;
    maxNodeSize: number;
}

// Oval cluster layoutu oluştur
export function createOvalLayout(
    centralUser: { fid: number; username: string; displayName: string; pfpUrl: string },
    connections: Array<{ fid: number; username: string; displayName: string; pfpUrl: string; score: number }>,
    config: LayoutConfig
): Node[] {
    const nodes: Node[] = [];

    // Merkez kullanıcıyı tam ortaya yerleştir
    const centerNode: Node = {
        ...centralUser,
        x: config.centerX,
        y: config.centerY,
        size: config.maxNodeSize * 1.2, // Merkez biraz daha büyük
        interactionScore: 0
    };
    nodes.push(centerNode);

    // Skor normalizasyonu
    const maxScore = Math.max(...connections.map(c => c.score), 1);

    // Her kullanıcı için konum hesapla
    connections.forEach((connection, index) => {
        const normalizedScore = connection.score / maxScore;

        // Elips üzerinde açı hesapla
        const angle = (index / connections.length) * 2 * Math.PI;

        // Skor low → external, skor high → center'a yakın
        const distanceMultiplier = 0.5 + (1 - normalizedScore) * 0.5; // 0.5 ile 1.0 arası

        // Elips formülü: x = a*cos(θ), y = b*sin(θ)
        let nodeX = config.centerX + config.radiusX * distanceMultiplier * Math.cos(angle);
        let nodeY = config.centerY + config.radiusY * distanceMultiplier * Math.sin(angle);

        // Random jitter ekle (doğal görünüm için)
        const jitterX = (Math.random() - 0.5) * 40;
        const jitterY = (Math.random() - 0.5) * 40;
        nodeX += jitterX;
        nodeY += jitterY;

        // Node boyutu skorla orantılı
        const nodeSize = config.minNodeSize + (config.maxNodeSize - config.minNodeSize) * normalizedScore;

        nodes.push({
            fid: connection.fid,
            username: connection.username,
            displayName: connection.displayName,
            pfpUrl: connection.pfpUrl,
            x: nodeX,
            y: nodeY,
            size: nodeSize,
            interactionScore: connection.score
        });
    });

    // Collision detection ve düzeltme
    performCollisionDetection(nodes, config);

    return nodes;
}

// Collision detection
function performCollisionDetection(nodes: Node[], config: LayoutConfig): void {
    const iterations = 10; // Kaç iterasyon collision düzeltmesi yapılacak
    const minDistance = 15; // Minimum node arası mesafe

    for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const nodeA = nodes[i];
                const nodeB = nodes[j];

                const dx = nodeB.x - nodeA.x;
                const dy = nodeB.y - nodeA.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDist = (nodeA.size + nodeB.size) / 2 + minDistance;

                if (distance < minDist && distance > 0) {
                    // Overlap var, düzelt
                    const overlap = minDist - distance;
                    const moveX = (dx / distance) * overlap * 0.5;
                    const moveY = (dy / distance) * overlap * 0.5;

                    // Merkez node hareket etmesin (index 0)
                    if (i !== 0) {
                        nodeA.x -= moveX;
                        nodeA.y -= moveY;
                    }
                    if (j !== 0) {
                        nodeB.x += moveX;
                        nodeB.y += moveY;
                    }
                }
            }
        }
    }

    // Sınırları kontrol et
    nodes.forEach((node, index) => {
        if (index === 0) return; // Merkez node hariç

        const padding = node.size;
        if (node.x - padding < 0) node.x = padding;
        if (node.x + padding > config.width) node.x = config.width - padding;
        if (node.y - padding < 0) node.y = padding;
        if (node.y + padding > config.height) node.y = config.height - padding;
    });
}
