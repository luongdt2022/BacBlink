#!/bin/bash
# Script tạo dữ liệu account demo 4 tầng (10 Roles, 3D Scoped)
# Yêu cầu: Backend API đang chạy tại http://localhost:5000 (hoặc thay đổi API_URL bên dưới)
# Chạy lệnh: chmod +x seed_demo_4tier_roles.sh && ./seed_demo_4tier_roles.sh

API_URL=${1:-"http://localhost:5000"}
PASSWORD="Password@123"

# Hàm gọi API Provisioning Account (Bề mặt quản trị V2)
create_account() {
  local email=$1
  local first_name=$2
  local role=$3
  local scope_type=$4
  local scope_id=$5
  local organization=$6

  echo "Đang tạo tài khoản [$role] - Email: $email ..."

  # Xử lý JSON payload để hỗ trợ ScopeId null
  local payload
  if [ -z "$scope_id" ]; then
    payload=$(cat <<EOF
{
  "email": "$email",
  "password": "$PASSWORD",
  "firstName": "$first_name",
  "lastName": "Demo",
  "organization": "$organization",
  "platformRole": "$role",
  "scopeType": "$scope_type",
  "isActive": true
}
EOF
)
  else
    payload=$(cat <<EOF
{
  "email": "$email",
  "password": "$PASSWORD",
  "firstName": "$first_name",
  "lastName": "Demo",
  "organization": "$organization",
  "platformRole": "$role",
  "scopeType": "$scope_type",
  "scopeId": "$scope_id",
  "isActive": true
}
EOF
)
  fi

  curl -s -X POST "$API_URL/api/v2/identity/provisioned-accounts" \
    -H "Content-Type: application/json" \
    -d "$payload"
  echo ""
  echo "----------------------------------------"
}

echo "=== BẮT ĐẦU TẠO DỮ LIỆU DEMO 4 TẦNG ==="

# ==========================================
# TẦNG 1: QUẢN TRỊ TOÀN CỤC (GLOBAL)
# ==========================================
create_account "super.admin@demo.nacentech.vn" "Super" "SUPER_ADMIN" "GLOBAL" "" "Ban Quản Trị Hệ Thống"
create_account "operator.admin@demo.nacentech.vn" "Operator" "OPERATOR_ADMIN" "GLOBAL" "" "Ban Vận Hành"

# ==========================================
# TẦNG 2: QUẢN TRỊ LĨNH VỰC & ĐỊA PHƯƠNG (SECTOR & PROVINCE)
# ==========================================
create_account "hanoi.admin@demo.nacentech.vn" "Hanoi" "PROVINCIAL_ADMIN" "PROVINCE" "HN" "Sở KH&CN Hà Nội"
create_account "saigon.admin@demo.nacentech.vn" "Saigon" "PROVINCIAL_ADMIN" "PROVINCE" "SG" "Sở KH&CN TP.HCM"
create_account "agri.admin@demo.nacentech.vn" "Agri" "SECTOR_ADMIN" "SECTOR" "LV01" "Ban Nông Nghiệp"
create_account "tech.admin@demo.nacentech.vn" "Tech" "SECTOR_ADMIN" "SECTOR" "LV05" "Ban Công Nghệ Lõi"

# ==========================================
# TẦNG 3: QUẢN TRỊ CỤM/TỔ CHỨC (ORG_UNIT)
# ==========================================
create_account "cluster.admin@demo.nacentech.vn" "Cluster" "CLUSTER_ADMIN" "ORG_UNIT" "CLUSTER_HN_01" "Cụm Đổi Mới Sáng Tạo HN"

# ==========================================
# TẦNG 4: NGƯỜI DÙNG CUỐI (END USERS)
# ==========================================
create_account "seller.user@demo.nacentech.vn" "Seller" "SELLER" "GLOBAL" "" "Công Ty Cung Cấp Giải Pháp"
create_account "buyer.user@demo.nacentech.vn" "Buyer" "BUYER" "GLOBAL" "" "Doanh Nghiệp Tìm Kiếm Công Nghệ"
create_account "innovation.entity@demo.nacentech.vn" "Innovation" "INNOVATION_ENTITY" "GLOBAL" "" "Viện Nghiên Cứu Startup"
create_account "expert.user@demo.nacentech.vn" "Expert" "VERIFIED_EXPERT" "GLOBAL" "" "Chuyên Gia Độc Lập"
create_account "public.user@demo.nacentech.vn" "Public" "PUBLIC_USER" "GLOBAL" "" "Người Dùng Phổ Thông"

echo "=== HOÀN TẤT TẠO DỮ LIỆU DEMO ==="
echo "Mật khẩu chung cho tất cả tài khoản là: $PASSWORD"
