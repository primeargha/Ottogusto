import Link from "next/link";
import { createApiClient } from "@/config/newApiClient";
import { isAxiosError } from "axios";

const TEST_API_PATH = "/parts/axiom-test-not-found-000";

type PageProps = {
  params: { "language-country": string };
};

export default async function TestAxiomServerApiErrorPage({ params }: PageProps) {
  const locale = params["language-country"];
  const api = createApiClient({ isServer: true });

  let httpStatus: number | null = null;
  let detail = "";

  try {
    await api.get(TEST_API_PATH);
    detail = "Unexpected success — endpoint should not exist.";
  } catch (error) {
    if (isAxiosError(error)) {
      httpStatus = error.response?.status ?? null;
      detail =
        httpStatus != null
          ? `Backend returned HTTP ${httpStatus} (logged to Axiom as backend_api_hit).`
          : "Network failure (logged to Axiom as network_error).";
    } else {
      detail = error instanceof Error ? error.message : "Unknown error";
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-8">
      <h1 className="text-2xl font-bold text-color-text-body">Server API error test</h1>
      <p className="text-color-text-body">{detail}</p>
      <p className="text-sm text-color-text-body opacity-80">
        Path: <code className="text-xs">{TEST_API_PATH}</code>
      </p>
      <Link href={`/${locale}/test-axiom`} className="text-sm underline">
        ← Back to Axiom test
      </Link>
    </div>
  );
}
