#!/usr/bin/env bash
# ==============================================================================
# Script import 8 Đơn vị con NacenTech và 38 Sản phẩm Chào bán Nguồn Cung (có ảnh thật)
# Sử dụng cho môi trường UAT và Production
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="${SCRIPT_DIR}/seed_nacentech_providers_and_offers.sql"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-55440}"
DB_NAME="${DB_NAME:-nacentech}"
DB_USER="${DB_USER:-postgres}"

echo "Đang nạp 8 Đơn vị và 38 Sản phẩm NacenTech vào CSDL [${DB_NAME}] tại ${DB_HOST}:${DB_PORT}..."
PGPASSWORD="${DB_PASSWORD:-postgres}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f "${SQL_FILE}"

echo "✓ Hoàn thành nạp dữ liệu NacenTech thành công!"
