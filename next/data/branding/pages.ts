interface PAGE_LABELS_Interface {
  [key: string]: string;
}

const siteName = process.env.NEXT_SITE_NAME || process.env.NEXT_PUBLIC_STORE || "Ottogusto";

export const PAGE_LABELS: PAGE_LABELS_Interface = {
  site_title: siteName,
  get_support: "Get support related to [category]",
  support_title: "[category] | Support",

  support_email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@ottogusto.com",
  email_inquiry_subject: "Request information – [title][oeRef]",
  email_inquiry_body: `Hello [store] Team,

I would like to request more information about the following part:

• Part name: [title]
• Manufacturer: [manufacturer]
• OE Reference: [oeRef]

Please let me know availability, delivery time, and any additional details.

Thank you,`,
};
