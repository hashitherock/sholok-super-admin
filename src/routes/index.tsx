import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { navGroups } from "@/lib/nav-registry";
import { AdminNotFound } from "@/components/admin/RouteBoundaries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Sholok Super Admin" },
      { name: "description", content: "Central administration overview for the Sholok digital services ecosystem." },
      { property: "og:title", content: "Overview — Sholok Super Admin" },
      { property: "og:description", content: "Central administration overview for the Sholok digital services ecosystem." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const group = navGroups[0];
  const item = group?.items[0];
  if (!group || !item) return <AdminNotFound />;
  return <ModulePage group={group} item={item} />;
}
