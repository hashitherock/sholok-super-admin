import { type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./AppSidebar";
import { navGroups } from "@/lib/nav-registry";

function Crumbs() {
  const { pathname } = useLocation();
  const group = navGroups.find((g) => g.items.some((i) => i.path === pathname));
  const item = group?.items.find((i) => i.path === pathname);
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild><Link to="/">Sholok</Link></BreadcrumbLink>
        </BreadcrumbItem>
        {group && item && (
          <>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem className="hidden sm:inline-flex">{group.title}</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage className="truncate">{item.title}</BreadcrumbPage></BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur">
          <SidebarTrigger aria-label="Toggle navigation" />
          <div className="min-w-0 flex-1"><Crumbs /></div>
          <Button variant="ghost" size="icon" asChild aria-label="Notifications">
            <Link to="/operations/notifications"><Bell /></Link>
          </Button>
          <div className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground" aria-label="Signed in as Super Admin">SA</div>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
