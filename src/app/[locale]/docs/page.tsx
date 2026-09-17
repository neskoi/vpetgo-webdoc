import { DocsPage } from "@/features/docs/DocsPage";
import { PublicShell } from "@/features/shell/PublicShell";
import type { LocaleParams } from "../layout";

export default async function Page({ params }: { params: LocaleParams }) {
  const { locale } = await params;

  return (
    <PublicShell activeSection="docs" locale={locale}>
      <DocsPage locale={locale} />
    </PublicShell>
  );
}
