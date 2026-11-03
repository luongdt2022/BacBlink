import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BlockchainZkpBadge } from "./BlockchainZkpBadge";
import * as blockchainApi from "@/lib/api/blockchain";

describe("BlockchainZkpBadge Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders verified badge when entity is anchored in local ledger", async () => {
    vi.spyOn(blockchainApi, "fetchEntityAnchorStatus").mockResolvedValue({
      verdict: "VERIFIED",
      isSuccess: true,
      summary: "Dữ liệu hợp lệ 100% trên Sổ cái nội bộ.",
      blockNumber: 1,
      blockHash: "0x1234567890abcdef",
      merkleRoot: "0xabcdef1234567890",
      commitmentHash: "0xdeadbeef",
      steps: [
        { stepName: "Canonical JSON RFC 8785", passed: true, details: "OK" },
        { stepName: "ZKP Salted Commitment", passed: true, details: "OK" },
        { stepName: "Merkle Tree Audit Path", passed: true, details: "OK" },
        { stepName: "ECDSA Digital Signature", passed: true, details: "OK" },
      ],
    });

    render(
      <BlockchainZkpBadge
        entityType="SELLER_OFFER"
        entityId="00000000-0000-0000-0000-000000000001"
        entityCode="TECH-2026-001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Bảo Chứng Mật Mã ZKP & Chuỗi Khối")).toBeInTheDocument();
      expect(screen.getByText("Block #1")).toBeInTheDocument();
    });
  });

  it("opens modal and displays verification steps when clicked", async () => {
    vi.spyOn(blockchainApi, "fetchEntityAnchorStatus").mockResolvedValue({
      verdict: "VERIFIED",
      isSuccess: true,
      summary: "Dữ liệu hợp lệ 100%.",
      blockNumber: 1,
      blockHash: "0xblockhash",
      merkleRoot: "0xmerkleroot",
      commitmentHash: "0xzkpcommitment",
      steps: [],
    });

    render(
      <BlockchainZkpBadge
        entityType="SELLER_OFFER"
        entityId="00000000-0000-0000-0000-000000000001"
        entityCode="TECH-2026-001"
      />
    );

    const badgeBtn = await screen.findByRole("button", { name: /Bảo Chứng Mật Mã/i });
    fireEvent.click(badgeBtn);

    expect(
      screen.getByText("Biên Bản Bảo Chứng Mật Mã Học ZKP & Chuỗi Khối")
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Block #1/i).length).toBeGreaterThan(0);
  });

  it("returns null if entity is NOT_ANCHORED", async () => {
    vi.spyOn(blockchainApi, "fetchEntityAnchorStatus").mockResolvedValue({
      verdict: "NOT_ANCHORED",
      isSuccess: false,
      summary: "Chưa neo.",
      steps: [],
    });

    const { container } = render(
      <BlockchainZkpBadge
        entityType="SELLER_OFFER"
        entityId="00000000-0000-0000-0000-000000000002"
      />
    );

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});
