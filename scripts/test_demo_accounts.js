const BASE = 'http://localhost:5080';

async function login(email) {
  const res = await fetch(BASE + '/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Password@123' })
  });
  return res.json();
}

async function get(path, token) {
  const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
  const res = await fetch(BASE + path, { headers });
  let data;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  return { status: res.status, data };
}

async function run() {
  const testMatrix = [
    {
      role: 'Super Admin',
      email: 'super.admin@demo.nacentech.vn',
      endpoints: [
        '/api/v1/governance/approvals?status=PENDING_APPROVAL',
        '/api/v1/governance/roles/officers',
        '/api/v1/master-data/sectors?activeOnly=false',
        '/api/v1/enterprises?pageSize=5'
      ]
    },
    {
      role: 'Tiền Giang Admin',
      email: 'tiengiang.admin@demo.nacentech.vn',
      endpoints: [
        '/api/v1/gov/assessments/tt17?scopeId=TG',
        '/api/v1/enterprises?province=Tiền Giang&pageSize=5',
        '/api/v1/gov/demands'
      ]
    },
    {
      role: 'Ninh Thuận Admin',
      email: 'ninhthuan.admin@demo.nacentech.vn',
      endpoints: [
        '/api/v1/gov/assessments/tt17?scopeId=NT',
        '/api/v1/enterprises?province=Ninh Thuận&pageSize=5',
        '/api/v1/gov/demands'
      ]
    },
    {
      role: 'Hà Nội Admin',
      email: 'hanoi.admin@demo.nacentech.vn',
      endpoints: [
        '/api/v1/gov/opportunities',
        '/api/v1/enterprises?pageSize=5',
        '/api/v1/gov/demands'
      ]
    },
    {
      role: 'Buyer User',
      email: 'buyer.user@demo.nacentech.vn',
      endpoints: [
        '/api/v1/buyer/demands',
        '/api/v1/brokerage/opportunities',
        '/api/v1/brokerage/radar',
        '/api/v1/portal/enterprise/profile'
      ]
    },
    {
      role: 'Seller User',
      email: 'seller.user@demo.nacentech.vn',
      endpoints: [
        '/api/v1/portal/seller/technologies',
        '/api/v1/brokerage/requests',
        '/api/v1/brokerage/opportunities',
        '/api/v1/portal/enterprise/profile'
      ]
    },
    {
      role: 'Expert User',
      email: 'expert.user@demo.nacentech.vn',
      endpoints: [
        '/api/v1/experts/me/detail',
        '/api/v1/brokerage/opportunities'
      ]
    },
    {
      role: 'Innovation Entity',
      email: 'innovation.entity@demo.nacentech.vn',
      endpoints: [
        '/api/v1/buyer/demands',
        '/api/v1/brokerage/opportunities',
        '/api/v1/brokerage/radar'
      ]
    }
  ];

  let allOk = true;

  for (const item of testMatrix) {
    console.log(`\n=== Testing: ${item.role} (${item.email}) ===`);
    const auth = await login(item.email);
    for (const ep of item.endpoints) {
      const resp = await get(ep, auth.accessToken);
      const isArr = Array.isArray(resp.data);
      const isItemsArr = resp.data && Array.isArray(resp.data.items);
      const count = isArr ? `${resp.data.length} items` : (isItemsArr ? `${resp.data.items.length} items (total ${resp.data.totalCount || resp.data.total || 'N/A'})` : (resp.data ? 'Object' : 'Empty'));
      console.log(`  ${ep} -> HTTP ${resp.status} (${count})`);
      if (resp.status >= 400) {
        allOk = false;
        console.log('    ERROR DETAIL:', JSON.stringify(resp.data));
      }
    }
  }

  console.log('\n========================================');
  console.log('FINAL RESULT: ' + (allOk ? 'ALL ENDPOINTS PASSED (200 OK)!' : 'SOME FAILED!'));
  console.log('========================================');
}

run();
