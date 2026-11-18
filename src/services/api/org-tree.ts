/**
 * Retired API stub — CR-BACLINK-007
 * Hệ thống BACLINK Bắc Ninh vận hành tập trung 1 cấp bởi Ban Quản trị Hiệp hội,
 * không sử dụng cây đơn vị hành chính đa cấp.
 */

export interface OrganizationUnitItem {
  id: string;
  code: string;
  name: string;
  unitType: string;
  parentId?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAtUtc: string;
  children?: OrganizationUnitItem[];
}

export const orgTreeApi = {
  async getTree(): Promise<OrganizationUnitItem[]> {
    return [];
  },
};
