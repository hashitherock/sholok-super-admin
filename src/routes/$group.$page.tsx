import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { findNav } from "@/lib/nav-registry";
import { AdminNotFound, AdminRouteError } from "@/components/admin/RouteBoundaries";

export const Route = createFileRoute("/$group/$page")({
  loader: ({ params }) => {
    const found = findNav(params.group, params.page);
    if (!found) throw notFound();
    if (found.item.path === "/") throw redirect({ to: "/", statusCode: 301 });
    return { group: params.group, page: params.page };
  },
  head: ({ params }) => {
    const f = findNav(params.group, params.page);
    const title = f ? `${f.item.title} — Sholok Super Admin` : "Not found — Sholok Super Admin";
    const description = f?.item.description ?? "Page not found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Page,
  errorComponent: AdminRouteError,
  notFoundComponent: AdminNotFound,
});

function Page() {
  const { group, page } = Route.useLoaderData();
  const f = findNav(group, page);
  if (!f) return <AdminNotFound />;
  return <ModulePage group={f.group} item={f.item} />;
}
