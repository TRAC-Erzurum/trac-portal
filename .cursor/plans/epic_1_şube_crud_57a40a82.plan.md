---
name: Epic 1 Şube CRUD
overview: Şube entity ve temel CRUD operasyonları - Şube oluşturma, listeleme, detay görüntüleme, düzenleme ve pasife alma.
todos:
  - id: branch-entity
    content: Branch entity ve migration oluştur
    status: completed
  - id: callsign-entity
    content: BranchCallSign entity ve migration oluştur
    status: completed
  - id: branch-service
    content: BranchService CRUD metodları
    status: completed
  - id: branch-controller
    content: BranchController endpoints
    status: completed
  - id: branch-pages
    content: "Frontend: Branch list/detail/form sayfaları"
    status: completed
  - id: branch-components
    content: "Frontend: BranchCard, BranchForm components"
    status: completed
  - id: inactive-branches
    content: "Admin: Pasif şubeler yönetimi"
    status: completed
  - id: migration-create-tables
    content: "Migration: CreateBranchTables (1770237857767)"
    status: completed
  - id: migration-seed-hq
    content: "Migration: SeedHeadquartersBranch (1770237865903)"
    status: completed
isProject: false
---

# Epic 1: Şube Entity ve Temel CRUD

## Genel Context

Bu epic, şube yönetimi özelliğinin temelini oluşturur. Diğer tüm epic'ler bu epic'e bağımlıdır.

### Mimari Kararlar

- **Şube bazlı roller:** Kullanıcılar global olarak sadece GUEST veya SUPER_ADMIN olabilir. Diğer roller (ADMIN, MEMBER, VOLUNTEER) şube bazında atanır.
- **CallSign:** Global unique, her şubenin tek bir default callSign'ı olabilir, ayrı tablo (BranchCallSign).
- **Soft Delete:** Şubeler silinmez, isActive: false yapılır.

### Veri Modeli

```
Branch (Şube)
├── id: UUID
├── name: string (UNIQUE)
├── type: enum (BRANCH, REPRESENTATIVE)
├── isHeadquarters: boolean (default: false)
├── isActive: boolean (default: true)
├── address, phone, email (nullable)
├── createdAt, updatedAt, createdBy, updatedBy
├── callSigns: BranchCallSign[] (1:N)
├── infrastructure: BranchInfrastructure[] (1:N)
└── memberships: UserBranchMembership[] (1:N)

BranchCallSign (Şube Çağrı İşareti)
├── id: UUID
├── branchId: UUID (FK)
├── callSign: string (GLOBAL UNIQUE)
├── isDefault: boolean (şube başına tek default)
└── createdAt, updatedAt
```

---

## User Stories

### US-1.1: Şube Oluşturma

**Rol:** Süper Yönetici
**İstiyorum ki:** Yeni şube veya temsilcilik oluşturabileyim
**Böylece:** TRAC'ın farklı şehirlerdeki yapılanmaları sisteme tanımlanabilsin

**Kabul Kriterleri:**

- Şube adı zorunlu ve sistemde unique olmalı
- En az bir çağrı işareti zorunlu (genellikle YM ile başlar: YM9KE, YM9ERZ)
- Çağrı işaretleri sistemde unique olmalı
- İlk çağrı işareti varsayılan olarak işaretlenir
- Tür seçimi: Şube veya Temsilcilik (sadece görsel ayrım)
- İletişim bilgileri: adres, telefon, email (opsiyonel)
- Sadece SUPER_ADMIN erişebilir
- Oluşturulan şubeye SUPER_ADMIN otomatik dahil edilir

**Backend Tasks:**

- Branch entity ve migration oluştur
- BranchCallSign entity ve migration oluştur
- BranchService.create() metodu
- BranchController POST /branches endpoint
- Validation: name unique, callSign global unique
- SUPER_ADMIN guard

**Frontend Tasks:**

- /admin/branches/new sayfası
- BranchForm component
- CallSign multi-input component
- Form validation
- API integration

---

### US-1.2: Şube Listeleme

**Rol:** Giriş yapmış kullanıcı
**İstiyorum ki:** Tüm şube ve temsilcilikleri listeleyebileyim
**Böylece:** Hangi şubelerin var olduğunu görebileyim

**Kabul Kriterleri:**

- Tüm aktif şubeler listelenir
- Şube adı, türü, çağrı işaretleri görüntülenir
- Şube detay sayfasına link verilir
- Pasif şubeler normal kullanıcılara gösterilmez
- SUPER_ADMIN pasif şubeleri de görebilir (ayrı filtre ile)

**Backend Tasks:**

- BranchService.findAll() - isActive filter
- BranchController GET /branches endpoint
- Query param: includeInactive (SUPER_ADMIN only)

**Frontend Tasks:**

- /branches sayfası
- BranchList component
- BranchCard component
- SUPER_ADMIN için "Pasif Şubeleri Göster" toggle

---

### US-1.3: Şube Detay Görüntüleme

**Rol:** Giriş yapmış kullanıcı
**İstiyorum ki:** Bir şubenin detaylarını görebileyim
**Böylece:** İletişim bilgilerine ve şube aktivitelerine ulaşabileyim

**Kabul Kriterleri:**

- Herkes görebilir: Şube adı, türü, çağrı işaretleri, iletişim bilgileri
- Herkes görebilir: İletişim altyapıları listesi
- Herkes görebilir: Çevrim istatistikleri ve listesi
- GUEST göremez: Üye listesi, operatör listesi
- VOLUNTEER+ görebilir: Üye listesi, operatör listesi
- SUPER_ADMIN için: Şube aktif/pasif toggle butonu

**Backend Tasks:**

- BranchService.findOne() with relations
- BranchController GET /branches/:id endpoint
- Role-based field filtering (members for VOLUNTEER+)

**Frontend Tasks:**

- /branches/:id sayfası
- BranchDetail component
- Conditional member list rendering
- SUPER_ADMIN toggle button

---

### US-1.4: Şube Bilgilerini Düzenleme

**Rol:** Şube Yöneticisi
**İstiyorum ki:** Yönetici olduğum şubenin bilgilerini güncelleyebileyim
**Böylece:** İletişim bilgileri güncel tutulabilsin

**Kabul Kriterleri:**

- Yönetici (o şubede ADMIN rolü) sadece kendi şubesini düzenleyebilir
- Genel Merkez düzenlenemez (SUPER_ADMIN dahil)
- Şube adı ve çağrı işaretleri unique kontrolü yapılır
- SUPER_ADMIN tüm şubeleri düzenleyebilir (Genel Merkez hariç)
- Çağrı işaretlerinden biri varsayılan olarak işaretlenebilir

**Backend Tasks:**

- BranchService.update() metodu
- BranchController PATCH /branches/:id endpoint
- Authorization: Branch ADMIN or SUPER_ADMIN
- Prevent HQ edit
- Unique validation

**Frontend Tasks:**

- /branches/:id/edit sayfası
- BranchForm component (edit mode)
- Authorization check

---

### US-1.5: Şube Pasife Alma ve Geri Getirme

**Rol:** Süper Yönetici
**İstiyorum ki:** Artık aktif olmayan şubeyi pasif yapabileyim ve gerekirse geri getirebileyim
**Böylece:** Geçmiş veriler korunurken şube listeden kaldırılabilsin

**Kabul Kriterleri:**

- Sadece SUPER_ADMIN pasif yapabilir ve geri getirebilir
- Genel Merkez pasif yapılamaz
- Şube detay sayfasında toggle butonu ile yapılır
- Şube pasif yapıldığında: Tüm çevrimler otomatik pasife çekilir
- Şube aktif yapıldığında: Çevrimler otomatik aktif olur
- SUPER_ADMIN pasif şubeleri /admin/inactive-branches'da görebilir

**Backend Tasks:**

- BranchService.deactivate() - cascade to nets
- BranchService.activate() - cascade to nets
- BranchController PATCH /branches/:id/status endpoint
- GET /admin/inactive-branches endpoint

**Frontend Tasks:**

- Branch detail toggle button
- /admin/inactive-branches sayfası
- InactiveBranchList component
- Confirmation dialog

---

## Bağımlılıklar

- Bu epic herhangi bir epic'e bağımlı değildir
- Epic 2, 3, 4, 5 bu epic'e bağımlıdır

