import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppButton, AppLink } from "./design-system";
import { Async } from "./async";
import { cn } from "@/lib/utils";

afterEach(cleanup);

describe("UI tokens and common controls", () => {
  it("merges semantic font sizes without deleting foreground colors", () => {
    for (const token of ["caption", "label", "body", "body-lg", "card-title"]) {
      expect(cn("text-white", `text-${token}`)).toContain("text-white");
      expect(cn(`text-${token}`, "text-white")).toContain(`text-${token}`);
    }
    expect(cn("text-label", "text-body")).toBe("text-body");
  });
  it.each([
    ["primary", "bg-brand-700", "hover:bg-brand-800"],
    ["cta", "bg-nacen-green-500", "hover:bg-nacen-green-600"],
    ["danger", "bg-status-danger", "hover:bg-rose-700"],
  ] as const)("keeps the %s variant and 44px target", (variant, background, hover) => {
    render(<AppButton variant={variant} className="text-label">Hành động</AppButton>);
    expect(screen.getByRole("button")).toHaveClass(background, hover, "text-white", "min-h-11", "focus-ring", "text-label");
  });
  it("preserves disabled behavior and link destination", () => {
    const click = vi.fn();
    render(<><AppButton disabled onClick={click}>Lưu</AppButton><AppLink href="/portal" variant="outline">Workspace</AppLink></>);
    fireEvent.click(screen.getByRole("button"));
    expect(click).not.toHaveBeenCalled();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/portal");
    expect(screen.getByRole("link")).toHaveClass("focus-ring", "min-h-11");
  });
  it.each(["loading", "empty", "error", "success", "partial"] as const)("renders %s without losing content or recovery", state => {
    const retry = vi.fn();
    render(<Async state={state} onRetry={retry} emptyContent={<p>Danh sách rỗng</p>}><p>Dữ liệu hồ sơ</p></Async>);
    if (state === "loading") expect(screen.getByText("Đang tải dữ liệu...")).toBeInTheDocument();
    if (state === "empty") expect(screen.getByText("Danh sách rỗng")).toBeInTheDocument();
    if (state === "error") { fireEvent.click(screen.getByRole("button", { name: "Thử lại" })); expect(retry).toHaveBeenCalledOnce(); }
    if (state === "success" || state === "partial") expect(screen.getByText("Dữ liệu hồ sơ")).toBeInTheDocument();
  });
});
