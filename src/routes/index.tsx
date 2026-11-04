import { createFileRoute } from "@tanstack/react-router";
import { Overview } from "@/components/admin/pages/Overview";

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
  return <Overview />;
}
