/** Client-safe check — NEXT_PUBLIC_ mirror of AUTH_BYPASS for UI banner. */
export function isAuthBypassEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";
}
