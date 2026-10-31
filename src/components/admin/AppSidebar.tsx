import { useMemo, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, Search } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarInput, useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { filterNav, navLink } from "@/lib/nav-registry";

export function AppSidebar() {
  const { pathname } = useLocation();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const [q, setQ] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const collapsed = state === "collapsed" && !isMobile;

  const filtered = useMemo(() => {
    return filterNav(q);
  }, [q]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" onClick={() => setOpenMobile(false)} className="flex items-center gap-2 px-1 py-1.5" aria-label="Sholok home">
          <span className="brand-mark grid size-8 shrink-0 place-items-center rounded-lg font-display text-lg font-bold">S</span>
          {!collapsed && (
            <span className="leading-tight">
              <span className="block font-display text-base font-bold">Sholok</span>
              <span className="block text-xs text-sidebar-foreground/60">Super Admin</span>
            </span>
          )}
        </Link>
        {!collapsed && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 opacity-60" />
            <SidebarInput
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search navigation…"
              aria-label="Search navigation"
              className="pl-8"
            />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent role="navigation" aria-label="Administration">
        {filtered.length === 0 && <p className="px-4 py-2 text-sm text-sidebar-foreground/60">No matches</p>}
        {filtered.map((g) => {
          const hasActive = g.items.some((i) => i.path === pathname);
          return (
            <Collapsible key={`${g.id}:${pathname}`} open={collapsed || !!q.trim() || (openGroups[`${g.id}:${pathname}`] ?? (hasActive || g.id === "dashboard"))} onOpenChange={(open) => setOpenGroups((prev) => ({ ...prev, [`${g.id}:${pathname}`]: open }))} className="group/collapsible">
              <SidebarGroup>
                {!collapsed && <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="w-full" aria-label={g.title}>
                    {g.title}
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>}
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {g.items.map((i) => (
                        <SidebarMenuItem key={i.path}>
                          <SidebarMenuButton asChild isActive={pathname === i.path} tooltip={i.title}>
                            <Link {...navLink(i.path)} aria-current={pathname === i.path ? "page" : undefined} onClick={() => setOpenMobile(false)}>
                              <i.icon />
                              <span>{i.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>
      {!collapsed && (
        <SidebarFooter>
          <p className="px-2 text-xs text-sidebar-foreground/60">Records are stored in this browser only.</p>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
