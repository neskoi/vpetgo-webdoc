import { AboutPage } from "@/features/about/AboutPage";
import { PublicShell } from "@/features/shell/PublicShell";
import type { LocaleParams } from "../layout";

export default async function Page({ params }: { params: LocaleParams }) {
  const { locale } = await params;

  return (
    <PublicShell activeSection="about" locale={locale}>
      <AboutPage locale={locale} />
    </PublicShell>
  );
}
