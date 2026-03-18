#!/bin/sh
set -eu

# Mosquitto bootstrap: uses shared TLS store at /etc/tls (provisioned by update.sh).
# Runs as UID/GID 1000 so it can read the key (group 1000). No per-service cert copy.

CONF_PATH="/mosquitto/config/mosquitto.conf"
ACL_PATH="/mosquitto/config/acl"
PASSWD_PATH="/mosquitto/config/passwd"
# Shared store: fullchain.pem and privkey.pem, readable by GID 1000
CERTFILE="/etc/tls/fullchain.pem"
KEYFILE="/etc/tls/privkey.pem"
TLS_UID="${TLS_CERTS_UID:-1000}"
TLS_GID="${TLS_CERTS_GID:-1000}"

umask 077

mkdir -p /mosquitto/config /mosquitto/data

if [ ! -f "$CERTFILE" ] || [ ! -f "$KEYFILE" ]; then
  echo "ERROR: Shared TLS store missing. Run update.sh to provision ./volumes/tls-certs." >&2
  echo "Expected: $CERTFILE and $KEYFILE" >&2
  exit 1
fi

if [ ! -f "$PASSWD_PATH" ]; then
  touch "$PASSWD_PATH"
fi

cat >"$ACL_PATH" <<'ACLEOF'
pattern write nodes/telemetry/%u
pattern write nodes/status/%u
topic write nodes/register
pattern read nodes/cmd/%u
pattern read nodes/register/ack/%u
ACLEOF

cat >"$CONF_PATH" <<CONFEOF
per_listener_settings true

listener 1883
protocol mqtt
listener_allow_anonymous true

listener 8883
protocol mqtt
listener_allow_anonymous false
password_file $PASSWD_PATH
acl_file $ACL_PATH
certfile $CERTFILE
keyfile $KEYFILE
require_certificate false

persistence true
persistence_location /mosquitto/data/
autosave_interval 60

log_dest stdout
CONFEOF

chown -R "${TLS_UID}:${TLS_GID}" /mosquitto/config /mosquitto/data
chmod 755 /mosquitto/config /mosquitto/data
chmod 600 "$PASSWD_PATH"
chmod 644 "$ACL_PATH" "$CONF_PATH"

# Drop to TLS_UID:TLS_GID so process can read shared cert store (key is chmod 640, group TLS_GID)
if command -v runuser >/dev/null 2>&1; then
  exec runuser -u "$TLS_UID" -g "$TLS_GID" -- mosquitto -c "$CONF_PATH"
fi
exec su "$TLS_UID" -s /bin/sh -c "exec mosquitto -c $CONF_PATH"
