import { createFileRoute, notFound } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { findNav } from "@/lib/nav-registry";

export const Route = createFileRoute("/$group/$page")({
  loader: ({ params }) => {
    const found = findNav(params.group, params.page);
    if (!found) throw notFound();
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
      ],
    };
  },
  component: Page,
});

function Page() {
  const { group, page } = Route.useLoaderData();
  const f = findNav(group, page)!;
  return <ModulePage group={f.group} item={f.item} />;
}
