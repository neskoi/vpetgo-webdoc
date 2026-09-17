import { redirect } from "next/navigation";
import { getDefaultDocSectionId } from "@/shared/content/siteContent";
import type { LocaleParams } from "../layout";

export default async function Page({ params }: { params: LocaleParams }) {
  const { locale } = await params;

  redirect(`/${locale}/docs/${getDefaultDocSectionId(locale)}`);
}
