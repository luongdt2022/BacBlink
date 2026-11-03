#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script nạp 12 tệp CV gốc vào Local Object Storage và CSDL PostgreSQL (CR-2026-022)
Nhiệm vụ: T-05.CR022.02
"""

import os
import sys
import uuid
import hashlib
import shutil
import subprocess

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

EXPERTS_MAPPING = [
    {
        "expertCode": "CG-NACEN-8D6927E5",
        "fullName": "Bành Quốc Tuấn",
        "relPath": "Specification/01_DATA_RAW/pdf/9 - Banh Quoc Tuan.pdf"
    },
    {
        "expertCode": "CG-NACEN-AF974777",
        "fullName": "Giang Mạnh Khôi",
        "relPath": "Specification/01_DATA_RAW/pdf/1 - Giang Manh Khoi.pdf"
    },
    {
        "expertCode": "CG-NACEN-F2A2C93B",
        "fullName": "Nguyễn Văn Đông",
        "relPath": "Specification/01_DATA_RAW/pdf/4 - Nguyễn Văn Đông.pdf"
    },
    {
        "expertCode": "CG-NACEN-E258A8DA",
        "fullName": "Vũ Văn Liệu",
        "relPath": "Specification/01_DATA_RAW/LLKH CN/3. B1-4-LLCN- Vũ Văn Liệu (Thư ký).doc"
    },
    {
        "expertCode": "CG-NACEN-1B8FBAC6",
        "fullName": "Phạm Chí Hiếu",
        "relPath": "Specification/01_DATA_RAW/pdf/7 - Pham Chi Hieu.pdf"
    },
    {
        "expertCode": "CG-NACEN-870E3CAD",
        "fullName": "Đinh Văn Giang",
        "relPath": "Specification/01_DATA_RAW/pdf/12 - Dinh Van Giang.pdf"
    },
    {
        "expertCode": "CG-NACEN-38E7CC8E",
        "fullName": "Trương Đức Toàn",
        "relPath": "Specification/01_DATA_RAW/pdf/8 - Trương Đức Toàn.pdf"
    },
    {
        "expertCode": "CG-NACEN-98EBFB47",
        "fullName": "Nguyễn Phương Đông",
        "relPath": "Specification/01_DATA_RAW/pdf/11 - Ng Phuong Dong.pdf"
    },
    {
        "expertCode": "CG-NACEN-04A4E87A",
        "fullName": "Trần Xuân Thịnh",
        "relPath": "Specification/01_DATA_RAW/LLKH CN/9. B1-4-LLCN-Thinh.doc"
    },
    {
        "expertCode": "CG-NACEN-C51155B1",
        "fullName": "Vũ Thanh Tùng",
        "relPath": "Specification/01_DATA_RAW/LLKH CN/10. B1-4-LLKH- Vũ Thanh Tùng.doc"
    },
    {
        "expertCode": "CG-NACEN-34265B47",
        "fullName": "Trương Công Tuấn",
        "relPath": "Specification/01_DATA_RAW/LLKH CN/11. B1-4-LLCN- Trương Công Tuấn.doc"
    },
    {
        "expertCode": "CG-NACEN-E8C6BB58",
        "fullName": "Trần Thị Vân Anh",
        "relPath": "Specification/01_DATA_RAW/pdf/2 - Trần Thị Vân Anh.pdf"
    }
]

def run_psql(cmd):
    full_cmd = ["docker", "exec", "nacentech-postgres-1", "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A", "-c", cmd]
    res = subprocess.run(full_cmd, capture_output=True, text=True, check=True)
    return res.stdout.strip()

def get_expert_profile_id(expert_code):
    sql = f"SELECT id FROM brokerage.expert_profiles WHERE expert_code = '{expert_code}' LIMIT 1;"
    return run_psql(sql)

def main():
    print("=" * 80)
    print("BẮT ĐẦU NẠP 12 TỆP CV GỐC VÀO STORAGE VÀ CSDL POSTGRESQL (CR-2026-022)")
    print(f"Project root: {PROJECT_ROOT}")
    print("=" * 80)

    # Thư mục đích lưu trữ vật lý
    storage_api_dir = os.path.join(PROJECT_ROOT, "SourceCode", "backend", "apps", "api", "storage", "experts", "documents")
    storage_root_dir = os.path.join(PROJECT_ROOT, "storage", "experts", "documents")
    os.makedirs(storage_api_dir, exist_ok=True)
    os.makedirs(storage_root_dir, exist_ok=True)

    # Xóa sạch các tài liệu cũ nếu cần tái lập Idempotent
    run_psql("DELETE FROM brokerage.expert_documents WHERE document_type = 'CURRICULUM_VITAE';")

    results = []
    for idx, item in enumerate(EXPERTS_MAPPING, 1):
        expert_code = item["expertCode"]
        full_name = item["fullName"]
        file_path = os.path.join(PROJECT_ROOT, item["relPath"])

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Không tìm thấy tệp gốc: {file_path}")

        profile_id = get_expert_profile_id(expert_code)
        if not profile_id:
            raise ValueError(f"Không tìm thấy expert profile cho mã: {expert_code}")

        with open(file_path, "rb") as f:
            data = f.read()

        size_bytes = len(data)
        sha256 = hashlib.sha256(data).hexdigest()
        ext = os.path.splitext(file_path)[1].lower()
        mime_type = "application/pdf" if ext == ".pdf" else "application/msword"

        doc_id = str(uuid.uuid4())
        key_filename = f"{uuid.UUID(doc_id).hex}{ext}"
        storage_key = f"experts/documents/{key_filename}"

        # Sao chép vào cả 2 thư mục storage
        dest_api = os.path.join(storage_api_dir, key_filename)
        dest_root = os.path.join(storage_root_dir, key_filename)
        with open(dest_api, "wb") as f:
            f.write(data)
        with open(dest_root, "wb") as f:
            f.write(data)

        # Chèn vào CSDL
        sql_insert = f"""
        INSERT INTO brokerage.expert_documents (
            id, expert_profile_id, document_type, storage_key, sha256, mime_type, size_bytes, malware_scan_status, is_active
        ) VALUES (
            '{doc_id}', '{profile_id}', 'CURRICULUM_VITAE', '{storage_key}', '{sha256}', '{mime_type}', {size_bytes}, 'CLEAN', true
        );
        """
        run_psql(sql_insert)

        results.append({
            "index": idx,
            "expert_code": expert_code,
            "full_name": full_name,
            "doc_id": doc_id,
            "storage_key": storage_key,
            "sha256": sha256,
            "size_bytes": size_bytes,
            "mime_type": mime_type
        })
        print(f"[{idx}/12] Đã lưu: {expert_code} - {full_name} -> docId={doc_id}, size={size_bytes}B, key={storage_key}")

    # Kiểm tra lại số lượng trong DB
    count = run_psql("SELECT count(*) FROM brokerage.expert_documents;")
    print("=" * 80)
    print(f"Tổng số bản ghi trong brokerage.expert_documents: {count}")
    print("=" * 80)

if __name__ == "__main__":
    main()
