# Master → Main geçişi — Yapılacaklar listesi

Master branch korumalı olduğu için önce değişiklikler PR ile master’a merge edilmeli, sonra branch adı ve temizlik yapılmalı.

---

## Genel sıra

1. Kod değişiklikleri bir branch’te olacak → PR ile master’a merge.
2. Master’da her şey tamam → GitHub’da default branch’i main yap (master’ı main olarak yeniden adlandır).
3. Branch protection’ı main’e taşı, master’ı sil.
4. main dışındaki tüm branch’leri (local + remote) sil.

---

## Repo 1: trac-portal (ana repo)

### 1.1 Değişiklikleri master’a al (PR ile)

- Değişikliklerin olduğu branch’e geç (örn. `esl` veya yeni bir branch).
- Değişiklikleri commit et (deploy.yml, docs/gelistirici.md, README.md).
- Branch’i push et: `git push -u origin <branch-adı>`.
- GitHub’da **Pull Request** aç: hedef branch **master**.
- PR’ı merge et (merge yetkisi olan biri).

### 1.2 Branch’i master’dan main’e çevir (GitHub + local)

- GitHub: **Settings → Repository → Default branch**.
- **Rename** / düzenle: `master` → `main` yaz, kaydet. (GitHub default branch’i böyle yeniden adlandırır.)
- Local’de (trac-portal clone’unda):
  - `git fetch origin`
  - `git checkout master` (veya şu an hangi branch’teysen)
  - `git branch -m master main`
  - `git fetch origin` (main’i al)
  - `git branch -u origin/main main`
  - `git remote set-head origin main`
- Eski remote master’ı sil: `git push origin --delete master`

### 1.3 Branch protection’ı main’e taşı

- GitHub: **Settings → Branches → Branch protection rules**.
- `master` için kural varsa: **Edit** → Branch name pattern’i `main` yap (veya yeni kural ekle `main` için, sonra master kuralını sil).

### 1.4 main dışındaki branch’leri sil

- Remote branch’leri listele: `git branch -r`
- main dışındaki her biri için:  
`git push origin --delete <branch-adı>` (örn. `esl`, `develop`).
- Local branch’leri listele: `git branch`
- main dışındaki her biri için:  
`git branch -d <branch-adı>` (merge edilmemişse `-D`).

---

## Repo 2: trac-portal-ui

### 2.1 Repo içinde master → main referanslarını güncelle

- Repoyu clone’la / güncelle.
- `.github/workflows/*.yml` içinde `master` geçen yerleri `main` yap.
- Varsa README / CONTRIBUTING / diğer dokümanlarda `master` → `main`.
- Commit + yeni bir branch’e push (örn. `chore/main-rename`).

### 2.2 Bu değişiklikleri master’a al (PR)

- PR aç: bu branch → **master**.
- PR’ı merge et.

### 2.3 Branch’i main yap ve temizlik

- GitHub: Default branch’i `master` → `main` olarak yeniden adlandır.
- Local: `git fetch origin`, `git branch -m master main`, `git push -u origin main`, `git push origin --delete master`.
- Branch protection’ı main için ayarla, master kuralını kaldır.
- main dışındaki branch’leri remote ve local’den sil.

---

## Repo 3: trac-portal-api

### 3.1 Repo içinde master → main referanslarını güncelle

- Repoyu clone’la / güncelle.
- `.github/workflows/*.yml` ve varsa dokümanlarda `master` → `main`.
- Commit + branch’e push.

### 3.2 Bu değişiklikleri master’a al (PR)

- PR aç: bu branch → **master**.
- PR’ı merge et.

### 3.3 Branch’i main yap ve temizlik

- GitHub: Default branch’i `main` yap (master’ı main olarak yeniden adlandır).
- Local: aynı adımlar (branch -m, push main, delete master).
- Branch protection’ı main’e taşı.
- main dışındaki branch’leri sil.

---

## Özet kontrol listesi


| Yapılacak                     | trac-portal | trac-portal-ui | trac-portal-api |
| ----------------------------- | ----------- | -------------- | --------------- |
| Workflow/doküman güncellemesi | ✅ (yapıldı) | Yapılacak      | Yapılacak       |
| PR ile master’a merge         | Yapılacak   | Yapılacak      | Yapılacak       |
| Default branch → main         | Yapılacak   | Yapılacak      | Yapılacak       |
| Branch protection → main      | Yapılacak   | Yapılacak      | Yapılacak       |
| master’ı remote’dan sil       | Yapılacak   | Yapılacak      | Yapılacak       |
| Diğer branch’leri sil         | Yapılacak   | Yapılacak      | Yapılacak       |


---

## Notlar

- **Master’a push engelli:** Tüm kod değişiklikleri mutlaka **başka bir branch’te** commit edilip **PR ile master’a** merge edilmeli.
- **Sıra:** Önce her repoda “main’e göre” kod (workflow + doküman) master’da olsun, sonra default branch’i main yapıp master’ı silin.
- **mmdvm-link:** Zaten default main; sadece istersen diğer branch’leri temizleyebilirsin.

