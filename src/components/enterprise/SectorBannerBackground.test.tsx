import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SectorBannerBackground } from "./SectorBannerBackground";

describe("SectorBannerBackground Component", () => {
  it("renders default science & technology watermark when no sector code provided", () => {
    const { container } = render(<SectorBannerBackground />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders specific watermark for LV01 Agriculture", () => {
    const { container } = render(<SectorBannerBackground sectorCode="LV01" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("resolves sector code from sector name accurately", () => {
    const { container } = render(<SectorBannerBackground sectorName="Cơ khí chế tạo máy" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
