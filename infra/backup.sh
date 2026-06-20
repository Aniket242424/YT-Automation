#!/usr/bin/env bash
# Phase 3.4 — daily backup: pg_dump + n8n data tarball -> S3.
# Install on the box:  crontab -e
#   15 2 * * *  /home/ec2-user/stack/backup.sh >> /home/ec2-user/stack/backup.log 2>&1
# Requires: aws CLI (instance IAM role grants S3 write), docker compose stack running.
set -euo pipefail

STACK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$STACK_DIR"

# shellcheck disable=SC1091
source ./.env

BUCKET="${BACKUP_BUCKET:-yourbrand-assets}"
STAMP="$(date +%Y-%m-%d_%H%M%S)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "[$(date -Is)] dumping postgres..."
docker compose exec -T postgres \
	pg_dump -U "${PG_USER:-n8n}" -d "${PG_DB:-n8n}" --no-owner \
	| gzip > "$TMP/n8n-db_${STAMP}.sql.gz"

echo "[$(date -Is)] archiving n8n data volume..."
docker run --rm -v stack_n8n_data:/data -v "$TMP":/backup alpine \
	tar czf "/backup/n8n-data_${STAMP}.tar.gz" -C /data .

echo "[$(date -Is)] uploading to s3://${BUCKET}/backups/ ..."
aws s3 cp "$TMP/n8n-db_${STAMP}.sql.gz"   "s3://${BUCKET}/backups/db/"
aws s3 cp "$TMP/n8n-data_${STAMP}.tar.gz" "s3://${BUCKET}/backups/n8n/"

# retain only the last 14 db dumps in S3
aws s3 ls "s3://${BUCKET}/backups/db/" | sort | head -n -14 | awk '{print $4}' \
	| while read -r f; do [ -n "$f" ] && aws s3 rm "s3://${BUCKET}/backups/db/$f"; done

echo "[$(date -Is)] backup done."
