---
name: Epic 6 Çevrim Listesi
overview: Çevrim listesi ve filtreleme - Varsayılan şube bazlı liste ve gelişmiş filtreleme seçenekleri.
todos:
  - id: guest-restriction
    content: GUEST için /nets erişim kısıtlaması
    status: pending
  - id: branch-filter-backend
    content: "NetController: Branch filter logic"
    status: pending
  - id: branch-filter-ui
    content: Şube filtre dropdown component
    status: pending
  - id: filter-persistence
    content: Filtre URL sync
    status: pending
isProject: false
---

# Epic 6: Çevrim Listesi ve Filtreleme

## Genel Context

Bu epic, çevrim listesinin şube context'ine göre filtrelenmesini sağlar.

### Bağımlılıklar

- **Bağımlı olduğu:** Epic 2 (Branch context), Epic 5 (Net-Branch)
- **Bağımlı olan:** Yok

### Mimari Kararlar

- GUEST çevrim listesi sayfasına erişemez
- Varsayılan filtre: Header'daki seçili şube
- Branch context JWT'den alınır

---

## User Stories

### US-6.1: Varsayılan Çevrim Listesi

**Rol:** Kayıtlı Kullanıcı (VOLUNTEER+)
**İstiyorum ki:** Çevrim listesi varsayılan şubemin çevrimlerini göstersin
**Böylece:** En alakalı çevrimleri hemen görebileyim

**Kabul Kriterleri:**

- GUEST çevrim listesi sayfasına erişemez (redirect to dashboard)
- VOLUNTEER+ için: Varsayılan olarak header'da seçili şubenin çevrimleri
- Aktif > Bekleyen > Tamamlanmış sıralaması korunur
- Şube değiştirildiğinde (header dropdown) liste güncellenir

**Backend Tasks:**

- NetController.findAll(): Branch filter from JWT context
- GUEST access restriction (403 or redirect)
- Query param: branchId (optional, defaults to JWT context)

**Frontend Tasks:**

- /nets page: GUEST redirect
- Auto-filter by selected branch
- useBranchStore integration
- Loading state on branch change

---

### US-6.2: Çevrim Filtreleme

**Rol:** Kayıtlı Kullanıcı
**İstiyorum ki:** Çevrimleri şubeye göre filtreleyebileyim
**Böylece:** İstediğim şubenin çevrimlerini bulabileyim

**Kabul Kriterleri:**

- Şube filtresi seçenekleri:
  - Seçili Şube (default): Header'daki şube
  - Tüm Şubelerim: Onaylı üyeliği olan şubelerin çevrimleri
  - Tüm Şubeler: Sistemdeki tüm çevrimler
- "Tüm Şubelerim" sadece APPROVED üyelikleri hesaba katar
- Mevcut filtreler (durum, tarih) korunur
- Filtre seçimi URL'de saklanır (shareable)

**Backend Tasks:**

- NetController: Branch filter query params
- branchFilter: 'selected' | 'my-branches' | 'all'
- GET /users/me/branch-ids helper endpoint

**Frontend Tasks:**

- NetFilterBar component: Branch filter dropdown
- Filter state management
- URL query param sync
- Combined filter logic (branch + status + date)

