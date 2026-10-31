import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { navLink, type NavGroup, type NavItem } from "@/lib/nav-registry";

export function ModulePage({ group, item }: { group: NavGroup; item: NavItem }) {
  const siblings = group.items.filter((i) => i.path !== item.path).slice(0, 6);
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="brand-mark grid size-12 shrink-0 place-items-center rounded-xl">
          <item.icon className="size-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.title} · #{item.num}
          </p>
          <h1 className="break-words font-display text-2xl font-bold sm:text-3xl">{item.title}</h1>
          <p className="mt-1 text-muted-foreground">{item.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {item.serviceId && <Badge variant="outline">Service ID: {item.serviceId}</Badge>}
            {item.category && <Badge variant="outline">{item.category}</Badge>}
            <Badge className="bg-accent text-accent-foreground hover:bg-accent">
              <Clock className="mr-1 size-3" aria-hidden /> Full workflow in Phase {item.phase}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Planned capabilities</CardTitle></CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2">
              {item.capabilities.map((c) => (
                <li key={c} className="flex gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Page structure is in place. Records and actions for this module are not built yet.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Related in {group.title}</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {siblings.map((s) => (
                <li key={s.path}>
                   <Link {...navLink(s.path)} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
                    <s.icon className="size-4 text-muted-foreground" aria-hidden /> {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
