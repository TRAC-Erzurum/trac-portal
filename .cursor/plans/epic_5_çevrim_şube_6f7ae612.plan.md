---
name: Epic 5 Çevrim Şube
overview: Çevrim-şube-altyapı ilişkisi - Çevrim oluştururken şube/altyapı seçimi, yönetim yetkisi ve operatör ataması.
todos:
  - id: migration-net-branch
    content: "Migration: AddBranchFieldsToNets (branchId, branchCallSignId, isActive + mevcut netleri HQ'ya ata)"
    status: completed
  - id: migration-net-infrastructure
    content: "Migration: CreateNetInfrastructure (net_infrastructure tablosu)"
    status: completed
  - id: net-branch-fields
    content: "Net entity: branchId, callSignId alanları"
    status: completed
  - id: net-infrastructure-entity
    content: NetInfrastructure entity ve migration
    status: completed
  - id: net-create-branch
    content: "Net oluşturma: Şube/altyapı seçimi"
    status: completed
  - id: manage-net-guard
    content: "ManageNetGuard: Branch membership check"
    status: completed
  - id: operator-selection
    content: "Operatör seçimi: Şube üyeleri filtresi"
    status: completed
  - id: branch-nets-list
    content: "Şube detay: Çevrim listesi"
    status: completed
  - id: infrastructure-delete-check
    content: "Altyapı silme/pasif kontrolü: Aktif çevrimde kullanılan altyapı silinemez"
    status: completed
isProject: false
---

# Epic 5: Çevrim-Şube-Altyapı İlişkisi

## Genel Context

Bu epic, çevrimlerin şubelerle ilişkilendirilmesini ve altyapı entegrasyonunu sağlar.

### Bağımlılıklar

- **Bağımlı olduğu:** Epic 1, 3, 4
- **Bağımlı olan:** Epic 6, 7, 8

### Mimari Kararlar

- Net.branchId IMMUTABLE (oluşturulduktan sonra değiştirilemez)
- CallSign ve altyapı değiştirilebilir
- Şube pasif olunca tüm çevrimler pasif
- GUEST çevrime katılabilir ama yönetemez

### Veri Modeli

```
Net (güncelleme)
├── branchId: UUID (FK) - IMMUTABLE
├── branchCallSignId: UUID (FK) - değiştirilebilir
├── isActive: boolean (default: true)
└── infrastructure: NetInfrastructure[] (M:N)

NetInfrastructure (Çevrim-Altyapı İlişkisi)
├── id: UUID
├── netId: UUID (FK)
├── infrastructureId: UUID (nullable, FK)
├── isSimplexAdHoc: boolean (default: false)
├── simplexFrequency: string (nullable)
└── createdAt
```

---

## User Stories

### US-5.1: Çevrim Oluştururken Şube, Çağrı İşareti ve Altyapı Seçimi

**Rol:** Şube Üyesi (MEMBER+ rolüne sahip)
**Kabul Kriterleri:**

- Şube seçimi zorunlu (sadece MEMBER+ olduğu şubeler)
- Varsayılan şube (header'daki) önceden seçili gelir
- Şube seçildikten sonra o şubenin çağrı işaretleri listelenir
- Varsayılan çağrı işareti önceden seçili gelir
- Şubenin aktif altyapıları listelenir
- Simpleks frekans manuel girilebilir
- Birden fazla altyapı + simpleks kombinasyonu seçilebilir
- En az bir altyapı veya simpleks zorunlu
- **Şube DEĞİŞTİRİLEMEZ** (uyarı gösterilir)
- Çağrı işareti ve altyapı sonradan değiştirilebilir

**Backend Tasks:**

- Net entity: branchId, branchCallSignId fields
- NetInfrastructure entity ve migration
- NetService.create(): Branch validation, immutability
- NetController: Updated POST endpoint

**Frontend Tasks:**

- Net creation form: Branch selector
- Cascading callsign dropdown
- Infrastructure multi-select
- Simplex frequency input
- "Şube değiştirilemez" warning

---

### US-5.1b: Çevrim Altyapı/Çağrı İşareti Güncelleme

**Rol:** Çevrim Operatörü veya Şube Yöneticisi
**Kabul Kriterleri:**

- Şube DEĞİŞTİRİLEMEZ (readonly)
- Çağrı işareti değiştirilebilir (şubenin diğer çağrı işaretlerinden)
- Altyapı seçimi değiştirilebilir
- En az bir altyapı/simpleks kalmalı
- Çevrim operatörü veya şube ADMIN değiştirebilir

**Backend Tasks:**

- NetService.update(): Prevent branchId change
- Validation: At least one infrastructure
- Authorization: Operator or Branch ADMIN

**Frontend Tasks:**

- Net edit form: Branch readonly
- CallSign/Infrastructure editable

---

### US-5.2: Çevrim Yönetim Yetkisi (Şube Bazlı)

**Rol:** Şube Üyesi
**Kabul Kriterleri:**

- Çevrimi yönetebilmek için o şubede onaylı üye olmak gerekir
- VOLUNTEER+ çevrimi başlatabilir/bitirebilir (kendi çevrimini)
- Şube ADMIN tüm şube çevrimlerini yönetebilir
- SUPER_ADMIN tüm şubelerin çevrimlerini yönetebilir
- Dahil olmadığı şube çevrimini kimse yönetemez (SUPER_ADMIN hariç)

**Backend Tasks:**

- ManageNetGuard: Branch membership check
- NetService: Branch-based authorization
- RolesGuard: Branch context aware

**Frontend Tasks:**

- Conditional management buttons
- Authorization checks before actions

---

### US-5.3: Çevrim Operatörü Seçimi ve Değiştirme

**Rol:** Şube Yöneticisi
**Kabul Kriterleri:**

- Operatör sadece çevrimin şubesinde MEMBER+ rolüne sahip olmalı
- Operatör seçiminde sadece şube üyeleri listelenir
- Şubeye dahil olmayan kullanıcı operatör seçilemez
- Çevrim başladıktan sonra operatör değişikliği şube ADMIN gerektirir

**Backend Tasks:**

- NetService.updateOperator(): Branch membership validation
- GET /branches/:id/members (for operator selection)

**Frontend Tasks:**

- Operator selection: Branch members only
- Operator change modal

---

### US-5.4: Şube Çevrimlerini Görüntüleme

**Rol:** Giriş yapmış kullanıcı
**Kabul Kriterleri:**

- Şube detay sayfasında çevrimler listelenir
- Herkes (GUEST dahil) çevrim listesi ve detaylarını görebilir
- GUEST çevrim listesi sayfasına (/nets) erişemez
- GUEST şube detay sayfasından çevrimleri görebilir

**Backend Tasks:**

- BranchController: GET /branches/:id/nets endpoint
- NetController: GUEST access restriction for /nets

**Frontend Tasks:**

- Branch detail: Nets section
- Access control for /nets page

---

### US-5.5: Aktif Çevrimde Kullanılan Altyapı Koruması

**Rol:** Şube Yöneticisi
**İstiyorum ki:** Aktif bir çevrimde kullanılan altyapıyı yanlışlıkla silmeyeyim
**Böylece:** Çevrim sırasında altyapı bilgisi kaybolmasın

**Kabul Kriterleri:**

- Aktif çevrimde kullanılan altyapı **silinemez**
- Aktif çevrimde kullanılan altyapı **pasif yapılabilir** (uyarı ile)
- Pasif yapıldığında mevcut çevrimler etkilenmez
- Yeni çevrim oluştururken pasif altyapılar listede görünmez
- Silme denendiğinde "Bu altyapı X aktif çevrimde kullanılıyor" hatası

**Backend Tasks:**

- InfrastructureService.delete(): Active net check
- InfrastructureService.deactivate(): Warning, allow with confirmation
- NetInfrastructure relation check query

**Frontend Tasks:**

- Delete button: Active net warning modal
- Deactivate: Confirmation dialog with active net info

