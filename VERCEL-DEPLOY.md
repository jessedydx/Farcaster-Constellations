# Vercel Deployment Rehberi (Adım Adım)

## 🎯 Hedef

Projeyi Vercel'e deploy edip Vercel KV database'i kurmak.

---

## 📋 Ön Hazırlık

### 1️⃣ GitHub Hesabı
- ✅ Zaten var (projeyi push etmek için)

### 2️⃣ Vercel Hesabı
- vercel.com → Sign Up (GitHub ile)

---

## 🚀 ADIM 1: Git Repository Oluştur

### Terminal'de:

```bash
# Proje dizinine git
cd "/Users/karatasailesi/Desktop/Farcaster Constellations"

# Git başlat (eğer yoksa)
git init

# .gitignore olduğundan emin ol
cat .gitignore

# Tüm dosyaları ekle
git add .

# Commit yap
git commit -m "Initial commit: Farcaster Constellation Mini App"
```

---

## 🌐 ADIM 2: GitHub'a Push Et

### 2.1. GitHub'da Yeni Repo Oluştur

1. **github.com** aç
2. Sağ üstte **"+"** → **"New repository"**
3. Repository adı: `farcaster-constellation`
4. **Public** seç
5. ❌ **Initialize this repository with** hiçbirini seçme
6. **"Create repository"**

### 2.2. Local Repo'yu GitHub'a Bağla

GitHub'ın gösterdiği komutları kullan:

```bash
# Remote ekle (kendi username'in ile)
git remote add origin https://github.com/KULLANICI_ADIN/farcaster-constellation.git

# Branch adını main yap
git branch -M main

# Push et
git push -u origin main
```

✅ **GitHub'da kodun göründü mü?** Kontrol et!

---

## 🎨 ADIM 3: Vercel'e Deploy Et

### 3.1. Vercel'de Yeni Proje

1. **vercel.com** aç → Login (GitHub ile)
2. Dashboard → **"Add New..."** → **"Project"**
3. **"Import Git Repository"**
4. GitHub hesabını bağla (izin ver)
5. `farcaster-constellation` repo'sunu bul
6. **"Import"** tıkla

### 3.2. Proje Ayarları

**Framework Preset:** Next.js (otomatik algılanır)
**Root Directory:** `./` (default)
**Build Command:** `next build` (default)
**Output Directory:** `.next` (default)

**Environment Variables Ekle:**

```
NEYNAR_API_KEY=B4A767B6-3F33-43D3-91A7-78350C23B081
BASE_RPC_URL=https://mainnet.base.org
NFT_CONTRACT_ADDRESS=0x8f871cE6070C816638b641fbFb205DAc5A6B5EB9
PINATA_API_KEY=7299d9760dc5fdc38dad
PINATA_SECRET_KEY=3c5ea210f733eddcc7b9d71cb0458c90ab4130e37aa06f5698e900bdb2633f83
```

**"Deploy"** tıkla!

⏳ Deploy süresi: ~2-3 dakika

---

## 💾 ADIM 4: Vercel KV Database Oluştur

Deploy bittikten sonra:

### 4.1. Storage Sekmesi

1. Vercel Dashboard → **Projen** → **Storage** sekmesi
2. **"Create Database"** tıkla
3. **"KV"** seç

### 4.2. Database Ayarları

- **Name:** `constellation-kv`
- **Region:** Seç (en yakın: Europe - Frankfurt veya US - Washington DC)
- **"Create"** tıkla

✅ **Otomatik Environment Variables Eklendi!**

Vercel otomatik olarak şunları ekler:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 4.3. Yeniden Deploy

KV eklendikten sonra project otomatik yeniden deploy olur.
Veya manuel: **"Deployments"** → son deployment → **"..."** → **"Redeploy"**

---

## ✅ ADIM 5: Test Et

### 5.1. Deployment URL'i Bul

Dashboard'da **"Visit"** butonuna tıkla veya URL'i kopyala:
```
https://farcaster-constellation-XXXX.vercel.app
```

### 5.2. Ana Sayfayı Aç

Tarayıcıda:
```
https://farcaster-constellation-XXXX.vercel.app
```

✅ **Ana sayfa göründü mü?**

### 5.3. Database Test Et

Terminal'de:

```bash
# URL'i kendi URL'in ile değiştir
curl -X POST https://farcaster-constellation-XXXX.vercel.app/api/db-test \
  -H "Content-Type: application/json" \
  -d '{"action":"save","fid":123,"token":"test123","url":"https://test.com"}'
```

**Beklenen Cevap:**
```json
{"success":true,"message":"Token saved"}
```

✅ **Başarılı mı?**

### 5.4. Token'ı Oku

```bash
curl -X POST https://farcaster-constellation-XXXX.vercel.app/api/db-test \
  -H "Content-Type: application/json" \
  -d '{"action":"get","fid":123}'
```

**Beklenen Cevap:**
```json
{
  "success": true,
  "data": {
    "fid": 123,
    "notificationToken": "test123",
    "notificationUrl": "https://test.com",
    "addedAt": 1701468000000,
    "lastNotifiedAt": null
  }
}
```

✅ **Token okundu mu?**

---

## 🎉 Tamamlandı!

### ✅ Checklist:

- [x] GitHub repo oluşturuldu
- [x] Kod push edildi
- [x] Vercel'e deploy edildi
- [x] Environment variables eklendi
- [x] Vercel KV database oluşturuldu
- [x] Database test edildi

---

## 📊 Deployment URL

**Production URL'in:**
```
https://farcaster-constellation-XXXX.vercel.app
```

**Bu URL'i not al!** Sonraki fazlarda kullanacağız.

---

## 🔄 Kod Güncellemesi (Gelecekte)

```bash
# Değişiklik yaptıktan sonra
git add .
git commit -m "Describe changes"
git push

# Vercel otomatik deploy edecek!
```

---

## 🆘 Sorun Çözümü

### Build Hatası
- Vercel Dashboard → Deployments → Failed deployment → Build Logs
- Hatayı oku ve düzelt

### Environment Variables Eksik
- Settings → Environment Variables → Ekle → Redeploy

### KV Bağlantı Hatası
- Storage sekmesinde KV var mı kontrol et
- Environment variables KV için eklenmiş mi?

---

**Deployment URL'ini bana gönder, Faz 2'ye geçelim!** 🚀
