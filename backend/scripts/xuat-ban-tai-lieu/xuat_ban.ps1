# Xuất tài liệu kiến trúc NacenTech ra HTML, PDF và DOCX.
# Chạy: powershell -ExecutionPolicy Bypass -File scripts\xuat_ban.ps1
# PDF đi đường HTML để giữ sơ đồ SVG dạng vector; DOCX dùng sơ đồ đã chụp thành ảnh.
# Lưu ý: tệp này phải được lưu dạng UTF-8 có BOM để Windows PowerShell đọc đúng tiếng Việt.

$ErrorActionPreference = 'Stop'

$root    = Split-Path -Parent $PSScriptRoot
$md      = Join-Path $root 'NACENTECH_KIEN_TRUC_HE_THONG_CHUAN.md'
$css     = Join-Path $root 'export-style.css'
$exports = Join-Path $root 'exports'
$work    = Join-Path $env:TEMP 'nacentech-export'
$chrome  = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

if (-not (Test-Path $chrome)) {
  $chrome = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
}
foreach ($p in @($md, $css, $chrome)) {
  if (-not (Test-Path $p)) { throw "Không tìm thấy: $p" }
}
foreach ($d in @($exports, $work)) {
  if (-not (Test-Path $d)) { New-Item -ItemType Directory $d | Out-Null }
}

# Chạy chương trình ngoài mà không để thông báo trên stderr bị hiểu nhầm là lỗi.
function Invoke-Exe {
  param(
    [Parameter(Mandatory)][string] $FilePath,
    [Parameter(Mandatory)][string[]] $Arguments,
    [string] $WorkingDirectory = $PWD.Path
  )
  $log = New-TemporaryFile
  try {
    $proc = Start-Process -FilePath $FilePath -ArgumentList $Arguments `
      -WorkingDirectory $WorkingDirectory -NoNewWindow -Wait -PassThru `
      -RedirectStandardError $log.FullName
    if ($proc.ExitCode -ne 0) {
      $err = (Get-Content $log.FullName -Raw)
      throw "$([System.IO.Path]::GetFileName($FilePath)) trả về mã $($proc.ExitCode). $err"
    }
  }
  finally { Remove-Item $log.FullName -Force -ErrorAction SilentlyContinue }
}

$base = [System.IO.Path]::GetFileNameWithoutExtension($md)
$html = Join-Path $exports "$base.html"
$pdf  = Join-Path $exports "$base.pdf"
$docx = Join-Path $exports "$base.docx"

Write-Host '[1/4] Dựng HTML...' -ForegroundColor Cyan
Invoke-Exe -FilePath 'pandoc' -WorkingDirectory $root -Arguments @(
  "`"$md`"", '-o', "`"$html`"", '--standalone', '--toc', '--toc-depth=2',
  '--embed-resources', '-c', (Split-Path -Leaf $css), '--metadata', 'lang=vi'
)

Write-Host '[2/4] Dựng PDF (giữ sơ đồ vector)...' -ForegroundColor Cyan
Remove-Item $pdf -Force -ErrorAction SilentlyContinue
$url = 'file:///' + $html.Replace('\', '/')
Invoke-Exe -FilePath $chrome -Arguments @(
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer',
  '--run-all-compositor-stages-before-draw', '--virtual-time-budget=20000',
  "`"--print-to-pdf=$pdf`"", "`"$url`""
)
if (-not (Test-Path $pdf)) { throw 'Dựng PDF thất bại.' }

Write-Host '[3/4] Chụp sơ đồ và dựng bản markdown cho Word...' -ForegroundColor Cyan
Invoke-Exe -FilePath 'python' -Arguments @(
  "`"$(Join-Path $PSScriptRoot 'chup_so_do.py')`"", "`"$md`"", "`"$work`"", "`"$chrome`""
)
$mdDocx = Join-Path $work 'for_docx.md'
if (-not (Test-Path $mdDocx)) { throw 'Không dựng được markdown cho Word.' }

Write-Host '[4/4] Dựng DOCX...' -ForegroundColor Cyan
Invoke-Exe -FilePath 'pandoc' -Arguments @(
  "`"$mdDocx`"", '-o', "`"$docx`"", '--toc', '--toc-depth=2', '--metadata', 'lang=vi'
)
Invoke-Exe -FilePath 'python' -Arguments @(
  "`"$(Join-Path $PSScriptRoot 'chuan_hoa_word.py')`"", "`"$docx`""
)

Write-Host ''
Write-Host 'Hoàn tất:' -ForegroundColor Green
Get-Item $html, $pdf, $docx |
  Select-Object Name, @{n = 'KB'; e = { [math]::Round($_.Length / 1KB) } }, LastWriteTime |
  Format-Table -AutoSize
