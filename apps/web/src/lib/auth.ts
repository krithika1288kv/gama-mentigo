import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";

export function isAuthBypassEnabled(): boolean {
  return process.env.AUTH_BYPASS === "true" || process.env.NODE_ENV === "test";
}

export function hasAzureAdConfig(): boolean {
  return Boolean(
    process.env.AZURE_AD_CLIENT_ID &&
      process.env.AZURE_AD_CLIENT_SECRET &&
      process.env.AZURE_AD_TENANT_ID,
  );
}

/**
 * Auth is role-agnostic for MVP (any authenticated UST employee).
 * Role-based gating can be added later without reworking session shape.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    ...(hasAzureAdConfig()
      ? [
          AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.AZURE_AD_TENANT_ID!,
          }),
        ]
      : []),
    ...(isAuthBypassEnabled()
      ? [
          CredentialsProvider({
            id: "dev-bypass",
            name: "Dev bypass",
            credentials: {
              email: { label: "Email", type: "text" },
            },
            async authorize(credentials) {
              return {
                id: "dev-user",
                name: "Dev Learner",
                email: credentials?.email || "dev.learner@ust.com",
              };
            },
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
};
