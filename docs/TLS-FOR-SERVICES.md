# TLS sertifikası kullanan servisler

Tüm stack için tek bir TLS sertifika deposu kullanılır. Yeni bir servis TLS istiyorsa aynı yapıyı kullanır; sertifikayı kendisi kopyalamaz veya özel izin çözümü yapmaz.

## Nasıl çalışır

1. **update.sh** (deploy sırasında) `/etc/letsencrypt/live/${DOMAIN}/` içeriğini `./volumes/tls-certs/` dizinine kopyalar.
2. İzinler: `fullchain.pem` 644, `privkey.pem` 640; sahip `root:1000`. Yani **GID 1000** olan her process key dosyasını okuyabilir.
3. Servisler bu dizini **read-only** mount eder ve process’i **UID 1000, GID 1000** (veya en azından GID 1000) ile çalıştırır.

## Yeni servise TLS ekleme

1. **docker-compose.yml** içinde servise volume ekle:
   ```yaml
   volumes:
     - ./volumes/tls-certs:/etc/tls:ro
   ```

2. Sertifika yolları:
   - Cert: `/etc/tls/fullchain.pem`
   - Key: `/etc/tls/privkey.pem`

3. Process’in bu dosyaları okuyabilmesi için:
   - Container’ı `user: "1000:1000"` ile çalıştırın, **veya**
   - Entrypoint root ile başlayıp config/data için gerekli chown’ları yaptıktan sonra `runuser`/`su` ile UID 1000 GID 1000’e düşün (örnek: `server/mmdvm-link/mosquitto-entrypoint.sh`).

4. İsteğe bağlı env (update.sh ile uyumlu):
   - `TLS_CERTS_UID=1000` / `TLS_CERTS_GID=1000` (varsayılan 1000; farklı kullanacaksanız update.sh’deki `TLS_CERTS_GID` ile aynı değeri kullanın).

## Özet

| Ne            | Nerede / Nasıl |
|---------------|-----------------|
| Depo yolu     | `./volumes/tls-certs` (host), container’da örn. `/etc/tls` |
| Provisioning  | `update.sh` (DOMAIN ve LetsEncrypt cert varken) |
| Key okuma     | Process GID 1000 (veya `TLS_CERTS_GID`) ile çalışmalı |
| Örnek         | Mosquitto: `server/mmdvm-link/mosquitto-entrypoint.sh` |
