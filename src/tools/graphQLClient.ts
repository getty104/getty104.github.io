import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";

const httpLink = new HttpLink({
  uri:
    process.env.PUBLIC_URL === "production"
      ? "https://expensive-shocked-elver.gigalixirapp.com/api/graph"
      : "http://localhost:4000/api/graph"
});

const cache = new InMemoryCache();

export const graphQLClient = new ApolloClient({
  link: httpLink,
  cache
});