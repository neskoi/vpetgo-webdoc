import { PublicShell } from "@/features/shell/PublicShell";
import { DocsPage } from "@/features/docs/DocsPage";
import type { LocaleParams } from "../layout";

export default async function Page({ params }: { params: LocaleParams }) {
  const { locale } = await params;

  return (
    <PublicShell activeSection="docs" locale={locale}>
      <DocsPage locale={locale} />
    </PublicShell>
  );
}
