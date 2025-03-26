# TRAC Erzurum Operatör ve Çevrim Yönetim Sistemi

Operatör ve Çevrim Yönetim Sistemi, amatör telsiz operatörlerinin günlük çevrimlere katılımını yönetmek, istatistiklerini tutmak ve performanslarını takip etmek için TRAC Erzurum Şubesi destekleriyle TA9MFE tarafından geliştirilmiş bir web uygulamasıdır.

## Proje Hakkında

Amatör bir hobi olan telsizcilik faliyetlerinde önemli bir yer alan çevrimlerin yönetiminde ve arşivlenmesinde farkedilen eksikliği giderme amacıyla yola çıkılmıştır. Daha sonra yapılan istişareler ve alınan kararlar neticesinde bir çevrim yönetim sistemi olmaktan çok amatör telsizcilerin kendi amatör kimliklerini yönetebildikleri bir sistem halini almıştır.

Temel özellikleri:
- Günlük çevrimlerin yönetimi
- Operatör katılım takibi
- Detaylı istatistik raporları
- Operatör performans analizi

## Teknik Altyapı

Proje iki ana bileşenden oluşmaktadır:

### Backend (API)
- [NestJS](https://nestjs.com/) framework'ü üzerine inşa edilmiştir
- TypeScript ile geliştirilmiştir
- PostgreSQL veritabanı kullanılmaktadır

### Frontend (Web Arayüzü)
- [Nuxt 3](https://nuxt.com/) framework'ü kullanılmaktadır
- Vue.js tabanlı modern bir arayüz
- TypeScript desteği
- Vuetify component framework'ü

## Geliştirme Ortamının Hazırlanması

Her bir bileşen için detaylı kurulum talimatlarına aşağıdaki bağlantılardan ulaşabilirsiniz:

- [Backend Kurulum Talimatları](./backend/README.md)
- [Frontend Kurulum Talimatları](./frontend/README.md)

## Docker ile Geliştirme Ortamı

Projeyi Docker ile çalıştırmak için:

```bash
# Geliştirme ortamını başlatmak için
docker-compose up --build -d

# Logları görüntülemek için
docker-compose logs -f

# Servisleri durdurmak için
docker-compose down
```

## Deployment (Canlı Ortam)

### GitHub Actions ve Container Registry

Proje, GitHub Actions kullanılarak otomatik olarak build edilir ve GitHub Container Registry'ye (ghcr.io) push edilir. İki farklı mod bulunmaktadır:

- Development (dev) modu: `dev` branche yapılan her pushta tetiklenir. `dev-build.{{build_id}}` etiketi ile versiyonlanır. Ayrıca son güncel dev buildi `dev` etiketine sahiptir.
- Release modu: Yeni bir tag oluşturulduğunda tetiklenerek tag adı ile versiyonlanır. Ayrıca son güncel release buildi `latest` etiketine sahiptir.

### Production Ortamına Kurulum

1. Sunucunuzda Docker ve Docker Compose'un kurulu olduğundan emin olun
2. Production ortamı için gerekli environment değişkenlerini ayarlayın
3. Container'ları çekin ve başlatın:

```bash
# Production ortamı için docker-compose dosyasını kullanarak
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Değişkenleri

Production ortamı için gerekli environment değişkenleri:

```env
# Backend
DATABASE_URL=postgresql://user:password@db:5432/dbname
JWT_SECRET=your-secret-key
API_PORT=3000

# Frontend
API_BASE_URL=https://api.example.com
```

## Katkıda Bulunma

Bu proje açık kaynak bir projedir ve katkılarınızı bekliyoruz. Katkıda bulunmak için aşağıdaki adımları takip edebilirsiniz:

### Geliştirme Ortamının Hazırlanması

1. Projeyi forklayın
2. Yeni bir feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Gerekli bağımlılıkları yükleyin:
   ```bash
   # Backend için
   cd backend && yarn install
   
   # Frontend için
   cd frontend && yarn install
   ```
4. Geliştirme ortamını Docker ile başlatın:
   ```bash
   docker-compose up --build -d
   ```

### Branch Politikası

- `master` ve `dev` branchleri korumalı branchlerdir
- Tüm geliştirmeler `dev` branchinden türetilen feature branchlerinde yapılmalıdır
- Pull requestler `dev` branchine açılmalıdır

### Pull Request Kuralları

1. **Branch İsimlendirmesi**
   - Feature için: `feature/özellik-adı`
   - Bug fix için: `fix/hata-açıklaması`
   - Hotfix için: `hotfix/acil-düzeltme`

2. **Commit Mesajları**
   - İngilizce yazılmalıdır
   - Açıklayıcı ve kısa olmalıdır
   - Örnek format: `feat: add new attendee list`

3. **PR İçeriği**
   - Her PR tek bir amaca hizmet etmelidir
   - PR açıklaması şablona uygun doldurulmalıdır
   - Yapılan değişikliklerin test edildiğinden emin olunmalıdır
   - Conflict olmamalıdır

4. **Code Review**
   - PR'ın merge edilebilmesi için en az bir onay gereklidir
   - Review yorumları yapıcı ve açıklayıcı olmalıdır
   - Tüm CI/CD kontrolleri başarılı olmalıdır

5. **Dokümantasyon**
   - Yeni özellikler için dokümantasyon güncellenmelidir

## Lisans

Bu proje [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](LICENSE) altında lisanslanmıştır.

Bu lisans kapsamında:
- ✅ Projeyi paylaşabilir ve uyarlayabilirsiniz
- ✅ Kaynak göstermek zorundasınız
- ❌ Ticari amaçla kullanamazsınız
- ✅ Değişiklik yaptığınız versiyonları aynı lisans ile paylaşmalısınız 