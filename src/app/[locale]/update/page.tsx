import { UpdaterPage } from "@/features/updater/UpdaterPage";
import { PublicShell } from "@/features/shell/PublicShell";
import type { LocaleParams } from "../layout";

export default async function Page({ params }: { params: LocaleParams }) {
  const { locale } = await params;

  return (
    <PublicShell activeSection="update" locale={locale}>
      <UpdaterPage locale={locale} />
    </PublicShell>
  );
}
