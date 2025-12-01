# 📋 SENİN YAPMAMIZ GEREKEN İŞLER - Detaylı Rehber

> **Not**: Terminal işlerini ben hallettim. Sen sadece bu dosyadaki adımları takip et!

## ✅ Terminal'de Tamamlananlar (Benim Yaptıklarım)

- ✅ Tüm proje dosyaları oluşturuldu
- ✅ `npm install` tamamlandı
- ✅ Tailwind CSS kuruldu
- ✅ `.env.local` dosyası oluşturuldu
- ✅ Proje hazır, sadece API key'ler gerekli!

---

## 🎯 SENİN YAPMAMIZ GEREKEN 5 ŞEY

### 📝 Kontrol Listesi

- [ ] **İŞ 1**: Neynar API Key Al (5 dakika)
- [ ] **İŞ 2**: Pinata API Keys Al (5 dakika)
- [ ] **İŞ 3**: .env.local Dosyasını Doldur (2 dakika)
- [ ] **İŞ 4**: Remix'te Contract Deploy Et (10 dakika)

**Toplam Süre**: ~22 dakika

**🔒 MetaMask Private Key GEREKMİYOR! Çok daha güvenli!**

---

## 🔑 İŞ 1: Neynar API Key Almak

### Neynar Nedir?
Farcaster verilerine erişmek için kullandığımız API servisi.

### Adım Adım:

#### 1.1. Siteye Git
🔗 [https://neynar.com](https://neynar.com) adresine git

#### 1.2. Kayıt Ol
- Sağ üstte **"Sign Up"** butonuna tıkla
- Email adresini gir
- Şifreni belirle
- **"Create Account"** tıkla
- Email'ine gelen linke tıkla (doğrulama)

#### 1.3. Dashboard'a Git
- Login olduktan sonra Dashboard'a yönlendirileceksin
- Sol menüde **"API Keys"** sekmesini bul

#### 1.4. API Key Oluştur
- **"Create New Key"** butonuna tıkla
- Key Name: `Farcaster Constellation` (veya istediğin bir isim)
- **"Create"** tıkla

#### 1.5. Key'i Kopyala
- Oluşturulan API key görünecek
- Yanındaki **COPY** ikonuna tıkla
- 📋 **Kopyalandı!**

> ⚠️ **ÖNEMLİ**: Bu key'i bir yere not al, sonra kullanacağız!

**Örnek key formatı**: `ney_xxxxxxxxxxxxxxxxxxxxx`

---

## 📌 İŞ 2: Pinata API Keys Almak

### Pinata Nedir?
IPFS'e dosya yüklemek için kullandığımız servis. Görselleri burada saklayacağız.

### Adım Adım:

#### 2.1. Siteye Git
🔗 [https://pinata.cloud](https://pinata.cloud) adresine git

#### 2.2. Kayıt Ol
- **"Start Free"** veya **"Sign Up"** butonuna tıkla
- Email adresini gir
- Şifreni belirle
- **"Create Account"** tıkla
- Email doğrulama yap

#### 2.3. Dashboard'a Git
- Login olduktan sonra dashboard açılacak
- Sol menüde **"API Keys"** sekmesini bul

#### 2.4. Yeni API Key Oluştur
- **"New Key"** butonuna tıkla (sağ üstte)
- **Admin** yetkisi seç (toggle ile aktif et)
- Key Name: `Farcaster Constellation NFT`
- **"Create Key"** tıkla

#### 2.5. Keys'leri Kopyala
Popup pencerede 2 şey göreceksin:
1. **API Key** → Kopyala ve not al
2. **API Secret** → Kopyala ve not al

> ⚠️ **DİKKAT**: Secret sadece bir kez gösterilir! Mutlaka not al!

**Örnek format**:
- API Key: `f1a2b3c4d5e6f7g8h9i0`
- API Secret: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`

---

## � İŞ 3: .env.local Dosyasını Doldurmak

### VS Code'da Dosyayı Aç

Terminal'de (ben çalıştıracağım):
```bash
code .env.local
```

### Şu Değerleri Gir:

Dosya şöyle görünüyor:

```env
NEYNAR_API_KEY=your_neynar_api_key_here
BASE_RPC_URL=https://mainnet.base.org
NFT_CONTRACT_ADDRESS=
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_here
```

### Doldur:

1. **NEYNAR_API_KEY** → İŞ 1'de aldığın Neynar key'i yapıştır
2. **BASE_RPC_URL** → `https://mainnet.base.org` (değiştirme!)
3. **NFT_CONTRACT_ADDRESS** → Şimdilik boş bırak (İŞ 4'te dolacak)
4. **PINATA_API_KEY** → İŞ 2'de aldığın Pinata API Key
5. **PINATA_SECRET_KEY** → İŞ 2'de aldığın Pinata Secret

### Örnek Dolu Hali:

```env
NEYNAR_API_KEY=ney_abc123xyz456def789
BASE_RPC_URL=https://mainnet.base.org
NFT_CONTRACT_ADDRESS=
PINATA_API_KEY=f1a2b3c4d5e6f7g8h9i0
PINATA_SECRET_KEY=a1b2c3d4e5f6g7h8...xyz
```

### Kaydet!

Dosyayı kaydet: `⌘ + S` (Mac) veya `Ctrl + S` (Windows)

✅ **Tamamlandı!**

---

## 🚀 İŞ 4: Smart Contract'ı Remix'te Deploy Etmek

### Remix Nedir?
Online Solidity IDE. Contract'ımızı burada compile edip deploy edeceğiz.

### Adım Adım:

#### 5.1. Remix'i Aç
🔗 [https://remix.ethereum.org](https://remix.ethereum.org) adresine git

#### 5.2. Yeni Dosya Oluştur

1. Sol tarafta **"contracts"** klasörünü gör
2. Klasöre sağ tıkla → **"New File"**
3. Dosya adı: `FarcasterConstellationNFT.sol`
4. Enter

#### 5.3. Contract Kodunu Kopyala

VS Code'da aç:
```
Desktop/Farcaster Constellations/contracts/FarcasterConstellationNFT.sol
```

**Tüm kodu kopyala** (`⌘ + A` → `⌘ + C`)

#### 5.4. Remix'e Yapıştır

Remix'teki yeni dosyaya yapıştır (`⌘ + V`)

#### 5.5. Compile Et

1. Sol menüde **"Solidity Compiler"** ikonuna tıkla (3. ikon)
2. Compiler version: `0.8.20` seç
3. **"Compile FarcasterConstellationNFT.sol"** butonuna tıkla
4. ✅ Yeşil tik göreceksin = Başarılı!

> ⚠️ **Hata Alırsan**: OpenZeppelin import'ları otomatik indirilmeli. 10-20 saniye bekle.

#### 5.6. Deploy Et

1. Sol menüde **"Deploy & Run Transactions"** ikonuna tıkla (4. ikon)
2. **ENVIRONMENT**: `Injected Provider - MetaMask` seç
3. MetaMask popup açılacak:
   - Network: **Base Mainnet** olmalı
   - Hesap: **Farcaster Test** cüzdanı olmalı
   - **"Connect"** tıkla
4. **CONTRACT**: `FarcasterConstellationNFT` seçili olmalı
5. Turuncu **"Deploy"** butonuna tıkla
6. MetaMask popup:
   - Gas fee görünecek (~$0.50-1)
   - **"Confirm"** tıkla
7. ⏳ 10-15 saniye bekle...
8. ✅ **Deployed!**

#### 5.7. Contract Adresini Kopyala

Deploy sonrası:
1. Alt tarafta **"Deployed Contracts"** bölümünde contract görünecek
2. Contract adresinin yanındaki **COPY** ikonuna tıkla
3. 📋 Kopyalandı!

**Örnek adres**: `0x1234567890abcdef1234567890abcdef12345678`

#### 5.8. Contract Adresini .env.local'e Ekle

VS Code'da `.env.local` dosyasını aç:

```env
NFT_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

Yapıştır ve kaydet!

✅ **Smart Contract Deploy Tamamlandı!**

---

## 🎉 TAMAMLANDI!

### ✅ Tamamlanan İşler

- ✅ Neynar API Key alındı
- ✅ Pinata API Keys alındı
- ✅ MetaMask test cüzdanı hazırlandı
- ✅ Base Mainnet eklendi ve ETH yüklendi
- ✅ .env.local dosyası tamamlandı
- ✅ Smart Contract deploy edildi
- ✅ Contract adresi .env.local'e eklendi

### 🚀 Artık Proje Çalışır Durumda!

Ben terminal'de development server'ı başlatacağım:

```bash
npm run dev
```

Sen tarayıcıda şu adresi açacaksın:
🔗 [http://localhost:3000](http://localhost:3000)

### 🧪 Test Et

Frame endpoint'ini dene:
🔗 [http://localhost:3000/api/frame](http://localhost:3000/api/frame)

Frame HTML'ini göreceksin!

---

## 🆘 Sorun mu Var?

### Sık Karşılaşılan Sorunlar

#### 1. Neynar API "Unauthorized" Hatası
- ✅ `.env.local` dosyasında key doğru yazıldı mı?
- ✅ Server'ı yeniden başlat: `npm run dev`

#### 2. Pinata Upload Hatası
- ✅ API Key ve Secret doğru mu?
- ✅ Pinata'da free tier limiti aşıldı mı?

#### 3. MetaMask Bağlanmıyor
- ✅ Base Mainnet seçili mi?
- ✅ Site'e izin verildi mi?
- ✅ MetaMask güncel mi?

#### 4. Contract Deploy Başarısız
- ✅ Cüzdanda ETH var mı? (min 0.001 ETH)
- ✅ Network Base Mainnet mi?
- ✅ Remix'te doğru compiler version seçili mi? (0.8.20)

---

## 📞 Bana Söyle!

Tüm bu işleri tamamladığında **bana haber ver**, ben de:

1. ✅ Development server'ı başlatacağım
2. ✅ Test yapacağım
3. ✅ Vercel deployment rehberini vereceğim
4. ✅ Farcaster Frame'i nasıl paylaşacağını göstereceğim

---

**🌟 Başarılar! Her adımı dikkatlice takip et ve sorun yaşarsan bana söyle!**
