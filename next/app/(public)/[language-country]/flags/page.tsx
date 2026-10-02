import { headers } from "next/headers";

import { getCurrentServerStore } from "@/utils/server-store";
import { getServerFeatureFlag } from "@/utils/server-feature";
import {
  getCountryCodeFromLanguageCountrySegment,
  getLanguageCountryFromPathname,
} from "@/utils/feature-flag-env";

import FlagsPageClient from "./FlagsPageClient";

interface PageProps {
  params: { "language-country": string };
}

function LocaleCountryBlock({ languageCountry }: { languageCountry: string }) {
  const country = getCountryCodeFromLanguageCountrySegment(languageCountry);
  return (
    <div className="rounded-lg bg-color-background-l1 p-4">
      <h2 className="mb-2 text-color-text-body typography-subtitle-01">Locale (URL)</h2>
      <dl className="grid gap-1 font-mono text-sm text-color-text-body">
        <div>
          <dt className="text-color-text-placeholder">language-country</dt>
          <dd>{languageCountry}</dd>
        </div>
        <div>
          <dt className="text-color-text-placeholder">Country code used for flags</dt>
          <dd>{country ?? "—"}</dd>
        </div>
      </dl>
    </div>
  );
}

function NodeEnvBlock() {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  return (
    <div className="rounded-lg bg-color-background-l1 p-4">
      <h2 className="mb-2 text-color-text-body typography-subtitle-01">Node environment</h2>
      <p className="font-mono text-sm text-color-text-body">
        NODE_ENV=<span className="text-color-primary-main">{nodeEnv}</span>
      </p>
      <p className="mt-2 text-xs text-color-text-placeholder">
        Store-specific behavior uses separate deployments / .env files; flags are not branched on
        NODE_ENV in code.
      </p>
    </div>
  );
}

function CurrentStoreBlock() {
  const store = getCurrentServerStore();
  const pub = process.env.NEXT_PUBLIC_STORE ?? "";
  const srv = process.env.STORE ?? "";
  return (
    <div className="rounded-lg bg-color-background-l1 p-4">
      <h2 className="mb-2 text-color-text-body typography-subtitle-01">Store (.env)</h2>
      <dl className="grid gap-1 font-mono text-sm text-color-text-body">
        <div>
          <dt className="text-color-text-placeholder">getCurrentServerStore() (host / env)</dt>
          <dd>{store}</dd>
        </div>
        <div>
          <dt className="text-color-text-placeholder">STORE</dt>
          <dd>{srv || "—"}</dd>
        </div>
        <div>
          <dt className="text-color-text-placeholder">NEXT_PUBLIC_STORE</dt>
          <dd>{pub || "—"}</dd>
        </div>
      </dl>
    </div>
  );
}

function ServerFlagsSection({ languageCountry }: { languageCountry: string }) {
  const h = headers();
  const xApiLocale = h.get("x-api-locale");
  const xPath = h.get("x-current-path");
  const pathLocale = xPath ? getLanguageCountryFromPathname(xPath) : null;
  const vin = getServerFeatureFlag("vin_feature_flag");
  const savedCar = getServerFeatureFlag("saved_car_feature_flag");

  return (
    <section className="rounded-lg border border-color-system-success-light bg-color-background-l2 p-4">
      <h2 className="mb-2 text-color-text-body typography-heading-03">Server component</h2>
      <p className="mb-4 text-sm text-color-text-placeholder">
        Uses <code className="rounded bg-color-background-l3 px-1">getServerFeatureFlag</code> with
        middleware headers (
        <code className="rounded bg-color-background-l3 px-1">x-api-locale</code> /{" "}
        <code className="rounded bg-color-background-l3 px-1">x-current-path</code>).
      </p>
      <dl className="mb-4 grid gap-2 font-mono text-xs text-color-text-body">
        <div>
          <dt className="text-color-text-placeholder">params[&quot;language-country&quot;]</dt>
          <dd>{languageCountry}</dd>
        </div>
        <div>
          <dt className="text-color-text-placeholder">x-api-locale</dt>
          <dd>{xApiLocale ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-color-text-placeholder">x-current-path (first segment)</dt>
          <dd>{pathLocale ?? "—"}</dd>
        </div>
      </dl>
      <dl className="grid gap-2 font-mono text-sm text-color-text-body">
        <div className="flex flex-wrap gap-2">
          <dt className="text-color-text-placeholder">vin_feature_flag</dt>
          <dd className={vin ? "text-color-system-success-dark" : "text-color-system-error-dark"}>
            {String(vin)}
          </dd>
        </div>
        <div className="flex flex-wrap gap-2">
          <dt className="text-color-text-placeholder">saved_car_feature_flag</dt>
          <dd
            className={savedCar ? "text-color-system-success-dark" : "text-color-system-error-dark"}
          >
            {String(savedCar)}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export default function FlagsPage({ params }: PageProps) {
  const languageCountry = params["language-country"];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 pb-16">
      <div>
        <h1 className="text-color-text-body typography-heading-02">Feature flags debug</h1>
        <p className="mt-2 text-sm text-color-text-placeholder">
          Compare server vs client evaluation for the same route. Values come from{" "}
          <code className="rounded bg-color-background-l3 px-1">NEXT_PUBLIC_*</code> JSON in
          environment.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <LocaleCountryBlock languageCountry={languageCountry} />
        <NodeEnvBlock />
        <CurrentStoreBlock />
      </div>

      <ServerFlagsSection languageCountry={languageCountry} />
      <FlagsPageClient />
    </div>
  );
}
