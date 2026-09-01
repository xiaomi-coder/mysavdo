#!/bin/bash
# MyBazzar bazasining kunlik zaxirasi. systemd timer orqali har kuni 04:00 da.
#
# Tiklash:
#   gunzip -c /var/backups/mybazzar/mybazzar-YYYYMMDD-HHMM.sql.gz \
#     | sudo -u postgres psql -d mybazzar
#
# Yangi bazaga tiklash (sinov uchun xavfsiz yo'l):
#   sudo -u postgres createdb mybazzar_test
#   gunzip -c <fayl> | sudo -u postgres psql -d mybazzar_test
set -euo pipefail

DIR=/var/backups/mybazzar
KEEP_DAYS=14
mkdir -p "$DIR"

STAMP=$(date +%Y%m%d-%H%M)
FILE="$DIR/mybazzar-$STAMP.sql.gz"

sudo -u postgres pg_dump mybazzar | gzip > "$FILE"

# Bo'sh yoki juda kichik fayl chiqsa — zaxira buzilgan deb hisoblanadi
SIZE=$(stat -c%s "$FILE")
if [ "$SIZE" -lt 10000 ]; then
  echo "$(date +%F\ %T) XATO: zaxira juda kichik ($SIZE bayt)" >> "$DIR/backup.log"
  exit 1
fi

# 14 kundan eski nusxalarni o'chirish
find "$DIR" -name 'mybazzar-*.sql.gz' -mtime +$KEEP_DAYS -delete

echo "$(date +%F\ %T) OK $FILE ($SIZE bayt)" >> "$DIR/backup.log"
