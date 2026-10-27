import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminRolesPage from "./page";
vi.mock("@/components/admin/admin-nav", () => ({ AdminNav: () => <nav>AdminNav</nav> }));
vi.mock("@/lib/auth-client", () => ({ authClient: { getAuthHeaders: () => ({}) } }));
const officers=[{ id:"1", name:"Cán bộ ngành hiện hành", email:"officer@example.test", role:"SECTOR_ADMIN", scopeType:"SECTOR", scopeId:"LV91", assignedAt:null }];
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => { fetchMock=vi.fn(async (url:string, opts?:RequestInit) => ({ ok:true,json:async () => ({success:true, data:url.endsWith("/sectors") ? [{code:"LV91",name:"Ngành runtime đổi tên"}] : opts?.method==="POST" ? {} : officers,message:opts?.method==="POST" ? "Đã lưu phân quyền." : undefined}) }));vi.stubGlobal("fetch",fetchMock); });
afterEach(() => {cleanup();vi.unstubAllGlobals();});
// QC-owned mocked regression for real API integration. Not black-box certification.
describe("AdminRoles real-provider contracts",()=>{
 it("preserves fixed business-role matrix (sector taxonomy is dynamic)",()=>{render(<AdminRolesPage/>); expect(screen.getByText("Ma Trận 10 Vai Trò & Thẩm Quyền Cốt Lõi")).toBeInTheDocument();for(const role of ["SUPER_ADMIN","OPERATOR_ADMIN","PROVINCIAL_ADMIN","SECTOR_ADMIN","CLUSTER_ADMIN","PUBLIC_USER"])expect(screen.getByText(role)).toBeInTheDocument();});
 it("reads officer list and resolves sector label from current taxonomy",async()=>{render(<AdminRolesPage/>);fireEvent.click(screen.getByRole("button",{name:/Danh Sách Cán Bộ & Phân Quyền/}));expect(await screen.findByText("Cán bộ ngành hiện hành")).toBeInTheDocument();expect(screen.getByText("Ngành runtime đổi tên")).toBeInTheDocument();fireEvent.change(screen.getByPlaceholderText(/Tìm theo email/),{target:{value:"no-match"}});expect(screen.queryByText("Cán bộ ngành hiện hành")).not.toBeInTheDocument();});
 it("sector assignment options use runtime code/name and require explicit active selection",async()=>{render(<AdminRolesPage/>);fireEvent.click(screen.getByRole("button",{name:/Gán Vai Trò Cán Bộ/}));const selects=screen.getAllByRole("combobox");fireEvent.change(selects[0],{target:{value:"SECTOR_ADMIN"}});expect(await screen.findByRole("option",{name:"LV91 — Ngành runtime đổi tên"})).toBeInTheDocument();expect(screen.getByRole("option",{name:"Chọn ngành đang hoạt động"})).toBeInTheDocument();});
 it("assigns via POST and reloads only after provider confirms",async()=>{render(<AdminRolesPage/>);fireEvent.click(screen.getByRole("button",{name:/Gán Vai Trò Cán Bộ/}));fireEvent.change(screen.getByPlaceholderText("VD: so.danang@nacentech.local"),{target:{value:"officer@example.test"}});fireEvent.change(screen.getByPlaceholderText("Nhập mã scope"),{target:{value:"P91"}});fireEvent.click(screen.getByRole("button",{name:/Xác Nhận Bổ Nhiệm/}));expect(await screen.findByText("Đã lưu phân quyền.")).toBeInTheDocument();const call=fetchMock.mock.calls.find(([,opts])=>(opts as RequestInit)?.method==="POST");expect(call).toBeDefined();expect(JSON.parse((call![1] as RequestInit).body as string)).toMatchObject({email:"officer@example.test",role:"PROVINCIAL_ADMIN",scopeType:"PROVINCE",scopeId:"P91"});});
 it("empty email is required by HTML form rather than a fake local alert",()=>{render(<AdminRolesPage/>);fireEvent.click(screen.getByRole("button",{name:/Gán Vai Trò Cán Bộ/}));const input=screen.getByPlaceholderText("VD: so.danang@nacentech.local") as HTMLInputElement;expect(input).toBeRequired();expect(input.checkValidity()).toBe(false);});
 it("provider failure keeps assignment modal open and reports error",async()=>{render(<AdminRolesPage/>);fireEvent.click(screen.getByRole("button",{name:/Gán Vai Trò Cán Bộ/}));fireEvent.change(screen.getByPlaceholderText("VD: so.danang@nacentech.local"),{target:{value:"officer@example.test"}});fireEvent.change(screen.getByPlaceholderText("Nhập mã scope"),{target:{value:"P91"}});fetchMock.mockRejectedValueOnce(new Error("provider unavailable"));fireEvent.click(screen.getByRole("button",{name:/Xác Nhận Bổ Nhiệm/}));await waitFor(()=>expect(screen.getByRole("alert")).toHaveTextContent("provider unavailable"));expect(screen.getByText("Bổ Nhiệm & Gán Vai Trò Cán Bộ")).toBeInTheDocument();});
 it("renders assigned officer count and allows pagination toggle for roles matrix (T077)",async()=>{
  render(<AdminRolesPage/>);
  expect(screen.getByText("Ma Trận 10 Vai Trò & Thẩm Quyền Cốt Lõi")).toBeInTheDocument();
  expect(await screen.findByText(/1 cán bộ/i)).toBeInTheDocument();
  const btn5 = screen.getByRole("button", { name: /^5$/ });
  expect(btn5).toBeInTheDocument();
  fireEvent.click(btn5);
  expect(screen.getByText(/Trang 1 \/ 2/i)).toBeInTheDocument();
  const nextBtn = screen.getByRole("button", { name: /Trang sau/i });
  fireEvent.click(nextBtn);
  expect(screen.getByText(/Trang 2 \/ 2/i)).toBeInTheDocument();
 });
});
