---
name: Epic 8 Dashboard Stats
overview: Dashboard şube istatistikleri - Kişisel ve topluluk istatistiklerinin şube bazlı filtrelenmesi.
todos:
  - id: user-branch-stats
    content: "Kişisel istatistikler: Şube bazlı hesaplama"
    status: pending
  - id: branch-stats
    content: Şube topluluk istatistikleri endpoint
    status: pending
  - id: global-stats
    content: Genel sistem istatistikleri
    status: pending
  - id: dashboard-ui
    content: "Dashboard: Branch-aware stats components"
    status: pending
isProject: false
---

# Epic 8: Dashboard Şube İstatistikleri

## Genel Context

Bu epic, dashboard istatistiklerinin şube context'ine göre filtrelenmesini sağlar.

### Bağımlılıklar

- **Bağımlı olduğu:** Epic 2 (Branch context), Epic 5 (Net-Branch)
- **Bağımlı olan:** Yok

### Mimari Kararlar

- İstatistikler header'daki seçili şubeye göre filtrelenir
- Genel istatistikler ayrı bölümde gösterilir
- GUEST sadece dashboard istatistiklerini görebilir

---

## User Stories

### US-8.1: Şube Bazlı Kişisel İstatistikler

**Rol:** Kayıtlı Kullanıcı
**İstiyorum ki:** Dashboard'da seçili şubeme ait istatistiklerimi görebileyim
**Böylece:** Şubedeki performansımı takip edebileyim

**Kabul Kriterleri:**

- Header'da seçili şubeye göre filtrelenir
- Gösterilecek istatistikler:
  - Seçili şubede katıldığım çevrim sayısı
  - Seçili şubede yönettiğim çevrim sayısı
  - Şube içi seri kaydım (consecutive participation)
- Genel istatistikler ayrı "Genel" bölümünde gösterilir
- Şube değiştiğinde istatistikler yenilenir

**Backend Tasks:**

- StatsService.getUserBranchStats(userId, branchId)
- GET /stats/me?branchId=xxx endpoint
- Calculation logic: Branch-filtered aggregations

```typescript
// Response structure
{
  branch: {
    participatedNets: 45,
    managedNets: 12,
    currentStreak: 5
  },
  global: {
    totalParticipatedNets: 120,
    totalManagedNets: 30,
    longestStreak: 15
  }
}
```

**Frontend Tasks:**

- DashboardStats component: Branch section
- useBranchStore integration
- Loading state on branch change
- Stats cards with branch context

---

### US-8.2: Şube Bazlı Topluluk İstatistikleri

**Rol:** Kayıtlı Kullanıcı
**İstiyorum ki:** Şube bazlı topluluk istatistiklerini görebileyim
**Böylece:** Şubenin genel performansını takip edebileyim

**Kabul Kriterleri:**

- Header'da seçili şubeye göre filtrelenir
- Gösterilecek istatistikler:
  - Şube toplam çevrim sayısı
  - Şube en aktif operatörler (top 5)
  - Şube en çok katılımcılı çevrimler (top 5)
- Genel (tüm sistem) istatistikler ayrı bölümde
- Şube değiştiğinde istatistikler yenilenir

**Backend Tasks:**

- StatsService.getBranchStats(branchId)
- StatsService.getGlobalStats()
- GET /stats/branch/:branchId endpoint
- GET /stats/global endpoint

```typescript
// Response structure
{
  branch: {
    totalNets: 150,
    topOperators: [...],
    topNets: [...]
  },
  global: {
    totalNets: 5000,
    totalUsers: 1200,
    topBranches: [...]
  }
}
```

**Frontend Tasks:**

- CommunityStats component: Branch section
- TopOperators leaderboard
- TopNets list
- Global stats section

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Header with Branch Dropdown]                          │
├─────────────────────────────────────────────────────────┤
│  📊 Kişisel İstatistikler (Seçili Şube)                │
│  ┌─────────┬─────────┬─────────┐                       │
│  │ Katılım │ Yönetim │ Seri    │                       │
│  │   45    │   12    │   5     │                       │
│  └─────────┴─────────┴─────────┘                       │
├─────────────────────────────────────────────────────────┤
│  👥 Şube İstatistikleri                                │
│  ┌─────────────────┬─────────────────┐                 │
│  │ Toplam Çevrim   │ En Aktif        │                 │
│  │     150         │ Operatörler     │                 │
│  └─────────────────┴─────────────────┘                 │
├─────────────────────────────────────────────────────────┤
│  🌍 Genel İstatistikler                                │
│  Toplam Çevrim: 5000 | Toplam Üye: 1200                │
└─────────────────────────────────────────────────────────┘
```

