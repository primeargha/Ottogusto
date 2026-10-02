/**
 * Fallback SEO strings for /allbrands when GET /Translations/:lang omits these keys.
 * Mirror the same keys in Cockpit/CMS so content can be edited without redeploying.
 */
export const SEO_ALL_BRANDS_LOCALE_DEFAULTS: Record<string, Record<string, string>> = {
  fr: {
    "seo.all_brands.title": "Ottogusto | Pièces Auto OEM et Premium par Marque",
    "seo.all_brands.description":
      "Sélectionnez la marque de votre véhicule pour parcourir notre catalogue. Ottogusto propose des pièces auto OEM et premium pour toutes les grandes marques avec une livraison rapide et sécurisée.",
    "seo.all_brands.keywords":
      "pièces auto OEM, pièces premium, par marque, toutes les marques, catalogue, ottogusto",
  },
  nl: {
    "seo.all_brands.title": "Ottogusto | OEM & Premium Auto-onderdelen per Merk",
    "seo.all_brands.description":
      "Selecteer het merk van uw voertuig om onze volledige catalogus te bekijken. Ottogusto biedt OEM en premium auto-onderdelen voor alle grote merken met snelle, veilige verzending.",
    "seo.all_brands.keywords":
      "OEM auto-onderdelen, premium auto-onderdelen, per merk, alle merken, catalogus, ottogusto",
  },
  de: {
    "seo.all_brands.title": "Ottogusto | OEM & Premium Autoteile nach Marke",
    "seo.all_brands.description":
      "Wählen Sie die Marke Ihres Fahrzeugs, um unseren kompletten Katalog zu durchsuchen. Ottogusto bietet OEM- und Premium-Autoteile für alle großen Marken mit schnellem, sicherem Versand.",
    "seo.all_brands.keywords":
      "OEM-Autoteile, Premium-Autoteile, nach Marke, alle Marken, Katalog, ottogusto",
  },
  it: {
    "seo.all_brands.title": "Ottogusto | Ricambi Auto OEM e Premium per Marca",
    "seo.all_brands.description":
      "Seleziona la marca del tuo veicolo per sfogliare il nostro catalogo completo. Ottogusto offre ricambi auto OEM e premium per le principali marche con spedizione rapida e sicura.",
    "seo.all_brands.keywords":
      "ricambi OEM, ricambi premium, per marca, tutte le marche, catalogo, ottogusto",
  },
};
