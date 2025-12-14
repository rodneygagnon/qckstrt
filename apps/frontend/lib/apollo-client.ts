import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3000/graphql",
});

const authLink = setContext((_, { headers }) => {
  // Get user from localStorage if available
  const userJson =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;

  return {
    headers: {
      ...headers,
      user: userJson || undefined,
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export interface DemoUser {
  id: string;
  email: string;
  roles: string[];
  department: string;
  clearance: string;
}

export const setDemoUser = (user: DemoUser) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getDemoUser = (): DemoUser | null => {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem("user");
  return userJson ? JSON.parse(userJson) : null;
};

export const clearDemoUser = () => {
  localStorage.removeItem("user");
};
