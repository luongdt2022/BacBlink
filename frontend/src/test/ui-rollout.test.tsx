import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Register from "@/app/(auth)/register/page";
import Upgrade from "@/app/profile/upgrade/expert/page";
import Admin from "@/app/admin/page";
import Gov from "@/app/gov/page";
import AdminLayout from "@/app/admin/layout";
import GovLayout from "@/app/gov/layout";
import PortalLayout from "@/app/portal/layout";
import Portal from "@/app/portal/page";
import { ExpertPublicDetailPage, ExpertOwnerDetailPage } from "@/components/expert-detail/profile-detail";
import { authClient } from "@/lib/auth-client";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), usePathname: () => "/portal", useSearchParams: () => new URLSearchParams() }));

const profile = {
  expertCode: "CG-UI-QA", fullName: "Chuyên gia kiểm thử giao diện", academicRank: "PGS", degree: "DOCTOR", birthYear: 1980, gender: "male",
  organizationName: "Đơn vị kiểm thử", positionTitle: "Nghiên cứu viên", publicBio: "Dữ liệu mô phỏng chỉ dùng để kiểm tra bố cục, không phải hồ sơ thật.",
  expertiseSectors: ["Công nghệ thông tin"], masteredTechCodes: ["CN06"], isVerified: true, isAcceptingConsultation: true,
  training: [{ title: "Tiến sĩ", subtitle: "Đào tạo khoa học và công nghệ", period: "2005–2010" }], employment: [],
  patents: [{title:"Công trình thử nghiệm bố cục",meta:"2026",description:"Thông tin kiểm thử hiển thị tiếng Việt."}], researchProjects: [], publications: [], practicalProjects: [], awards: [],
};
const owner = { phone: null, email: null, organizationAddress: null, pdpdConsent: true, legalOath: true, status: "CHANGES_REQUESTED", activeDocumentTypes: [], publicProfile: profile };

// Optional offline visual fixtures of the real React components. No production route,
// auth bypass, real account, or database write is introduced.
function artifact(name: string, container: HTMLElement) {
  if (!process.env.UI_QA_OUTPUT) return;
  const dir = resolve(process.env.UI_QA_OUTPUT);
  mkdirSync(dir, {recursive:true});
  const fonts = [400,500,600,700,800].map(weight=>`@font-face{font-family:QaBeVietnam;src:url(http://localhost:3002/fonts/be-vietnam-pro/${weight}.ttf);font-weight:${weight};font-display:swap}`).join("");
  writeFileSync(resolve(dir,`${name}.html`), `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>UI QA — ${name}</title><link rel="stylesheet" href="http://localhost:3002/_next/static/css/app/layout.css"><style>${fonts}:root{--font-be-vietnam-pro:QaBeVietnam}body{margin:0}.qa-tools{padding:1rem;display:flex;gap:1rem;flex-wrap:wrap;background:white;color:#0f172a}</style></head><body><div class="qa-tools"><strong>Dữ liệu kiểm thử giao diện — không phải hệ thống thật</strong><button onclick="document.documentElement.classList.toggle('dark')">Light/Dark</button><button onclick="document.documentElement.dataset.textScale=document.documentElement.dataset.textScale==='lg'?'':'lg'">A/A+</button></div>${container.innerHTML}</body></html>`);
}

beforeEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe("Existing screen rollout regression", () => {
  it("retains registration fields and consent without submitting", () => {
    const {container}=render(<Register/>);
    expect(Array.from(container.querySelectorAll('input')).map(el=>el.name)).toEqual(["lastName","firstName","email","password","confirmPassword","phone","acceptPdpd"]);
    expect(screen.getByRole('button',{name:"Đăng ký thành viên"})).toHaveClass('bg-nacen-green-500');
  });
  it("retains all three expert steps and input controls", () => {
    const {container}=render(<Upgrade/>);
    expect(screen.getByText("Quét CV & Định danh")).toBeInTheDocument();
    artifact("upgrade-step-1",container);
    fireEvent.change(screen.getByPlaceholderText("TS. Nguyễn Văn An"), { target: { value: "TS. Nguyễn Minh An" } });
    fireEvent.click(screen.getByText("Năng lực Chuyên môn"));
    expect(screen.getByText("Từ khóa chuyên sâu (Tags)")).toBeInTheDocument();
    artifact("upgrade-step-2",container);
    fireEvent.click(screen.getByText("Công bố & Cam kết"));
    expect(container.querySelector('#pdpdConsent')).toBeInTheDocument();
    expect(container.querySelector('#legalOath')).toBeInTheDocument();
    artifact("upgrade-step-3",container);
  });
  it.each(["SUPER_ADMIN","ADMIN","SELLER"])("keeps role %s and its workspace",role=>{
    authClient.setSession("ui-qa-only",{id:"qa",email:"qa@example.invalid",fullName:"Kiểm thử UI",role});
    const {container}=render(role==='SUPER_ADMIN'||role==='ADMIN'?<AdminLayout><Admin/></AdminLayout>:<PortalLayout><Portal/></PortalLayout>);
    expect(screen.queryByText("Yêu cầu Đăng nhập")).not.toBeInTheDocument();
    artifact(role.toLowerCase(),container);
  });
  it("keeps the access-denied screen for an unauthorized user",()=>{
    authClient.setSession("ui-qa-only",{id:"qa",email:"qa@example.invalid",fullName:"Kiểm thử UI",role:"USER"});
    const {container}=render(<AdminLayout><Admin/></AdminLayout>);
    expect(screen.getByText("Truy cập bị từ chối (403 Forbidden)")).toBeInTheDocument();
    artifact("forbidden",container);
  });
  it("renders public, owner and expert dashboard fixtures with isolated API mocks",async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({data:profile})}));
    const pub=render(<ExpertPublicDetailPage expertCode="CG-UI-QA"/>);
    await screen.findByText(profile.fullName);artifact("expert-public",pub.container);
    fireEvent.click(screen.getByText("Điền yêu cầu kết nối"));artifact("expert-consultation",pub.container);
    cleanup();
    authClient.setSession("ui-qa-only",{id:"qa",email:"qa@example.invalid",fullName:profile.fullName,role:"VERIFIED_EXPERT"});
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({data:owner})}));
    const own=render(<PortalLayout><ExpertOwnerDetailPage/></PortalLayout>);
    await screen.findByText("Khu vực dữ liệu riêng tư");artifact("expert-owner",own.container);
    cleanup();
    const dash=render(<PortalLayout><Portal/></PortalLayout>);
    await screen.findByText("Dashboard chuyên gia");artifact("expert-dashboard",dash.container);
  });
});
