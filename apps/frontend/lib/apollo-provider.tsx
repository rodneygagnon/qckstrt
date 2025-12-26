"use client";

import { ApolloProvider as BaseApolloProvider } from "@apollo/client/react";
import { apolloClient } from "./apollo-client";
import { AuthProvider } from "./auth-context";
import { I18nProvider } from "./i18n/context";
import "@/lib/i18n";

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseApolloProvider client={apolloClient}>
      <AuthProvider>
        <I18nProvider>{children}</I18nProvider>
      </AuthProvider>
    </BaseApolloProvider>
  );
}
