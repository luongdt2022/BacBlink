import Link from "next/link";
import { AppLink } from "@/components/ui/design-system";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  GraduationCap,
  Handshake,
} from "lucide-react";

const modules = {
  "doanh-nghiep-dmst": {
    title: "Danh bạ Doanh nghiệp Hội viên",
    description: "Không gian hồ sơ doanh nghiệp hội viên BACLINK, phân tích năng lực sản xuất và kết nối chuỗi cung ứng công nghiệp Bắc Ninh.",
    icon: Building2,
  },
  "chuyen-gia": {
    title: "Ban Cố vấn Kỹ thuật BACLINK",
    description: "Tra cứu hồ sơ cố vấn kỹ thuật công nghiệp và kết nối tư vấn nhà máy.",
    icon: Handshake,
  },
} as const;

type ModuleSlug = keyof typeof modules;

export function generateStaticParams() {
  return Object.keys(modules).map((module) => ({ module }));
}

export default async function PublicModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (module === "chuyen-gia") {
    redirect("/experts");
  }
  if (module === "doanh-nghiep-dmst") {
    redirect("/enterprises");
  }
  if (module === "elearning") {
    redirect("/elearning");
  }

  const item = modules[module as ModuleSlug];
  if (!item) notFound();

  const Icon = item.icon;
  return (
    <main className="page-container flex min-h-[60vh] items-center py-12">
      <section className="surface-card w-full p-8 sm:p-12">
        <div className="mb-6 inline-flex rounded-xl bg-brand-50 p-3 text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">
          <Icon className="h-7 w-7" />
        </div>
        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-200">Phân hệ chính</p>
        <h1 className="mt-2 font-bold tracking-tight text-slate-900 dark:text-white type-page-title">{item.title}</h1>
        <p className="mt-4 max-w-2xl text-body leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <AppLink href="/" variant="outline">
            <ArrowLeft className="h-4 w-4" /> Trang chủ
          </AppLink>
          <AppLink href="/portal">
            Vào workspace tác nghiệp <ArrowRight className="h-4 w-4" />
          </AppLink>
        </div>
      </section>
    </main>
  );
}
