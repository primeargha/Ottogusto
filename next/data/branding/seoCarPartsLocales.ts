import { isOttogusto } from "@/config/store-constants";

/**
 * Fallback SEO strings for /car-parts when GET /Translations/:lang omits these keys.
 * Mirror the same keys in Cockpit/CMS so content can be edited without redeploying.
 */
const OTTOGUSTO_LOCALES: Record<string, Record<string, string>> = {
  fr: {
    "seo.car_parts.title": "Pièces Auto en Ligne pour Toutes Marques & Modèles | Ottogusto",
    "seo.car_parts.description":
      "Achetez vos pièces auto en ligne chez Ottogusto | Pièces OE d'origine pour toutes marques et modèles. 1 million de pièces en stock, livraison rapide en UE et retours faciles.",
  },
  nl: {
    "seo.car_parts.title": "Auto-onderdelen Online voor Alle Merken & Modellen | Ottogusto",
    "seo.car_parts.description":
      "Bestel auto-onderdelen online bij Ottogusto | Originele OE-onderdelen voor alle merken en modellen. 1 miljoen onderdelen op voorraad, snelle EU-levering en eenvoudig retourneren.",
  },
  de: {
    "seo.car_parts.title": "Autoteile Online für Alle Marken & Modelle | Ottogusto",
    "seo.car_parts.description":
      "Kaufen Sie Autoteile online bei Ottogusto | Original-OE-Teile für alle Marken und Modelle. 1 Million Teile auf Lager, schnelle EU-Lieferung und einfache Rückgabe.",
  },
};

const QVERDE_LOCALES: Record<string, Record<string, string>> = {
  fr: {
    "seo.car_parts.title": "Pièces Auto pour Alfa Romeo, Fiat, Lancia, Abarth, Jeep | QVerde",
    "seo.car_parts.description":
      "Achetez des pièces auto italiennes en ligne chez QVerde | Pièces OE d'origine pour Alfa Romeo, Fiat, Lancia, Abarth, Jeep. +200 000 pièces en stock, livraison rapide en UE et retours faciles.",
  },
  nl: {
    "seo.car_parts.title": "Auto-onderdelen voor Alfa Romeo, Fiat, Lancia, Abarth, Jeep | QVerde",
    "seo.car_parts.description":
      "Bestel Italiaanse auto-onderdelen online bij QVerde | Originele OE-onderdelen voor Alfa Romeo, Fiat, Lancia, Abarth, Jeep. +200.000 onderdelen op voorraad, snelle EU-levering en eenvoudig retourneren.",
  },
  de: {
    "seo.car_parts.title": "Autoteile für Alfa Romeo, Fiat, Lancia, Abarth, Jeep | QVerde",
    "seo.car_parts.description":
      "Kaufen Sie italienische Autoteile online bei QVerde | Original-OE-Teile für Alfa Romeo, Fiat, Lancia, Abarth, Jeep. Über 200.000 Teile auf Lager, schnelle EU-Lieferung und einfache Rückgabe.",
  },
};

export const SEO_CAR_PARTS_LOCALE_DEFAULTS: Record<string, Record<string, string>> = isOttogusto()
  ? OTTOGUSTO_LOCALES
  : QVERDE_LOCALES;
