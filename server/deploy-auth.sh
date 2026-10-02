#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════
# Xavfsizlikni ishga tushirish — serverda root sifatida
#
#   bash deploy-auth.sh phase1   # server login + YANGI JWT kaliti
#   (keyin veb va mobil yangilanadi)
#   bash deploy-auth.sh phase2   # qulflash: RLS, anonimni yopish
#
# Kalit SERVERNING O'ZIDA yaratiladi va ekranga chiqmaydi.
# Oldin auth-phase1.sql va auth-phase2.sql /root ga ko'chirilgan bo'lsin.
#
# Orqaga qaytarish:
#   phase1 — faqat qo'shadi. Kalitni qaytarish:
#            cp /etc/postgrest/mybazzar.conf.bak-<vaqt> /etc/postgrest/mybazzar.conf
#            systemctl restart postgrest-mybazzar
#   phase2 — /var/backups/mybazzar/OLDIN-phase2-<vaqt>.sql.gz dan tiklash
# ══════════════════════════════════════════════════════════════════════════
set -euo pipefail

CONF=/etc/postgrest/mybazzar.conf
STAMP=$(date +%Y%m%d-%H%M)
PSQL="sudo -u postgres psql -d mybazzar -v ON_ERROR_STOP=1 -q"

case "${1:-}" in
  phase1)
    sudo -u postgres pg_dump mybazzar | gzip > "/var/backups/mybazzar/OLDIN-phase1-$STAMP.sql.gz"
    cp "$CONF" "$CONF.bak-$STAMP"

    $PSQL < /root/auth-phase1.sql

    # Yangi kalit — faqat URL-xavfsiz belgilar, sed uchun ham xavfsiz
    NEW=$(python3 -c "import secrets; print(secrets.token_urlsafe(48))")
    echo "INSERT INTO private.secrets(key, value) VALUES ('jwt', :'s')
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;" \
      | sudo -u postgres psql -d mybazzar -v ON_ERROR_STOP=1 -q -v s="$NEW"
    sed -i -E "s|^jwt-secret *=.*|jwt-secret    = \"$NEW\"|" "$CONF"
    unset NEW

    systemctl restart postgrest-mybazzar
    sleep 2
    echo "postgrest: $(systemctl is-active postgrest-mybazzar)"
    # Tekshiruv: login funksiyasi javob beradimi (xato parol bilan)
    curl -s -X POST http://127.0.0.1:3002/rpc/login \
      -H 'Content-Type: application/json' \
      -d '{"p_email":"yoq@yoq.uz","p_password":"x"}'
    echo
    ;;

  phase2)
    sudo -u postgres pg_dump mybazzar | gzip > "/var/backups/mybazzar/OLDIN-phase2-$STAMP.sql.gz"
    $PSQL < /root/auth-phase2.sql
    $PSQL -c "NOTIFY pgrst, 'reload schema';"
    echo "anonim users (401 bo'lishi kerak): $(curl -s -o /dev/null -w '%{http_code}' 'http://127.0.0.1:3002/users?select=email')"
    ;;

  *)
    echo "Ishlatish: bash deploy-auth.sh phase1|phase2"; exit 1 ;;
esac
