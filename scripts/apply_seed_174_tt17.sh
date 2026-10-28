#!/usr/bin/env bash
# ==============================================================================
# Script import 174 Doanh nghiệp TT17 (166 Tiền Giang + 8 Ninh Thuận)
# bao gồm: Tài khoản Sở KH&CN, Dữ liệu Doanh nghiệp, và Hồ sơ Đánh giá TT17
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="${SCRIPT_DIR}/seed_166_tg_8_nt_tt17.sql"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-55440}"
DB_NAME="${DB_NAME:-nacentech}"
DB_USER="${DB_USER:-postgres}"

echo "Đang nạp 174 Doanh nghiệp TT17 vào CSDL [${DB_NAME}] tại ${DB_HOST}:${DB_PORT}..."
PGPASSWORD="${DB_PASSWORD:-postgres}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f "${SQL_FILE}"

echo "✓ Hoàn thành nạp 174 Doanh nghiệp TT17 vào CSDL!"
