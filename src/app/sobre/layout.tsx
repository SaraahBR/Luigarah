import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sobre");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: t("metaKeywords"),
  };
}

export default function SobreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
