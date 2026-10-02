import { GoogleTagManager } from "@next/third-parties/google";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function GTM() {
  if (!GTM_ID) {
    // Fail silently in production if GTM ID is missing
    return null;
  }

  return <GoogleTagManager gtmId={GTM_ID} />;
}

// GTM noscript iframe for body
export function GTMNoScript() {
  if (!GTM_ID) {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
