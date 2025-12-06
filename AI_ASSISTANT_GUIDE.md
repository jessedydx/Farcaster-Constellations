# 🤖 AI Assistant Onboarding Guide

**Bu dosyayı gelecekteki AI asistanları için yazıyorum.**

Merhaba! Bu projeyi devralıyorsanız, önce şu dosyaları okuyun:

---

## 📚 Zorunlu Okuma Sırası

1. **`PROJECT_STATE.md`** ← Uygulamanın ne yaptığı, dosya yapısı
2. **`BACKUP_AND_RESTORE.md`** ← Yedek/geri yükleme komutları
3. **`AI_ASSISTANT_GUIDE.md`** ← Bu dosya (ipuçları)

---

## 🎯 Kritik Bilgiler

### Kullanıcı Tercihleri
- **Dil:** Türkçe (kod İngilizce, açıklamalar Türkçe)
- **Style:** Minimalist, cyber-neon aesthetic
- **Security:** `.env.local` asla commit edilmemeli
- **Approach:** Adım adım açıklama, şaşırtmadan ilerle

### Dokunmaman Gerekenler
- Wallet integration (kullanıcı istemedikçe)
- Contract ABI (değiştirilmemeli)
- Farcaster SDK konfigürasyonu (çalışıyor)

---

## 🔧 Sık Karşılaşılan Sorunlar

### 1. "Bildirim Gelmiyor"
**Sebep:** Kullanıcı Warpcast'te notifications enable etmemiş  
**Çözüm:**
```
Settings → Notifications → Mini Apps → 
"Farcaster Constellation NFT" → Enable
```

### 2. "Imgur 429 Rate Limit"
**Sebep:** Çok fazla PFP fetch  
**Çözüm:** Zaten browser fallback var, normal

### 3. "Deployment Failed"
**Sebep:** Vercel environment variables eksik  
**Çözüm:** `.env.local` değişkenlerini Vercel'e ekle

---

## 🚀 Hızlı Başlangıç (Yeni Oturumlar için)

```bash
# 1. Projeye git
cd "/Users/karatasailesi/Desktop/Farcaster Constellations"

# 2. Durumu kontrol et
git status
git log --oneline -5

# 3. Eğer sorun varsa stable'a dön
git checkout v1.0-stable

# 4. Dependencies
npm install

# 5. Dev sunucu
npm run dev
```

---

## 📝 Deployment Workflow

```bash
# Code değişikliği yaptıktan sonra:
git add .
git commit -m "açıklayıcı mesaj"
git push origin main

# Vercel otomatik deploy eder (~2 dk)
# https://farcaster-constellations-w425.vercel.app
```

---

## 🎨 Code Style Preferences

### Commit Messages
```
feat: yeni özellik
fix: bug düzeltme
ui: görsel değişiklik
debug: debug kodu
test: test ekleme
```

### TypeScript
- Strict mode
- Proper typing (no `any` mümkünse)
- Functional components

### Naming
- File: kebab-case (`constellation-image.ts`)
- Function: camelCase (`generateImage`)
- Component: PascalCase (`HomePage`)

---

## 🔐 Güvenlik Notları

### Asla Commit Etmeyin
- `.env.local`
- API keys
- Private keys
- Wallet seeds

### Gitignored
```
.env*
.vercel
node_modules/
.next/
```

---

## 🆘 Acil Durum İletişimi

Eğer kullanıcı "eski haline getir" derse:
```bash
git checkout v1.0-stable
git push origin main --force
```

Eğer tamamen sıfırdan başlamak gerekirse:
```bash
# BACKUP_AND_RESTORE.md → Kademe 3
```

---

## 📊 Test Endpoints (Debugging için)

```bash
# Constellation oluşturma
curl https://farcaster-constellations-w425.vercel.app/api/frame

# Bildirim test
curl https://farcaster-constellations-w425.vercel.app/api/test-notification

# Contract address check
# Console'da: "🔧 Using contract address: 0xC6c..."
```

---

## 🧩 Önemli Kavramlar

### FID (Farcaster ID)
- Her kullanıcının unique ID'si
- Kullanıcı: 328997 (@jesse7.eth)

### Constellation
- 20 kişilik etkileşim haritası
- Canvas rendering
- IPFS'e upload

### Mini App
- Farcaster içinde çalışan iframe
- SDK ile entegrasyon
- Notifications support

---

## 💡 İpuçları

1. Değişiklik yapmadan önce **git branch** oluştur
2. Hata logları için **Vercel Dashboard → Logs**
3. Contract interactions için **BaseScan**
4. Her major değişiklikten sonra **yeni tag** oluştur

---

**Başarılar! 🚀**

**Last Updated:** 6 Aralık 2025  
**Version:** v1.0-stable
