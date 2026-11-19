import { ExpertPublicDetailPage } from "@/components/expert-detail/profile-detail";

export default async function ExpertDetailRoute({ params }: { params: Promise<{ expertCode: string }> }) {
  const { expertCode } = await params;
  return <ExpertPublicDetailPage expertCode={expertCode} />;
}
