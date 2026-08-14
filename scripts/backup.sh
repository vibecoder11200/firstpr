#!/bin/sh
# ======================================================================
# FirstPR — weekly Postgres backup (C6/HIGH-8)
#
# Runs from the `db-backup` compose service (cron: Sun 03:00).
# Writes a gzip'd pg_dump to the dedicated `backups` volume.
# Keeps the last 4 weekly dumps, prunes older ones.
#
# Restore: see scripts/restore.md
# ======================================================================
set -eu

BACKUP_DIR=${BACKUP_DIR:-/backups}
KEEP=${KEEP:-4}
STAMP=$(date +%Y%m%d-%H%M%S)
FILE="$BACKUP_DIR/firstpr-$STAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

# -Fc: custom format (splittable, restore per-table); tl: no owner/re-acl noise
pg_dump -Fc -Z 6 -f "$FILE"

# Keep only the newest $KEEP backups
ls -1t "$BACKUP_DIR"/firstpr-*.sql.gz 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
  rm -f "$old"
done

echo "backup ok: $FILE"
echo "backups kept: ${KEEP} (dir: $BACKUP_DIR)"