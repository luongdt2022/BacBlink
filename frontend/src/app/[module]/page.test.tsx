import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PublicModulePage, { generateStaticParams } from "./page";

const mockRedirect = vi.fn();
const mockNotFound = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
  notFound: () => {
    mockNotFound();
    throw new Error("NEXT_NOT_FOUND");
  },
}));

describe("PublicModulePage and dynamic routing guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generateStaticParams only generates supported submodules and excludes dedicated pages (dich-vu-khac, gioi-thieu, elearning)", () => {
    const params = generateStaticParams();
    const modules = params.map((p) => p.module);

    expect(modules).toContain("doanh-nghiep-dmst");
    expect(modules).toContain("chuyen-gia");

    // Must NOT contain dedicated routes to prevent circular redirect
    expect(modules).not.toContain("dich-vu-khac");
    expect(modules).not.toContain("gioi-thieu");
    expect(modules).not.toContain("elearning");
    expect(modules).toHaveLength(2);
  });

  it("redirects module 'chuyen-gia' to '/experts'", async () => {
    await expect(
      PublicModulePage({ params: Promise.resolve({ module: "chuyen-gia" }) })
    ).rejects.toThrow("NEXT_REDIRECT:/experts");
    expect(mockRedirect).toHaveBeenCalledWith("/experts");
  });

  it("redirects module 'doanh-nghiep-dmst' to '/enterprises'", async () => {
    await expect(
      PublicModulePage({ params: Promise.resolve({ module: "doanh-nghiep-dmst" }) })
    ).rejects.toThrow("NEXT_REDIRECT:/enterprises");
    expect(mockRedirect).toHaveBeenCalledWith("/enterprises");
  });

  it("redirects module 'elearning' to dedicated route '/elearning'", async () => {
    await expect(
      PublicModulePage({ params: Promise.resolve({ module: "elearning" }) })
    ).rejects.toThrow("NEXT_REDIRECT:/elearning");
    expect(mockRedirect).toHaveBeenCalledWith("/elearning");
  });

  it("calls notFound() for 'dich-vu-khac' inside [module] to prevent circular redirect over dedicated /dich-vu-khac route", async () => {
    await expect(
      PublicModulePage({ params: Promise.resolve({ module: "dich-vu-khac" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("calls notFound() for 'gioi-thieu' inside [module] to prevent circular redirect over dedicated /gioi-thieu route", async () => {
    await expect(
      PublicModulePage({ params: Promise.resolve({ module: "gioi-thieu" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("calls notFound() for arbitrary unknown modules", async () => {
    await expect(
      PublicModulePage({ params: Promise.resolve({ module: "unknown-slug-xyz" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
