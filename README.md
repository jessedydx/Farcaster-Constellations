# 🌟 Farcaster Constellation NFT

Farcaster üzerindeki sosyal etkileşimlerini cyber-neon tarzda bir yıldız haritası (constellation) NFT'sine dönüştüren interaktif bir miniapp.

![Constellation Preview](https://via.placeholder.com/1440x1920/0a0a0f/00ffff?text=Cyber-Neon+Constellation)

## 📖 Proje Hakkında

Bu proje, Farcaster kullanıcılarının son 30 gündeki sosyal etkileşimlerini analiz ederek:
- En çok etkileşim kurulan 20 kişiyi belirler
- Oval cluster layout ile cyber-neon bir görselleştirme yapar
- IPFS'e yükler
- Base L2 üzerinde ERC-721 NFT olarak mint eder

## ✨ Özellikler

- ✅ **Etkileşim Analizi**: Reply (3 puan), Mention (2 puan), Recast (1.5 puan), Like (0.2 puan)
- ✅ **Oval Cluster Layout**: Elips formülü + collision detection
- ✅ **Cyber-Neon Görsel**: SVG tabanlı, 1440×1920 çözünürlük
- ✅ **IPFS Storage**: Pinata API ile kalıcı depolama
- ✅ **Base L2 NFT**: Gas-efficient ERC-721 kontrat
- ✅ **Farcaster Frame**: Tek tıkla NFT oluşturma

## 🚀 Kurulum

### 1. Depoyu Klonlayın

\`\`\`bash
cd "Farcaster Constellations"
\`\`\`

### 2. Bağımlılıkları Yükleyin

\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables Ayarlayın

\`\`\`bash
cp .env.example .env.local
\`\`\`

Ardından `.env.local` dosyasını düzenleyin:

\`\`\`env
NEYNAR_API_KEY=your_neynar_api_key_here
BASE_RPC_URL=https://mainnet.base.org
DEPLOYER_PRIVATE_KEY=your_private_key_here
NFT_CONTRACT_ADDRESS=will_be_filled_after_deploy
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_here
\`\`\`

#### API Anahtarlarını Nereden Alırsınız?

- **Neynar API**: [neynar.com](https://neynar.com) - Farcaster verilerine erişim için
- **Pinata**: [pinata.cloud](https://pinata.cloud) - IPFS yükleme için
- **Base RPC**: [base.org](https://base.org) - Base network için

### 4. Smart Contract'ı Deploy Edin

⚠️ **ÖNEMLİ**: Önce Solidity kontratını compile etmeniz gerekiyor.

**Seçenek A: Remix Kullanarak (Önerilen)**

1. [remix.ethereum.org](https://remix.ethereum.org) adresine gidin
2. `contracts/FarcasterConstellationNFT.sol` dosyasını yükleyin
3. Solidity Compiler'da compile edin
4. Deploy & Run kısmında:
   - Environment: "Injected Provider - MetaMask"
   - Network: Base Mainnet
   - Deploy butonuna tıklayın
5. Contract adresini kopyalayıp `.env.local`'e ekleyin

**Seçenek B: Hardhat/Foundry (İleri Seviye)**

Hardhat veya Foundry kurarak kontratı compile edip deploy edebilirsiniz.

### 5. Uygulamayı Çalıştırın

\`\`\`bash
npm run dev
\`\``

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacak.

## 🎯 Kullanım

### Frame Olarak Kullanım

1. Uygulamanızı public bir sunucuya deploy edin (Vercel önerilir)
2. Frame URL'inizi Farcaster'da paylaşın:
   \`\`\`
   https://your-domain.com/api/frame
   \`\`\`
3. Kullanıcılar "Create My Constellation" butonuna tıkladığında:
   - Otomatik olarak FID (Farcaster ID) alınır
   - Etkileşimler analiz edilir
   - Görsel oluşturulur
   - IPFS'e yüklenir
   - NFT mint edilir

## 📁 Proje Yapısı

\`\`\`
Farcaster Constellations/
├── app/
│   ├── api/
│   │   └── frame/
│   │       └── route.ts          # Frame API endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Ana sayfa
├── contracts/
│   └── FarcasterConstellationNFT.sol  # ERC-721 kontrat
├── lib/
│   ├── farcaster.ts              # Farcaster API fonksiyonları
│   ├── layout.ts                 # Oval cluster algoritması
│   ├── render.ts                 # SVG renderer
│   └── ipfs.ts                   # IPFS upload helper
├── scripts/
│   └── deploy.ts                 # Contract deploy script
├── .env.example                  # Örnek environment variables
├── package.json
└── README.md
\`\`\`

## 🔒 Güvenlik Uyarıları

### ⚠️ ASLA YAPMAYIN:
- ❌ Private key'inizi kod içine yazmayın
- ❌ `.env.local` dosyasını GitHub'a yüklemeyin
- ❌ API anahtarlarınızı paylaşmayın
- ❌ Production'da test private key kullanmayın

### ✅ MUTLAKA YAPIN:
- ✅ `.env.local` dosyasını `.gitignore`'da tutun
- ✅ Önce test ağında (Base Sepolia) test edin
- ✅ Private key'leri güvenli bir yerde saklayın
- ✅ Environment variable'ları her deploy'da kontrol edin

## 🧪 Test

### Test Ağında Deploy

Base Sepolia test ağında deneme yapmak için:

1. `.env.local`'de RPC URL'i değiştirin:
   \`\`\`
   BASE_RPC_URL=https://sepolia.base.org
   \`\`\`

2. Base Sepolia ETH alın: [faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

3. Contract'ı deploy edin ve test edin

## 🎨 Görsel Detayları

### Layout Algoritması

- **Oval Cluster**: Elips formülü kullanarak node'lar yerleştirilir
- **Skor Bazlı Mesafe**: Yüksek skor → merkeze yakın, düşük skor → dışarıda
- **Collision Detection**: 10 iterasyonlu overlap düzeltmesi
- **Random Jitter**: Doğal görünüm için ±40px rastgele sapma

### Cyber-Neon Stil

- Dark tech gradient arka plan (#0a0a0f → #1a0a2e)
- Neon grid overlay (50px spacing)
- Quadratic bezier bağlantı çizgileri
- Glow filters (Gaussian blur)
- Merkez kullanıcı: cyan (#00ffff)
- Diğer kullanıcılar: magenta (#ff00ff)

## 📊 NFT Metadata Formatı

\`\`\`json
{
  "name": "Farcaster Constellation #123",
  "description": "A cyber-neon visualization of @username's social constellation...",
  "image": "ipfs://QmXXX...",
  "attributes": [
    { "trait_type": "Central FID", "value": 123 },
    { "trait_type": "Connection Count", "value": 20 },
    { "trait_type": "Generation Date", "value": "2024-..." }
  ],
  "properties": {
    "central_fid": 123,
    "nodes": [...],
    "image_ipfs_cid": "QmXXX..."
  }
}
\`\`\`

## 🛠 Teknolojiler

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Ethers.js, Base L2, Solidity 0.8.20
- **Storage**: IPFS (Pinata)
- **API**: Neynar (Farcaster data)
- **Görsel**: SVG rendering

## 📝 Lisans

MIT License

## 🙋 Destek

Sorularınız için GitHub Issues kullanabilirsiniz.

---

**🚀 Hayalinizdeki constellation'ı oluşturun!**
