import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { AdminNotFound, AdminRouteError } from "@/components/admin/RouteBoundaries";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: AdminRouteError,
    defaultNotFoundComponent: AdminNotFound,
  });

  return router;
};
