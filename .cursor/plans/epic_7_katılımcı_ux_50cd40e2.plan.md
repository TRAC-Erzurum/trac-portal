---
name: Epic 7 Katılımcı UX
overview: Katılımcı ekleme UX iyileştirmesi - Arama sonuçlarında şube üyelerinin önceliklendirilmesi.
todos:
  - id: participant-search-api
    content: "Participant search: Branch priority sorting"
    status: pending
  - id: participant-search-ui
    content: "Search results: Branch member badge"
    status: pending
  - id: visual-grouping
    content: "Optional: Visual grouping by membership"
    status: pending
isProject: false
---

# Epic 7: Katılımcı Ekleme UX

## Genel Context

Bu epic, çevrime katılımcı eklerken daha iyi bir kullanıcı deneyimi sağlar.

### Bağımlılıklar

- **Bağımlı olduğu:** Epic 4 (Memberships), Epic 5 (Net-Branch)
- **Bağımlı olan:** Yok

### Öncelik

P1 - UX için önemli, ancak core functionality değil.

---

## User Stories

### US-7.1: Katılımcı Aramada Şube Önceliği

**Rol:** Çevrim Operatörü
**İstiyorum ki:** Katılımcı eklerken şube üyeleri önce listelensin
**Böylece:** Şube üyelerini daha hızlı bulabileyim

**Kabul Kriterleri:**

- Arama sonuçları sıralaması:
  1. Önce çevrimin şubesindeki operatörler/üyeler
  2. Sonra diğer şubelerdeki operatörler
- Şube üyeleri görsel olarak ayırt edilebilir (badge/ikon)
- Her kullanıcı her çevrime katılabilir (şube kısıtlaması yok)
- Arama minimum 2 karakter sonrası başlar
- Debounce: 300ms

**Backend Tasks:**

- UserService.searchForParticipant(): Branch priority sorting
- Query param: priorityBranchId
- Response: Include isBranchMember flag

```typescript
// Response structure
{
  users: [
    { id, name, callSign, isBranchMember: true },
    { id, name, callSign, isBranchMember: false },
  ]
}
```

**Frontend Tasks:**

- ParticipantSearch component update
- Branch member badge/indicator
- Visual grouping (optional): "Şube Üyeleri" / "Diğer"
- Existing search functionality preserved

**UX Considerations:**

- Badge color: Primary color for branch members
- Tooltip: "Bu kullanıcı şube üyesidir"
- No functional difference, purely visual prioritization

