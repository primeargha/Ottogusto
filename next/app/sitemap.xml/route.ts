import { getStoreFromDomain } from "@/config/client-theme-config";
import { STORE_IDS, DEFAULT_STORE } from "@/config/store-constants";
import { type NextRequest } from "next/server";

const escapeXml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

export async function GET(req: NextRequest) {
  //@ts-ignore
  const { protocol, host } = req.headers
    .get("host")
    ?.split(":")
    ?.reduce(
      (acc, part) => {
        if (/^https?$/.test(part)) {
          acc.protocol = part;
        } else if (/^\d+$/.test(part)) {
          acc.port = part;
        } else {
          acc.host = part;
        }
        return acc;
      },
      { protocol: "", host: "", port: "" } as { protocol: string; host: string; port: string },
    );
  const STORE_NAME = getStoreFromDomain(
    `${host.toLowerCase().includes(STORE_IDS.QVERDE) ? STORE_IDS.QVERDE : DEFAULT_STORE}`,
  );

  // const baseUrl =
  //   process.env.FRONTEND_PROD_URL ||
  //   process.env.NEXT_PUBLIC_FRONTEND_PROD_URL ||
  //   req?.nextUrl?.origin ||
  //   "";
  // const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE_URL_SITEMAP;
  // const base = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
  const cdn = `https://static.${STORE_NAME}.com`; //cdnBase ? cdnBase.replace(/\/+$/, "") : "";
  const staticSitemapUrl = `${process.env.NEXT_PUBLIC_FRONTEND_PROD_URL}/sitemap-pages.xml`;
  const cdnSitemapUrls = cdn
    ? [
        `${cdn}/${STORE_NAME}/sitemap-nl-BE.xml`,
        `${cdn}/${STORE_NAME}/sitemap-fr-BE.xml`,
        `${cdn}/${STORE_NAME}/sitemap-en-BE.xml`,
        `${cdn}/${STORE_NAME}/sitemap-de-BE.xml`,

        `${cdn}/${STORE_NAME}/sitemap-nl-NL.xml`,
        // `${cdn}/${STORE_NAME}/sitemap-fr-NL.xml`,
        `${cdn}/${STORE_NAME}/sitemap-en-NL.xml`,
        `${cdn}/${STORE_NAME}/sitemap-fr-FR.xml`,
        // `${cdn}/sitemaps/product-index.xml`, // Frank will provide this
        // `${cdn}/sitemaps/product-index.xml`, // Frank will provide this
      ]
    : [];

  const lastmod = new Date().toISOString();

  const xmlParts: string[] = [];
  xmlParts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  xmlParts.push(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`);
  xmlParts.push(
    `<sitemap><loc>${escapeXml(staticSitemapUrl)}</loc><lastmod>${lastmod}</lastmod></sitemap>`,
  );
  for (const url of cdnSitemapUrls) {
    xmlParts.push(`<sitemap><loc>${escapeXml(url)}</loc><lastmod>${lastmod}</lastmod></sitemap>`);
  }
  xmlParts.push(`</sitemapindex>`);

  return new Response(xmlParts.join("\n"), {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
    status: 200,
  });
}
