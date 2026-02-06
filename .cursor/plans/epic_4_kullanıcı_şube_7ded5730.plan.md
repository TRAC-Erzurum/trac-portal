---
name: Epic 4 Kullanıcı Şube
overview: Kullanıcı-şube ilişkisi ve şube bazlı roller - Kayıt, üyelik talepleri, onay akışı, rol yönetimi ve parola sıfırlama.
todos:
  - id: migration-memberships
    content: "Migration: CreateUserBranchMemberships (user_branch_memberships tablosu)"
    status: completed
  - id: migration-globalrole
    content: "Migration: UpdateUserGlobalRole (users tablosuna globalRole ekle)"
    status: completed
  - id: migration-superadmin-hq
    content: "Migration: SeedSuperAdminHqMembership (SUPER_ADMIN'i HQ'ya ekle)"
    status: completed
  - id: membership-entity
    content: UserBranchMembership entity ve migration
    status: completed
  - id: user-globalrole
    content: "User entity: globalRole field"
    status: completed
  - id: registration-update
    content: "Kayıt akışı: Çoklu şube seçimi"
    status: completed
  - id: membership-service
    content: "MembershipService: request, approve, reject, remove"
    status: completed
  - id: pending-banner
    content: GUEST için onay bekliyor banner
    status: completed
  - id: account-memberships
    content: "Account sayfası: Üyeliklerim bölümü"
    status: completed
  - id: admin-requests
    content: "Admin: Talep yönetimi sayfası"
    status: completed
  - id: member-list
    content: "Şube detay: Üye listesi ve yönetimi (Epic 2: HQ/SUPER_ADMIN için çıkar butonu gizle)"
    status: completed
  - id: role-management
    content: Rol değiştirme ve koruma kuralları
    status: completed
isProject: false
---

# Epic 4: Kullanıcı-Şube İlişkisi ve Şube Bazlı Roller

## Genel Context

Bu epic, şube bazlı rol sisteminin temelini oluşturur. En kapsamlı epic (11 user story).

### Bağımlılıklar

- **Bağımlı olduğu:** Epic 1, Epic 2
- **Bağımlı olan:** Epic 5, 6, 7, 8

### Mimari Kararlar

- globalRole: GUEST | SUPER_ADMIN
- Şube rolleri: ADMIN | MEMBER | VOLUNTEER
- Üyelik durumları: PENDING | APPROVED | REJECTED
- Üyelik talebi expire olmaz
- Kullanıcı silindiğinde tüm kayıtları silinir

### Veri Modeli

```
UserBranchMembership
├── id: UUID
├── userId: UUID (FK)
├── branchId: UUID (FK)
├── role: enum (ADMIN, MEMBER, VOLUNTEER)
├── status: enum (PENDING, APPROVED, REJECTED)
├── processedBy: UUID (nullable, FK)
├── processedAt: datetime (nullable)
├── rejectionReason: string (nullable)
└── createdAt, updatedAt
(UNIQUE: userId + branchId)

User (güncelleme)
├── globalRole: enum (GUEST, SUPER_ADMIN)
└── memberships: UserBranchMembership[]
```

---

## User Stories

### US-4.1: Kayıt Sırasında Şube Seçimi

**Rol:** Yeni Kullanıcı
**Kabul Kriterleri:**

- Kayıt formunda en az bir şube seçimi zorunlu
- Birden fazla şube seçilebilir
- Seçilen her şube için ayrı PENDING talep oluşturulur
- Kullanıcı globalRole: GUEST olarak kaydedilir
- UX: Her şube için açıklama, "Şube nedir?" tooltip, alfabetik sıralama

**Tasks:**

- AuthService.register(): Multi-branch selection
- Registration form: Branch multi-select
- Branch info tooltips

---

### US-4.2: Şubeye Katılma Talebi

**Rol:** Kayıtlı Kullanıcı
**Kabul Kriterleri:**

- Dahil olmadığı şubelere talep gönderebilir
- Aynı şubeye birden fazla PENDING talep gönderilemez
- Reddedilen şubeye tekrar başvurulabilir

**Tasks:**

- MembershipService.requestJoin()
- Duplicate PENDING check
- Branch list with "Talep Gönder" button

---

### US-4.2b: Onay Bekleyen Kullanıcı Deneyimi

**Rol:** GUEST (Onay bekleyen)
**Kabul Kriterleri:**

- Her erişebildiği sayfada üstte banner gösterilir
- Banner: "Üyelik talebiniz onay bekliyor..."
- Banner kapatılamaz
- Dashboard'da başvurulan şubeler ve durumları listelenir

**Tasks:**

- PendingApprovalBanner component
- App layout: Conditional banner for GUEST
- Dashboard: Pending requests list

---

### US-4.2c: Üyelik Durumu Takibi

**Rol:** Kayıtlı Kullanıcı
**Kabul Kriterleri:**

- Account sayfasında "Şube Üyeliklerim" bölümü
- Her üyelik: Şube adı, durum, tarih, rol (onaylananlar için)
- Reddedilenler için: Red nedeni, "Tekrar Başvur" butonu

**Tasks:**

- GET /users/me/memberships endpoint
- Account page: Memberships section
- Membership status UI

---

### US-4.3: Bekleyen Talepleri Görüntüleme (Yönetici)

**Rol:** Şube Yöneticisi
**Kabul Kriterleri:**

- Dashboard'da "Bekleyen Talepler" kartı (üyelik + parola sıfırlama)
- Talep varsa badge ile uyarı
- "Tümünü Gör" linki ile /admin/requests sayfası
- Sadece yönetici olduğu şubenin talepleri

**Tasks:**

- GET /branches/:id/pending-requests endpoint
- AdminRequestsCard component
- /admin/requests page

---

### US-4.4: Üyelik Talebini Onaylama

**Rol:** Şube Yöneticisi
**Kabul Kriterleri:**

- Onay sırasında rol seçimi: VOLUNTEER, MEMBER, ADMIN
- İlk onayda kullanıcı otomatik HQ'ya MEMBER olarak eklenir
- SUPER_ADMIN herhangi bir şubenin talebini onaylayabilir

**Tasks:**

- MembershipService.approve()
- HQ auto-add on first approval
- Approval modal with role selection

---

### US-4.5: Üyelik Talebini Reddetme

**Rol:** Şube Yöneticisi
**Kabul Kriterleri:**

- Red nedeni opsiyonel
- Status: REJECTED
- Kullanıcı daha sonra tekrar başvurabilir

**Tasks:**

- MembershipService.reject()
- Rejection modal with optional reason

---

### US-4.6: Şube Üyesinin Rolünü Değiştirme

**Rol:** Şube Yöneticisi
**Kabul Kriterleri:**

- Yönetici sadece kendi şubesindeki üyelerin rolünü değiştirebilir
- Kendisini ADMIN'den düşüremez (en az bir ADMIN kalmalı)
- SUPER_ADMIN'lerin şube rolü değiştirilemez
- Şube admini başka admin atayabilir

**Tasks:**

- MembershipService.updateRole()
- Last admin protection
- SUPER_ADMIN protection
- Role change dropdown in member list

---

### US-4.7: Kullanıcıyı Şubeden Çıkarma

**Rol:** Şube Yöneticisi
**Kabul Kriterleri:**

- Genel Merkez'den çıkarılamaz
- SUPER_ADMIN çıkarılamaz
- Aktif/bekleyen çevrimi olan kullanıcı çıkarılamaz
- Hata mesajı: "Bu kullanıcının şubede aktif çevrimi bulunmaktadır"

**Tasks:**

- MembershipService.remove()
- HQ protection
- SUPER_ADMIN protection
- Active net check
- Remove button in member list

---

### US-4.8: Şube Üyelerini Görüntüleme

**Rol:** Kayıtlı Kullanıcı (VOLUNTEER+)
**Kabul Kriterleri:**

- GUEST üye listesini göremez
- VOLUNTEER+ şube detay sayfasında üye listesi görebilir
- Üye adı, çağrı işareti, şube içi rol bilgisi
- Yöneticiler için rol değiştirme ve çıkarma butonları

**Epic 2 Bağımlılıkları (UI koruma kuralları):**

- HQ branch için "çıkar" butonu gizlenmeli (Epic 2 - US-2.2)
- SUPER_ADMIN kullanıcılar için "çıkar" butonu gizlenmeli (Epic 2 - US-2.3)

**Tasks:**

- GET /branches/:id/members endpoint (VOLUNTEER+ only)
- MemberList component
- Admin actions (role change, remove)
- HQ/SUPER_ADMIN için çıkar butonu gizleme

---

### US-4.9: Parola Sıfırlama Talebi İşleme

**Rol:** Şube Yöneticisi
**Kabul Kriterleri:**

- Kullanıcının dahil olduğu TÜM şubelerin adminleri işleyebilir
- İşleme: Onayla (geçici parola) veya Reddet
- Talep işlendiğinde diğer adminler artık göremez

**Tasks:**

- PasswordResetService updates
- Multi-branch admin access
- Processed state handling

