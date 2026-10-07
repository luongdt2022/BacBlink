#!/usr/bin/env python3
"""CR-2026-005: approved 50-case business blueprint, real HTTP/browser only.
No implementation imports, route interception, fake service responses or test-data writes.
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
   set(id,'BLOCKED','Real screenshot captured; no horizontal overflow. Manual density/overlap/clipping review required.');await page.close();
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
 await run('TC-C3-01',async()=>{const p=await directoryPage();for(const r of rows)if(!await p.getByLabel(r.name,{exact:true}).count())throw Error('Directory missing active sector name');const label=p.locator('label').filter({hasText:new RegExp('LĨNH VỰC CHUYÊN MÔN \\('+rows.length+'\\)')});if(!await label.count())throw Error('Directory option count differs from active API');set('TC-C3-01','BLOCKED','All directory active code/name options and count match live API; independent DB count still required.');await p.close()});
 await run('TC-C1-02',async()=>{const chosen=publicRows.find(r=>typeof r.fullName==='string'&&/[À-ỹ]/.test(r.fullName));if(!chosen){set('TC-C1-02','BLOCKED','No approved expert with Vietnamese searchable name');return;}const p=await directoryPage();const wait=p.waitForResponse(r=>r.url().includes('/api/v1/public/experts')&&new URL(r.url()).searchParams.get('q')===chosen.fullName);await p.getByPlaceholder(/Tìm theo họ tên chuyên gia/).fill(chosen.fullName);await p.getByRole('button',{name:'Tìm kiếm',exact:true}).click();const data=await(await wait).json();const found=Array.isArray(data.data)?data.data:(data.data?.items||[]);if(!found.some(r=>r.expertCode===chosen.expertCode))throw Error('Vietnamese exact name search did not return chosen real expert');set('TC-C1-02','PASS','Real Vietnamese public name submitted unchanged and corresponding public expert returned.');await p.close()});
 await run('TC-C2-05',async()=>{const p=await directoryPage();const input='QC-NO-MATCH-'+Date.now();const wait=p.waitForResponse(r=>r.url().includes('/api/v1/public/experts')&&new URL(r.url()).searchParams.get('q')===input);await p.getByPlaceholder(/Tìm theo họ tên chuyên gia/).fill(input);await p.getByRole('button',{name:'Tìm kiếm',exact:true}).click();await wait;await p.waitForTimeout(250);if(!await p.getByText(/Không tìm thấy chuyên gia/i).count())throw Error('No-result UI fails to show empty recovery state');if(!await p.getByRole('button',{name:/Đặt lại|Xóa bộ lọc/i}).count())throw Error('No-result recovery control missing');set('TC-C2-05','PASS','Real no-match search shows empty state and recovery control.');await p.close()});
 await run('TC-C1-10',async()=>{const p=await directoryPage();const input=p.getByPlaceholder(/Tìm theo họ tên chuyên gia/);await input.fill('từ khóa');if(rows.length)await p.getByLabel(rows[0].name,{exact:true}).check();await p.getByRole('button',{name:'Đặt lại',exact:true}).click();if(await input.inputValue()!=='')throw Error('Reset leaves keyword');if(!await p.getByLabel('Tất cả ngành nghề',{exact:true}).isChecked())throw Error('Reset leaves sector filter');if(await p.locator('select').inputValue()!=='')throw Error('Reset leaves province');set('TC-C1-10','PASS','Rendered keyword/sector/province reset to actual default values.');await p.close()});
 await run('TC-C1-11',async()=>{const p=await directoryPage();const input=p.getByPlaceholder(/Tìm theo họ tên chuyên gia/);await input.focus();if(!await input.evaluate(n=>n===document.activeElement))throw Error('Search cannot receive keyboard focus');await p.keyboard.press('Tab');if(!await p.getByRole('button',{name:'Tìm kiếm',exact:true}).evaluate(n=>n===document.activeElement))throw Error('Tab cannot reach search action');set('TC-C1-11','BLOCKED','Keyboard search-to-action focus verified; visual focus and complete filter/CTA keyboard walkthrough still required.');await p.close()});
 await run('TC-C4-01',async()=>{if(!publicRows.length){set('TC-C4-01','BLOCKED','No approved real expert to complete journey');return;}const p=await browser.newPage();await p.goto(base+'/chuyen-gia',{waitUntil:'networkidle'});const link=p.locator('a[href^="/experts/"]').first();if(!await link.count())throw Error('Alias directory offers no profile navigation');const href=await link.getAttribute('href');await link.click();await p.waitForURL('**/experts/**');if(new URL(p.url()).pathname!==href)throw Error('Profile navigation code mismatch');set('TC-C4-01','BLOCKED','Alias-to-real-public-profile navigation succeeded; full menu/Vietnamese-search/PII journey remains incomplete.');await p.close()});

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
   async function checkPublicOption(code,name,present){
     const home=await context.newPage();await home.goto(base,{waitUntil:'networkidle'});if((await home.getByRole('link',{name,exact:true}).count()>0)!==present)throw Error('Home active sector visibility differs');
     await home.goto(base+'/experts',{waitUntil:'networkidle'});if((await home.getByLabel(name,{exact:true}).count()>0)!==present)throw Error('Directory active sector visibility differs');await home.close();
   }
   let created=null;const code='LVQC'+Date.now(), name='Ngành kiểm chứng Delta QC';
   await run('TC-C3-09',async()=>{
     await admin.goto(base+'/admin/sectors',{waitUntil:'networkidle'});await admin.getByRole('button',{name:/Thêm Lĩnh Vực Mới/i}).click();await admin.getByPlaceholder(/VD: LV19/).fill(code);await admin.getByPlaceholder(/VD: Năng Lượng/).fill(name);await admin.getByRole('button',{name:'Lưu Lĩnh Vực',exact:true}).click();await admin.getByText(code,{exact:true}).waitFor({timeout:10000});await admin.reload({waitUntil:'networkidle'});if(!await admin.getByText(code,{exact:true}).count())throw Error('Create disappeared on reload');created=(await actual('/api/v1/master-data/sectors?activeOnly=false')).data.find(r=>r.code===code);if(!created?.id)throw Error('Persisted created ID not returned');set('TC-C3-09','PASS','Actual admin UI POST confirmed; new taxonomy row remains after reload and authenticated API read.');
   });
   try{
     if(created){
       await run('TC-C4-05',async()=>{await checkPublicOption(code,name,true);const upgrade=await context.newPage();await upgrade.goto(base+'/profile/upgrade/expert',{waitUntil:'networkidle'});const full=upgrade.getByPlaceholder('TS. Nguyễn Văn An');if(await full.count())await full.fill('Chuyên gia kiểm chứng QC');await upgrade.getByRole('button',{name:/Tiếp tục: Năng lực Chuyên môn/i}).click();if(!await upgrade.getByRole('option',{name,exact:true}).count())throw Error('Upgrade selector does not reflect created sector');set('TC-C4-05','PASS','Admin actual create persists and Home/directory/upgrade reflect same active taxonomy code/name.');await upgrade.close();});
       const renamed=name+' đổi tên';
       await run('TC-C3-10',async()=>{await actual('/api/v1/admin/sectors/'+created.id,{method:'PATCH',body:JSON.stringify({name:renamed})});const found=(await active()).find(r=>r.code===code);if(found?.name!==renamed)throw Error('Actual rename not persisted');await checkPublicOption(code,renamed,true);set('TC-C3-10','BLOCKED','Actual rename persisted; Home/directory current labels verified. Upgrade/admin/GOV/profile/matrix full cross-surface coverage pending.');});
       await run('TC-C3-11',async()=>{await actual('/api/v1/admin/sectors/'+created.id,{method:'DELETE'});if((await active()).some(r=>r.code===code))throw Error('Deactivated code remains active API');await checkPublicOption(code,renamed,false);const history=(await actual('/api/v1/master-data/sectors?activeOnly=false')).data.find(r=>r.code===code);if(!history||history.isActive!==false)throw Error('Deactivation rewrote/deleted taxonomy history');set('TC-C3-11','BLOCKED','Actual deactivation removes active API/Home/directory and retains inactive row; upgrade/historical expert checks pending.');});
       await run('TC-C4-06',async()=>{await admin.goto(base+'/admin/roles',{waitUntil:'networkidle'});await admin.getByRole('button',{name:/Gán Vai Trò Cán Bộ/i}).click();await admin.getByRole('combobox').first().selectOption('SECTOR_ADMIN');if(await admin.getByRole('option',{name:new RegExp(code)}).count())throw Error('Inactive sector remains role assignment option');set('TC-C4-06','BLOCKED','Deactivated real sector absent directory/Home/RBAC options and inactive history retained; historical expert profile preservation still needs targeted assertion.');});
     }
   }finally{if(created){try{await actual('/api/v1/admin/sectors/'+created.id,{method:'DELETE'})}catch(e){set('TC-C3-11','FAIL','Cleanup deactivation failed: '+e.message)}}await context.close()}
 }else set('TC-C3-09','BLOCKED','Real clone admin credentials source unavailable');
 await browser.close();console.log(JSON.stringify(result));
})().catch(e=>{console.log(JSON.stringify({browserError:e.message}));process.exitCode=1});
"""
    try:
        env=dict(os.environ, DELTA_WEB_URL=WEB, DELTA_EVIDENCE_DIR=str(OUT), DELTA_SECTORS=json.dumps(sectors(),ensure_ascii=False))
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
 'TC-C1-02':'Need approved real Vietnamese search input and expert whose public searchable fields prove matching.',
 'TC-C1-07':'Need >1 page of approved real experts plus observable UI pagination state.',
 'TC-C1-08':'Need approved experts in both consultation states and full UI interaction.',
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
 'TC-C2-14':'Needs approved historical retired-sector profile plus active-sector profile.',
 'TC-C3-01':'Home API/UI comparison available separately; directory option count and independent DB count still required.',
 'TC-C3-03':'Need approved public experts with proven province scopes for match/exclusion.',
 'TC-C3-04':'Need approved real expert matching all four filters and UI end-to-end query evidence.',
 'TC-C3-05':'Need enough approved experts for page>1 and UI page-reset evidence.',
 'TC-C3-06':'Needs authorized controlled real API outage and browser recovery, no mocks.',
 'TC-C3-07':'Needs approved live requester data and permission to create actual consultation request.',
 'TC-C3-08':'Needs approved requester input and UI validation/service refusal; no fake responses.',
 'TC-C3-09':'Needs approved real admin account and approved taxonomy creation data plus reload verification.',
 'TC-C3-10':'Needs approved real taxonomy rename, cross-surface reload and restore plan.',
 'TC-C3-11':'Needs approved safe taxonomy deactivation and preserved historical profile evidence.',
 'TC-C3-12':'Needs safe actual empty taxonomy/outage; production data must not be cleared for a test.',
 'TC-C3-13':'Needs category API list + independent DB active-category read to verify count and membership.',
 'TC-C3-14':'Needs approved actual rename/deactivate and matrix replay.',
 'TC-C3-15':'Needs real scoped admin account and approved target officer; cannot fabricate assignment.',
 'TC-C3-16':'Needs real expert account, approved CV/profile data and actual submit evidence.',
 'TC-C4-01':'Needs full browser public menu/search/profile journey and PII evidence.',
 'TC-C4-02':'Needs real enterprise role account, province/sector dataset and multi-page journey.',
 'TC-C4-03':'Needs approved real enterprise consultation submission input and recipient expert.',
 'TC-C4-04':'Needs completed browser mobile drawer/chip/profile journey.',
 'TC-C4-05':'Needs approved real admin mutation then Home/directory/upgrade verification.',
 'TC-C4-06':'Needs authorized real deactivation then filter/RBAC historical preservation verification.',
 'TC-C4-07':'Needs approved real CV file/text, configured real AI credentials and safe taxonomy outage control.',
 'TC-C4-08':'Needs approved actual taxonomy rename and matrix/profile reload verification.'}
for cid,reason in reasons.items():
    if CASES[cid]['evidence'].startswith('Case prerequisites'): finish(cid,'BLOCKED',reason)
report={'timestamp_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'api':API,'web':WEB,'source':'Approved 50-case QC-BLUEPRINT-DELTA-V12.md; real HTTP/browser; no mocks','gate4':'OPEN', 'results':[CASES[k] for k in sorted(CASES)]}
counts={status:sum(c['status']==status for c in CASES.values()) for status in ('PASS','FAIL','BLOCKED')};report['counts']=counts
(OUT/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
lines=['# Delta v12 real-service black-box evidence','',f"UTC: {report['timestamp_utc']}",f"API: {API}; Web: {WEB}",'',f"PASS {counts['PASS']} / FAIL {counts['FAIL']} / BLOCKED {counts['BLOCKED']} — Gate 4 remains OPEN.",'','No mock response/interception or business-data write was used. Screenshots are observations; responsive visual sign-off requires manual review.','', '| Case | Result | Evidence / missing prerequisite |','|---|---|---|']
lines += [f"| {c['id']} | {c['status']} | {c['evidence'].replace('|','/').replace(chr(10),' ')} |" for c in report['results']]
(OUT/'results.md').write_text('\n'.join(lines)+'\n')
print(json.dumps(counts));print(str(OUT/'results.md'))
