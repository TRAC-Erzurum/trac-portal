# Geliştirici dökümanı

Bu sayfa projeye **kod veya teknik katkı** sunacaklar içindir. Genel bilgi ve kullanıcı geri bildirimi [README](../README.md)’de; yalnızca hata/öneri iletmek isteyenler README’deki **“Geri bildirim / hata bildirimi”** bölümüne ve [trac-portal — Issues](https://github.com/TRAC-Erzurum/trac-portal/issues) sayfasına baksın.

**Kısa özet:** Issue’lar yalnızca **ana repoda** (trac-portal). PR’lar değişikliğin olduğu repoya açılır: UI → trac-portal-ui, API → trac-portal-api; hedef branch **master** (koruma altında, doğrudan push yok). Deploy: PR merge sonrası ürün sahipleri son testi yapar ve deployment’ı manuel başlatır; geliştirici deploy tetiklemez.

---

## Proje yapısı

Ana repo (**trac-portal**) iki git submodule içerir; her biri ayrı GitHub repo’sudur. Kurulum ve komutlar ilgili proje README’sinde:

| Proje | GitHub repo | README (ana repoda) |
|-------|-------------|---------------------|
| Backend (NestJS, PostgreSQL) | [TRAC-Erzurum/trac-portal-api](https://github.com/TRAC-Erzurum/trac-portal-api) | [trac-portal-api/README.md](../trac-portal-api/README.md) |
| Frontend (Vue 3, Vite) | [TRAC-Erzurum/trac-portal-ui](https://github.com/TRAC-Erzurum/trac-portal-ui) | [trac-portal-ui/README.md](../trac-portal-ui/README.md) |

Submodule’leri henüz klonlamadıysanız: `git submodule update --init --recursive`.

---

## UI projesine nasıl katkı yapılır?

1. **Issue’lar nerede?**  
   Tüm issue’lar **yalnızca ana repoda** (trac-portal): [trac-portal — Issues](https://github.com/TRAC-Erzurum/trac-portal/issues). Yeni görev almak veya hata/öneri takip etmek için buraya bakın.

2. **PR nereye açılır?**  
   UI kod değişiklikleri için PR’ı **trac-portal-ui** repo’suna, **master** branch’ine açarsınız (ana repoya değil).  
   Repo: [TRAC-Erzurum/trac-portal-ui](https://github.com/TRAC-Erzurum/trac-portal-ui).  
   **master** korumalıdır; doğrudan push yok, katkı yalnızca PR ile.

3. **Akış:**  
   trac-portal-ui’yi fork’layın → kendi fork’unuzda branch açın → değişikliği yapın → [TRAC-Erzurum/trac-portal-ui](https://github.com/TRAC-Erzurum/trac-portal-ui) içinde **master**’a Pull Request açın.

4. **PR kuralları:**  
   - UI değişikliklerinde PR açıklamasında **ekran görüntüsü** zorunlu.  
   - Tasarım proje diline uymalı; ana repodaki [.cursor/rules](../.cursor/rules) (design-system, component-patterns) kontrol edin.

5. **Deploy nasıl olur?**  
   PR merge edildikten sonra trac-portal-ui’de CI imajı build edilir. **Canlıya alma (deployment) ürün sahipleri tarafından yapılır:** merge sonrası ürün sahipleri son kez test eder, ardından ana repodaki deploy workflow’unu manuel başlatır. Geliştirici deploy tetiklemez.

---

## API (backend) projesine nasıl katkı yapılır?

1. **Issue’lar nerede?**  
   Yine **yalnızca ana repoda** (trac-portal): [trac-portal — Issues](https://github.com/TRAC-Erzurum/trac-portal/issues).

2. **PR nereye açılır?**  
   Backend kod değişiklikleri için PR’ı **trac-portal-api** repo’suna, **master** branch’ine açarsınız.  
   Repo: [TRAC-Erzurum/trac-portal-api](https://github.com/TRAC-Erzurum/trac-portal-api).  
   **master** korumalıdır; doğrudan push yok, katkı yalnızca PR ile.

3. **Akış:**  
   trac-portal-api’yi fork’layın → kendi fork’unuzda branch açın → değişikliği yapın → [TRAC-Erzurum/trac-portal-api](https://github.com/TRAC-Erzurum/trac-portal-api) içinde **master**’a Pull Request açın.

4. **PR kuralları:**  
   - Tasarım/API kurallarına uyun; gerekirse ana repodaki [.cursor/rules](../.cursor/rules) (backend-structure, api-patterns vb.)’e bakın.

5. **Deploy nasıl olur?**  
   PR merge edildikten sonra trac-portal-api’de CI imajı build edilir. **Canlıya alma ürün sahipleri tarafından yapılır:** merge sonrası ürün sahipleri son kez test eder, ardından ana repodaki deploy workflow’unu manuel başlatır. Geliştirici deploy tetiklemez.

---

## Ortam değişkenleri (ana repo)

Kökte `.env.example` → `.env` kopyalayın. Örnek değişkenler:

| Değişken | Açıklama |
|----------|----------|
| `PORT` | UI portu (örn. 80) |
| `API_BASE_URL`, `FRONTEND_URL` | API ve frontend URL’leri |
| `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL (docker-compose’da `DB_USER` da kullanılır) |
| `JWT_SECRET`, `COOKIE_SECRET`, `SESSION_SECRET`, `JWT_EXPIRES_IN` | Oturum ve güvenlik |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Google OAuth |
| `DOMAIN` | Production domain (deploy için) |
| `NODE_ENV` | Ortam (production / development) |

UI ve API’ye özel değişkenler ilgili submodule README’lerinde.

## Docker (production)

Kökteki `docker-compose.yml`: UI, API, PostgreSQL, certbot. İmajlar GHCR’dan; `UI_TAG`, `API_TAG` veya tek `TAG` ile sürüm seçilir.

```bash
export UI_TAG=latest API_TAG=latest
# .env dolu olmalı (DOMAIN, DB_*, JWT_*, vb.)
docker compose up -d
```

Yerel geliştirme için API ve UI’yı ayrı çalıştırın; ilgili submodule README’sine bakın.

## Deployment (ürün sahipleri)

Ana repoda [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) manuel tetiklenir (workflow_dispatch). UI/API sürümü seçilebilir (varsayılan latest). SSH ile sunucuya dosya atılır, GHCR’dan imaj çekilir. Gerekli repo secret’ları: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `REPO_ACCESS_TOKEN`. Bu süreci ürün sahipleri, merge sonrası son testin ardından başlatır.

## Katkıda bulunanlar

Katkıda bulunanların listesi: [contributors.md](contributors.md).
