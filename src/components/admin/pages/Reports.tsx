import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataNotice, Empty, PageHead } from "@/components/admin/DataNotice";
import { updateData, useAdminStore, withinDays, type AdminData } from "@/lib/admin-store";

type Row = Record<string, string | number>;
export const reportTemplates: Record<string, { label: string; rows: (d: AdminData, days: number) => Row[] }> = {
  services: { label: "Service status", rows: (d) => d.services.map(({ id, name, category, status, health, users, version }) => ({ id, name, category, status, health, users, version })) },
  users: { label: "New users", rows: (d, n) => withinDays(d.users, n).map(({ id, name, status, serviceId, createdAt }) => ({ id, name, status, serviceId, createdAt: createdAt.slice(0, 10) })) },
  orders: { label: "Orders", rows: (d, n) => withinDays(d.orders, n).map(({ id, serviceId, amount, status, createdAt }) => ({ id, serviceId, amount, status, createdAt: createdAt.slice(0, 10) })) },
  transactions: { label: "Pay transactions", rows: (d, n) => withinDays(d.transactions, n).map(({ id, amount, status, createdAt }) => ({ id, amount, status, createdAt: createdAt.slice(0, 10) })) },
};

export function toCsv(rows: Row[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]!);
  const esc = (v: unknown) => { const s = String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

function download(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

const uid = () => `${Date.now().toString(36)}${Math.floor(performance.now()).toString(36)}`;

export function Reports() {
  const { data } = useAdminStore();
  const [template, setTemplate] = useState("services");
  const [days, setDays] = useState("30");
  const [name, setName] = useState("");
  const rows = useMemo(() => reportTemplates[template]!.rows(data, Number(days)), [data, template, days]);
  const label = reportTemplates[template]!.label;

  const log = (format: "csv" | "json") => {
    const reportName = name.trim() || `${label} (${days} days)`;
    updateData((d) => ({ ...d, reportRuns: [{ id: uid(), name: reportName, format, rows: rows.length, createdAt: new Date().toISOString() }, ...d.reportRuns].slice(0, 50) }));
    return reportName.replace(/\W+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  };
  const exportAs = (format: "csv" | "json") => {
    if (!rows.length) { toast.error("Nothing to export for this selection."); return; }
    const file = log(format);
    if (format === "csv") download(`${file}.csv`, toCsv(rows), "text/csv");
    else download(`${file}.json`, JSON.stringify(rows, null, 2), "application/json");
    toast.success(`Exported ${rows.length} rows as ${format.toUpperCase()}.`);
  };
  const save = () => {
    const n = name.trim();
    if (!n) { toast.error("Give the report a name before saving."); return; }
    if (updateData((d) => ({ ...d, reports: [{ id: uid(), name: n, template, days: Number(days), createdAt: new Date().toISOString() }, ...d.reports] }))) {
      toast.success("Report definition saved in this browser."); setName("");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHead title="Reports" description="Build a report from local sample records, preview it, and export it as CSV or JSON." />
      <DataNotice />
      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div className="space-y-1.5"><Label>Template</Label>
            <Select value={template} onValueChange={setTemplate}><SelectTrigger aria-label="Template"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(reportTemplates).map(([k, t]) => <SelectItem key={k} value={k}>{t.label}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-1.5"><Label>Period</Label>
            <Select value={days} onValueChange={setDays} disabled={template === "services"}><SelectTrigger aria-label="Period"><SelectValue /></SelectTrigger>
              <SelectContent>{["7", "30", "90"].map((d) => <SelectItem key={d} value={d}>Last {d} days</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-1.5"><Label htmlFor="rname">Report name</Label><Input id="rname" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder={`${label} (${days} days)`} /></div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={save}><Save /> Save</Button>
            <Button onClick={() => exportAs("csv")}><Download /> CSV</Button>
            <Button variant="outline" onClick={() => exportAs("json")}>JSON</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Preview · {rows.length} rows</CardTitle></CardHeader>
        <CardContent>
          {rows.length === 0 ? <Empty>No records match this template and period.</Empty> : (
            <div className="max-h-96 overflow-auto rounded border">
              <Table>
                <TableHeader><TableRow>{Object.keys(rows[0]!).map((c) => <TableHead key={c}>{c}</TableHead>)}</TableRow></TableHeader>
                <TableBody>{rows.slice(0, 50).map((r, i) => <TableRow key={i}>{Object.values(r).map((v, j) => <TableCell key={j}>{v}</TableCell>)}</TableRow>)}</TableBody>
              </Table>
            </div>
          )}
          {rows.length > 50 && <p className="mt-2 text-xs text-muted-foreground">Showing first 50 rows; exports include all {rows.length}.</p>}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Saved reports</CardTitle></CardHeader>
          <CardContent>
            {data.reports.length === 0 ? <Empty>No saved reports yet. Name a report and press Save.</Empty> : (
              <ul className="divide-y">{data.reports.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <button className="text-left font-medium hover:underline" onClick={() => { setTemplate(r.template); setDays(String(r.days)); setName(r.name); }}>{r.name}</button>
                  <Button size="icon" variant="ghost" aria-label={`Delete ${r.name}`} onClick={() => updateData((d) => ({ ...d, reports: d.reports.filter((x) => x.id !== r.id) }))}><Trash2 /></Button>
                </li>))}</ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Export history</CardTitle></CardHeader>
          <CardContent>
            {data.reportRuns.length === 0 ? <Empty>No exports yet.</Empty> : (
              <ul className="divide-y">{data.reportRuns.slice(0, 10).map((r) => (
                <li key={r.id} className="flex justify-between gap-2 py-2 text-sm"><span>{r.name} · {r.format.toUpperCase()} · {r.rows} rows</span><span className="text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span></li>))}</ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
