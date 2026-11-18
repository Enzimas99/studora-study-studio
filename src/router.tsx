import { QueryClient } from "@tanstack/react-query";
import { createHashHistory, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();
  const useHash =
    typeof window !== "undefined" && import.meta.env.VITE_HASH_ROUTER === "true";

  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: useHash ? createHashHistory() : undefined,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
