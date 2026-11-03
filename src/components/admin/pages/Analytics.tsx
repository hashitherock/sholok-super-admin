import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataNotice, Empty, PageHead } from "@/components/admin/DataNotice";
import { ChartCard, Stat } from "@/components/admin/pages/Overview";
import { countBy, money, series, useAdminStore, withinDays } from "@/lib/admin-store";
import { Boxes, ReceiptText, ShoppingCart, Users } from "lucide-react";

const ranges = { "7": "Last 7 days", "30": "Last 30 days", "90": "Last 90 days" } as const;
const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function PieCard({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="h-64">
        {data.length === 0 ? <Empty>No records in this period.</Empty> : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                {data.map((d, i) => <Cell key={d.name} fill={colors[i % colors.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function Analytics() {
  const { data } = useAdminStore();
  const [range, setRange] = useState<keyof typeof ranges>("30");
  const days = Number(range);
  const size = days === 7 ? 1 : days === 30 ? 3 : 7;
  const buckets = Math.ceil(days / size);
  const users = withinDays(data.users, days);
  const orders = withinDays(data.orders, days);
  const sales = orders.filter((o) => o.status === "completed");
  const refunds = orders.filter((o) => o.status === "refunded");
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHead
        title="Analytics"
        description="Trends calculated from sample records, relative to 1 Nov 2026."
        actions={
          <Select value={range} onValueChange={(v) => setRange(v as keyof typeof ranges)}>
            <SelectTrigger className="w-44" aria-label="Date range"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(ranges).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
        }
      />
      <DataNotice />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="New users" value={users.length} icon={Users} />
        <Stat label="Orders in range" value={orders.length} icon={ShoppingCart} />
        <Stat label="Completed sales" value={money(sales.reduce((t, o) => t + o.amount, 0))} icon={Boxes} />
        <Stat label="Refunded orders" value={refunds.length} icon={ReceiptText} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="New users" data={series(data.users, buckets, size)} />
        <ChartCard title="Completed sales (৳)" kind="bar" format={(n) => `${Math.round(n / 1000)}k`} data={series(data.orders.filter((o) => o.status === "completed"), buckets, size, (o) => o.amount)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <PieCard title="Services by category" data={countBy(data.services, (s) => s.category)} />
        <PieCard title="Services by status" data={countBy(data.services, (s) => s.status)} />
        <PieCard title="Orders by status" data={countBy(orders, (o) => o.status)} />
      </div>
    </div>
  );
}
