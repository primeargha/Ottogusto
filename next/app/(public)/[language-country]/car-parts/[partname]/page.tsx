import Typography from "@/components/og-components/Typography";
import { Box } from "@/components/ui/box";
import React from "react";
import { notFound } from "next/navigation";
import { buildAlternateLanguages } from "@/utils/hreflang";

type Props = {
  params: { "language-country": string; category: string };
};

// Static paths
export async function generateStaticParams() {
  const languages = ["en", "fr", "nl", "de"];
  const categories = ["engine", "brakes", "suspension"]; // Add your actual categories here

  return languages.flatMap((lang) =>
    categories.map((category) => ({
      "language-country": lang,
      category,
    })),
  );
}

// 🧠 Dynamic metadata for each language-country
export async function generateMetadata({ params }: Props) {
  const lang = params["language-country"];
  return {
    title: `Part Page (${lang.toUpperCase()})`,
    description: `This is the part page for ${lang.toUpperCase()}.`,
    alternates: {
      languages: buildAlternateLanguages(`/${lang}/car-parts`),
    },
    openGraph: {
      title: `Part Page (${lang.toUpperCase()})`,
      description: `OG: This is the part page for ${lang.toUpperCase()}.`,
      url: `https://yourdomain.com/${lang}/part`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

const page = (props: Props) => {
  notFound();
};

export default page;
