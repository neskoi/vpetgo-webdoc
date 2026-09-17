import { DownloadPage } from "@/features/download/DownloadPage";
import { PublicShell } from "@/features/shell/PublicShell";
import type { LocaleParams } from "../layout";

export default async function Page({ params }: { params: LocaleParams }) {
  const { locale } = await params;

  return (
    <PublicShell activeSection="download" locale={locale}>
      <DownloadPage locale={locale} />
    </PublicShell>
  );
}
