import Link from "next/link";
import { ServerUiErrorClient } from "../_components/ServerUiErrorClient";

type PageProps = {
  params: { "language-country": string };
};

/** Simulates API returning 200 with null items; client .map() triggers ui_error. */
export default function TestAxiomServerUiErrorPage({ params }: PageProps) {
  const locale = params["language-country"];
  const items: string[] | null = null;

  return (
    <div className="mx-auto max-w-lg space-y-4 p-8">
      <h1 className="text-2xl font-bold text-color-text-body">Server UI error test</h1>
      <p className="text-sm text-color-text-body opacity-80">
        Server passed null as list data. Client render should throw and log{" "}
        <code className="text-xs">ui_error</code> to Axiom.
      </p>
      <ServerUiErrorClient items={items} />
      <Link href={`/${locale}/test-axiom`} className="text-sm underline">
        ← Back to Axiom test
      </Link>
    </div>
  );
}
