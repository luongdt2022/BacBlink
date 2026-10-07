import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SettingsPage from "./page";
import { authClient } from "@/lib/auth-client";

const push = vi.fn();
const replace = vi.fn();
const router = { push, replace };

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("next/link", () => ({ default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props}>{children}</a> }));
vi.mock("@/components/common/toast", () => ({ useToast: () => ({ info: vi.fn() }) }));

describe("SettingsPage logout", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockReset();
    replace.mockReset();
    authClient.setSession("token", { id: "person-1", email: "member@nacentech.local", fullName: "Nguyễn Minh An", role: "PUBLIC_USER" });
  });

  afterEach(cleanup);

  it("keeps the session on cancel and clears it after confirmation", async () => {
    render(<SettingsPage />);
    expect(await screen.findByText("Phiên làm việc")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Đăng xuất" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Ở lại" }));
    expect(authClient.getToken()).toBe("token");

    fireEvent.click(screen.getByRole("button", { name: "Đăng xuất" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Đăng xuất" }));
    expect(authClient.getToken()).toBeNull();
    expect(push).toHaveBeenCalledWith("/");
  });

  it("renders all 3 upgrade navigation cards for PUBLIC_USER (TC-C2-SET-02)", async () => {
    render(<SettingsPage />);

    expect(await screen.findByText("Nâng hạng tài khoản")).toBeInTheDocument();

    // Card 1: Chuyên gia KH&CN -> links to /profile/upgrade/expert
    const expertCard = screen.getByRole("link", { name: /Chuyên gia KH&CN/i });
    expect(expertCard).toBeInTheDocument();
    expect(expertCard).toHaveAttribute("href", "/profile/upgrade/expert");

    // Card 2: Doanh nghiệp
    expect(screen.getByText("Doanh nghiệp")).toBeInTheDocument();

    // Card 3: Doanh nghiệp ĐMST
    expect(screen.getByText("Doanh nghiệp ĐMST")).toBeInTheDocument();
  });
});

