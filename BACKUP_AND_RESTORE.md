# 🔄 Farcaster Constellation NFT V2 - Backup & Restore Guide

**Yedek Tarihi:** 6 Aralık 2025, 23:36 (GMT+3)  
**Yedek Versiyonu:** v1.0-stable  
**Durum:** ✅ Tamamen Çalışır Durumda

---

## 📦 3 Kademeli Yedekleme Stratejisi

### Kademe 1: Git Tag (Önerilen - En Hızlı)
```bash
# Bu noktaya dönmek için:
cd "/Users/karatasailesi/Desktop/Farcaster Constellations"
git fetch --all --tags
git checkout v1.0-stable
npm install
```

### Kademe 2: Git Commit Hash (Alternatif)
```bash
# Specific commit'e dönmek için:
cd "/Users/karatasailesi/Desktop/Farcaster Constellations"
git checkout db1658b  # Son stable commit
npm install
```

### Kademe 3: GitHub Remote (Tam Felaket Kurtarma)
```bash
# Projeyi tamamen silip yeniden klonlamak için:
rm -rf "/Users/karatasailesi/Desktop/Farcaster Constellations"
cd "/Users/karatasailesi/Desktop"
git clone https://github.com/jessedydx/Farcaster-Constellations.git "Farcaster Constellations"
cd "Farcaster Constellations"
git checkout v1.0-stable
npm install
```

---

## ⚙️ Restore Sonrası Yapılması Gerekenler

### 1. Environment Variables Kontrolü
```bash
# .env.local dosyasını kontrol edin (gitignored):
cat .env.local
```

**Gerekli değişkenler:**
- `NEYNAR_API_KEY` = 6ECC8F91-991B-4600-9AF6-FAF47DA16A48
- `BASE_RPC_URL` = https://mainnet.base.org
- `NFT_CONTRACT_ADDRESS` = 0xC6cC93716CE39C26996425217B909f3E725F5850
- `PINATA_API_KEY` = (Kullanıcıdan alın)
- `PINATA_SECRET_KEY` = (Kullanıcıdan alın)
- `CRON_SECRET` = (Güvenli random string oluşturun)

### 2. Dependencies Yükleme
```bash
npm install
```

### 3. Development Sunucusu
```bash
npm run dev
# http://localhost:3000 üzerinden erişilebilir
```

### 4. Vercel Deployment
```bash
# Otomatik - GitHub push ile deploy olur
git push origin main
```

---

## 🔐 Kritik Dosyalar (Yedeklenmeli)

Bu dosyalar `.gitignore` ile korunuyor, **manuel yedek alın:**

1. **`.env.local`** - Tüm API keys
2. **`contracts/FarcasterConstellationNFTV2.sol`** - Contract source code
3. **`contracts/FarcasterConstellationNFTV2_Flattened.sol`** - Verified contract

**Yedekleme komutu:**
```bash
cp .env.local .env.local.backup
cp contracts/FarcasterConstellationNFTV2.sol ~/Desktop/contract-backup.sol
```

---

## 📝 Değişiklik Geçmişi (Son 10 Commit)

Bu yedek noktasına kadar yapılan değişiklikler:

```
db1658b - fix: use Neynar managed notifications webhook URL
39d8660 - fix: use correct Neynar API format with target_fids
4882e79 - debug: add detailed error logging for notifications
e830dd3 - test: add notification test endpoint
4a40405 - fix: variable name typo
120cbea - fix: repair corrupted cron file
8c39a7a - feat: add notifications for mint success and monthly reminders
f2cdeee - fix: correct timing for auto-show addFrame popup
2067c05 - ui: remove manual Add to Farcaster button
f7e6c6c - feat: auto-show Add to Farcaster popup on app open
```

---

## 🚨 Acil Durum Rollback

Eğer bir şeyler ters giderse, **hemen önceki stable versiyona dönmek** için:

```bash
cd "/Users/karatasailesi/Desktop/Farcaster Constellations"
git reset --hard v1.0-stable
git push origin main --force  # UYARI: Sadece acil durumda!
```

---

## 📊 Yedek Doğrulama

Restore'dan sonra şunları test edin:

1. ✅ `npm run dev` çalışıyor mu?
2. ✅ `/api/frame` endpoint çalışıyor mu?
3. ✅ Constellation oluşturma çalışıyor mu?
4. ✅ NFT mint çalışıyor mu?
5. ✅ Bildirimler gönderiliyor mu? (test: `/api/test-notification`)

---

**Not:** Bu dosyayı güncel tutun. Her major değişiklikten sonra yeni tag oluşturun.

**Next Tags:**
- `v1.1-stable` - Bildirim sistemi tamamen çalışır hale getirildiğinde
- `v1.2-stable` - Kullanıcı tracking sistemi eklendiğinde
- `v2.0-stable` - Major feature updates
