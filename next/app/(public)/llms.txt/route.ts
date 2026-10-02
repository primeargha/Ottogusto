import { NextResponse } from "next/server";

const siteName = process.env.NEXT_SITE_NAME || process.env.NEXT_PUBLIC_STORE || "Ottogusto";
const siteUrl =
  process.env.FRONTEND_PROD_URL ||
  process.env.NEXT_PUBLIC_FRONTEND_PROD_URL ||
  'https://dev.ottogusto.com';

export function GET() {
  const llmsTxtContent = `# LLMs.txt for ${siteName}
# This file provides information about this site for Large Language Models

# Site Information
name: ${siteName}
description: Fuelling Passion. Powering Possibilities Original parts for the Innovators
url: ${siteUrl}

# API Endpoints for LLMs
api-endpoint: ${siteUrl}/api
sitemap: ${siteUrl}/sitemap.xml

# Contact Information
contact: ${siteUrl}/contact

# Additional Resources
about: ${siteUrl}/about
products: ${siteUrl}/products

# Crawling Instructions
# LLMs should respect robots.txt and crawl delay
# Rate limiting may be applied to excessive requests
# Please cache responses when possible`;

  return new NextResponse(llmsTxtContent, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
    },
  });
}
