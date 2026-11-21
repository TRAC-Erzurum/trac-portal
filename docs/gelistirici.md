# Geliştirici dökümanı

Bu sayfa projeye **kod veya teknik katkı** sunacaklar içindir. Genel bilgi ve kullanıcı geri bildirimi [README](../README.md)’de; yalnızca hata/öneri iletmek isteyenler README’deki **“Geri bildirim / hata bildirimi”** bölümüne ve [trac-portal — Issues](https://github.com/TRAC-Erzurum/trac-portal/issues) sayfasına baksın.

**Kısa özet:** Issue’lar yalnızca **ana repoda** (trac-portal). PR’lar değişikliğin olduğu repoya açılır: UI → trac-portal-ui, API → trac-portal-api; hedef branch **main** (koruma altında, doğrudan push yok). Deploy: PR merge sonrası ürün sahipleri son testi yapar ve canlıya alma işlemini manuel olarak yapar; geliştirici deploy tetiklemez.

---

## Proje yapısı

Ana repo (**trac-portal**) üç git submodule içerir; her biri ayrı GitHub repo’sudur. Kurulum ve komutlar ilgili proje README’sinde:

| Proje | GitHub repo | README (ana repoda) |
|-------|-------------|---------------------|
| Backend (NestJS, PostgreSQL) | [TRAC-Erzurum/trac-portal-api](https://github.com/TRAC-Erzurum/trac-portal-api) | [trac-portal-api/README.md](../trac-portal-api/README.md) |
| Frontend (Vue 3, Vite) | [TRAC-Erzurum/trac-portal-ui](https://github.com/TRAC-Erzurum/trac-portal-ui) | [trac-portal-ui/README.md](../trac-portal-ui/README.md) |
| Çevre bağlantısı (MMDVM, Python) | [TRAC-Erzurum/mmdvm-link](https://github.com/TRAC-Erzurum/mmdvm-link) | [mmdvm-link/README.md](../mmdvm-link/README.md) |

Submodule’leri henüz klonlamadıysanız: `git submodule update --init --recursive`.

Her submodule’ün kendi `AGENTS.md` dosyası ve (varsa) `docs/conventions/` klasörü, o projenin kod kurallarını ve doğrulama komutunu (`verify`) içerir. Katkıdan önce ilgili olanı okuyun.

---

## UI projesine nasıl katkı yapılır?

1. **Issue’lar nerede?**  
   Tüm issue’lar **yalnızca ana repoda** (trac-portal): [trac-portal — Issues](https://github.com/TRAC-Erzurum/trac-portal/issues). Yeni görev almak veya hata/öneri takip etmek için buraya bakın.

2. **PR nereye açılır?**  
   UI kod değişiklikleri için PR’ı **trac-portal-ui** repo’suna, **main** branch’ine açarsınız (ana repoya değil).  
   Repo: [TRAC-Erzurum/trac-portal-ui](https://github.com/TRAC-Erzurum/trac-portal-ui).  
   **main** korumalıdır; doğrudan push yok, katkı yalnızca PR ile.

3. **Akış:**  
   trac-portal-ui’yi fork’layın → kendi fork’unuzda branch açın → değişikliği yapın → [TRAC-Erzurum/trac-portal-ui](https://github.com/TRAC-Erzurum/trac-portal-ui) içinde **main**’e Pull Request açın.

4. **PR kuralları:**  
   - UI değişikliklerinde PR açıklamasında **ekran görüntüsü** zorunlu.  
   - Tasarım proje diline uymalı; trac-portal-ui’nin `AGENTS.md` ve `docs/conventions/` dosyalarındaki kurallara bakın.

5. **Deploy nasıl olur?**  
   PR merge edildikten sonra trac-portal-ui’de CI imajı build edilir. **Canlıya alma (deployment) ürün sahipleri tarafından yapılır:** merge sonrası ürün sahipleri son kez test eder ve ardından canlıya alma işlemini manuel olarak başlatır. Geliştirici deploy tetiklemez.

---

## API (backend) projesine nasıl katkı yapılır?

1. **Issue’lar nerede?**  
   Yine **yalnızca ana repoda** (trac-portal): [trac-portal — Issues](https://github.com/TRAC-Erzurum/trac-portal/issues).

2. **PR nereye açılır?**  
   Backend kod değişiklikleri için PR’ı **trac-portal-api** repo’suna, **main** branch’ine açarsınız.  
   Repo: [TRAC-Erzurum/trac-portal-api](https://github.com/TRAC-Erzurum/trac-portal-api).  
   **main** korumalıdır; doğrudan push yok, katkı yalnızca PR ile.

3. **Akış:**  
   trac-portal-api’yi fork’layın → kendi fork’unuzda branch açın → değişikliği yapın → [TRAC-Erzurum/trac-portal-api](https://github.com/TRAC-Erzurum/trac-portal-api) içinde **main**’e Pull Request açın.

4. **PR kuralları:**  
   - API kurallarına uyun; trac-portal-api’nin `AGENTS.md` ve `docs/conventions/` dosyalarına bakın.

5. **Deploy nasıl olur?**  
   PR merge edildikten sonra trac-portal-api’de CI imajı build edilir. **Canlıya alma ürün sahipleri tarafından yapılır:** merge sonrası ürün sahipleri son kez test eder ve ardından canlıya alma işlemini manuel olarak başlatır. Geliştirici deploy tetiklemez.

---

## Agent ile geliştirme

Projede yapay zeka ajanlarıyla (Claude Code, Copilot, Cursor vb.) çalışmak isteyenler için kurallar ana repodaki [AGENTS.md](../AGENTS.md) dosyasında toplanmıştır. Agent dokümanları araçtan bağımsız düz Markdown’dır; hangi aracı kullandığınız fark etmez. Her submodule’ün kendi `AGENTS.md` dosyası, o projenin kurallarını ve `verify` komutunu tanımlar.

---

## Ortam değişkenleri (ana repo)

Kökte `.env.example` → `.env` kopyalayın. Değişkenlerin tam listesi ve anlamları:

| Değişken | Açıklama |
|----------|----------|
| `UI_TAG`, `API_TAG` | Kullanılacak UI ve API imaj sürümü (örn. `v0.4.21`) |
| `PORT` | API portu (varsayılan 8000) |
| `DOMAIN` | Production domain (Traefik yönlendirmesi ve OIDC issuer için) |
| `NODE_ENV` | Ortam (production / development) |
| `DB_HOST`, `DB_PORT`, `DB_SSL`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL bağlantısı |
| `JWT_SECRET`, `JWT_EXPIRES_IN`, `COOKIE_SECRET`, `SESSION_SECRET` | Oturum ve güvenlik |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Google OAuth |
| `PUBLIC_API_ORIGIN` | OIDC sağlayıcısının dış adresi (issuer: `<origin>/api/oidc`); docker-compose’da `https://${DOMAIN}` olarak türetilir |
| `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Cloudflare R2 (yüklemeler) |
| `GITHUB_REPO_WEB_URL`, `GITHUB_FEEDBACK_TOKEN` | Uygulama içi geri bildirim entegrasyonu |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile (CAPTCHA) |

UI ve API’ye özel değişkenler ilgili submodule README’lerinde.

### Ortam değişkenleri nerede tutulur?

Uygulama yapılandırması **deploy edilen sunucudaki** `.env` dosyasında tutulur; bu dosya `docker-compose.yml` ve `update.sh` ile aynı dizinde durur. Bu dosya ilk kurulumda sunucuda oluşturulur; sürüm güncellemelerinde yalnızca `UI_TAG` ve `API_TAG` satırları değişir. Gerçek değerleri repoya, issue’lara veya PR’lara yazmayın.

## Docker (production)

Kökteki `docker-compose.yml` üretim sunucusu içindir ve iki servis içerir: `api` ve `ui`. Topoloji şöyledir:

- Her iki servis de `internal` ağındadır; `ui` ayrıca dış `edge` ağı üzerinden sunucudaki Traefik’e bağlanır ve `DOMAIN` adresinden yayınlanır.
- `api`, dış `data` ağındaki PostgreSQL’e bağlanır.
- İmajlar GHCR’dan çekilir; sürüm `UI_TAG` ve `API_TAG` ile seçilir.

`edge` ve `data` ağları ve Traefik/PostgreSQL bileşenleri sunucuda hazır olmalıdır; bu dosya yerelde tek başına çalışmaz. Yerel geliştirme için API ve UI’yı ayrı çalıştırın; ilgili submodule README’sine bakın.

## İç ağdan erişim (LAN)

UI ve API'yi aynı makinede çalıştırıp **iç ağdaki diğer cihazlardan** (telefon, tablet, başka bilgisayar) erişmek için:

1. **Backend:** API zaten `0.0.0.0` üzerinde dinler; ek ayar gerekmez.
2. **Frontend:** Vite dev sunucusu `host: true` ile tüm arayüzlerde dinler; `/api` istekleri otomatik olarak backend'e proxy edilir.
3. **Ortam:** UI projesinde (trac-portal-ui) `.env` içinde **iç ağ kullanımı için** API adresini relative yapın:
   ```bash
   VITE_API_URL=/api
   ```
   Böylece tarayıcı istekleri `http://<makine-ip>:5173/api` üzerinden gider ve Vite bu istekleri backend'e yönlendirir.
4. **Erişim:** İç ağdaki cihazlarda tarayıcıda şu adresi açın:
   - **UI:** `http://<bu-makinanin-yerel-ip>:5173`  
   Örnek: `http://192.168.1.100:5173`  
   Makinenin yerel IP'sini öğrenmek: Windows `ipconfig`, macOS/Linux `ip addr` veya `ifconfig`.

**Not:** Sadece kendi bilgisayarınızdan `localhost` ile kullanacaksanız `VITE_API_URL=http://localhost:8000/api` kalabilir. İç ağdan erişecek cihazlar varsa `VITE_API_URL=/api` kullanın.

## Deployment (ürün sahipleri)

Canlıya alma işlemi ürün sahipleri tarafından, merge sonrası son testin ardından manuel olarak yapılır. Geliştiricilerin deploy tetiklemesi beklenmez.

## Katkıda bulunanlar

Katkıda bulunanların listesi: [contributors.md](contributors.md).
