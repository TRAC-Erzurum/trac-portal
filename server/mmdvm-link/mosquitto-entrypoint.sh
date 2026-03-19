#!/bin/sh
set -eu

# Mosquitto bootstrap: shared TLS store at /etc/tls is OPTIONAL.
# - If /etc/tls/fullchain.pem + /etc/tls/privkey.pem exist: enable TLS listener 8883.
# - Otherwise: run plaintext listener 1883 only (PoC still works).

CONF_PATH="/mosquitto/config/mosquitto.conf"
ACL_PATH="/mosquitto/config/acl"
PASSWD_PATH="/mosquitto/config/passwd"
CERTFILE="/etc/tls/fullchain.pem"
KEYFILE="/etc/tls/privkey.pem"

umask 077

mkdir -p /mosquitto/config /mosquitto/data

HAVE_TLS=0
if [ -f "$CERTFILE" ] && [ -f "$KEYFILE" ]; then
  HAVE_TLS=1
else
  echo "WARN: Shared TLS store missing. TLS listener 8883 will be disabled." >&2
  echo "Expected (optional): $CERTFILE and $KEYFILE" >&2
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

if [ "$HAVE_TLS" = "1" ]; then
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
else
  cat >"$CONF_PATH" <<CONFEOF
per_listener_settings true

listener 1883
protocol mqtt
listener_allow_anonymous true

persistence true
persistence_location /mosquitto/data/
autosave_interval 60

log_dest stdout
CONFEOF
fi

chown -R mosquitto:mosquitto /mosquitto/config /mosquitto/data 2>/dev/null || true
chmod 755 /mosquitto/config /mosquitto/data
chmod 600 "$PASSWD_PATH"
chmod 644 "$ACL_PATH" "$CONF_PATH"

exec mosquitto -c "$CONF_PATH"
