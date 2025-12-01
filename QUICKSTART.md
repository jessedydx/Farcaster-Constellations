# 🎯 Farcaster Constellation NFT - Hızlı Başlangıç

## 🚀 Projen Hazır!

Tüm dosyalar oluşturuldu. Şimdi sadece birkaç adımda projeyi çalıştırabilirsin.

## ⚡ Hızlı Kurulum (5 Dakika)

### 1. API Anahtarlarını Al

#### a) Neynar API Key
- [neynar.com](https://neynar.com) → Sign Up
- API Keys → Create New Key
- Kopyala

#### b) Pinata Keys
- [pinata.cloud](https://pinata.cloud) → Sign Up
- API Keys → New Key → Admin
- API Key ve Secret'ı kopyala

### 2. .env.local Dosyasını Doldur

\`\`\`bash
cp .env.example .env.local
code .env.local
\`\`\`

Şunları doldur:
- `NEYNAR_API_KEY` → Neynar key'inizi buraya
- `PINATA_API_KEY` → Pinata key
- `PINATA_SECRET_KEY` → Pinata secret
- `DEPLOYER_PRIVATE_KEY` → MetaMask private key (⚠️ test wallet kullan!)
- `BASE_RPC_URL` → `https://mainnet.base.org` (olduğu gibi bırak)

### 3. Development Server'ı Başlat

\`\`\`bash
npm run dev
\`\`\`

[http://localhost:3000](http://localhost:3000) → Projen çalışıyor! 🎉

### 4. Smart Contract Deploy Et

#### Remix ile (En Kolay):
1. [remix.ethereum.org](https://remix.ethereum.org) aç
2. `contracts/FarcasterConstellationNFT.sol` içeriğini kopyala
3. Remix'te yeni dosya oluştur, yapıştır
4. Compile et
5. MetaMask'ı Base Mainnet'e bağla
6. Deploy et
7. Contract adresini `.env.local`'e ekle:
   \`\`\`
   NFT_CONTRACT_ADDRESS=0x...
   \`\`\`

### 5. Test Et!

Tarayıcıda: `http://localhost:3000/api/frame`

Frame HTML'ini göreceksin.

## 📁 Oluşturulan Dosyalar

### Core Logic
- ✅ `lib/farcaster.ts` - Farcaster API ve etkileşim analizi
- ✅ `lib/layout.ts` - Oval cluster layout algoritması
- ✅ `lib/render.ts` - Cyber-neon SVG renderer
- ✅ `lib/ipfs.ts` - IPFS upload helper (Pinata)

### Smart Contract
- ✅ `contracts/FarcasterConstellationNFT.sol` - ERC-721 NFT kontratı
- ✅ `scripts/deploy.ts` - Deploy script

### API
- ✅ `app/api/frame/route.ts` - Farcaster Frame endpoint

### UI
- ✅ `app/page.tsx` - Ana sayfa
- ✅ `app/layout.tsx` - Root layout
- ✅ `app/globals.css` - Global stiller

### Config
- ✅ `package.json` - Dependencies
- ✅ `tsconfig.json` - TypeScript
- ✅ `next.config.js` - Next.js
- ✅ `tailwind.config.js` - Tailwind CSS

### Docs
- ✅ `README.md` - Kapsamlı dokümantasyon
- ✅ `AI-RULES.md` - AI davranış kuralları
- ✅ `.env.example` - Örnek environment variables

## 🎨 Proje Özellikleri

### Teknik
- **Framework**: Next.js 14 + TypeScript
- **Blockchain**: Base L2, Ethers.js v6
- **Storage**: IPFS (Pinata)
- **API**: Neynar (Farcaster)
- **Styling**: Tailwind CSS

### Fonksiyonel
- 🌐 **Etkileşim Analizi**: Son 30 gün, 4 tip etkileşim
- 🎨 **Oval Cluster**: Elips formülü + collision detection
- ✨ **Cyber-Neon**: SVG + glow filters, 1440×1920
- 💾 **IPFS**: Kalıcı storage
- ⛓ **NFT**: Base L2 ERC-721

## ⚠️ Önemli Güvenlik Notları

### ASLA YAPMAYIN
- ❌ Private key'i GitHub'a yüklemeyin
- ❌ `.env.local`'i commit etmeyin
- ❌ Ana cüzdanınızı kullanmayın

### MUTLAKA YAPIN
- ✅ Test cüzdanı oluşturun
- ✅ Önce Base Sepolia'da test edin
- ✅ `.gitignore` kontrol edin
- ✅ API key'leri gizli tutun

## 🚀 Production Deploy

### Vercel'e Deploy
1. GitHub'a push et
2. [vercel.com](https://vercel.com) → Import Project
3. Environment variables ekle
4. Deploy!

Frame URL'iniz: `https://your-project.vercel.app/api/frame`

## 📖 Detaylı Rehber

- **Türkçe Rehber**: `walkthrough.md` (artifacts klasöründe)
- **İngilizce Docs**: `README.md`
- **AI Kuralları**: `AI-RULES.md`

## 🆘 Sorun mu Var?

### Sık Karşılaşılan Sorunlar

1. **Module not found**
   \`\`\`bash
   npm install
   \`\`\`

2. **API Error 401**
   - `.env.local` kontrol et
   - API key'ler doğru mu?

3. **Contract deployment fail**
   - Base Mainnet'te ETH var mı?
   - MetaMask doğru network'te mi?

4. **IPFS upload error**
   - Pinata API keys doğru mu?
   - Internet bağlantın aktif mi?

## 🎉 Başarılar!

Artık Farcaster kullanıcıları için cyber-neon constellation NFT'leri oluşturabilirsin!

**Oluşturulan Toplam Dosya**: 15+
**Toplam Kod Satırı**: ~1500+
**Hazırlık Süresi**: 5 dakika
**İlk NFT Mint Süresi**: ~2 dakika

---

**🌟 İyi eğlenceler!**
