# 🤖 AI-RULES.md

Bu dosya, Farcaster Constellation NFT projesinin yapımında kullanılan tüm AI davranış kurallarını içerir.

## 🧬 1. AI DAVRANIŞ KURALLARI

### Temel Kurallar
1. **Türkçe İletişim**: Tüm açıklamalar Türkçe olmalıdır
2. **Detaylı Açıklama**: Her şey hiç bilmeyen birine anlatır gibi açıklanmalıdır
3. **Rehber Formatı**: Adım adım, madde madde ilerleme zorunludur
4. **Gerçek Kod**: Pseudo kod değil, çalışan gerçek kod yazılmalıdır
5. **Atlama Yok**: Hiçbir adım atlanmamalıdır

### Her Adımın İçermesi Gerekenler
1. Açıklama (Ne yapıyoruz?)
2. "Şimdi şu adımları izle:" direktifleri
3. Gerçek, çalışan kod
4. Kod açıklaması (Her satır ne işe yarar?)
5. Mini özet ("Bu adımda ne yaptık?" maddeleri)

### Dosya ve Klasör Yönetimi
1. Dosya isimlerini tam ve net söyle
2. Terminal komutlarını detaylı ver
3. VS Code'da hangi dosyanın açılacağını belirt
4. Klasör yapısını açıkla

## 🔐 2. GÜVENLİK KURALLARI

### Kritik Güvenlik Kuralları
1. **ASLA** private key'i kod içine gömme
2. **ASLA** RPC URL'i hardcode etme
3. **ASLA** API anahtarlarını kod içinde bırakma
4. **DAIMA** `.env.local` dosyası kullan
5. **DAIMA** `.env.example` ile placeholder ver

### Kullanıcı Uyarıları
Her kurulum adımında şu uyarılar verilmelidir:
- ⚠️ "Private key'ini paylaşma"
- ⚠️ "Bu dosyayı GitHub'a yükleme"
- ⚠️ "Ana ağa deploy etmeden önce test ağında dene"
- ⚠️ "Yanlış RPC veya yanlış private key → para kaybı"

### Hata Yönetimi
1. Eksik dependency → çözüm önerisi ver
2. API hatası → alternatif yol göster
3. Network hatası → troubleshooting adımları listele

## 📚 3. REHBER ADIM LİSTESİ

Rehber mutlaka şu adımları içermelidir:

### ✅ Adım 1 – Next.js Proje Kurulumu
- `package.json` oluştur
- `tsconfig.json` ayarla
- `next.config.js` yap
- Dependencies yükle

### ✅ Adım 2 – .env Ayarları + Neynar Bağlantısı
- `.env.example` oluştur
- `.env.local` için talimat ver
- API anahtarı nereden alınır açıkla

### ✅ Adım 3 – Farcaster Interaction Fonksiyonları
- `lib/farcaster.ts` yaz
- Neynar API kullanımını açıkla
- Etkileşim skorlama sistemini detaylandır

### ✅ Adım 4 – Oval Cluster Layout
- `lib/layout.ts` oluştur
- Elips formülünü açıkla
- Collision detection algoritmasını yaz

### ✅ Adım 5 – Cyber-Neon SVG Üretimi
- `lib/render.ts` kod
- SVG gradient ve filter tanımlarını ekle
- PFP loading ve base64 dönüşümünü yap

### ✅ Adım 6 – NFT Kontratı
- `contracts/FarcasterConstellationNFT.sol` yaz
- ERC-721 standardını uygula
- FID bazlı uniklik kontrolü ekle

### ✅ Adım 7 – Deploy Script
- `scripts/deploy.ts` oluştur
- Ethers.js kullanımını göster
- Contract compile uyarısı ver

### ✅ Adım 8 – IPFS Upload Helper
- `lib/ipfs.ts` yaz
- Pinata API entegrasyonu yap
- Metadata format açıkla

### ✅ Adım 9 – Frame / Miniapp Endpointleri
- `app/api/frame/route.ts` kod
- GET ve POST handler'ları yaz
- Farcaster Frame spec'ini uygula

### ✅ Adım 10 – Final Checklist
- Tüm dosyaların kontrolü
- Test adımları
- Deploy prosedürü
- Troubleshooting

### ✅ Sonunda: AI-RULES.md
- Tüm kuralları bu dosyaya yaz
- Madde madde listele
- Eksik bırakma

## 🧠 4. TASARIM ZORUNLULUKLARI

### Oval Cluster Modeli Gereksinimleri
1. **21 Node**: 1 merkez + 20 bağlantı
2. **Elips Formülü**: `x = a*cos(θ)`, `y = b*sin(θ)`
3. **Random Jitter**: Doğal görünüm için ±40px
4. **Collision Fix**: 10 iterasyon overlap düzeltmesi
5. **Merkez Koordinatları**: centerX, centerY tanımlanmalı
6. **Skor Bazlı Boyut**: interaction score → node size

### Cyber-Neon Stil Zorunlulukları
1. Dark-tech gradient arka plan
2. Neon glow layers (feGaussianBlur)
3. PFP circle + clipPath kullan
4. Quadratic bezier bağlantı çizgileri
5. 1440×1920 çözünürlük (mutlak)

### SVG Render Kuralları
1. Arka plan: dark-tech gradient (#0a0a0f → #1a0a2e)
2. Neon glow katmanları ekle
3. Node PFP: circle içinde clipPath
4. Bağlantı: quadratic bezier + gradient
5. Çözünürlük: 1440×1920 (değiştirilemez)

### NFT Metadata Formatı
```json
{
  "name": "Farcaster Constellation #[FID]",
  "description": "...",
  "image": "ipfs://...",
  "attributes": [...],
  "properties": {
    "central_fid": number,
    "nodes": [{fid, username, interactionScore}],
    "image_ipfs_cid": "string"
  }
}
```

## 🏗 5. KOD ZORUNLULUKLARI

### Zorunlu Dosyalar ve İçerikleri

#### lib/farcaster.ts
- `getUserInfo(fid)` fonksiyonu
- `analyzeInteractions(fid)` fonksiyonu
- `getBulkUserInfo(fids[])` fonksiyonu
- Neynar API entegrasyonu
- Etkileşim skorlama: reply:3, mention:2, recast:1.5, like:0.2

#### lib/layout.ts
- `createOvalLayout()` fonksiyonu
- Elips formülü implementation
- `performCollisionDetection()` fonksiyonu
- Random jitter ekleme
- Boundary checking

#### lib/render.ts
- `renderConstellationSVG()` fonksiyonu
- PFP'leri base64'e çevirme
- SVG gradient tanımları
- Glow filter uygulamaları
- Neon çizgi çizimi

#### lib/ipfs.ts
- `uploadSVGToIPFS()` fonksiyonu
- `uploadJSONToIPFS()` fonksiyonu
- `createAndUploadNFTMetadata()` fonksiyonu
- Pinata API kullanımı

#### contracts/FarcasterConstellationNFT.sol
- ERC721 + ERC721URIStorage + Ownable
- `mintConstellation()` fonksiyonu
- `fidToTokenId` mapping
- `hasConstellation()` view fonksiyonu
- Event emission

#### scripts/deploy.ts
- Ethers.js provider setup
- Wallet bağlantısı
- Balance check
- Contract deployment (commented template)
- .env.local güncelleme

#### app/api/frame/route.ts
- POST handler: constellation oluşturma
- GET handler: Frame HTML dönme
- Tam süreç orkestratörü
- Error handling

### Kod Standartları
1. **TypeScript**: Her dosya TypeScript olmalı
2. **Tip Güvenliği**: Interface ve type tanımları zorunlu
3. **Error Handling**: try-catch blokları gerekli
4. **Console Logging**: Her major adımda log at
5. **Yorumlar**: Karmaşık kısımlar yorumlanmalı

## 🧾 6. CEVAP FORMATI

### Cevap Akışı
1. **Proje Tanımı**: Sade Türkçe, detaylı
2. **"Şimdi adım adım rehbere başlıyoruz"** cümlesi
3. **ADIM 1** (tam detay)
4. **ADIM 2** (tam detay)
5. **...** (devam)
6. **ADIM 10**
7. **Final Checklist**
8. **AI-RULES.md**

### Her Adım Formatı
```markdown
## Adım X - [Başlık]

**Ne Yapıyoruz?**
[Açıklama]

**Şimdi şu adımları izle:**
1. [Madde 1]
2. [Madde 2]
3. [Madde 3]

**Kod:**
```[language]
[Gerçek kod]
```

**Kod Açıklaması:**
- Satır X: [Açıklama]
- Satır Y: [Açıklama]

**Bu Adımda Ne Yaptık?**
- ✅ [Başarı 1]
- ✅ [Başarı 2]
```

### Zorunlu Bileşenler
- ✅ Emoji kullanımı (okunabilirlik için)
- ✅ Code blocks (syntax highlighting)
- ✅ Madde işaretleri (liste formatı)
- ✅ Uyarı kutuları (⚠️ işareti)
- ✅ Dosya yolları (tam path)

## 🧿 7. SON TALİMAT

### Genel Prensip
TÜM BU KURALLARA UYGUN OLARAK:
1. Sıfırdan başla
2. Adım adım ilerle
3. Hiçbir şeyi atlama
4. Gerçek kod yaz
5. Tüm dosyaları oluştur
6. Güvenlik uyarılarını ver
7. AI-RULES.md'yi en sona ekle

### Kalite Kontrol
Her cevap şunları içermelidir:
- ✅ 10 ana adım
- ✅ Tüm zorunlu dosyalar (7 adet)
- ✅ Her dosyada gerçek kod
- ✅ Güvenlik uyarıları
- ✅ Terminal komutları
- ✅ Açıklayıcı yorumlar
- ✅ AI-RULES.md dosyası

### Eksik Olmaması Gerekenler
- ❌ Pseudo kod
- ❌ "TODO" notları
- ❌ Yarım bırakılmış fonksiyonlar
- ❌ Placeholder değerler (kod içinde)
- ❌ Eksik import'lar
- ❌ Syntax hataları

## 📋 8. CHECKLIST (AI için)

Cevabı vermeden önce kontrol et:

### Dosya Kontrolü
- [ ] package.json ✅
- [ ] tsconfig.json ✅
- [ ] next.config.js ✅
- [ ] .env.example ✅
- [ ] lib/farcaster.ts ✅
- [ ] lib/layout.ts ✅
- [ ] lib/render.ts ✅
- [ ] lib/ipfs.ts ✅
- [ ] contracts/FarcasterConstellationNFT.sol ✅
- [ ] scripts/deploy.ts ✅
- [ ] app/api/frame/route.ts ✅
- [ ] README.md ✅
- [ ] AI-RULES.md ✅

### İçerik Kontrolü
- [ ] Her dosya gerçek kod içeriyor
- [ ] Hiçbir TODO yok
- [ ] Tüm fonksiyonlar tamamlanmış
- [ ] Güvenlik uyarıları mevcut
- [ ] Terminal komutları verilmiş
- [ ] Türkçe açıklamalar yazılmış

### Format Kontrolü
- [ ] Adım adım rehber formatı
- [ ] Madde madde listeleme
- [ ] Kod blokları syntax highlighted
- [ ] Emoji kullanılmış
- [ ] Uyarı işaretleri konulmuş

## 🎯 9. SONUÇ

Bu AI-RULES.md dosyası, Farcaster Constellation NFT projesinin yapımında kullanılan tüm kuralları içerir. Her AI asistanı bu dosyayı okuyarak projeyi aynı kalitede yeniden oluşturabilmeli veya genişletebilmelidir.

**Temel Prensipler:**
1. Güvenlik her şeyden önce gelir
2. Açıklık ve detay zorunludur
3. Gerçek, çalışan kod yazılır
4. Kullanıcı eğitimi önceliktir
5. Hiçbir adım atlanmaz

---

**Son Güncelleme**: Bu dosya projenin bir parçası olarak her zaman güncel tutulmalıdır.
