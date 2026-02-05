---
name: Epic 3 İletişim Altyapısı
overview: İletişim altyapısı yönetimi - VHF/UHF Analog Röle, EchoLink, APRS, HF altyapıları için CRUD ve kullanım kılavuzları.
todos:
  - id: migration-infrastructure-tables
    content: "Migration: CreateInfrastructureTables (branch_infrastructure, infrastructure_tutorials)"
    status: completed
  - id: migration-seed-tutorials
    content: "Migration: SeedInfrastructureTutorials (TR/EN default tutorials)"
    status: completed
  - id: infrastructure-entity
    content: BranchInfrastructure entity ve migration
    status: completed
  - id: infrastructure-types
    content: Type-specific fields ve validation
    status: completed
  - id: infrastructure-crud
    content: Infrastructure service CRUD
    status: completed
  - id: tutorial-entity
    content: InfrastructureTutorial entity ve seed
    status: completed
  - id: infrastructure-pages
    content: "Frontend: Infrastructure list/form/detail"
    status: completed
  - id: global-search
    content: "US-3.2b: Global infrastructure search - /infrastructure sayfası ve GET /infrastructure endpoint"
    status: pending
isProject: false
---

# Epic 3: İletişim Altyapısı (Communication Infrastructure)

## Genel Context

Bu epic, şubelerin amatör telsiz altyapılarını (röle, DMR, EchoLink vb.) yönetmesini sağlar.

### Bağımlılıklar

- **Bağımlı olduğu:** Epic 1 (Branch entity)
- **Bağımlı olan:** Epic 5 (Net-Infrastructure ilişkisi)

### Terminoloji

"Kanal" yerine amatör telsiz jargonuna uygun "İletişim Altyapısı" terimi kullanılmaktadır.

### Veri Modeli

```
BranchInfrastructure (İletişim Altyapısı)
├── id: UUID
├── branchId: UUID (FK)
├── type: enum (VHF_UHF_REPEATER, DMR, ECHOLINK, APRS, HF)
├── name: string
├── description: string (nullable)
├── isActive: boolean (default: true)
│
│ // Konum alanları (REPEATER, DMR için)
├── location: string (nullable)
├── latitude: decimal (nullable)
├── longitude: decimal (nullable)
├── altitude: number (nullable)
├── coverage: string (nullable)
│
│ // VHF/UHF Röle özgü
├── rxFrequency, txFrequency, offset, ctcssTone, dcsTone
│
│ // DMR özgü
├── dmrId, talkgroup, colorCode, timeSlot
│
│ // EchoLink özgü
├── echolinkNode, echolinkName
│
│ // APRS özgü
├── aprsFrequency, digipeater
│
│ // HF özgü
├── hfFrequencyRange, hfMode
└── createdAt, updatedAt

InfrastructureTutorial (Altyapı Kılavuzu)
├── id: UUID
├── type: enum
├── title: string
├── content: text/markdown
├── locale: string (tr, en)
└── createdAt, updatedAt
```

---

## User Stories

### US-3.1: İletişim Altyapısı Oluşturma

**Rol:** Şube Yöneticisi
**İstiyorum ki:** Şubeme ait iletişim altyapılarını ekleyebileyim
**Böylece:** Şubenin kullandığı altyapılar sisteme tanımlansın

**Kabul Kriterleri:**

- Altyapı türleri:
  - VHF/UHF Röle: RX/TX Frekans, CTCSS/DCS Ton, Offset, Konum
  - DMR: RX/TX Frekans, DMR ID, Talkgroup, Color Code, Time Slot
  - EchoLink: Node numarası, Node adı
  - APRS: Frekans, Digipeater bilgisi
  - HF Band: Frekans aralığı, Mode (SSB/CW/FT8)
- Her altyapı için: Ad, açıklama, aktif/pasif durumu
- Konum alanları (röle/DMR): Enlem, boylam, yükseklik, kapsama
- Şube yöneticisi veya SUPER_ADMIN ekleyebilir

**Backend Tasks:**

- BranchInfrastructure entity ve migration
- InfrastructureType enum
- InfrastructureService.create()
- InfrastructureController POST endpoint
- Branch ADMIN guard

**Frontend Tasks:**

- /branches/:id/infrastructure/new sayfası
- InfrastructureForm component (type-specific fields)
- Location picker component (optional)

---

### US-3.2: İletişim Altyapısı Listeleme ve Arama

**Rol:** Giriş yapmış kullanıcı (GUEST dahil)
**İstiyorum ki:** Tüm şubelerin iletişim altyapılarını arayabileyim
**Böylece:** Hangi altyapıları kullanabileceğimi bileyim

**Kabul Kriterleri:**

- Şube detay sayfasında altyapılar listelenir
- GUEST dahil herkes görebilir ve arama yapabilir
- Aktif/pasif durumu görsel olarak belirtilir
- Altyapı türüne göre filtreleme ve gruplandırma
- Tüm şubelerin altyapılarını arayabilme (global arama)

**Backend Tasks:**

- InfrastructureService.findAll() with filters
- GET /branches/:id/infrastructure endpoint
- GET /infrastructure (global search) endpoint

**Frontend Tasks:**

- InfrastructureList component
- InfrastructureCard component (type-specific display)
- Filter/search UI
- /infrastructure global search page

---

### US-3.3: İletişim Altyapısı Kullanım Kılavuzu

**Rol:** Giriş yapmış kullanıcı (GUEST dahil)
**İstiyorum ki:** Her altyapı türü için nasıl bağlanacağımı görebileyim
**Böylece:** Yeni olsam bile altyapıyı kullanmayı öğreneyim

**Kabul Kriterleri:**

- Her altyapı türü için tutorial içeriği:
  - VHF/UHF Röle: "Tonlu bir FM röleye nasıl bağlanılır"
  - DMR: "DMR röleye nasıl bağlanılır, TG seçimi"
  - EchoLink: "EchoLink'e nasıl katılınır"
  - APRS: "APRS ağına nasıl bağlanılır"
  - HF: "HF bandında iletişim kurma"
- Altyapı detay sayfasında "Nasıl Bağlanırım?" butonu
- Modal veya accordion ile kılavuz gösterimi
- DB'de saklanır, şimdilik admin düzenleyemez

**Backend Tasks:**

- InfrastructureTutorial entity ve migration
- Seed script: Default tutorials (TR/EN)
- GET /infrastructure/tutorials/:type endpoint

**Frontend Tasks:**

- TutorialModal component
- "Nasıl Bağlanırım?" button on infrastructure detail
- i18n support for tutorials

---

### US-3.4: İletişim Altyapısı Düzenleme ve Silme

**Rol:** Şube Yöneticisi
**İstiyorum ki:** Şubemin altyapılarını düzenleyebileyim veya silebileyim
**Böylece:** Altyapı bilgileri güncel tutulabilsin

**Kabul Kriterleri:**

- Şube yöneticisi veya SUPER_ADMIN düzenleyebilir/silebilir
- Aktif çevrimde kullanılan altyapı silinemez (pasif yapılabilir)
- Soft delete: isActive: false

**Backend Tasks:**

- InfrastructureService.update()
- InfrastructureService.deactivate()
- Active net check before delete
- PATCH/DELETE endpoints

**Frontend Tasks:**

- /branches/:id/infrastructure/:infraId/edit sayfası
- Delete confirmation with active net warning

