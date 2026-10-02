"use client";

import { useState } from "react";
import { OGButton } from "@/components/og-components/OGButton";

function CrashOnRender(): never {
  throw new Error("Axiom test: client UI error");
}

export function ClientUiErrorTrigger() {
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    return <CrashOnRender />;
  }

  return (
    <OGButton type="error" onClick={() => setShouldCrash(true)}>
      Client UI error
    </OGButton>
  );
}
