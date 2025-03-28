[![API Build](https://github.com/TRAC-Erzurum/trac-portal-api/actions/workflows/docker-ghrc.yaml/badge.svg)](https://github.com/TRAC-Erzurum/trac-portal-api/actions/workflows/docker-ghrc.yaml)
[![UI Build](https://github.com/TRAC-Erzurum/trac-portal-ui/actions/workflows/docker-ghrc.yaml/badge.svg)](https://github.com/TRAC-Erzurum/trac-portal-ui/actions/workflows/docker-ghrc.yaml)

---

# TRAC Erzurum Operatör ve Çevrim Yönetim Sistemi

Operatör ve Çevrim Yönetim Sistemi, amatör telsiz operatörlerinin günlük çevrimlere katılımını yönetmek, istatistiklerini tutmak ve performanslarını takip etmek için TRAC Erzurum Şubesi destekleriyle TA9MFE tarafından geliştirilmiş bir web uygulamasıdır.

## Proje Hakkında

Amatör bir hobi olan telsizcilik faliyetlerinde önemli bir yer alan çevrimlerin yönetiminde ve arşivlenmesinde farkedilen eksikliği giderme amacıyla yola çıkılmıştır. Daha sonra yapılan istişareler ve alınan kararlar neticesinde bir çevrim yönetim sistemi olmaktan çok amatör telsizcilerin kendi amatör kimliklerini yönetebildikleri bir sistem halini almıştır.

### Temel özellikleri:

- Günlük çevrimlerin yönetimi
- Operatör katılım takibi
- Detaylı istatistik raporları
- Operatör performans analizi

## Katkıda Bulunma

Gönüllülük esasıyla geliştirilen bu proje, katkı sunmak isteyen tüm gönüllülerin desteğine açıktır. Teknik altyapınız olsun veya olmasın projeye katkıda bulunabilirsiniz. Aşağıda yer alan alanlardan birinde katkı sağlamak isterseniz bizimle iletişime geçebilirsiniz.

### Yazılım Geliştirme

Projede ağırlıklı olarak frontend developer ihtiyacı bulunmaktadır. Arayüz geliştirme deneyiminiz veya öğrenme isteğiniz varsa bizimle iletişime geçebilirsiniz.

Ayrıca backend geliştirme, CI/CD ve teknik dökümantasyon konusunda yardımcı olmak isteyen gönüllüler de katkı sunmak istediği taktirde iletişime geçebilirler.

#### Backend (API)

- [NestJS](https://nestjs.com/) framework üzerine inşa edilmiştir
- TypeScript ile geliştirilmiştir
- PostgreSQL veritabanı kullanılmaktadır

Backend projesine [katkıda bulunun.](./trac-portal-api/README.md)

#### Frontend (Web Arayüzü)

- [Nuxt 3](https://nuxt.com/) framework üzerine geliştirilmiştir
- Vue.js tabanlı modern bir arayüz sunmaktadır
- Vuetify component kullanılmıştır

Frontend projesine [katkıda bulunun.](./trac-portal-ui/README.md)

### QA/Test

Projede kalite standardını yüksek tutmak için test süreçlerinin oturtulmasına ihtiyacımız var. Bu konuda yardımcı olmak isteyen QA/Test mühendisleri bizimle iletişim kurabilirler.

### Ürün Yönetimi ve Dökümantasyon

Projenin yol haritasını çizmede bize yardımcı olacak ürün yöneticilerine ihtiyaç duymaktayız.

## Sık Sorulan Sorular

**1. Yazılım geliştiricisiyim, katkı sunmak istiyorum, ne yapmam gerekiyor?**

Proje belli olgunluğa gelinceye kadar kaynak kodları yalnızca belirli kişiler tarafından erişilebilir durumda olacaktır. Burada amaç, kod kalitesini ve kültürünü oturtmayı kolaylaştırmaktır.

Projenin issue takibi [github issues](https://github.com/TRAC-Erzurum/trac-portal/issues) sayfasından yapılmaktadır. Kaynak kodlara erişmek ve burada yer alan issuelara katkı sunmak için [katkıda bulunma](./docs/contribution.md) dökümanını takip edebilirsiniz.

**2. QA/Test mühendisiyim, katkı sunmak istiyorum, ne yapmam gerekiyor?**

Ürünü inceleyerek başlayabilirsiniz. Gördüğünüz hata/bug/sorunları bize bildirmenizi bekliyoruz. Sorun bildirme ile alakalı detaylı bilgiye [buradan](./docs/bug-reporting.md) ulaşabilirsiniz.

Test otomasyon sürecine katkıda bulunmak isterseniz [katkıda bulunma](./docs/contribution.md) dökümanını okuyabilirsiniz.

**3. Ürün yönetimi deneyimim var, katkı sunmak istiyorum, ne yapmam gerekiyor?**

İlk aşamada ürünü kullanmanızı ve bize geri bildirim vermenizi bekliyoruz. Geri bildirim ile alakalı detaylı bilgiye [buradan](./docs/feedback.md) ulaşabilirsiniz.

**4. Hiçbir teknik altyapım yok, ben nasıl katkı sunabilirim?**

Ürünün geniş kitlelerce kullanılmaası bizim için en büyük motivasyon kaynağı. Lütfen aktif olarak ürünü kullanın. Unutmayın, bu proje sizler için ve sizlerin sayesinde var.

Ürünü kullanırken farkettiğiniz her problem için [burada](./docs/bug-reporting.md) yer alan talimatları takip ederek bildirimde bulunabilirsiniz.

Üründe olması gerektiğini düşündüğünüz yeni özellikler için [burada](./docs/feedback.md) yer alan talimatları takip ederek geri bildirimde bulunabilirsiniz.

## Lisans

Bu proje [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](LICENSE) altında lisanslanmıştır.

Bu lisans kapsamında:

- ✅ Projeyi paylaşabilir ve uyarlayabilirsiniz
- ✅ Kaynak göstermek zorundasınız
- ❌ Ticari amaçla kullanamazsınız
- ✅ Değişiklik yaptığınız versiyonları aynı lisans ile paylaşmalısınız
