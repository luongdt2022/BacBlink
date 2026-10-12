# -*- coding: utf-8 -*-
"""Generate the TASK-04 Basic Design review UI from the Seller SSOT workbook.

This is a review artifact only: it renders source-field metadata and conditional
visibility rules; it does not define implementation-level validation or APIs.
"""

from __future__ import annotations

import html
import json
from pathlib import Path

import openpyxl


ROOT = Path(__file__).resolve().parents[1]
WORKBOOK = ROOT / "DỮ_LIỆU_GỐC_MASTER" / "Nacentwin_20260924_bo_loc_da_sua.xlsx"
DETAIL_WORKBOOK = Path(__file__).with_name("Ma_tran_truong_C_ban_SP_theo_nganh_20260924.xlsx")
OUTPUT = Path(__file__).with_name("DANH_MUC_TRUONG_CHAO_BAN_VA_BO_LOC_18_NGANH.html")


def text(value: object) -> str:
    return str(value or "").strip()


def load_group_map() -> dict[str, str]:
    """Read the source business groups, rather than inventing UI group names."""
    workbook = openpyxl.load_workbook(DETAIL_WORKBOOK, data_only=True, read_only=False)
    groups: dict[str, str] = {}
    for sheet_name in ("Truong_chung", "Truong_rieng_loai"):
        sheet = workbook[sheet_name]
        for row in sheet.iter_rows(min_row=5, values_only=True):
            code, group = text(row[0]), text(row[1])
            if code:
                groups[code] = group
    return groups


def load_sector_scope_map() -> dict[str, str]:
    """Read each sector's approved demo scope from the detail workbook."""
    workbook = openpyxl.load_workbook(DETAIL_WORKBOOK, data_only=True, read_only=False)
    sheet = workbook["Thu_vien_bo_mau"]
    scopes: dict[str, str] = {}
    for row in sheet.iter_rows(min_row=5, values_only=True):
        code, scope = text(row[1]), text(row[3])
        if code and scope and code not in scopes:
            scopes[code] = scope
    return scopes


def load_records() -> list[dict[str, str]]:
    workbook = openpyxl.load_workbook(WORKBOOK, data_only=True, read_only=True)
    sheet = workbook["Bo_loc_Cban"]
    group_map = load_group_map()
    sector_scopes = load_sector_scope_map()
    rows: list[dict[str, str]] = []
    for row in sheet.iter_rows(min_row=5, max_row=sheet.max_row, max_col=16, values_only=True):
        industry, industry_name, code, layer, name, input_type, product, device, solution, visible, required, description, status, source, transfer_only, order = row
        if not code or not name:
            continue
        rows.append({
            "industry": text(industry), "industryName": text(industry_name),
            "code": text(code), "layer": text(layer), "name": text(name),
            "input": text(input_type), "product": text(product), "device": text(device),
            "solution": text(solution), "visible": text(visible), "required": text(required),
            "description": text(description), "status": text(status), "source": text(source),
            "transferOnly": text(transfer_only) or "Không", "order": int(order or 0),
            "group": group_map.get(text(code), f"Thông số ngành {text(industry_name)}"),
            "sectorScope": sector_scopes.get(text(industry), "Phạm vi sản phẩm đang chờ chọn cụ thể"),
        })
    return rows


def validate_detail_workbook() -> None:
    """Guard the three source partitions used by the Basic Design review."""
    workbook = openpyxl.load_workbook(DETAIL_WORKBOOK, data_only=True, read_only=False)
    expected = {"Truong_chung": 45, "Truong_rieng_loai": 30, "Chi_tiet_nganh": 129}
    for sheet_name, expected_count in expected.items():
        sheet = workbook[sheet_name]
        actual = sum(1 for row in sheet.iter_rows(min_row=5, values_only=True) if row[0])
        if actual != expected_count:
            raise ValueError(f"{sheet_name}: expected {expected_count} source fields, found {actual}.")


def render(records: list[dict[str, str]]) -> str:
    payload = json.dumps(records, ensure_ascii=False).replace("</", "<\\/")
    total = len(records)
    title = "Danh mục trường cơ bản & bộ lọc ngành — Hồ sơ chào bán"
    return f'''<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<style>
:root{{--blue:#155eef;--navy:#101828;--muted:#667085;--line:#e4e7ec;--bg:#f8fafc;--soft:#eff6ff;--gold:#b54708;}}
*{{box-sizing:border-box}} body{{margin:0;background:var(--bg);color:#1d2939;font:14px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}}
header{{background:#fff;border-bottom:1px solid var(--line);padding:22px max(24px,calc((100% - 1200px)/2));position:sticky;top:0;z-index:3}} h1{{margin:0;color:var(--navy);font-size:20px}} header p{{margin:5px 0 0;color:var(--muted);font-size:12px}} main{{max-width:1200px;margin:0 auto;padding:24px}}.artifact-tabs{{max-width:1200px;margin:18px auto 0;padding:0 24px;display:flex;gap:8px;overflow:auto}}.artifact-tabs button{{white-space:nowrap;color:#475467;border:1px solid #d0d5dd;background:#fff;border-radius:8px;padding:8px 11px;font-size:12px;font-weight:700;cursor:pointer}}.artifact-tabs button.active{{color:#175cd3;background:#eff8ff;border-color:#84caff}}.artifact-panel{{display:none;max-width:1200px;margin:0 auto;padding:24px}}.artifact-panel.active{{display:block}}.artifact-frame{{display:block;width:100%;height:1180px;border:1px solid var(--line);border-radius:14px;background:#fff}}
.notice{{background:#fffaeb;border:1px solid #fedf89;color:#7a2e0e;padding:12px 14px;border-radius:10px;margin-bottom:18px;font-size:13px}} .metrics,.controls,.grid{{display:grid;gap:12px}} .metrics{{grid-template-columns:repeat(4,1fr);margin-bottom:18px}} .metric,.panel,.field{{background:#fff;border:1px solid var(--line);border-radius:12px}}.metric{{padding:14px}}.metric b{{display:block;font-size:25px;color:var(--navy)}}.metric span{{font-size:12px;color:var(--muted)}}
.controls{{grid-template-columns:repeat(3,1fr);padding:18px;margin-bottom:18px}} label{{font-weight:650;font-size:12px;display:block;margin-bottom:6px;color:#344054}}select{{width:100%;padding:10px;border:1px solid #d0d5dd;border-radius:8px;background:#fff;color:#101828;font:inherit}}.panel{{padding:18px;margin-bottom:18px}}.panel h2{{margin:0 0 6px;font-size:16px;color:var(--navy)}}.help{{color:var(--muted);font-size:12px;margin:0 0 14px}}
.table-section{{background:#fff;border:1px solid var(--line);border-radius:12px;margin:14px 0;overflow:hidden}}.table-section h3{{margin:0;padding:13px 16px;background:#f9fafb;border-bottom:1px solid var(--line);font-size:14px;color:var(--navy)}}.table-section h3 small{{font-weight:400;color:var(--muted);margin-left:6px}}.group-title{{margin:0;padding:10px 16px;background:#fcfcfd;border-bottom:1px solid #eaecf0;color:#344054;font-size:12px}}.group-title span{{color:var(--muted);font-weight:400;margin-left:5px}}.table-wrap{{overflow-x:auto}}table{{border-collapse:collapse;width:100%;min-width:840px}}td{{vertical-align:top;padding:0;border-bottom:1px solid #eaecf0;font-size:12px;color:#344054}}tr:last-child td{{border-bottom:0}}.field-cell{{width:33.333%;padding:13px 16px;border-right:1px solid #eaecf0}}.field-cell:last-child{{border-right:0}}.field-name{{font-size:14px;font-weight:700;color:#101828}}.field-code{{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:#667085;margin-bottom:4px}}.tag{{display:inline-block;padding:3px 7px;border-radius:99px;background:#f2f4f7;color:#475467;font-size:11px;white-space:nowrap;margin:7px 3px 3px 0}}.tag.required{{background:#fef3f2;color:#b42318}}.tag.conditional{{background:#fffaeb;color:#b54708}}.muted{{color:var(--muted);font-size:11px;margin-top:6px;max-width:600px}}.selection{{background:#eff8ff;border:1px solid #b2ddff;color:#175cd3;padding:10px 12px;border-radius:9px;margin-top:14px;font-size:12px;font-weight:600}}.empty{{padding:20px;background:#fff;border:1px dashed #d0d5dd;border-radius:12px;color:var(--muted)}}.count{{font-size:12px;color:var(--muted);margin:0 0 14px}}@media(max-width:720px){{.metrics,.controls{{grid-template-columns:1fr 1fr}}header{{position:static}}table{{min-width:0}}.field-cell{{display:block;width:100%;border-right:0;border-bottom:1px solid #eaecf0}}.field-cell:empty{{display:none}}}}@media(max-width:440px){{.metrics,.controls{{grid-template-columns:1fr}}main{{padding:14px}}}}
.trl-grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}}.trl-card{{background:#fff;border:1px solid var(--line);border-radius:12px;padding:15px}}.trl-card h3{{margin:0 0 5px;font-size:13px;color:var(--navy)}}.trl-card p{{margin:0;color:var(--muted);font-size:12px}}.trl-table{{min-width:920px}}.trl-table th,.trl-table td{{padding:11px 12px;vertical-align:top;border:1px solid #eaecf0;font-size:12px;text-align:left}}.trl-table th{{background:#101828;color:#fff;font-size:11px}}.trl-table .level{{width:56px;text-align:center;font-weight:800;color:#101828}}.trl-table .band-rd{{background:#eff8ff}}.trl-table .band-pilot{{background:#fffaeb}}.trl-table .band-live{{background:#ecfdf3}}.trl-source{{font-size:11px;color:var(--muted);margin:12px 0 0}}@media(max-width:720px){{.trl-grid{{grid-template-columns:1fr}}}}
</style></head><body>
<header><h1>{title} <span style="font-size:12px;color:#175cd3">TASK-04</span></h1><p>Runtime SSOT: <code>Nacentwin_20260924_bo_loc_da_sua.xlsx / Bo_loc_Cban</code> · Đã đối chiếu: <code>Ma_tran_truong_C_ban_SP_theo_nganh_20260924.xlsx</code></p></header>
<nav class="artifact-tabs" aria-label="Điều hướng artefact TASK-04"><button class="active" onclick="showArtifact('review',this)">Rà soát trường</button><button onclick="showArtifact('trl',this)">TRL</button><button onclick="showArtifact('create',this)">Wireframe: tạo hồ sơ</button><button onclick="showArtifact('detail',this)">Wireframe: chi tiết hồ sơ</button></nav>
<main id="review-panel" class="artifact-panel active"><div class="notice"><b>Phạm vi review:</b> chọn loại chào bán, ngành và trạng thái chuyển giao để kiểm tra các trường nguồn được áp dụng. Lựa chọn này đồng bộ sang hai tab wireframe.</div>
<section class="metrics"><div class="metric"><b>45</b><span>trường thông tin chung</span></div><div class="metric"><b>30</b><span>trường riêng theo loại</span></div><div class="metric"><b>129</b><span>thông số riêng theo ngành</span></div><div class="metric"><b>1.479</b><span>quy tắc ma trận tổng hợp</span></div></section>
<section class="panel"><h2>1. Chọn ngữ cảnh hiển thị</h2><p class="help">Chọn một tổ hợp để xem nhanh các trường áp dụng. Combobox ngành là điểm chọn ngành duy nhất.</p><div class="controls"><div><label for="type">Loại chào bán</label><select id="type"><option value="all">Tất cả</option><option value="product">Sản phẩm</option><option value="device">Thiết bị</option><option value="solution">Giải pháp công nghệ</option></select></div><div><label for="industry">Ngành công nghiệp</label><select id="industry"></select></div><div><label for="transfer">Có chuyển giao công nghệ?</label><select id="transfer"><option value="no">Không</option><option value="yes">Có — hiện trường chỉ dành cho chuyển giao</option></select></div></div><div class="selection" id="selection"></div></section>
<section><h2 style="margin:0 0 4px;color:#101828;font-size:17px">2. Review tối giản trường hồ sơ</h2><p class="count" id="summary"></p><div id="tables"></div></section></main>
<section id="trl-panel" class="artifact-panel"><section class="panel"><h2>TRL — Mức độ sẵn sàng công nghệ</h2><p class="help">TRL là thang 1–9 đo độ trưởng thành kỹ thuật. Nó không thay thế đánh giá thị trường, pháp lý, giá bán hoặc chất lượng.</p><div class="selection" id="trl-context"></div></section><section class="trl-grid"><article class="trl-card"><h3>Khi nào phải khai?</h3><p><b>KT-50 — Mức TRL</b> bắt buộc khi <b>Có chuyển giao công nghệ = Có</b>. Nếu không chuyển giao, đây là thông tin tùy chọn.</p></article><article class="trl-card"><h3>Đầu vào cần có</h3><p>Seller chọn mức TRL; đối chiếu tên, mô tả và bài toán giải quyết. <b>TL-108</b> nhận báo cáo thử nghiệm, nghiệm thu hoặc vận hành thực tế để làm minh chứng.</p></article><article class="trl-card"><h3>Đầu ra sử dụng</h3><p>Hiển thị mức trưởng thành để Buyer lọc, so sánh và matching. Cần phân biệt rõ trạng thái <b>tự khai</b>, <b>AI đề xuất</b> và <b>đã xác minh</b>.</p></article></section><section class="table-section"><h3>Thang TRL 1–9 <small>Diễn giải dùng để review Basic Design</small></h3><div class="table-wrap"><table class="trl-table"><thead><tr><th>TRL</th><th>Diễn giải ngắn</th><th>Nhóm hiển thị</th><th>Minh chứng / dấu hiệu nên có</th><th>Dùng trên sàn</th></tr></thead><tbody><tr><td class="level band-rd">1</td><td>Nguyên lý cơ bản đã được quan sát và ghi nhận.</td><td>R&amp;D</td><td>Tài liệu nghiên cứu nền tảng, công bố hoặc báo cáo khoa học.</td><td>Mức nghiên cứu sớm.</td></tr><tr><td class="level band-rd">2</td><td>Đã hình thành khái niệm công nghệ hoặc ứng dụng dự kiến.</td><td>R&amp;D</td><td>Mô tả khái niệm, tính khả thi và lợi ích dự kiến.</td><td>Mức nghiên cứu sớm.</td></tr><tr><td class="level band-rd">3</td><td>Đã có bằng chứng khái niệm qua phân tích hoặc thí nghiệm.</td><td>R&amp;D</td><td>Kết quả phân tích/thí nghiệm xác nhận thông số trọng yếu.</td><td>Tiếp cận đối tác R&amp;D.</td></tr><tr><td class="level band-pilot">4</td><td>Thành phần hoặc mô hình thử đã được kiểm chứng trong phòng thí nghiệm.</td><td>Thử nghiệm / pilot</td><td>Biên bản thử nghiệm lab, mô hình thử, kết quả chức năng cơ bản.</td><td>Tìm đối tác thử nghiệm.</td></tr><tr><td class="level band-pilot">5</td><td>Thành phần hoặc mô hình thử được kiểm chứng trong môi trường liên quan.</td><td>Thử nghiệm / pilot</td><td>Kết quả thử ở điều kiện gần thực tế, mô tả môi trường và chỉ tiêu đo.</td><td>Pilot có kiểm soát.</td></tr><tr><td class="level band-pilot">6</td><td>Mẫu hệ thống hoặc prototype được trình diễn trong môi trường liên quan.</td><td>Thử nghiệm / pilot</td><td>Prototype hoạt động, báo cáo trình diễn, kết quả theo điều kiện sử dụng dự kiến.</td><td>Trao đổi triển khai pilot.</td></tr><tr><td class="level band-live">7</td><td>Prototype hệ thống được trình diễn trong môi trường vận hành.</td><td>Vận hành / thương mại</td><td>Biên bản pilot/vận hành thực tế, kết quả và các giới hạn còn lại.</td><td>Công nghệ gần sẵn sàng vận hành.</td></tr><tr><td class="level band-live">8</td><td>Hệ thống hoàn chỉnh, đạt yêu cầu qua thử nghiệm và trình diễn.</td><td>Vận hành / thương mại</td><td>Kết quả kiểm thử, nghiệm thu hoặc xác nhận đáp ứng điều kiện sử dụng dự kiến.</td><td>Sẵn sàng triển khai.</td></tr><tr><td class="level band-live">9</td><td>Hệ thống thực tế đã vận hành thành công trong điều kiện sử dụng.</td><td>Vận hành / thương mại</td><td>Bằng chứng vận hành thực tế, kết quả, địa điểm/quy mô và thời điểm áp dụng.</td><td>Đã có vận hành thực tế.</td></tr></tbody></table></div></section><p class="trl-source">Nguồn: Quy tắc TASK-04 hiện tại (KT-50, TL-108); tài liệu đánh giá NacenTech; NASA Technology Readiness Levels — https://www.nasa.gov/directorates/somd/space-communications-navigation-program/technology-readiness-levels/.</p></section>
<section id="create-panel" class="artifact-panel"><iframe id="create-frame" class="artifact-frame" src="wireframe_tao_ho_so_chao_ban.html" title="Wireframe tạo hồ sơ chào bán"></iframe></section>
<section id="detail-panel" class="artifact-panel"><iframe id="detail-frame" class="artifact-frame" src="wireframe_chi_tiet_ho_so_chao_ban.html" title="Wireframe chi tiết hồ sơ chào bán"></iframe></section>
<script>const records={payload};
const $=id=>document.getElementById(id); const industries=[...new Map(records.map(r=>[r.industry,[r.industryName,r.industry]])).values()];
function requirement(r){{const x=r.required.toLowerCase();if(x.includes('bắt buộc ban đầu')||x.includes('đề xuất bắt buộc'))return 'required';if(x.includes('bắt buộc'))return 'conditional';return 'optional'}}
function typeAllowed(r,t){{const applies=value=>value.startsWith('Có');return t==='all'||(t==='product'&&applies(r.product))||(t==='device'&&applies(r.device))||(t==='solution'&&applies(r.solution))}}
function esc(s){{const d=document.createElement('div');d.textContent=s;return d.innerHTML}}
const essentialCodes=new Set(['CHUNG-31','CHUNG-CG','CHUNG-32','CHUNG-35','CHUNG-36','GIA-69']);
function reviewTier(r,transfer){{return essentialCodes.has(r.code)||(r.code==='KT-50'&&transfer==='yes')?'essential':'supplemental'}}
function fieldCell(r,tier){{if(!r)return '<td class="field-cell"></td>';const label=tier==='essential'?'Đề xuất: Bắt buộc':'Đề xuất: Bổ sung sau';return `<td class="field-cell"><div class="field-code">${{esc(r.code)}} · ${{esc(r.input||'Chưa xác định')}}</div><div class="field-name">${{esc(r.name)}}</div><span class="tag ${{tier==='essential'?'required':'conditional'}}">${{label}}</span>${{r.transferOnly==='Có'?'<span class="tag conditional">Chỉ khi chuyển giao</span>':''}}<div class="muted">${{esc(r.description||r.visible||'')}}</div><div class="muted">Điều kiện nguồn: ${{esc(r.required||'Chưa xác định')}}</div><div class="muted">Nguồn: ${{esc(r.source)}}</div></td>`}}
function pairedRows(rows,tier){{let html='';for(let index=0;index<rows.length;index+=3)html+=`<tr>${{fieldCell(rows[index],tier)}}${{fieldCell(rows[index+1],tier)}}${{fieldCell(rows[index+2],tier)}}</tr>`;return html}}
function groupedTables(rows,tier){{const groups=new Map();rows.forEach(r=>{{const name=r.group||'Khác';if(!groups.has(name))groups.set(name,[]);groups.get(name).push(r)}});return [...groups.entries()].map(([name,items])=>`<h4 class="group-title">${{esc(name)}}<span>${{items.length}} trường · 3 trường/dòng</span></h4><div class="table-wrap"><table><tbody>${{pairedRows(items,tier)}}</tbody></table></div>`).join('')}}
function section(title,caption,rows,tier){{if(!rows.length)return '';return `<section class="table-section"><h3>${{title}}<small>${{caption}} · ${{rows.length}} trường</small></h3>${{groupedTables(rows,tier)}}</section>`}}
function syncWireframes(context){{['create-frame','detail-frame'].forEach(id=>{{const frame=$(id);if(frame&&frame.contentWindow)frame.contentWindow.postMessage({{kind:'seller-context',...context}},'*')}})}}
function showArtifact(name,button){{document.querySelectorAll('.artifact-panel').forEach(panel=>panel.classList.remove('active'));$(`${{name}}-panel`).classList.add('active');document.querySelectorAll('.artifact-tabs button').forEach(tab=>tab.classList.remove('active'));button.classList.add('active')}}
function render(){{const t=$('type').value,i=$('industry').value,transfer=$('transfer').value;let rows=records.filter(r=>r.industry===i&&typeAllowed(r,t)&&(transfer==='yes'||r.transferOnly!=='Có')).sort((a,b)=>a.order-b.order);let unique=new Map();rows.forEach(r=>unique.set(r.code,r));rows=[...unique.values()];const essential=rows.filter(r=>reviewTier(r,transfer)==='essential'), supplemental=rows.filter(r=>reviewTier(r,transfer)==='supplemental');const sourceSector=records.find(r=>r.industry===i);const industryName=sourceSector?.industryName||'';$('summary').textContent=`${{i}} · ${{industryName}} · ${{essential.length}} trường bắt buộc đề xuất + ${{supplemental.length}} trường bổ sung`;$('selection').textContent=`Tổ hợp đang xem: ${{t==='all'?'Tất cả loại chào bán':$('type').selectedOptions[0].text}} · ${{$('industry').selectedOptions[0].text}} · ${{transfer==='yes'?'Có chuyển giao công nghệ':'Không chuyển giao công nghệ'}}. Nhãn “Đề xuất” là phương án tối giản đang chờ PO duyệt; điều kiện nguồn được giữ ở từng trường.`;$('trl-context').textContent=transfer==='yes'?`Tổ hợp đang xem: ${{i}} · ${{industryName}} · Có chuyển giao công nghệ. Mức TRL là trường bắt buộc theo điều kiện (KT-50).`:`Tổ hợp đang xem: ${{i}} · ${{industryName}} · Không chuyển giao công nghệ. Mức TRL có thể khai bổ sung, không chặn tạo hồ sơ.`;$('tables').innerHTML=rows.length?section('I. Thông tin bắt buộc để đăng và tra cứu','Phương án MVP đề xuất',essential,'essential')+section('II. Thông tin bổ sung sau','Không chặn việc tạo hồ sơ ban đầu',supplemental,'supplemental'):'<div class="empty">Không có trường khớp với tổ hợp điều kiện này.</div>';syncWireframes({{industry:i,industryName,scope:sourceSector?.sectorScope||'',type:t,transfer,industryFields:rows.filter(r=>r.layer.startsWith('3.')).slice(0,8).map(r=>({{code:r.code,name:r.name,input:r.input,visible:r.visible}}))}})}}
$('industry').innerHTML=industries.map(([name,code])=>`<option value="${{code}}">${{code}} — ${{name}}</option>`).join('');$('industry').value=industries[0][1];['type','industry','transfer'].forEach(id=>$(id).addEventListener('change',render));['create-frame','detail-frame'].forEach(id=>$(id).addEventListener('load',render));render();
</script></body></html>'''


if __name__ == "__main__":
    validate_detail_workbook()
    records = load_records()
    OUTPUT.write_text(render(records), encoding="utf-8")
    print(f"Generated {OUTPUT} ({len(records)} source rules).")
