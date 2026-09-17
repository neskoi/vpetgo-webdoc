import { redirect } from "next/navigation";
import { defaultLocale } from "@/shared/i18n/locales";

export default function HomePage() {
  redirect(`/${defaultLocale}/docs`);
}
