#!/usr/bin/env python3
"""CR-2026-005: approved 50-case business blueprint, real HTTP/browser only.
No implementation imports, route interception or fake service responses. Authorizedwrites are restricted to isolatedQCclone.
Missing accounts, safe outage/mutation controls and externally approved CV inputs are BLOCKED.
Provide DELTA_API_URL / DELTA_WEB_URL. Optional DELTA_ADMIN_TOKEN for real read access.
Playwright Python + Chromium are optional prerequisites for browser cases.
"""
import datetime, json, os, re, subprocess, urllib.error, urllib.parse, urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3]
BLUEPRINT = ROOT / 'specs/TASK-05_HO_SO_CHUYEN_GIA_KHCN/QC-BLUEPRINT-DELTA-V12.md'
OUT = ROOT / 'docs/test-evidence/CR-2026-005/blackbox'
API = os.getenv('DELTA_API_URL', 'http://127.0.0.1:5080').rstrip('/')
WEB = os.getenv('DELTA_WEB_URL', 'http://127.0.0.1:3000').rstrip('/')
OUT.mkdir(parents=True, exist_ok=True)
CASES = {}
for line in BLUEPRINT.read_text().splitlines():
    if line.startswith('| TC-C'):
        parts = [p.strip() for p in line.split('|')[1:-1]]
        CASES[parts[0]] = {'id':parts[0], 'description':parts[1], 'status':'BLOCKED', 'evidence':'Case prerequisites not yet satisfied / not executed.'}
assert len(CASES) == 50, 'Blueprint must enumerate exactly 50 cases'
CACHE = {}
def finish(cid, status, reason):
    CASES[cid].update(status=status, evidence=reason)
def run(cid, fn):
    try:
        reason=fn(); finish(cid,'PASS',reason)
    except Blocked as err: finish(cid,'BLOCKED',str(err))
    except Exception as err: finish(cid,'FAIL',str(err))
class Blocked(Exception): pass
def require(condition, message):
    if not condition: raise AssertionError(message)
def get(path, query=None, token=None):
    url=API+path+('?' + urllib.parse.urlencode(query) if query else '')
    headers={'Accept':'application/json'}
    if token: headers['Authorization']='Bearer '+token
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=headers),timeout=5) as res: status=res.status; payload=json.load(res)
    except urllib.error.HTTPError as err:
        status=err.code
        try: payload=json.load(err)
        except Exception: payload={}
    except (urllib.error.URLError, TimeoutError) as err: raise Blocked('Live API unavailable: '+str(err.reason if hasattr(err,'reason') else err))
    require(status < 500, f'Live API {path} returned HTTP {status}')
    require(status==200, f'Expected HTTP 200 for {path}, got {status}')
    require(payload.get('success') is True, f'{path}: successful envelope required')
    return payload.get('data')
def sectors():
    if 'sectors' not in CACHE:
        data=get('/api/v1/sectors'); require(isinstance(data,list),'Sector response must be a list')
        require(all(isinstance(r,dict) and r.get('code') and isinstance(r.get('name'),str) for r in data),'Sector code/name invalid')
        CACHE['sectors']=data
    return CACHE['sectors']
def directory(**q): return get('/api/v1/public/experts',q)
def items(data):
    if isinstance(data,list): return data
    if isinstance(data,dict):
        for key in ('items','results'):
            if isinstance(data.get(key),list): return data[key]
    raise Blocked('Documented public list pagination shape cannot be observed in this response')
def no_pii(data):
    denied={'cccd','citizenid','nationalid','identitynumber','phone','phonenumber','personalphone','email','personalemail'}
    def walk(obj):
        if isinstance(obj,dict):
            for k,v in obj.items():
                require(k.lower() not in denied,'Forbidden public PII key: '+k)
                walk(v)
        elif isinstance(obj,list):
            for v in obj: walk(v)
    walk(data)
def empty_search():
    rows=items(directory(q='QC-NO-MATCH-'+datetime.datetime.now().strftime('%Y%m%d%H%M%S')))
    require(len(rows)==0,'Unique unmatched search unexpectedly returns experts')
    return 'Real public API empty search returned zero records.'
def unknown_sector():
    rows=items(directory(sectorCode='QC-UNKNOWN-SECTOR'))
    require(len(rows)==0,'Unknown sector returned results contrary to filter')
    return 'Unknown active-sector code returned zero results without 500.'
def province_contract():
    rows=get('/api/v1/governance/org-units/public-provinces'); require(isinstance(rows,list),'Province list expected')
    for row in rows: require(set(row).issubset({'code','name','region'}),'Province projection exposes extra keys'); require(row.get('code') and row.get('name'),'Missing province code/name')
    CACHE['provinces']=rows
    return f'Real public province projection verified: {len(rows)} entries; only code/name/region keys.'
def public_privacy():
    data=directory(); no_pii(data)
    return f'Real public API projection has no forbidden PII keys; {len(items(data))} records observed.'
def sector_filter():
    active=sectors()
    if not active: raise Blocked('No active sector exists to exercise filter')
    code=active[0]['code']; rows=items(directory(sectorCode=code))
    if not rows: raise Blocked('No approved public expert in chosen active sector; cannot prove matching behavior')
    for row in rows:
        values=row.get('expertiseSectors',row.get('sectorCodes'))
        if not isinstance(values,list): raise Blocked('Public projection lacks documented observable sector membership; need real expert detail evidence')
        require(code in values,'Returned expert does not match selected active sector')
    require(len(items(directory()))>=len(rows),'Removing filter yields fewer records than filtered list')
    return f'Real sector filter and removal verified for {code}; {len(rows)} records.'
run('TC-C1-01',lambda: (items(directory()), 'Real public default directory responds successfully.')[1])
run('TC-C1-03',empty_search)
run('TC-C1-04',lambda: (sectors(),'Real active taxonomy code/name contract observed.')[1])
run('TC-C1-05',unknown_sector)
run('TC-C1-06',province_contract)
run('TC-C1-12',public_privacy)
run('TC-C3-02',sector_filter)
def paged_filter():
    first=items(directory(q="Nguyễn",page=1,pageSize=1)); second=items(directory(q="Nguyễn",page=2,pageSize=1))
    if not first or not second: raise Blocked("Real filtered result set has fewer than two records; cannot prove page preservation")
    require(len(first)==1 and len(second)==1,"API pageSize=1 ignored")
    require(first[0].get('expertCode') != second[0].get('expertCode'),"Pagination repeats same expert")
    for row in first+second: require("Nguyễn" in row.get('fullName',''),"Page result violates retained Vietnamese search criterion")
    return "Actual public API page1/page2 with pageSize1 retained same Vietnamese query; distinct matching experts returned. UI multi-page dataset remains a separate prerequisite."
run('TC-C1-07',paged_filter)

# Black-box browser: use rendered accessible controls and visible output only.
try:
    from playwright.sync_api import sync_playwright
    pw=sync_playwright().start(); browser=pw.chromium.launch(headless=True)
except Exception as err:
    browser=None; browser_reason='Browser prerequisite missing/unavailable: '+str(err)
if browser:
    def page(viewport=None):
        p=browser.new_page(viewport=viewport or {'width':1440,'height':900})
        p.goto(WEB+'/experts',wait_until='networkidle',timeout=45000)
        return p
    def responsive(cid, size):
        p=page(size)
        try:
            require(p.locator('body').inner_text().strip(),'No rendered directory content')
            require(p.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),'Horizontal overflow')
            require(p.get_by_role('heading').count()>0,'No visible page headings')
            p.screenshot(path=str(OUT/(cid+'.png')),full_page=True)
            raise Blocked('Screenshot captured and no horizontal overflow; manual UIUX review required for density, overlap and content clipping.')
        finally:p.close()
    run('TC-C2-01',lambda:responsive('TC-C2-01',{'width':1440,'height':900}))
    run('TC-C2-02',lambda:responsive('TC-C2-02',{'width':390,'height':844}))
    def home():
        rows=sectors(); p=browser.new_page()
        try:
            p.goto(WEB,wait_until='networkidle',timeout=45000)
            require(p.get_by_text(re.compile(r'^'+str(len(rows))+r' Lĩnh Vực Trọng Điểm$')).count()>0,'Home active count differs from live taxonomy')
            for row in rows:
                links=p.get_by_role('link',name=row['name'],exact=True)
                require(links.count()>0,'Home missing current sector name')
                require(links.first.get_attribute('href')=='/experts?sector='+urllib.parse.quote(row['code'],safe=''),'Home sector link uses incorrect code')
            return f'Home count and {len(rows)} exact name/code links match real API active taxonomy.'
        finally:p.close()
    run('TC-C2-11',home)
    def alias():
        p=browser.new_page()
        try:
            res=p.goto(WEB+'/chuyen-gia',wait_until='networkidle',timeout=45000)
            require(res and res.status<400,'Alias navigation fails')
            require(p.get_by_role('heading',name=re.compile('chuyên gia',re.I)).count()>0,'Alias does not show directory heading')
            raise Blocked('Alias page loaded; usable filter interaction must be completed before full case pass.')
        finally:p.close()
    run('TC-C2-10',alias)
    def copy():
        p=browser.new_page()
        try:
            p.goto(WEB+'/login',wait_until='networkidle',timeout=45000)
            require(not re.search(r'\b(?:10|18)\s+(?:ngành|lĩnh vực)',p.locator('body').inner_text(),re.I),'Login hardcodes active sector count')
            raise Blocked('Login copy observed without static sector count; authenticated admin copy needs approved live account.')
        finally:p.close()
    run('TC-C2-12',copy)
    browser.close(); pw.stop()
else:
    for cid in ('TC-C2-01','TC-C2-02','TC-C2-10','TC-C2-11','TC-C2-12'):finish(cid,'BLOCKED',browser_reason)
# Node Playwright fallback uses existing browser/runtime; no package install or service mocks.
if not browser:
    node_script = r"""
const {chromium}=require(process.env.DELTA_PLAYWRIGHT_MODULE || '/Users/luongdt/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});const result={}; const base=process.env.DELTA_WEB_URL;
 const set=(id,status,evidence)=>result[id]={status,evidence};
 async function run(id,fn){try{await fn()}catch(e){set(id,'FAIL',e.message)}}
 for(const [id,width,height] of [['TC-C2-01',1440,900],['TC-C2-02',390,844]])await run(id,async()=>{
   const page=await browser.newPage({viewport:{width,height}});await page.goto(base+'/experts',{waitUntil:'networkidle',timeout:45000});
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Directory horizontal overflow');
   await page.screenshot({path:process.env.DELTA_EVIDENCE_DIR+'/'+id+'.png',fullPage:true});
   const reviewed=JSON.parse(require('fs').readFileSync(process.env.DELTA_EVIDENCE_DIR+'/visual-review.json','utf8')).cases[id];set(id,reviewed.status,reviewed.evidence+' Fresh real screenshot recaptured with no horizontal overflow.');await page.close();
 });
 await run('TC-C2-11',async()=>{
   const page=await browser.newPage();await page.goto(base,{waitUntil:'networkidle',timeout:45000});const rows=JSON.parse(process.env.DELTA_SECTORS);
   if(!await page.getByText(new RegExp('^'+rows.length+' Lĩnh Vực Trọng Điểm$')).count())throw Error('Home count differs from actual active taxonomy');
   for(const row of rows){const a=page.getByRole('link',{name:row.name,exact:true});if(!await a.count())throw Error('Current sector name missing');if(await a.first().getAttribute('href')!=='/experts?sector='+encodeURIComponent(row.code))throw Error('Home filter link code differs');}
   set('TC-C2-11','PASS',`Home count and ${rows.length} links match real API active code/name data.`);await page.close();
 });
 await run('TC-C2-10',async()=>{const p=await browser.newPage();const r=await p.goto(base+'/chuyen-gia',{waitUntil:'networkidle',timeout:45000});if(!r||r.status()>=400)throw Error('Alias navigation HTTP error');if(!await p.getByRole('heading',{name:/chuyên gia/i}).count())throw Error('Alias does not show directory');set('TC-C2-10','BLOCKED','Alias loads real directory; remaining filter usability needs full interaction.');await p.close()});

 const api=process.env.DELTA_API_URL;
 const live=await fetch(api+'/api/v1/public/experts').then(r=>r.json());
 const publicRows=Array.isArray(live.data)?live.data:(live.data?.items||live.data?.results||[]);
 const rows=JSON.parse(process.env.DELTA_SECTORS);
 async function directoryPage(){const p=await browser.newPage();await p.goto(base+'/experts',{waitUntil:'networkidle',timeout:45000});return p}
 await run('TC-C3-01',async()=>{const p=await directoryPage();for(const r of rows)if(!await p.getByLabel(r.name,{exact:true}).count())throw Error('Directory missing active sector name');const label=p.locator('label').filter({hasText:'LĨNH VỰC CHUYÊN MÔN'});if(!await label.count() || !(await label.innerText()).trim().endsWith('('+rows.length+')'))throw Error('Directory option count differs from active API');const db=JSON.parse(require('fs').readFileSync(process.env.DELTA_DB_COUNT_FILE,'utf8'));if(db.activeSectorCount!==rows.length)throw Error('Independent DB count differs liveAPI/UI');set('TC-C3-01','PASS','Directory active code/name options and count match liveAPI and independent SQL evidence '+db.utc); await p.close()});
 await run('TC-C1-02',async()=>{const chosen=publicRows.find(r=>typeof r.fullName==='string'&&/[À-ỹ]/.test(r.fullName));if(!chosen){set('TC-C1-02','BLOCKED','No approved expert with Vietnamese searchable name');return;}const p=await directoryPage();const wait=p.waitForResponse(r=>r.url().includes('/api/v1/public/experts')&&new URL(r.url()).searchParams.get('q')===chosen.fullName);await p.getByPlaceholder(/Tìm theo họ tên chuyên gia/).fill(chosen.fullName);await p.getByRole('button',{name:'Tìm kiếm',exact:true}).click();const data=await(await wait).json();const found=Array.isArray(data.data)?data.data:(data.data?.items||[]);if(!found.some(r=>r.expertCode===chosen.expertCode))throw Error('Vietnamese exact name search did not return chosen real expert');set('TC-C1-02','PASS','Real Vietnamese public name submitted unchanged and corresponding public expert returned.');await p.close()});
 await run('TC-C2-05',async()=>{const p=await directoryPage();const input='QC-NO-MATCH-'+Date.now();const wait=p.waitForResponse(r=>r.url().includes('/api/v1/public/experts')&&new URL(r.url()).searchParams.get('q')===input);await p.getByPlaceholder(/Tìm theo họ tên chuyên gia/).fill(input);await p.getByRole('button',{name:'Tìm kiếm',exact:true}).click();await wait;await p.waitForTimeout(250);if(!await p.getByText(/Không tìm thấy chuyên gia/i).count())throw Error('No-result UI fails to show empty recovery state');if(!await p.getByRole('button',{name:/Đặt lại|Xóa bộ lọc/i}).count())throw Error('No-result recovery control missing');set('TC-C2-05','PASS','Real no-match search shows empty state and recovery control.');await p.close()});
 await run('TC-C1-10',async()=>{const p=await directoryPage();const input=p.getByPlaceholder(/Tìm theo họ tên chuyên gia/);await input.fill('từ khóa');if(rows.length)await p.getByLabel(rows[0].name,{exact:true}).check();await p.getByRole('button',{name:'Đặt lại',exact:true}).click();if(await input.inputValue()!=='')throw Error('Reset leaves keyword');if(!await p.getByLabel('Tất cả ngành nghề',{exact:true}).isChecked())throw Error('Reset leaves sector filter');if(await p.locator('select').inputValue()!=='')throw Error('Reset leaves province');set('TC-C1-10','PASS','Rendered keyword/sector/province reset to actual default values.');await p.close()});
 await run('TC-C1-11',async()=>{const p=await directoryPage();const input=p.getByPlaceholder(/Tìm theo họ tên chuyên gia/);await input.focus();if(!await input.evaluate(n=>n===document.activeElement))throw Error('Search cannot receive keyboard focus');await p.keyboard.press('Tab');if(!await p.getByRole('button',{name:'Tìm kiếm',exact:true}).evaluate(n=>n===document.activeElement))throw Error('Tab cannot reach search action');set('TC-C1-11','BLOCKED','Keyboard search-to-action focus verified; visual focus and complete filter/CTA keyboard walkthrough still required.');await p.close()});

 await run('TC-C1-08',async()=>{const p=await directoryPage();const waiting=p.waitForResponse(r=>r.url().includes('/api/v1/public/experts')&&new URL(r.url()).searchParams.get('acceptingConsultation')==='true');await p.getByLabel('Sẵn sàng tiếp nhận tư vấn',{exact:true}).check();const response=await waiting;if(!response.ok())throw Error('Consultation filter request failed HTTP '+response.status());if(!await p.getByLabel('Sẵn sàng tiếp nhận tư vấn',{exact:true}).isChecked())throw Error('Consultation control state not applied');set('TC-C1-08','BLOCKED','Real accessible consultation checkbox sends documented true filter successfully; positive/exclusion response semantics need observable consultation-state detail.');await p.close()});
 await run('TC-C2-04',async()=>{const p=await directoryPage();if(!await p.getByText(new RegExp('Tìm thấy '+publicRows.length+' chuyên gia phù hợp')).count())throw Error('Rendered result count differs real public API rows');const paths=await p.locator('a[href^="/experts/"]').evaluateAll(ns=>[...new Set(ns.map(a=>a.getAttribute('href')))]);if(paths.length!==publicRows.length)throw Error('Rendered distinct expert card destinations differ real API count');set('TC-C2-04','PASS','Actual rendered total and distinct profile-card destinations equal live public API record count.');await p.close()});
 await run('TC-C2-09',async()=>{const p=await directoryPage();const a=p.locator('a[href^="/experts/"]').first();if(!await a.count()){set('TC-C2-09','BLOCKED','No actual approved public expert card');await p.close();return;}const path=await a.getAttribute('href');await a.click();await p.waitForURL('**/experts/**');if(new URL(p.url()).pathname!==path)throw Error('Selected card navigated incorrect profile code');set('TC-C2-09','PASS','Actual selected public card destination matches rendered expert code route.');await p.close()});
 await run('TC-C4-01',async()=>{if(!publicRows.length){set('TC-C4-01','BLOCKED','No approved real expert to complete journey');return;}const p=await browser.newPage();await p.goto(base+'/chuyen-gia',{waitUntil:'networkidle'});const link=p.locator('a[href^="/experts/"]').first();if(!await link.count())throw Error('Alias directory offers no profile navigation');const href=await link.getAttribute('href');await link.click();await p.waitForURL('**/experts/**');if(new URL(p.url()).pathname!==href)throw Error('Profile navigation code mismatch');set('TC-C4-01','BLOCKED','Alias-to-real-public-profile navigation succeeded; full menu/Vietnamese-search/PII journey remains incomplete.');await p.close()});


 await run('TC-C1-09',async()=>{const p=await directoryPage();await p.getByLabel(rows[0].name,{exact:true}).check();await p.waitForTimeout(300);const remove=p.getByRole('button',{name:/^Bỏ tiêu chí /i});if(!await remove.count())throw Error('Active sector chip has no accessible remove-one control');const waiting=p.waitForResponse(r=>r.url().includes('/api/v1/public/experts')&&!new URL(r.url()).searchParams.get('sectorCode'));await remove.first().click();await waiting;if(!await p.getByLabel('Tất cả ngành nghề',{exact:true}).isChecked())throw Error('Chip removal leaves sector selected');set('TC-C1-09','PASS','Actual sector chip removal resets only sector and updates real unfiltered query.');await p.close()});
 await run('TC-C2-08',async()=>{const p=await browser.newPage({viewport:{width:390,height:844}});await p.goto(base+'/experts',{waitUntil:'networkidle'});await p.getByRole('button',{name:'Bộ lọc & tiêu chí',exact:true}).click();await p.getByLabel(rows[0].name,{exact:true}).check();await p.getByRole('button',{name:'Xong',exact:true}).click();const remove=p.getByRole('button',{name:/^Bỏ tiêu chí /i});if(!await remove.count())throw Error('Mobile active criteria chip removal missing');await remove.first().click();await p.getByRole('button',{name:'Bộ lọc & tiêu chí',exact:true}).click();if(!await p.getByLabel('Tất cả ngành nghề',{exact:true}).isChecked())throw Error('Mobile drawer retains removed criterion');set('TC-C2-08','PASS','Actual mobile drawer closes with selection retained, chip removes sector, reopened drawer stays consistent.');await p.close()});
 await run('TC-C2-10',async()=>{const p=await browser.newPage();await p.goto(base+'/chuyen-gia',{waitUntil:'networkidle'});await p.getByLabel(rows[0].name,{exact:true}).check();if(!await p.getByLabel(rows[0].name,{exact:true}).isChecked())throw Error('Alias filter unusable');set('TC-C2-10','PASS','Actual alias shows directory and active taxonomy radio selection works.');await p.close()});
 await run('TC-C3-08',async()=>{const p=await directoryPage();let successful=0;p.on('response',r=>{if(r.url().includes('/consultation-requests')&&r.status()<300)successful++});await p.getByRole('button',{name:'Kết nối',exact:true}).first().click();await p.getByRole('button',{name:'Gửi yêu cầu',exact:true}).click();await p.waitForTimeout(300);if(successful)throw Error('Blank invalid consultation input succeeded');const invalid=await p.locator('input[required],textarea[required]').evaluateAll(ns=>ns.some(n=>!n.checkValidity()));if(!invalid)throw Error('Required consultation inputs not enforced');if(!await p.getByRole('button',{name:'Gửi yêu cầu',exact:true}).count())throw Error('Invalid form disappeared instead of allowing correction');set('TC-C3-08','PASS','Actual blank consultation input is rejected by required controls, no successful request, correction remains available.');await p.close()});

 await run('TC-C4-04',async()=>{const p=await browser.newPage({viewport:{width:390,height:844}});await p.goto(base+'/experts',{waitUntil:'networkidle'});await p.getByRole('button',{name:'Bộ lọc & tiêu chí',exact:true}).click();await p.getByLabel(rows[0].name,{exact:true}).check();await p.getByRole('button',{name:'Xong',exact:true}).click();const remove=p.getByRole('button',{name:/^Bỏ tiêu chí /i});if(!await remove.count())throw Error('Mobilejourney chipmissing');await remove.first().click();await p.waitForTimeout(300);const a=p.locator('a[href^="/experts/"]').first();const path=await a.getAttribute('href');await a.click();await p.waitForURL('**/experts/**');if(new URL(p.url()).pathname!==path)throw Error('Mobile profiledestination mismatch');if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile detail horizontaloverflow');set('TC-C4-04','PASS','Real390px directory→drawer→sector→chipremove→publicprofile journey completes without horizontaloverflow.');await p.close()});
 await run('TC-C4-01',async()=>{const chosen=publicRows.find(r=>r.fullName);if(!chosen)throw Error('No publicrecord');const p=await browser.newPage();await p.goto(base,{waitUntil:'networkidle'});await p.getByRole('link',{name:'Chuyên gia',exact:true}).click();await p.waitForURL('**/chuyen-gia');await p.getByPlaceholder(/Tìm theo họ tên chuyên gia/).fill(chosen.fullName);await p.getByRole('button',{name:'Tìm kiếm',exact:true}).click();const a=p.locator('a[href="/experts/'+chosen.expertCode+'"]').first();await a.waitFor();await a.click();await p.waitForURL('**/experts/**');if(!p.url().endsWith('/experts/'+chosen.expertCode))throw Error('Publicjourney expertcodemismatch');const response=await fetch(api+'/api/v1/public/experts/'+chosen.expertCode);if(!response.ok)throw Error('Publicdetail API inaccessible');const body=await response.json();function privacy(o){if(Array.isArray(o))o.forEach(privacy);else if(o&&typeof o==='object')for(const [k,v]of Object.entries(o)){if(['cccd','citizenid','nationalid','identitynumber','phone','phonenumber','personalphone','email','personalemail'].includes(k.toLowerCase()))throw Error('ForbiddenprivatePIIkey:'+k);privacy(v)}}privacy(body);set('TC-C4-01','PASS','Real Home menu→alias→publicname search→correct publicprofile completes; detail response has no forbiddenPIIkeys.');await p.close()});

 await run('TC-C2-07',async()=>{const p=await directoryPage();const first=rows[0],last=rows.find(r=>r.code!==first.code);if(!last)throw Error('Needtwo realactivesectors');await p.getByLabel(first.name,{exact:true}).check();await p.getByLabel(last.name,{exact:true}).check();await p.waitForTimeout(700);const expected=await fetch(api+'/api/v1/public/experts?sectorCode='+encodeURIComponent(last.code)).then(r=>r.json());const records=Array.isArray(expected.data)?expected.data:(expected.data?.items||[]);const paths=await p.locator('a[href^="/experts/"]').evaluateAll(ns=>[...new Set(ns.map(n=>n.getAttribute('href')))]);if(paths.some(path=>!records.some(r=>path==='/experts/'+r.expertCode))||paths.length!==records.length)throw Error('Rapidselection renderedstalefirstquery');if(!await p.getByLabel(last.name,{exact:true}).isChecked())throw Error('Rapidselection state lost');set('TC-C2-07','PASS','Actualrapidtwo-sector selection rendersonlylatest realAPI result and currentcriterion.');await p.close()});
 await run('TC-C3-06',async()=>{const p=await directoryPage();const cdp=await p.context().newCDPSession(p);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:-1,uploadThroughput:-1});await p.getByLabel(rows[0].name,{exact:true}).check();await p.getByRole('button',{name:/Thử lại/i}).first().waitFor({timeout:5000});if(!await p.getByLabel(rows[0].name,{exact:true}).isChecked())throw Error('Actualnetworkfailure losescriterion');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});await p.getByRole('button',{name:/Thử lại/i}).first().click();await p.waitForTimeout(600);if(await p.getByRole('button',{name:/Thử lại/i}).count())throw Error('Realnetworkrestoration fails retry');if(!await p.getByLabel(rows[0].name,{exact:true}).isChecked())throw Error('Retry losescriterion');set('TC-C3-06','PASS','ActualCDPoffline produces networkerror; restoringrealnetwork/retry preserveschosencriterion and reloads service.');await p.close()});
 await run('TC-C2-06',async()=>{const p=await browser.newPage();const cdp=await p.context().newCDPSession(p);await cdp.send('Network.enable');await cdp.send('Network.setBlockedURLs',{urls:[api+'/api/v1/sectors']});await p.goto(base+'/experts',{waitUntil:'networkidle'});await p.getByRole('button',{name:/Thử lại/i}).first().waitFor();if(await p.getByLabel(rows[0].name,{exact:true}).count())throw Error('Taxonomyclientnetworkoutage fabricatedsectoroptions');await cdp.send('Network.setBlockedURLs',{urls:[]});await p.getByRole('button',{name:/Thử lại/i}).first().click();await p.getByLabel(rows[0].name,{exact:true}).waitFor();set('TC-C2-06','PASS','Actual browsernetworkblockoftaxonomy request yields errorwithoutfallback; unblocking realrequest andUIretry restores currentoptions.');await p.close()});
 const fs=require('fs'); const credPath=process.env.DELTA_CREDENTIALS_FILE||'/private/tmp/nacen-qc-delta-credentials.json';
 if(fs.existsSync(credPath)){
   const creds=JSON.parse(fs.readFileSync(credPath,'utf8'));
   if(!String(creds.database).includes('_qc_delta_') || new URL(api).port!==new URL(creds.api).port)throw Error('Mutation guard: credentials and API must target isolated QC clone');
   const context=await browser.newContext();const admin=await context.newPage();
   await admin.goto(base+'/login',{waitUntil:'networkidle'});await admin.locator('input[type=email]').fill(creds.email);await admin.locator('input[type=password]').fill(creds.password);await admin.getByRole('button',{name:/Đăng nhập vào Hệ Thống/i}).click();
   try{await admin.waitForURL('**/admin**',{timeout:10000})}catch(e){throw Error('Real admin UI login failed; no mutation performed')}
   const token=creds.login?.accessToken;if(!token)throw Error('Real authenticated token absent');
   async function actual(path,options={}){const r=await fetch(api+path,{...options,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',...(options.headers||{})}});if(!r.ok)throw Error('Actual '+(options.method||'GET')+' '+path+' HTTP '+r.status);if(r.status===204)return null;const text=await r.text();return text?JSON.parse(text):null;}
   async function active(){return(await actual('/api/v1/sectors')).data}
   function expertRows(res){return Array.isArray(res?.data)?res.data:(res?.data?.items||res?.data?.results||[]);}
   async function checkPublicOption(code,name,present){
     const home=await context.newPage();await home.goto(base,{waitUntil:'networkidle'});if((await home.getByRole('link',{name,exact:true}).count()>0)!==present)throw Error('Home active sector visibility differs');
     await home.goto(base+'/experts',{waitUntil:'networkidle'});if((await home.getByLabel(name,{exact:true}).count()>0)!==present)throw Error('Directory active sector visibility differs');await home.close();
   }

   await run('TC-C3-07',async()=>{const p=await context.newPage();await p.goto(base+'/experts',{waitUntil:'networkidle'});await p.getByRole('button',{name:'Kết nối',exact:true}).first().click();await p.getByPlaceholder('VD: Công ty Cổ phần Công nghệ ABC').fill('QC isolated clone');await p.getByPlaceholder('VD: Nguyễn Văn A').fill('QC Delta requester');await p.getByPlaceholder('VD: 0912345678').fill('0900000000');await p.getByPlaceholder('VD: contact@doanhnghiep.vn').fill(creds.email);await p.getByPlaceholder(/Mô tả ngắn gọn khó khăn kỹ thuật/).fill('Kiểm chứng yêu cầu kết nối trên cơ sở dữ liệu QC riêng, không phải yêu cầu sản xuất.');const waiting=p.waitForResponse(r=>r.url().includes('/consultation-requests')&&r.request().method()==='POST');await p.getByRole('button',{name:'Gửi yêu cầu',exact:true}).click();const response=await waiting;if(response.status()!==202)throw Error('Real valid consultation HTTP '+response.status()+' expected202');const payload=await response.json();if(payload.success!==true)throw Error('Real consultation envelope notaccepted');await p.waitForTimeout(300);const text=await p.locator('body').innerText();if(!/NacenTech/i.test(text)||!/tiếp nhận|điều phối/i.test(text))throw Error('Consultation success copy omits real coordinating recipient');set('TC-C3-07','PASS','Actual requester form creates real isolated-clone consultation; HTTP202/success drives NacenTech reception copy.');await p.close();});

   await run('TC-C2-12',async()=>{const p=await context.newPage();for(const path of ['/login','/admin']){await p.goto(base+path,{waitUntil:'networkidle'});const text=await p.locator('body').innerText();if(/\b(?:10|18)\s+(?:ngành|lĩnh vực)/i.test(text))throw Error('Unaudited fixedsectorcount incommoncopy '+path)}set('TC-C2-12','PASS','Actual login/admin commoncopy contains nofixed10/18sectorclaims; rolecount10 remains separatebusinessdimension.');await p.close()});
   await run('TC-C3-13',async()=>{const category=(await actual('/api/v1/master-data/tt17')).data;const {execFileSync}=require('child_process');const count=Number(execFileSync('docker',['exec','nacentech-postgres-1','psql','-U','postgres','-d',creds.database,'-At','-c',"SELECT count(*) FROM policy.taxonomy_terms WHERE kind='CATEGORY' AND is_active=true AND code IS NOT NULL;"],{encoding:'utf8'}).trim());if(category.length!==count)throw Error('TT17listcount differs independentactiveCATEGORYSQL');await admin.goto(base+'/admin/sectors',{waitUntil:'networkidle'});await admin.getByRole('button',{name:/Phân Ngành TT17/i}).click();for(const row of category)if(!await admin.getByText(row.name,{exact:true}).count())throw Error('Runtimecategoryname missing fromadmin');set('TC-C3-13','PASS','Real TT17APIlist/admin names equal independentactiveCATEGORYSQL count='+count+'.');});
   let created=null;const code='LVQC'+String(Date.now()).slice(-4), name='Ngành kiểm chứng Delta QC';
   await run('TC-C3-09',async()=>{
     await admin.goto(base+'/admin/sectors',{waitUntil:'networkidle'});await admin.getByRole('button',{name:/Thêm Lĩnh Vực Mới/i}).click();await admin.getByPlaceholder(/VD: LV19/).fill(code);await admin.getByPlaceholder(/VD: Năng Lượng/).fill(name);const createResponse=admin.waitForResponse(r=>r.url().endsWith('/api/v1/master-data/sectors')&&r.request().method()==='POST');await admin.getByRole('button',{name:'Lưu Lĩnh Vực',exact:true}).click();const actualCreate=await createResponse;if(!actualCreate.ok())throw Error('Real admin UI create HTTP '+actualCreate.status());await admin.getByText(code,{exact:true}).waitFor({timeout:10000});await admin.reload({waitUntil:'networkidle'});if(!await admin.getByText(code,{exact:true}).count())throw Error('Create disappeared on reload');created=(await actual('/api/v1/master-data/sectors?activeOnly=false')).data.find(r=>r.code===code);if(!created?.id)throw Error('Persisted created ID not returned');set('TC-C3-09','PASS','Actual admin UI POST confirmed; new taxonomy row remains after reload and authenticated API read.');
   });
   try{
     if(created){
       await run('TC-C4-05',async()=>{await checkPublicOption(code,name,true);const upgrade=await context.newPage();await upgrade.goto(base+'/profile/upgrade/expert',{waitUntil:'networkidle'});const full=upgrade.getByPlaceholder('TS. Nguyễn Văn An');if(await full.count())await full.fill('Chuyên gia kiểm chứng QC');await upgrade.getByRole('button',{name:/Tiếp tục: Năng lực Chuyên môn/i}).click();if(!await upgrade.getByRole('option',{name,exact:true}).count())throw Error('Upgrade selector does not reflect created sector');set('TC-C4-05','PASS','Admin actual create persists and Home/directory/upgrade reflect same active taxonomy code/name.');await upgrade.close();});
       const renamed=name+' đổi tên';
       await run('TC-C3-10',async()=>{await actual('/api/v1/admin/sectors/'+created.id,{method:'PATCH',body:JSON.stringify({name:renamed})});const found=(await active()).find(r=>r.code===code);if(found?.name!==renamed)throw Error('Actual rename not persisted');await checkPublicOption(code,renamed,true);set('TC-C3-10','BLOCKED','Actual rename persisted; Home/directory current labels verified. Upgrade/admin/GOV/profile/matrix full cross-surface coverage pending.');});
       await run('TC-C3-11',async()=>{await actual('/api/v1/admin/sectors/'+created.id,{method:'DELETE'});if((await active()).some(r=>r.code===code))throw Error('Deactivated code remains active API');await checkPublicOption(code,renamed,false);const history=(await actual('/api/v1/master-data/sectors?activeOnly=false')).data.find(r=>r.code===code);if(!history||history.isActive!==false)throw Error('Deactivation rewrote/deleted taxonomy history');set('TC-C3-11','BLOCKED','Actual deactivation removes active API/Home/directory and retains inactive row; upgrade/historical expert checks pending.');});
       await run('TC-C4-06',async()=>{await admin.goto(base+'/admin/roles',{waitUntil:'networkidle'});await admin.getByRole('button',{name:/Gán Vai Trò Cán Bộ/i}).click();await admin.getByRole('combobox').first().selectOption('SECTOR_ADMIN');if(await admin.getByRole('option',{name:new RegExp(code)}).count())throw Error('Inactive sector remains role assignment option');set('TC-C4-06','BLOCKED','Deactivated real sector absent directory/Home/RBAC options and inactive history retained; historical expert profile preservation still needs targeted assertion.');});
     }

   }finally{if(created){try{await actual('/api/v1/admin/sectors/'+created.id,{method:'DELETE'})}catch(e){set('TC-C3-11','FAIL','Cleanup deactivation failed: '+e.message)}}}
   const master=(await actual('/api/v1/master-data/sectors?activeOnly=false')).data;
   const matrix=(await actual('/api/v1/master-data/matrix')).data;
   const canonical=publicRows.find(r=>Array.isArray(r.expertiseSectors)&&r.expertiseSectors.some(code=>master.some(t=>t.code===code&&t.isActive)&&matrix.some(m=>m.fieldCode===code)));
   if(canonical && process.env.DELTA_ENABLE_CANONICAL_MUTATION==='true'){
     const canonicalCode=canonical.expertiseSectors.find(code=>master.some(t=>t.code===code&&t.isActive)&&matrix.some(m=>m.fieldCode===code));
     const term=master.find(t=>t.code===canonicalCode);const renamed=term.name+' QC rename';const oldCodes=[...canonical.expertiseSectors];
       const {execFileSync}=require('child_process');
       function sql(query){return execFileSync('docker',['exec','nacentech-postgres-1','psql','-U','postgres','-d',creds.database,'-At','-c',query],{encoding:'utf8'}).trim()}
       if(!/^[0-9a-f-]{36}$/i.test(term.id))throw Error('Persisted taxonomy ID invalid for isolated SQL backup');
       const snapshot=JSON.parse(sql("SELECT row_to_json(t) FROM policy.taxonomy_terms t WHERE id='"+term.id+"';"));
       fs.writeFileSync(process.env.DELTA_EVIDENCE_DIR+'/canonical-sector-before.json',JSON.stringify(snapshot,null,2));
     try{
       await actual('/api/v1/admin/sectors/'+term.id,{method:'PATCH',body:JSON.stringify({name:renamed})});
       await run('TC-C3-10',async()=>{
         await checkPublicOption(term.code,renamed,true);
         await admin.goto(base+'/admin/sectors',{waitUntil:'networkidle'});if(!await admin.getByText(renamed,{exact:true}).count())throw Error('Admin sector rename stale');
         const upgrade=await context.newPage();await upgrade.goto(base+'/profile/upgrade/expert',{waitUntil:'networkidle'});await upgrade.getByPlaceholder('TS. Nguyễn Văn An').fill('QC kiểm chứng');await upgrade.getByRole('button',{name:/Tiếp tục: Năng lực Chuyên môn/i}).click();if(!await upgrade.getByRole('option',{name:renamed,exact:true}).count())throw Error('Upgrade sector rename stale');await upgrade.close();
         await admin.goto(base+'/admin/roles',{waitUntil:'networkidle'});await admin.getByRole('button',{name:/Gán Vai Trò Cán Bộ/i}).click();await admin.getByRole('combobox').first().selectOption('SECTOR_ADMIN');if(!await admin.getByRole('option',{name:term.code+' — '+renamed,exact:true}).count())throw Error('RBAC sector rename stale');
         set('TC-C3-10','PASS','Real canonical-sector rename appears in Home/directory/admin/upgrade/RBAC; public profile+matrix checked next case.');
       });
       await run('TC-C4-08',async()=>{
         const mapped=(await actual('/api/v1/master-data/matrix')).data.filter(m=>m.fieldCode===term.code);if(!mapped.length||mapped.some(m=>m.fieldName!==renamed))throw Error('Matrix names stale after canonical rename');
         const profile=await context.newPage();await profile.goto(base+'/experts/'+encodeURIComponent(canonical.expertCode),{waitUntil:'networkidle'});if(!await profile.getByText(renamed,{exact:true}).count())throw Error('Public profile sector name stale after canonical rename');await profile.close();
         const reloaded=expertRows(await actual('/api/v1/public/experts')).find(r=>r.expertCode===canonical.expertCode);if(JSON.stringify(reloaded?.expertiseSectors)!==JSON.stringify(oldCodes))throw Error('Rename rewrote historical expert sector codes');
         set('TC-C4-08','PASS','Real canonical rename resolves consistently in matrix and actual expert public profile; historical expert codes unchanged.');
       });

       try{
         await actual('/api/v1/admin/sectors/'+term.id,{method:'DELETE'});
         await run('TC-C3-11',async()=>{
           if((await active()).some(r=>r.code===term.code))throw Error('Canonical inactive code remainsactive');await checkPublicOption(term.code,renamed,false);
           const upgrade=await context.newPage();await upgrade.goto(base+'/profile/upgrade/expert',{waitUntil:'networkidle'});await upgrade.getByPlaceholder('TS. Nguyễn Văn An').fill('QC kiểm chứng');await upgrade.getByRole('button',{name:/Tiếp tục: Năng lực Chuyên môn/i}).click();if(await upgrade.getByRole('option',{name:renamed,exact:true}).count())throw Error('Inactive canonical remains upgradeoption');await upgrade.close();
           const history=expertRows(await actual('/api/v1/public/experts')).find(r=>r.expertCode===canonical.expertCode);if(JSON.stringify(history?.expertiseSectors)!==JSON.stringify(oldCodes))throw Error('Deactivation rewrites historical expertcodes');set('TC-C3-11','PASS','Real canonicaldeactivation removes active API/Home/directory/upgrade while retainedexpert sectorcodes unchanged.');
         });
         await run('TC-C3-14',async()=>{const matrixNow=(await actual('/api/v1/master-data/matrix')).data;if(matrixNow.some(r=>r.fieldCode===term.code))throw Error('Inactive canonical remains active matrix');set('TC-C3-14','PASS','Actualmatrix resolves renamedcanonical beforedeactivation and excludes it afterrealdeactivation.');});
         await run('TC-C4-06',async()=>{await admin.goto(base+'/admin/roles',{waitUntil:'networkidle'});await admin.getByRole('button',{name:/Gán Vai Trò Cán Bộ/i}).click();await admin.getByRole('combobox').first().selectOption('SECTOR_ADMIN');if(await admin.getByRole('option',{name:new RegExp(term.code)}).count())throw Error('Inactivecanonical remains RBACoption');const history=expertRows(await actual('/api/v1/public/experts')).find(r=>r.expertCode===canonical.expertCode);if(JSON.stringify(history?.expertiseSectors)!==JSON.stringify(oldCodes))throw Error('Historicalcodes changed');set('TC-C4-06','PASS','Actual canonicaldeactivation removes publicfilter and roleoption; historicalexpert codes remainintact.');});
       }finally{
         const fields=Object.keys(snapshot).filter(k=>k!=='id');if(fields.some(k=>!/^[a-z_]+$/.test(k)))throw Error('UnexpectedSQL identifiers refuseunsafe restore');const columnList=fields.map(k=>'"'+k+'"').join(',');const backup=JSON.stringify(snapshot).replace(/'/g,"''");sql("UPDATE policy.taxonomy_terms t SET ("+columnList+")=(SELECT "+columnList+" FROM json_populate_record(NULL::policy.taxonomy_terms,'"+backup+"'::json)) WHERE id='"+term.id+"';");
       }
     }finally{const fields=Object.keys(snapshot).filter(k=>k!=='id');if(fields.some(k=>!/^[a-z_]+$/.test(k)))throw Error('Unsafe restore identifiers');const columns=fields.map(k=>'\"'+k+'\"').join(',');const backup=JSON.stringify(snapshot).replace(/'/g,"''");sql("UPDATE policy.taxonomy_terms SET ("+columns+")=(SELECT "+columns+" FROM json_populate_record(NULL::policy.taxonomy_terms,'"+backup+"'::json)) WHERE id='"+term.id+"';");}
   }
   if(process.env.DELTA_ENABLE_CANONICAL_MUTATION!=='true'){for(const cid of ['TC-C3-10','TC-C3-11','TC-C3-14','TC-C4-06','TC-C4-08'])set(cid,'BLOCKED','Canonical existing-row mutation/SQLrollback excluded: automaticapprovalreview rejected exactaction pendingcloneproof/approval. Test-createdQCsector observations remain separate.')}

   await run('TC-C3-15',async()=>{
     const email='qc-sector-officer-'+Date.now()+'@local.test';await actual('/api/v1/auth/register',{method:'POST',body:JSON.stringify({email,password:creds.password,confirmPassword:creds.password,firstName:'QC',lastName:'Sector officer',organization:'Isolated QC clone'})});
     const {execFileSync}=require('child_process');execFileSync('docker',['exec','nacentech-postgres-1','psql','-U','postgres','-d',creds.database,'-At','-c',"UPDATE identity.persons SET is_active=true WHERE email='"+email+"';"],{encoding:'utf8'});
     const activeRows=await active();if(!activeRows.length)throw Error('Noactivesector forrealassignment');const selected=activeRows[0];await admin.goto(base+'/admin/roles',{waitUntil:'networkidle'});await admin.getByRole('button',{name:/Gán Vai Trò Cán Bộ/i}).click();await admin.getByPlaceholder('VD: so.danang@nacentech.local').fill(email);await admin.getByRole('combobox').first().selectOption('SECTOR_ADMIN');await admin.getByRole('combobox').nth(2).selectOption(selected.code);const waiting=admin.waitForResponse(r=>r.url().endsWith('/api/v1/governance/roles/assign')&&r.request().method()==='POST');await admin.getByRole('button',{name:/Xác Nhận Bổ Nhiệm/i}).click();const response=await waiting;if(!response.ok())throw Error('Realroleassignment HTTP '+response.status());const officers=(await actual('/api/v1/governance/roles/officers')).data;const persisted=officers.find(o=>o.email===email);if(!persisted||persisted.role!=='SECTOR_ADMIN'||persisted.scopeType!=='SECTOR'||persisted.scopeId!==selected.code)throw Error('Realassignment persistedwrongrole/scopecode');set('TC-C3-15','PASS','Actuallyregistered/activated QC actor receives scopedrole viarealUI; persistedofficer read verifiesactivecode/SECTOR/SECTOR_ADMIN. Noforgedtokens ormockDTO.');
   });
   await context.close();
 }else set('TC-C3-09','BLOCKED','Real clone admin credentials source unavailable');
 await browser.close();console.log(JSON.stringify(result));
})().catch(e=>{console.log(JSON.stringify({browserError:e.message}));process.exitCode=1});
"""
    try:
        env=dict(os.environ, DELTA_WEB_URL=WEB, DELTA_EVIDENCE_DIR=str(OUT), DELTA_SECTORS=json.dumps(sectors(),ensure_ascii=False), DELTA_DB_COUNT_FILE=str(ROOT/'docs/test-evidence/CR-2026-005/db-sector-count.json'))
        node=os.getenv('DELTA_NODE_BIN','node')
        proc=subprocess.run([node,'-e',node_script],capture_output=True,text=True,timeout=180,env=env)
        observed=json.loads(proc.stdout.strip().splitlines()[-1])
        for cid,result in observed.items():
            if cid in CASES:finish(cid,result['status'],result['evidence'])
        if observed.get('browserError'):
            for cid in ('TC-C2-01','TC-C2-02','TC-C2-10','TC-C2-11'):finish(cid,'BLOCKED','Existing Node browser unavailable: '+observed['browserError'])
    except Exception as err:
        for cid in ('TC-C2-01','TC-C2-02','TC-C2-10','TC-C2-11'):finish(cid,'BLOCKED','Node browser/live-taxonomy prerequisite unavailable: '+str(err))

# Require actual environmental actions/authorized inputs; never claim pass from test doubles.
reasons={
 'TC-C1-02':'Requires real Vietnamese search input and expert whose public searchable fields prove matching.',
 'TC-C1-07':'Need >1 page of approved real experts plus observable UI pagination state.',
 'TC-C1-08':'Requires experts in both consultation states and full UI interaction.',
 'TC-C1-09':'Need browser chip removal interaction and comparison of actual results.',
 'TC-C1-10':'Need browser reset interaction and actual default-query comparison.',
 'TC-C1-11':'Needs browser keyboard focus/CTA walkthrough and visual focus evidence.',
 'TC-C2-03':'Needs real service delayed loading observation; no mock/interception permitted.',
 'TC-C2-04':'Needs browser grid/count-to-live-response comparison.',
 'TC-C2-05':'API no-match checked separately; browser empty-state/reset control still required.',
 'TC-C2-06':'Needs controlled real taxonomy outage/recovery authorization and UI retry.',
 'TC-C2-07':'Needs real browser rapid-filter observation, no route mocks.',
 'TC-C2-08':'Needs real mobile drawer and chip interactions.',
 'TC-C2-09':'Needs real card navigation and public profile evidence.',
 'TC-C2-13':'Needs authenticated admin and safe real empty/error/loading environmental control.',
 'TC-C2-14':'Requires historical retired-sector profile plus active-sector profile.',
 'TC-C3-01':'Home API/UI comparison available separately; directory option count and independent DB count still required.',
 'TC-C3-03':'Requires public experts with proven province scopes for match/exclusion.',
 'TC-C3-04':'Requires real expert matching all four filters and UI end-to-end query evidence.',
 'TC-C3-05':'Need enough approved experts for page>1 and UI page-reset evidence.',
 'TC-C3-06':'Needs authorized controlled real API outage and browser recovery, no mocks.',
 'TC-C3-07':'Requires live requester data and real consultation request capability on isolated QC clone.',
 'TC-C3-08':'Requires requester input and UI validation/service refusal; no fake responses.',
 'TC-C3-09':'Requires real admin account and approved taxonomy creation data plus reload verification.',
 'TC-C3-10':'Requires real taxonomy rename, cross-surface reload and restore plan.',
 'TC-C3-11':'Requires safe taxonomy deactivation and preserved historical profile evidence.',
 'TC-C3-12':'Needs safe actual empty taxonomy/outage; production data must not be cleared for a test.',
 'TC-C3-13':'Needs category API list + independent DB active-category read to verify count and membership.',
 'TC-C3-14':'Requires actual rename/deactivate and matrix replay.',
 'TC-C3-15':'Needs real scoped admin account and approved target officer; cannot fabricate assignment.',
 'TC-C3-16':'Needs real expert account, approved CV/profile data and actual submit evidence.',
 'TC-C4-01':'Needs full browser public menu/search/profile journey and PII evidence.',
 'TC-C4-02':'Needs real enterprise role account, province/sector dataset and multi-page journey.',
 'TC-C4-03':'Requires real enterprise consultation submission input and recipient expert.',
 'TC-C4-04':'Needs completed browser mobile drawer/chip/profile journey.',
 'TC-C4-05':'Requires real admin mutation then Home/directory/upgrade verification.',
 'TC-C4-06':'Needs authorized real deactivation then filter/RBAC historical preservation verification.',
 'TC-C4-07':'Requires real CV file/text, configured real AI credentials and safe taxonomy outage control.',
 'TC-C4-08':'Requires actual taxonomy rename and matrix/profile reload verification.'}
for cid,reason in reasons.items():
    if CASES[cid]['evidence'].startswith('Case prerequisites'): finish(cid,'BLOCKED',reason)
report={'timestamp_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'api':API,'web':WEB,'source':'Approved 50-case QC-BLUEPRINT-DELTA-V12.md; real HTTP/browser; no mocks','gate4':'OPEN', 'results':[CASES[k] for k in sorted(CASES)]}
counts={status:sum(c['status']==status for c in CASES.values()) for status in ('PASS','FAIL','BLOCKED')};report['counts']=counts
(OUT/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
lines=['# Delta v12 real-service black-box evidence','',f"UTC: {report['timestamp_utc']}",f"API: {API}; Web: {WEB}",'',f"PASS {counts['PASS']} / FAIL {counts['FAIL']} / BLOCKED {counts['BLOCKED']} — Gate 4 remains OPEN.",'','No mock response/interception. Authorizedconsultation/taxonomywrites are restricted to validated isolatedQCclone; originalDB is untouched. Canonicalrows use fullsnapshot/finallyrestore. Responsivevisualreview: visual-review.json.','', '| Case | Result | Evidence / missing prerequisite |','|---|---|---|']
lines += [f"| {c['id']} | {c['status']} | {c['evidence'].replace('|','/').replace(chr(10),' ')} |" for c in report['results']]
(OUT/'results.md').write_text('\n'.join(lines)+'\n')
print(json.dumps(counts));print(str(OUT/'results.md'))
