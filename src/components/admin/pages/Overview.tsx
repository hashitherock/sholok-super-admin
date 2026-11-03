import { Link } from "@tanstack/react-router";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowLeftRight, Boxes, GitPullRequest, LifeBuoy, ShoppingCart, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataNotice, Empty, PageHead } from "@/components/admin/DataNotice";
import { money, series, summarize, useAdminStore } from "@/lib/admin-store";
import { navLink } from "@/lib/nav-registry";

export function Stat({ label, value, sub, icon: Icon }: { label: string; value: string | number; sub?: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="brand-mark grid size-10 shrink-0 place-items-center rounded-lg"><Icon className="size-5" /></div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="truncate text-2xl font-bold" data-testid={`stat-${label}`}>{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartCard({ title, data, kind = "area", format }: { title: string; data: { label: string; value: number }[]; kind?: "area" | "bar"; format?: (n: number) => string }) {
  const empty = data.every((d) => d.value === 0);
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="h-60">
        {empty ? <Empty>No records in this period.</Empty> : (
          <ResponsiveContainer width="100%" height="100%">
            {kind === "area" ? (
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" width={44} tickFormatter={format} />
                <Tooltip formatter={(v: number) => (format ? format(v) : v)} />
                <Area dataKey="value" name={title} stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.15} />
              </AreaChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" width={44} tickFormatter={format} />
                <Tooltip formatter={(v: number) => (format ? format(v) : v)} />
                <Bar dataKey="value" name={title} fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function Overview() {
  const { data } = useAdminStore();
  const s = summarize(data);
  const pending = data.approvals.filter((a) => a.status === "pending");
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHead title="Overview" description="Summary calculated from the sample records saved in this browser." />
      <DataNotice />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Users" value={s.totalUsers} sub={`${s.activeUsers} active`} icon={Users} />
        <Stat label="Active services" value={`${s.servicesActive} / ${s.servicesTotal}`} sub={`${s.servicesAttention.length} need attention`} icon={Boxes} />
        <Stat label="Orders" value={s.orders} sub={`${money(s.sales)} completed sales`} icon={ShoppingCart} />
        <Stat label="Pay volume" value={money(s.txVolume)} sub="Succeeded sample transactions" icon={ArrowLeftRight} />
        <Stat label="Open tickets" value={s.openTickets} icon={LifeBuoy} />
        <Stat label="Pending approvals" value={s.pendingApprovals} sub={`${s.refundsPending} refunded orders`} icon={GitPullRequest} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="New users per week" data={series(data.users, 12, 7)} />
        <ChartCard title="Orders per week" kind="bar" data={series(data.orders, 12, 7)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="size-4 text-secondary" /> Configuration warnings</CardTitle></CardHeader>
          <CardContent>
            {s.servicesAttention.length === 0 ? <Empty>All 20 services are active and healthy.</Empty> : (
              <ul className="divide-y">
                {s.servicesAttention.map((x) => (
                  <li key={x.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <Link {...navLink(`/services/${x.id}`)} className="font-medium hover:underline">{x.name}</Link>
                    <span className="flex gap-1"><Badge variant="outline">{x.status}</Badge><Badge variant="outline">{x.health}</Badge></span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pending approvals</CardTitle></CardHeader>
          <CardContent>
            {pending.length === 0 ? <Empty>Nothing waiting for approval.</Empty> : (
              <ul className="divide-y">
                {pending.map((a) => (
                  <li key={a.id} className="flex justify-between gap-2 py-2 text-sm"><span>{a.title}</span><span className="text-muted-foreground">{a.createdAt.slice(0, 10)}</span></li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
