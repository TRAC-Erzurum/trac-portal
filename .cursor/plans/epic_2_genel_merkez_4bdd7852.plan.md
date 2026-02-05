---
name: Epic 2 Genel Merkez
overview: Genel Merkez şubesi ve varsayılan şube seçimi - HQ otomatik oluşturma, zorunlu üyelik, SUPER_ADMIN yönetimi ve header dropdown.
todos:
  - id: hq-seed
    content: "Seed script: HQ branch oluşturma"
    status: completed
  - id: hq-protection
    content: HQ edit/delete protection
    status: completed
  - id: hq-auto-membership
    content: İlk onayda HQ'ya otomatik ekleme
    status: completed
  - id: super-admin-protection
    content: SUPER_ADMIN koruma ve otomatik üyelik
    status: completed
  - id: jwt-branch-context
    content: JWT'de branch context yönetimi
    status: completed
  - id: header-dropdown
    content: Header branch dropdown component
    status: completed
isProject: false
---

# Epic 2: Genel Merkez ve Varsayılan Şube

## Genel Context

Bu epic, sistemin temel şube yapısını ve kullanıcı-şube context yönetimini sağlar.

### Bağımlılıklar

- **Bağımlı olduğu:** Epic 1 (Branch entity)
- **Bağımlı olan:** Epic 4, 5, 6, 8

### Mimari Kararlar

- Herkes (SUPER_ADMIN dahil) sadece dahil olduğu şubelerin listelerinde görünür
- Branch context JWT'de saklanır (en son kullanılan)
- Tek SUPER_ADMIN var, silinemez
- SUPER_ADMIN tüm şubelere otomatik dahil

---

## User Stories

### US-2.1: Genel Merkez Otomatik Oluşturma

**Rol:** Sistem
**İstiyorum ki:** Genel Merkez şubesi varsayılan olarak mevcut olsun
**Böylece:** Tüm onaylı kullanıcılar en az bir şubeye dahil olsun

**Kabul Kriterleri:**

- Sistem kurulumunda "Genel Merkez" otomatik oluşturulur
- isHeadquarters: true flag'i ile işaretlenir
- Genel Merkez silinemez ve düzenlenemez
- Genel Merkez her zaman aktif

**Backend Tasks:**

- Seed script: HQ branch oluşturma
- BranchService: isHeadquarters check for delete/edit
- Migration: HQ branch with default callsign

**Frontend Tasks:**

- HQ için edit/delete butonları gizleme
- HQ badge/indicator gösterimi

---

### US-2.2: Zorunlu Genel Merkez Üyeliği

**Rol:** Sistem
**İstiyorum ki:** Herhangi bir şubede onaylanan kullanıcı otomatik Genel Merkez'e de dahil olsun
**Böylece:** Her aktif kullanıcının Genel Merkez erişimi olsun

**Kabul Kriterleri:**

- İlk şube onayında kullanıcı otomatik Genel Merkez'e MEMBER olarak eklenir
- Kullanıcı Genel Merkez'den çıkarılamaz
- SUPER_ADMIN bile Genel Merkez'den çıkarılamaz
- UI'da Genel Merkez için "çıkar" butonu gösterilmez

**Backend Tasks:**

- MembershipService.approve(): HQ auto-add logic
- MembershipService.remove(): HQ protection
- UserBranchMembership: HQ membership validation

**Frontend Tasks:**

- Member list: HQ remove button hidden
- Conditional UI based on isHeadquarters

---

### US-2.3: Süper Yönetici Şube Üyeliği

**Rol:** Sistem
**İstiyorum ki:** Süper yönetici tüm şubelere otomatik dahil olsun
**Böylece:** Tüm şubeleri yönetebilsin

**Kabul Kriterleri:**

- SUPER_ADMIN globalRole'e sahip kullanıcı tüm şubelere otomatik dahildir
- Yeni şube oluşturulduğunda SUPER_ADMIN otomatik eklenir
- SUPER_ADMIN hiçbir şubeden çıkarılamaz
- SUPER_ADMIN silinemez (tek SUPER_ADMIN var)
- Görünürlük: Herkes gibi, dahil olduğu şubelerin listelerinde görünür
- SUPER_ADMIN herhangi bir şubede herhangi bir kullanıcıyı ADMIN yapabilir

**Backend Tasks:**

- BranchService.create(): Auto-add SUPER_ADMIN
- MembershipService.remove(): SUPER_ADMIN protection
- UserService.delete(): SUPER_ADMIN protection

**Frontend Tasks:**

- Member list: SUPER_ADMIN remove button hidden
- Role change UI for SUPER_ADMIN

---

### US-2.4: Varsayılan Şube Seçimi (Header'dan)

**Rol:** Kayıtlı Kullanıcı
**İstiyorum ki:** Header'daki dropdown'dan varsayılan şubemi değiştirebileyim
**Böylece:** Hızlıca context değiştirebileyim

**Kabul Kriterleri:**

- Header'da şube seçim dropdown'u bulunur
- Sadece birden fazla şubesi olan kullanıcılar dropdown'u görür
- Tek şubesi olanlar dropdown yerine şube adını görür (tıklanamaz)
- Sadece onaylı üyelikleri olan şubeler listelenir
- Seçim yapıldığında dashboard ve çevrim listesi güncellenir
- Varsayılan şube: En son kullanılan (ilk kez için Genel Merkez)
- Seçim JWT'de saklanır (session bazlı)

**Backend Tasks:**

- AuthService: currentBranchId in JWT payload
- AuthService: Token refresh with new branch context
- UserController: PATCH /users/me/current-branch endpoint

**Frontend Tasks:**

- HeaderBranchDropdown component
- useBranchStore (Pinia) for branch context
- Auto-refresh on branch change
- Conditional dropdown vs static text

