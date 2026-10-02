export function isAxiomTestEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AXIOM_TEST_ERRORS === "true";
}
