---
name: Şube Yönetimi User Stories
overview: TRAC Portal için şube/temsilcilik yönetimi özelliğinin user story'leri. Şube bazlı roller, iletişim altyapısı ve onay akışlarını içeren kapsamlı user story seti.
todos:
  - id: final-review
    content: Son gözden geçirme ve onay
    status: pending
isProject: false
---

# Şube/Temsilcilik Yönetimi - User Stories (v4 - Final)

## Mimari Değişiklik: Şube Bazlı Roller

Mevcut sistemde kullanıcının tek bir global rolü var. Yeni sistemde:

- Kullanıcı **global olarak** sadece GUEST veya SUPER_ADMIN olabilir
- Diğer roller (ADMIN, MEMBER, VOLUNTEER) **şube bazında** atanır
- Bir kullanıcı A şubesinde ADMIN, B şubesinde VOLUNTEER olabilir
- SUPER_ADMIN tüm şubelerde tam yetkiye sahiptir
- **Herkes (SUPER_ADMIN dahil) sadece dahil olduğu şubelerin listelerinde görünür**

```
┌─────────────────────────────────────────────────────────┐
│                      User                               │
│  globalRole: GUEST | SUPER_ADMIN                        │
└─────────────────────────────────────────────────────────┘
                           │
                           │ 1:N
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  UserBranchMembership                   │
│  userId, branchId, role, status, isDefault              │
│  role: ADMIN | MEMBER | VOLUNTEER                       │
│  status: PENDING | APPROVED | REJECTED                  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ N:1
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      Branch                             │
│  name, type, callSigns[], isActive, isHeadquarters      │
└─────────────────────────────────────────────────────────┘
```

## Kesinleşen Kararlar


| Konu                   | Karar                                              |
| ---------------------- | -------------------------------------------------- |
| CallSign               | Global unique, tek default, ayrı tablo             |
| SUPER_ADMIN görünürlük | Herkes gibi, sadece dahil olduğu şubelerde görünür |
| Şube silindiğinde      | Tüm ilişkili çevrimler pasife çekilir              |
| Kullanıcı silindiğinde | Tüm kayıtları silinir, istisnasız                  |
| Branch context         | JWT'de saklanır                                    |
| Default şube           | En son kullanılan                                  |
| Üyelik talebi süresi   | Expire olmaz                                       |
| Admin yetki atama      | Şube admini kendi şubesinde başka admin atayabilir |
| GUEST şube detayı      | Üye/operatör listesi hariç herşeyi görebilir       |
| Çevrim listesi GUEST   | Göremez, sadece dashboard istatistikleri           |
| Branch dropdown        | Sadece çoklu şubesi olanlar görür                  |
| Altyapı tutorials      | DB'de saklanır, şimdilik admin düzenleyemez        |
| Beklenen şube sayısı   | Max ~100                                           |
| Migration              | HQ + Erzurum şubesi, mevcut roller korunur         |


---

## Epic 1: Şube Entity ve Temel CRUD

### US-1.1: Şube Oluşturma

**Rol:** Süper Yönetici  
**İstiyorum ki:** Yeni şube veya temsilcilik oluşturabileyim  
**Böylece:** TRAC'ın farklı şehirlerdeki yapılanmaları sisteme tanımlanabilsin

**Kabul Kriterleri:**

- Şube adı zorunlu ve sistemde unique olmalı
- En az bir çağrı işareti zorunlu (genellikle YM ile başlar: YM9KE, YM9ERZ)
- Çağrı işaretleri sistemde unique olmalı (farklı şubeler aynı çağrı işaretini kullanamazlar)
- İlk çağrı işareti varsayılan olarak işaretlenir
- Tür seçimi: Şube veya Temsilcilik (sadece görsel ayrım)
- İletişim bilgileri: adres, telefon, email (opsiyonel)
- Sadece SUPER_ADMIN erişebilir
- Oluşturulan şubeye SUPER_ADMIN otomatik dahil edilir

---

### US-1.2: Şube Listeleme

**Rol:** Giriş yapmış kullanıcı  
**İstiyorum ki:** Tüm şube ve temsilcilikleri listeleyebileyim  
**Böylece:** Hangi şubelerin var olduğunu görebileyim

**Kabul Kriterleri:**

- Tüm aktif şubeler listelenir
- Şube adı, türü, çağrı işaretleri görüntülenir
- Şube detay sayfasına link verilir
- Pasif (silinmiş) şubeler normal kullanıcılara gösterilmez
- SUPER_ADMIN pasif şubeleri de görebilir (ayrı filtre ile)

---

### US-1.3: Şube Detay Görüntüleme

**Rol:** Giriş yapmış kullanıcı  
**İstiyorum ki:** Bir şubenin detaylarını görebileyim  
**Böylece:** İletişim bilgilerine ve şube aktivitelerine ulaşabileyim

**Kabul Kriterleri:**

- Herkes görebilir: Şube adı, türü, çağrı işaretleri, iletişim bilgileri
- Herkes görebilir: İletişim altyapıları listesi (röle, echolink, DMR vb.)
- Herkes görebilir: Çevrim istatistikleri (toplam sayı, son çevrim tarihi)
- Herkes görebilir: Çevrim listesi ve detayları
- **GUEST göremez:** Üye listesi, operatör listesi
- VOLUNTEER+ görebilir: Üye listesi, operatör listesi
- SUPER_ADMIN için: Şube aktif/pasif toggle butonu (sadece SUPER_ADMIN görür)

---

### US-1.4: Şube Bilgilerini Düzenleme

**Rol:** Şube Yöneticisi  
**İstiyorum ki:** Yönetici olduğum şubenin bilgilerini güncelleyebileyim  
**Böylece:** İletişim bilgileri güncel tutulabilsin

**Kabul Kriterleri:**

- Yönetici (o şubede ADMIN rolü) sadece kendi şubesini düzenleyebilir
- Genel Merkez düzenlenemez (SUPER_ADMIN dahil)
- Şube adı ve çağrı işaretleri unique kontrolü yapılır
- SUPER_ADMIN tüm şubeleri düzenleyebilir (Genel Merkez hariç)
- Çağrı işaretlerinden biri varsayılan olarak işaretlenebilir

---

### US-1.5: Şube Pasife Alma ve Geri Getirme

**Rol:** Süper Yönetici  
**İstiyorum ki:** Artık aktif olmayan şubeyi pasif yapabileyim ve gerekirse geri getirebiileyim  
**Böylece:** Geçmiş veriler korunurken şube listeden kaldırılabilsin

**Kabul Kriterleri:**

- Sadece SUPER_ADMIN pasif yapabilir ve geri getirebilir
- Genel Merkez pasif yapılamaz
- Şube detay sayfasında toggle butonu ile yapılır
- **Şube pasif yapıldığında:**
  - Şubeye ait TÜM çevrimler otomatik pasife çekilir
  - Üyelik ilişkileri korunur (veri kaybı yok)
  - Pasif çevrimler ve diğer kayıtlar kimse tarafından görünmez (SUPER_ADMIN dahil)
- **Şube aktif yapıldığında:**
  - Şube tekrar listelerde görünür
  - Çevrimler ve diğer kayıtlar otomatik aktif olur
- **SUPER_ADMIN pasif şubeleri** ayrı bir listede (/admin/inactive-branches) görebilir ve aktif edebilir
- **SUPER_ADMIN pasif çevrimleri göremez** - şube aktif edildiğinde otomatik gelir

---

## Epic 2: Genel Merkez ve Varsayılan Şube

### US-2.1: Genel Merkez Otomatik Oluşturma

**Rol:** Sistem  
**İstiyorum ki:** Genel Merkez şubesi varsayılan olarak mevcut olsun  
**Böylece:** Tüm onaylı kullanıcılar en az bir şubeye dahil olsun

**Kabul Kriterleri:**

- Sistem kurulumunda "Genel Merkez" otomatik oluşturulur
- isHeadquarters: true flag'i ile işaretlenir
- Genel Merkez silinemez ve düzenlenemez
- Genel Merkez her zaman aktif

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
- Şube bazlı rol ataması SUPER_ADMIN için geçerli değil (global yetki)
- **Görünürlük:** Herkes gibi, sadece dahil olduğu şubelerin üye/operatör listelerinde görünür
- SUPER_ADMIN herhangi bir şubede herhangi bir kullanıcıyı ADMIN yapabilir

---

### US-2.4: Varsayılan Şube Seçimi (Header'dan)

**Rol:** Kayıtlı Kullanıcı  
**İstiyorum ki:** Header'daki dropdown'dan varsayılan şubemi değiştirebiileyim  
**Böylece:** Hızlıca context değiştirebiileyim

**Kabul Kriterleri:**

- Header'da şube seçim dropdown'u bulunur
- **Sadece birden fazla şubesi olan kullanıcılar dropdown'u görür**
- Tek şubesi olanlar dropdown yerine şube adını görür (tıklanamaz)
- Sadece onaylı üyelikleri olan şubeler listelenir
- Seçim yapıldığında dashboard ve çevrim listesi güncellenir
- **Varsayılan şube: En son kullanılan** (ilk kez için Genel Merkez)
- Seçim JWT'de saklanır (session bazlı)

---

## Epic 3: İletişim Altyapısı (Communication Infrastructure)

> **Terminoloji:** "Kanal" yerine amatör telsiz jargonuna uygun "İletişim Altyapısı" terimi kullanılmaktadır.

### US-3.1: İletişim Altyapısı Oluşturma

**Rol:** Şube Yöneticisi  
**İstiyorum ki:** Şubeme ait iletişim altyapılarını (röle, echolink, DMR, APRS, HF) ekleyebileyim  
**Böylece:** Şubenin kullandığı altyapılar sisteme tanımlansın

**Kabul Kriterleri:**

- Altyapı türleri:
  - **VHF/UHF Röle (Analog FM)**: RX/TX Frekans, CTCSS/DCS Ton, Offset, Konum, Yükseklik, Kapsama alanı
  - **DMR (Digital Mobile Radio)**: RX/TX Frekans, DMR ID, Talkgroup, Color Code, Time Slot, Konum
  - **EchoLink**: Node numarası, Node adı
  - **APRS**: Frekans, Digipeater bilgisi
  - **HF Band**: Frekans aralığı, Mode (SSB/CW/FT8 vb.)
- Her altyapı için: Ad, açıklama, aktif/pasif durumu
- Konum alanları (röle/DMR için): Enlem, boylam, yükseklik (metre), kapsama açıklaması
- Şube yöneticisi veya SUPER_ADMIN ekleyebilir

---

### US-3.2: İletişim Altyapısı Listeleme ve Arama

**Rol:** Giriş yapmış kullanıcı (GUEST dahil)  
**İstiyorum ki:** Tüm şubelerin iletişim altyapılarını arayabileyim ve görebileyim  
**Böylece:** Hangi altyapıları kullanabileceğimi bileyim

**Kabul Kriterleri:**

- Şube detay sayfasında altyapılar listelenir
- GUEST dahil herkes görebilir ve arama yapabilir
- Aktif/pasif durumu görsel olarak belirtilir
- Altyapı türüne göre filtreleme ve gruplandırma
- Tüm şubelerin altyapılarını arayabilme (global arama)

---

### US-3.3: İletişim Altyapısı Kullanım Kılavuzu

**Rol:** Giriş yapmış kullanıcı (GUEST dahil)  
**İstiyorum ki:** Her altyapı türü için nasıl bağlanacağımı gösteren bir kılavuz görebileyim  
**Böylece:** Yeni olsam bile altyapıyı kullanmayı öğreneyim

**Kabul Kriterleri:**

- Her altyapı türü için hardcoded tutorial içeriği:
  - VHF/UHF Röle: "Tonlu bir FM röleye nasıl bağlanılır"
  - DMR: "DMR röleye nasıl bağlanılır, TG seçimi"
  - EchoLink: "EchoLink'e nasıl katılınır"
  - APRS: "APRS ağına nasıl bağlanılır"
  - HF: "HF bandında iletişim kurma"
- Altyapı detay sayfasında "Nasıl Bağlanırım?" butonu
- Modal veya accordion ile kılavuz gösterimi

---

### US-3.4: İletişim Altyapısı Düzenleme ve Silme

**Rol:** Şube Yöneticisi  
**İstiyorum ki:** Şubemin altyapılarını düzenleyebileyim veya silebiileyim  
**Böylece:** Altyapı bilgileri güncel tutulabilsin

**Kabul Kriterleri:**

- Şube yöneticisi veya SUPER_ADMIN düzenleyebilir/silebilir
- Aktif çevrimde kullanılan altyapı silinemez (pasif yapılabilir)
- Soft delete: isActive: false

---

## Epic 4: Kullanıcı-Şube İlişkisi ve Şube Bazlı Roller

### US-4.1: Kayıt Sırasında Şube Seçimi

**Rol:** Yeni Kullanıcı  
**İstiyorum ki:** Kayıt olurken üye olmak istediğim şubeleri seçebileyim  
**Böylece:** Doğru şubeye başvurmuş olayım

**Kabul Kriterleri:**

- Kayıt formunda en az bir şube seçimi zorunlu
- Birden fazla şube seçilebilir
- Seçilen her şube için ayrı onay talebi oluşturulur
- Kullanıcı globalRole: GUEST olarak kaydedilir
- Her talep status: PENDING olarak başlar
- **UX gereksinimleri:**
  - Her şube için kısa açıklama gösterilir (şehir, tür vb.)
  - "Şube nedir?" bilgi tooltip'i/linki
  - Şubeler alfabetik veya lokasyona göre sıralı

---

### US-4.2: Şubeye Katılma Talebi

**Rol:** Kayıtlı Kullanıcı  
**İstiyorum ki:** Dahil olmadığım şubelere katılma talebi gönderebileyim  
**Böylece:** Yeni şubelere üye olabileyim

**Kabul Kriterleri:**

- Kullanıcı aktif şubelerin listesini görebilir
- Dahil olmadığı şubelere "Katılma Talebi Gönder" butonu
- Talep status: PENDING olarak oluşturulur
- Aynı şubeye birden fazla bekleyen talep gönderilemez
- Reddedilen talep için yeniden başvurulabilir

---

### US-4.2b: Onay Bekleyen Kullanıcı Deneyimi

**Rol:** GUEST (Onay bekleyen kullanıcı)  
**İstiyorum ki:** Onay beklediğimi açıkça görebileyim  
**Böylece:** Ne durumda olduğumu ve ne yapabileceğimi bileyim

**Kabul Kriterleri:**

- **Her erişebildiği sayfada** üstte bilgilendirme banner'ı gösterilir
- Banner içeriği: "Üyelik talebiniz onay bekliyor. Onaylandıktan sonra tüm özelliklere erişebilirsiniz."
- Banner kapatılamaz (her zaman görünür)
- Dashboard'da hangi şubelere başvurduğu ve durumları listelenir

---

### US-4.2c: Üyelik Durumu Takibi

**Rol:** Kayıtlı Kullanıcı  
**İstiyorum ki:** Üyelik taleplerimin durumunu takip edebileyim  
**Böylece:** Hangi şubelerde onaylandığımı/reddedildiğimi bileyim

**Kabul Kriterleri:**

- Account (Hesap) sayfasında "Şube Üyeliklerim" bölümü
- Her üyelik için: Şube adı, durum (Bekliyor/Onaylandı/Reddedildi), tarih
- Onaylananlar için: Atanan rol (VOLUNTEER/MEMBER/ADMIN)
- Reddedilenler için: Red nedeni (varsa)
- Reddedilen şubeye "Tekrar Başvur" butonu

---

### US-4.3: Bekleyen Talepleri Görüntüleme (Yönetici)

**Rol:** Şube Yöneticisi  
**İstiyorum ki:** Şubeme gelen tüm talepleri (üyelik + parola sıfırlama) görebileyim  
**Böylece:** Talepleri hızlıca değerlendirebiileyim

**Kabul Kriterleri:**

- Dashboard'da birleşik "Bekleyen Talepler" kartı gösterilir
- Talep türleri: Üyelik talebi, Parola sıfırlama talebi
- Dashboard'da maksimum 3 talep gösterilir
- 3'ten fazla varsa "Tümünü Gör" linki ile ayrı sayfaya yönlendirilir
- Ayrı sayfa: `/admin/requests` - tüm talepler filtrelenebilir liste
- Sadece yönetici olduğu şubenin talepleri görünür
- SUPER_ADMIN: Seçili şubenin taleplerini görür (header dropdown'a göre)
- Talep sayısı badge ile gösterilir
- Talep gönderenin adı, çağrı işareti, talep türü görünür

---

### US-4.4: Üyelik Talebini Onaylama

**Rol:** Şube Yöneticisi  
**İstiyorum ki:** Şubeme gelen üyelik taleplerini onaylayabileyim  
**Böylece:** Kullanıcı şubeme dahil olsun

**Kabul Kriterleri:**

- Onay sırasında rol seçimi: VOLUNTEER, MEMBER, ADMIN
- Onaylanan kullanıcının ilk şube onayıysa Genel Merkez'e de eklenir
- Status: APPROVED olarak güncellenir
- Kullanıcıya bildirim gönderilir (gelecekte)
- SUPER_ADMIN herhangi bir şubenin talebini onaylayabilir

---

### US-4.5: Üyelik Talebini Reddetme

**Rol:** Şube Yöneticisi  
**İstiyorum ki:** Şubeme gelen üyelik taleplerini reddedebiileyim  
**Böylece:** Uygun olmayan başvuruları eleyebileyim

**Kabul Kriterleri:**

- Red nedeni opsiyonel olarak girilebilir
- Status: REJECTED olarak güncellenir
- Kullanıcı daha sonra tekrar başvurabilir
- SUPER_ADMIN herhangi bir şubenin talebini reddedebilir

---

### US-4.6: Şube Üyesinin Rolünü Değiştirme

**Rol:** Şube Yöneticisi  
**İstiyorum ki:** Şubemdeki üyelerin rollerini değiştirebiileyim  
**Böylece:** Yetkileri güncelleyebileyim

**Kabul Kriterleri:**

- Yönetici sadece kendi şubesindeki üyelerin rolünü değiştirebilir
- ADMIN → MEMBER/VOLUNTEER veya tersi
- Kendisini ADMIN'den düşüremez (en az bir ADMIN kalmalı)
- SUPER_ADMIN'lerin şube rolü değiştirilemez
- SUPER_ADMIN herhangi bir şubede rol değiştirebilir

---

### US-4.7: Kullanıcıyı Şubeden Çıkarma

**Rol:** Şube Yöneticisi  
**İstiyorum ki:** Üyeleri şubemden çıkarabileyim  
**Böylece:** Şube kadrosunu güncel tutabileyim

**Kabul Kriterleri:**

- Yönetici sadece kendi şubesinden çıkarabilir
- Genel Merkez'den çıkarılamaz
- SUPER_ADMIN hiçbir şubeden çıkarılamaz
- Kullanıcının o şubede aktif/bekleyen çevrimi varsa çıkarılamaz
- Hata mesajı: "Bu kullanıcının şubede aktif çevrimi bulunmaktadır"
- SUPER_ADMIN herhangi bir şubeden çıkarabilir (kendisi hariç)

---

### US-4.8: Şube Üyelerini Görüntüleme

**Rol:** Kayıtlı Kullanıcı (VOLUNTEER+)  
**İstiyorum ki:** Bir şubenin üyelerini görebileyim  
**Böylece:** Şubede kimlerin olduğunu bileyim

**Kabul Kriterleri:**

- GUEST üye listesini göremez
- VOLUNTEER+ şube detay sayfasında üye listesi görebilir
- Üye adı, çağrı işareti, şube içi rol bilgisi
- Yöneticiler için rol değiştirme ve çıkarma butonları

---

### US-4.9: Parola Sıfırlama Talebi İşleme

**Rol:** Şube Yöneticisi  
**İstiyorum ki:** Şubemdeki üyelerin parola sıfırlama taleplerini işleyebileyim  
**Böylece:** Kullanıcılara yardımcı olabileyim

**Kabul Kriterleri:**

- Kullanıcı dahil olduğu TÜM şubelerin yöneticileri tarafından işlenebilir
- Örn: Kullanıcı A hem Erzurum hem Ankara şubesindeyse, her iki şubenin yöneticisi talebi işleyebilir
- İşleme: Onayla (geçici parola oluştur) veya Reddet
- Talep işlendiğinde diğer şube yöneticileri artık göremez

---

## Epic 5: Çevrim-Şube-Altyapı İlişkisi

### US-5.1: Çevrim Oluştururken Şube, Çağrı İşareti ve Altyapı Seçimi

**Rol:** Şube Üyesi (MEMBER+ rolüne sahip)  
**İstiyorum ki:** Çevrim oluştururken şube, çağrı işareti ve iletişim altyapısı seçebileyim  
**Böylece:** Çevrim doğru şube ve altyapı ile ilişkilendirilsin

**Kabul Kriterleri:**

- Şube seçimi zorunlu (sadece MEMBER+ rolüne sahip olduğu şubeler)
- Varsayılan şube önceden seçili gelir
- Şube seçildikten sonra o şubenin çağrı işaretleri listelenir
- Varsayılan çağrı işareti önceden seçili gelir
- Şube seçildikten sonra o şubenin aktif altyapıları listelenir
- Ek olarak simpleks frekans manuel girilebilir (frekans zorunlu)
- Birden fazla altyapı + simpleks kombinasyonu seçilebilir
- En az bir altyapı veya simpleks seçimi zorunlu (tek kısıtlama)
- **Şube çevrim oluşturulduktan sonra DEĞİŞTİRİLEMEZ**
- Çağrı işareti ve altyapı seçimi sonradan değiştirilebilir
- **UX:** Şube seçimi yanında uyarı: "Şube seçimi oluşturulduktan sonra değiştirilemez"

---

### US-5.1b: Çevrim Altyapı/Çağrı İşareti Güncelleme

**Rol:** Çevrim Operatörü veya Şube Yöneticisi  
**İstiyorum ki:** Çevrimin çağrı işaretini ve altyapı seçimini güncelleyebileyim  
**Böylece:** Koşullar değiştiğinde uygun altyapıya geçebileyim

**Kabul Kriterleri:**

- Şube DEĞİŞTİRİLEMEZ (sabit)
- Çağrı işareti değiştirilebilir (şubenin diğer çağrı işaretlerinden)
- Altyapı seçimi değiştirilebilir (şubenin aktif altyapıları + simpleks)
- En az bir altyapı/simpleks kalmalı
- Çevrim operatörü veya şube ADMIN değiştirebilir

---

### US-5.2: Çevrim Yönetim Yetkisi (Şube Bazlı)

**Rol:** Şube Üyesi  
**İstiyorum ki:** Sadece üyesi olduğum şubenin çevrimlerini yönetebiileyim  
**Böylece:** Yetki karmaşası oluşmasın

**Kabul Kriterleri:**

- Çevrimi yönetebilmek için o şubede onaylı üye olmak gerekir
- Şube içi VOLUNTEER+ çevrimi başlatabilir/bitirebilir (kendi çevrimini)
- Şube içi ADMIN tüm şube çevrimlerini yönetebilir
- SUPER_ADMIN tüm şubelerin çevrimlerini yönetebilir
- Dahil olmadığı şube çevrimini kimse yönetemez (SUPER_ADMIN hariç)

---

### US-5.3: Çevrim Operatörü Seçimi ve Değiştirme

**Rol:** Şube Yöneticisi  
**İstiyorum ki:** Çevrim operatörünü aynı şubeden birine atayabileyim  
**Böylece:** Sadece şube üyeleri operatör olabilsin

**Kabul Kriterleri:**

- Operatör sadece çevrimin şubesinde MEMBER+ rolüne sahip olmalı
- Operatör seçiminde sadece şube üyeleri (MEMBER+) listelenir
- Şubeye dahil olmayan kullanıcı operatör olarak seçilemez
- Çevrim başladıktan sonra operatör değişikliği şube ADMIN veya SUPER_ADMIN gerektirir

---

### US-5.4: Şube Çevrimlerini Görüntüleme

**Rol:** Giriş yapmış kullanıcı  
**İstiyorum ki:** Herhangi bir şubenin çevrimlerini görebileyim  
**Böylece:** Farklı şubelerin aktivitelerini takip edebileyim

**Kabul Kriterleri:**

- Şube detay sayfasında çevrimler listelenir
- Herkes (GUEST dahil) çevrim listesi ve detaylarını görebilir
- **GUEST çevrim listesi sayfasına erişemez** (sadece dashboard istatistikleri)
- GUEST şube detay sayfasından çevrimleri görebilir

---

## Epic 6: Çevrim Listesi ve Filtreleme

### US-6.1: Varsayılan Çevrim Listesi

**Rol:** Kayıtlı Kullanıcı (VOLUNTEER+)  
**İstiyorum ki:** Çevrim listesi varsayılan şubemin çevrimlerini göstersin  
**Böylece:** En alakalı çevrimleri hemen görebileyim

**Kabul Kriterleri:**

- **GUEST çevrim listesi sayfasına erişemez**
- VOLUNTEER+ için: Varsayılan olarak header'da seçili şubenin çevrimleri
- Aktif > Bekleyen > Tamamlanmış sıralaması korunur
- Şube değiştirildiğinde liste güncellenir

---

### US-6.2: Çevrim Filtreleme

**Rol:** Kayıtlı Kullanıcı  
**İstiyorum ki:** Çevrimleri şubeye göre filtreleyebileyim  
**Böylece:** İstediğim şubenin çevrimlerini bulabileyim

**Kabul Kriterleri:**

- Şube filtresi: Seçili Şube, Tüm Şubelerim, Tüm Şubeler
- "Tüm Şubelerim" onaylı üyeliği olan şubelerin çevrimlerini gösterir
- "Tüm Şubeler" sistemdeki tüm çevrimleri gösterir
- Mevcut filtreler (durum, tarih) korunur

---

## Epic 7: Katılımcı Ekleme UX

### US-7.1: Katılımcı Aramada Şube Önceliği

**Rol:** Çevrim Operatörü  
**İstiyorum ki:** Katılımcı eklerken şube üyeleri önce listelensin  
**Böylece:** Şube üyelerini daha hızlı bulabileyim

**Kabul Kriterleri:**

- Arama sonuçları: Önce çevrimin şubesindeki operatörler
- Sonra diğer şubelerdeki operatörler
- Şube üyeleri görsel olarak ayırt edilebilir (badge/ikon)
- Her kullanıcı her çevrime katılabilir (şube kısıtlaması yok)

---

## Epic 8: Dashboard Şube İstatistikleri

### US-8.1: Şube Bazlı Kişisel İstatistikler

**Rol:** Kayıtlı Kullanıcı  
**İstiyorum ki:** Dashboard'da seçili şubeme ait istatistiklerimi görebileyim  
**Böylece:** Şubedeki performansımı takip edebileyim

**Kabul Kriterleri:**

- Header'da seçili şubeye göre filtrelenir
- Seçili şubede katıldığım çevrim sayısı
- Seçili şubede yönettiğim çevrim sayısı
- Şube içi seri kaydım
- Genel istatistikler ayrı bölümde gösterilir

---

### US-8.2: Şube Bazlı Topluluk İstatistikleri

**Rol:** Kayıtlı Kullanıcı  
**İstiyorum ki:** Şube bazlı topluluk istatistiklerini görebileyim  
**Böylece:** Şubenin genel performansını takip edebileyim

**Kabul Kriterleri:**

- Header'da seçili şubeye göre filtrelenir
- Şube toplam çevrim sayısı
- Şube en aktif operatörler
- Şube en çok katılımcılı çevrimler
- Genel (tüm sistem) istatistikler ayrı bölümde

---

## Veri Modeli

> **Not:** Tüm CallSign'lar global unique. Her şubenin tek bir default callSign'ı olabilir. Altyapı türleri ayrı tablolarda tutulabilir (implementation kararı).

```
Branch (Şube)
├── id: UUID
├── name: string (UNIQUE)
├── type: enum (BRANCH, REPRESENTATIVE)
├── isHeadquarters: boolean (default: false)
├── isActive: boolean (default: true)
├── address, phone, email (nullable)
├── createdAt, updatedAt, createdBy, updatedBy
│
├── callSigns: BranchCallSign[] (1:N)
├── infrastructure: BranchInfrastructure[] (1:N)
└── memberships: UserBranchMembership[] (1:N)

BranchCallSign (Şube Çağrı İşareti)
├── id: UUID
├── branchId: UUID (FK)
├── callSign: string (GLOBAL UNIQUE)
├── isDefault: boolean (şube başına tek default)
└── createdAt, updatedAt

BranchInfrastructure (İletişim Altyapısı)
├── id: UUID
├── branchId: UUID (FK)
├── type: enum (VHF_UHF_REPEATER, DMR, ECHOLINK, APRS, HF)
├── name: string
├── description: string (nullable)
├── isActive: boolean (default: true)
├── ... türe özgü alanlar (implementation kararı)
└── createdAt, updatedAt

UserBranchMembership (Kullanıcı-Şube Üyeliği)
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
├── ... mevcut alanlar ...
├── globalRole: enum (GUEST, SUPER_ADMIN)
├── currentBranchId: UUID (nullable) - JWT'de saklanır, en son kullanılan
└── memberships: UserBranchMembership[] (1:N)

Net (güncelleme)
├── ... mevcut alanlar ...
├── branchId: UUID (FK) - IMMUTABLE
├── branchCallSignId: UUID (FK) - değiştirilebilir
├── isActive: boolean (default: true) - şube pasif olunca false
└── infrastructure: NetInfrastructure[] (M:N)

NetInfrastructure (Çevrim-Altyapı İlişkisi)
├── id: UUID
├── netId: UUID (FK)
├── infrastructureId: UUID (nullable, FK)
├── isSimplexAdHoc: boolean (default: false)
├── simplexFrequency: string (nullable)
└── createdAt

InfrastructureTutorial (Altyapı Kılavuzu)
├── id: UUID
├── type: enum (VHF_UHF_REPEATER, DMR, ECHOLINK, APRS, HF)
├── title: string
├── content: text/markdown
├── locale: string (tr, en)
└── createdAt, updatedAt
(DB'de saklanır, şimdilik admin düzenleyemez)
```

---

## Öncelik Sıralaması

**P0 - MVP (Temel Altyapı):**

- US-1.1, US-1.2, US-1.3 (Şube Oluşturma, Listeleme, Detay)
- US-2.1, US-2.2, US-2.3 (Genel Merkez ve SUPER_ADMIN)
- US-4.1, US-4.2b, US-4.2c (Kayıt, Onay Bekleme UX, Durum Takibi)
- US-4.3, US-4.4, US-4.5 (Admin Talep İşleme)

**P1 - Çevrim Entegrasyonu:**

- US-3.1, US-3.2, US-3.3, US-3.4 (İletişim Altyapısı)
- US-5.1, US-5.1b, US-5.2, US-5.3, US-5.4 (Çevrim-Şube-Altyapı)
- US-2.4 (Header Dropdown)
- US-6.1, US-6.2 (Çevrim Filtreleme)
- US-7.1 (Katılımcı Aramada Şube Önceliği)

**P2 - Yönetim ve İyileştirmeler:**

- US-4.2, US-4.6, US-4.7, US-4.8, US-4.9 (Üyelik Yönetimi)
- US-1.4, US-1.5 (Şube Düzenleme/Pasif)
- US-8.1, US-8.2 (Dashboard İstatistikleri)

---

## Kesinleşen Kararlar (Özet)


| #   | Konu                   | Karar                                                                           |
| --- | ---------------------- | ------------------------------------------------------------------------------- |
| 1   | Entity ismi            | "İletişim Altyapısı" (BranchInfrastructure)                                     |
| 2   | Altyapı türleri        | VHF/UHF Röle, DMR, EchoLink, APRS, HF                                           |
| 3   | CallSign               | Global unique, şube başına tek default                                          |
| 4   | GUEST katılımı         | Çevrime katılımcı olarak eklenebilir                                            |
| 5   | GUEST erişimi          | Üye/operatör listesi hariç herşeyi görebilir, çevrim listesi sayfasına erişemez |
| 6   | Çevrim değişikliği     | Şube IMMUTABLE, çağrı işareti ve altyapı değiştirilebilir                       |
| 7   | Simpleks               | Ad-hoc frekans girilebilir, kısıtlama yok                                       |
| 8   | Bildirimler            | Activity log, ayrı sistem yok                                                   |
| 9   | Admin talep listesi    | Dashboard'da bekleyen varsa uyarı/badge                                         |
| 10  | Parola sıfırlama       | Kullanıcının TÜM şube adminleri işleyebilir                                     |
| 11  | SUPER_ADMIN görünürlük | Herkes gibi, dahil olduğu şubelerde görünür                                     |
| 12  | Branch context         | JWT'de saklanır                                                                 |
| 13  | Default şube           | En son kullanılan                                                               |
| 14  | Branch dropdown        | Sadece çoklu şubesi olanlar görür                                               |
| 15  | Şube pasif olunca      | Tüm çevrimler pasif, kimse göremez                                              |
| 16  | Kullanıcı silinince    | Tüm kayıtları silinir                                                           |
| 17  | Üyelik expiration      | Yok                                                                             |
| 18  | Tutorial               | DB'de saklanır, admin düzenleyemez (şimdilik)                                   |
| 19  | Beklenen şube sayısı   | Max ~100                                                                        |
| 20  | Migration              | HQ + Erzurum, mevcut roller korunur                                             |


---

## Altyapı Kılavuzları

Her altyapı türü için tutorial içeriği (DB'de saklanır, i18n destekli):


| Tür              | Kılavuz Başlığı                         |
| ---------------- | --------------------------------------- |
| VHF_UHF_REPEATER | Tonlu FM Röleye Nasıl Bağlanılır        |
| DMR              | DMR Röleye Bağlanma ve TalkGroup Seçimi |
| ECHOLINK         | EchoLink'e Katılma Rehberi              |
| APRS             | APRS Ağına Bağlanma                     |
| HF               | HF Bandında İletişim Kurma              |


Altyapı detay sayfasında "Nasıl Bağlanırım?" butonu ile modal/accordion gösterimi.

---

## Toplam User Story Sayısı


| Epic                  | Sayı   |
| --------------------- | ------ |
| 1. Şube CRUD          | 5      |
| 2. Genel Merkez       | 4      |
| 3. İletişim Altyapısı | 4      |
| 4. Kullanıcı-Şube     | 11     |
| 5. Çevrim-Şube        | 5      |
| 6. Çevrim Listesi     | 2      |
| 7. Katılımcı UX       | 1      |
| 8. Dashboard          | 2      |
| **TOPLAM**            | **34** |


