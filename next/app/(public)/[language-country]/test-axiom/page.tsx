"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { OGButton } from "@/components/og-components/OGButton";
import { ClientApiErrorTrigger } from "./_components/ClientApiErrorTrigger";
import { ClientUiErrorTrigger } from "./_components/ClientUiErrorTrigger";

export default function TestAxiomPage() {
  const params = useParams();
  const locale = (params?.["language-country"] as string | undefined) ?? "en-BE";
  const base = `/${locale}/test-axiom`;

  return (
    <div className="mx-auto max-w-lg space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-bold text-color-text-body">Axiom test</h1>
        <p className="mt-2 text-sm text-color-text-body opacity-80">
          Dev only — requires <code className="text-xs">NEXT_PUBLIC_AXIOM_TEST_ERRORS=true</code>.
          Check Axiom Stream and monitor emails after each action.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-color-text-body">Client (this page)</h2>
        <ClientUiErrorTrigger />
        <ClientApiErrorTrigger />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-color-text-body">Server routes</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <OGButton href={`${base}/server-api-error`} type="secondary">
            Server API error
          </OGButton>
          <OGButton href={`${base}/server-ui-error`} type="secondary">
            Server UI error
          </OGButton>
        </div>
        <p className="text-sm text-color-text-body opacity-80">
          Server API error: SSR request to a missing part (404, logged as{" "}
          <code className="text-xs">backend_api_hit</code>). Server UI error: SSR passes null list
          to client; <code className="text-xs">.map()</code> throws →{" "}
          <code className="text-xs">ui_error</code>.
        </p>
      </section>

      <p className="text-xs text-color-text-body opacity-60">
        <Link href={`/${locale}/test-server`} className="underline">
          Theme test page
        </Link>
      </p>
    </div>
  );
}
