import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("carreiras");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: t("metaKeywords"),
  };
}

export default function CarreirasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
