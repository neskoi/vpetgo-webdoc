import { notFound } from "next/navigation";
import { DocsPage } from "@/features/docs/DocsPage";
import { PublicShell } from "@/features/shell/PublicShell";
import { findDocSection, getDocSectionIds } from "@/shared/content/siteContent";
import { supportedLocales, type Locale } from "@/shared/i18n/locales";

type DocsSectionParams = Promise<{
  locale: Locale;
  sectionId: string;
}>;

export function generateStaticParams() {
  return supportedLocales.flatMap((locale) =>
    getDocSectionIds(locale).map((sectionId) => ({
      locale,
      sectionId
    }))
  );
}

export default async function Page({ params }: { params: DocsSectionParams }) {
  const { locale, sectionId } = await params;

  if (!findDocSection(locale, sectionId)) {
    notFound();
  }

  return (
    <PublicShell activeSection="docs" locale={locale}>
      <DocsPage locale={locale} sectionId={sectionId} />
    </PublicShell>
  );
}
