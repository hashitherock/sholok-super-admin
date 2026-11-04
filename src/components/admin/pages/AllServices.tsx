import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { LayoutGrid, List, Pencil, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { DataNotice, Empty, PageHead } from "@/components/admin/DataNotice";
import { serviceHealth, serviceSchema, serviceStatuses, updateService, useAdminStore, type Service } from "@/lib/admin-store";
import { navLink } from "@/lib/nav-registry";

const PAGE = 8;
type Sort = "name" | "users" | "updated";

export function queryServices(list: Service[], q: { text: string; status: string; category: string; sort: Sort }) {
  const t = q.text.trim().toLowerCase();
  return list
    .filter((s) => (!t || `${s.name} ${s.id} ${s.category} ${s.owner}`.toLowerCase().includes(t)) && (q.status === "all" || s.status === q.status) && (q.category === "all" || s.category === q.category))
    .sort((a, b) => q.sort === "users" ? b.users - a.users : q.sort === "updated" ? b.updatedAt.localeCompare(a.updatedAt) : a.name.localeCompare(b.name));
}

function StatusBadge({ s }: { s: Service }) {
  const tone = s.status === "active" ? "bg-primary/10 text-primary" : s.status === "maintenance" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{s.status}</span>;
}

function Toggle({ s }: { s: Service }) {
  return (
    <Switch
      checked={s.status !== "disabled"}
      aria-label={`${s.status === "disabled" ? "Enable" : "Disable"} ${s.name}`}
      onCheckedChange={(on) => { if (updateService(s.id, { status: on ? "active" : "disabled" })) toast.success(`${s.name} ${on ? "enabled" : "disabled"} (saved in this browser).`); }}
    />
  );
}

function EditDialog({ s, onClose }: { s: Service; onClose: () => void }) {
  const [form, setForm] = useState({ description: s.description, owner: s.owner, version: s.version, status: s.status, health: s.health });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = serviceSchema.pick({ description: true, owner: true, version: true, status: true, health: true }).safeParse(form);
    if (!r.success) { setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]))); return; }
    if (updateService(s.id, r.data)) { toast.success(`${s.name} updated.`); onClose(); }
    else toast.error("Couldn't save this change.");
  };
  const field = (k: "owner" | "version", label: string) => (
    <div className="space-y-1.5"><Label htmlFor={k}>{label}</Label>
      <Input id={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} aria-invalid={!!errors[k]} />
      {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}</div>
  );
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit {s.name}</DialogTitle><DialogDescription>Service ID {s.id} and name are fixed. Changes are saved in this browser only.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-3" noValidate>
          <div className="space-y-1.5"><Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} aria-invalid={!!errors.description} />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}</div>
          <div className="grid gap-3 sm:grid-cols-2">{field("owner", "Owner team")}{field("version", "Version")}</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Service["status"] })}><SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
                <SelectContent>{serviceStatuses.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><Label>Health</Label>
              <Select value={form.health} onValueChange={(v) => setForm({ ...form, health: v as Service["health"] })}><SelectTrigger aria-label="Health"><SelectValue /></SelectTrigger>
                <SelectContent>{serviceHealth.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Save changes</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DetailsDialog({ s, onClose, onEdit }: { s: Service; onClose: () => void; onEdit: () => void }) {
  const rows: [string, string | number][] = [["Service ID", s.id], ["Category", s.category], ["Owner team", s.owner], ["Version", s.version], ["Status", s.status], ["Health", s.health], ["Sample users", s.users.toLocaleString()], ["Last updated", new Date(s.updatedAt).toLocaleString()]];
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{s.name}</DialogTitle><DialogDescription>{s.description}</DialogDescription></DialogHeader>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">{rows.map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
        <DialogFooter>
          <Button variant="outline" asChild><Link {...navLink(`/services/${s.id}`)}>Open management page</Link></Button>
          <Button onClick={onEdit}><Pencil /> Edit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AllServices() {
  const { data } = useAdminStore();
  const [view, setView] = useState<"cards" | "table">("cards");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<Sort>("name");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<string | null>(null);
  const [edit, setEdit] = useState<string | null>(null);
  const categories = useMemo(() => [...new Set(data.services.map((s) => s.category))].sort(), [data.services]);
  const list = queryServices(data.services, { text, status, category, sort });
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PAGE, cur * PAGE);
  const reset = (fn: () => void) => { fn(); setPage(1); };
  const find = (id: string | null) => data.services.find((s) => s.id === id);
  const active = data.services.filter((s) => s.status === "active").length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHead title="All Services" description={`${data.services.length} Sholok services · ${active} active. Search, filter, edit and enable or disable each service.`}
        actions={<div className="flex rounded-md border p-0.5" role="group" aria-label="View">
          <Button size="sm" variant={view === "cards" ? "secondary" : "ghost"} aria-pressed={view === "cards"} onClick={() => setView("cards")}><LayoutGrid /> Cards</Button>
          <Button size="sm" variant={view === "table" ? "secondary" : "ghost"} aria-pressed={view === "table"} onClick={() => setView("table")}><List /> Table</Button>
        </div>} />
      <DataNotice />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input placeholder="Search services…" aria-label="Search services" value={text} onChange={(e) => reset(() => setText(e.target.value))} />
        <Select value={status} onValueChange={(v) => reset(() => setStatus(v))}><SelectTrigger aria-label="Filter by status"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All statuses</SelectItem>{serviceStatuses.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select>
        <Select value={category} onValueChange={(v) => reset(() => setCategory(v))}><SelectTrigger aria-label="Filter by category"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select>
        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}><SelectTrigger aria-label="Sort"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="name">Sort: Name A–Z</SelectItem><SelectItem value="users">Sort: Most users</SelectItem><SelectItem value="updated">Sort: Recently updated</SelectItem></SelectContent></Select>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">{list.length} of {data.services.length} services</p>

      {list.length === 0 ? (
        <Empty>No services match these filters. <Button variant="link" onClick={() => { setText(""); setStatus("all"); setCategory("all"); setPage(1); }}>Clear filters</Button></Empty>
      ) : view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {shown.map((s) => (
            <Card key={s.id} data-testid="service-card">
              <CardContent className="flex h-full flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0"><p className="font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">{s.id} · {s.category}</p></div>
                  <Toggle s={s} />
                </div>
                <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">{s.description}</p>
                <div className="flex flex-wrap items-center gap-2"><StatusBadge s={s} /><Badge variant="outline">{s.health}</Badge><span className="text-xs text-muted-foreground">{s.users.toLocaleString()} users</span></div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDetail(s.id)}><Eye /> Details</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEdit(s.id)}><Pencil /> Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Health</TableHead><TableHead className="text-right">Users</TableHead><TableHead>Enabled</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {shown.map((s) => (
                <TableRow key={s.id} data-testid="service-row">
                  <TableCell><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.id}</p></TableCell>
                  <TableCell>{s.category}</TableCell><TableCell><StatusBadge s={s} /></TableCell><TableCell>{s.health}</TableCell>
                  <TableCell className="text-right">{s.users.toLocaleString()}</TableCell><TableCell><Toggle s={s} /></TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => setDetail(s.id)}>Details</Button><Button size="sm" variant="ghost" onClick={() => setEdit(s.id)}>Edit</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {list.length > PAGE && (
        <nav className="flex items-center justify-between gap-2" aria-label="Pagination">
          <Button variant="outline" size="sm" disabled={cur === 1} onClick={() => setPage(cur - 1)}>Previous</Button>
          <span className="text-sm">Page {cur} of {pages}</span>
          <Button variant="outline" size="sm" disabled={cur === pages} onClick={() => setPage(cur + 1)}>Next</Button>
        </nav>
      )}

      {find(detail) && <DetailsDialog s={find(detail)!} onClose={() => setDetail(null)} onEdit={() => { setEdit(detail); setDetail(null); }} />}
      {find(edit) && <EditDialog key={edit} s={find(edit)!} onClose={() => setEdit(null)} />}
    </div>
  );
}
