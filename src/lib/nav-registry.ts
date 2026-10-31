import {
  LayoutDashboard, LineChart, FileBarChart, Boxes, Search, Mail, Newspaper, PenLine, Users2,
  ShoppingBag, Store, Wallet, Map, HelpCircle, BookImage, Clapperboard, Tv, Music, Languages,
  BookA, TrendingUp, Trophy, CloudSun, UserCircle, Users, ShieldCheck, KeyRound, BadgeCheck,
  MonitorSmartphone, DoorOpen, Flag, Building2, NotebookPen, MessagesSquare, Package, Handshake,
  Truck, Undo2, MapPinned, Video, ArrowLeftRight, ReceiptText, Landmark, Percent, BookOpen,
  SlidersHorizontal, Shield, ScrollText, Activity, Bell, LifeBuoy, GitPullRequest, DatabaseBackup,
  Plug, Settings, Palette, Globe, MailOpen, Wrench, History, CircleHelp, type LucideIcon,
} from "lucide-react";

export type NavItem = {
  num: number;
  id: string;
  title: string;
  path: string;
  icon: LucideIcon;
  description: string;
  capabilities: string[];
  phase: number;
  serviceId?: string;
  category?: string;
};

export type NavGroup = { id: string; title: string; items: NavItem[] };

type Def = [id: string, title: string, icon: LucideIcon, description: string, capabilities: string[], extra?: Partial<NavItem>];

const svc = (
  id: string, title: string, icon: LucideIcon, category: string, description: string, capabilities: string[],
): Def => [id, title, icon, description, capabilities, { serviceId: id, category, phase: 3 }];

const groups: { id: string; title: string; phase: number; defs: Def[] }[] = [
  {
    id: "dashboard", title: "Dashboard", phase: 2, defs: [
      ["overview", "Overview", LayoutDashboard, "Summary of users, services, orders, finance and security across the Sholok ecosystem.", ["Summary cards calculated from local records", "Registration, order and transaction charts", "Pending approvals, tickets and refunds", "Configuration warnings"]],
      ["analytics", "Analytics", LineChart, "Trend analysis for user activity, service usage and commerce records.", ["Date-range filters", "User activity and retention trends", "Service distribution and status breakdown", "Orders, sales and refunds analysis"]],
      ["reports", "Reports", FileBarChart, "Generate and export administrative reports from local records.", ["Report templates by module", "CSV / JSON export", "Saved report definitions", "Report history"]],
    ],
  },
  {
    id: "services", title: "Service Management", phase: 3, defs: [
      ["all", "All Services", Boxes, "Central registry and management entry point for all 20 Sholok services.", ["Canonical 20-service registry", "Status, category and health filters", "Enable / disable and maintenance states", "Links to each service's management page"], { phase: 2 }],
      svc("search", "Search", Search, "Discovery", "Search engine configuration and search experience management.", ["Search settings and preferences", "Category and indexing configuration records", "Search interface settings", "Search policy and moderation configuration"]),
      svc("mail", "Mail", Mail, "Communication", "Email account and mailbox administration.", ["Mailbox policies and quota configuration", "Email template records", "Account policies", "Delivery configuration status"]),
      svc("news", "News", Newspaper, "Media", "Editorial news publishing and article administration.", ["Article records and editorial status", "Sections and categories", "Publisher assignments", "Headline and featured placement"]),
      svc("blog", "Blog", PenLine, "Media", "Personal and creator blog platform administration.", ["Blog and post records", "Comment policy settings", "Featured blog curation", "Blog category configuration"]),
      svc("cafe", "Cafe — Community", Users2, "Community", "Community groups, boards and membership administration.", ["Community records and owners", "Board and membership settings", "Community rules configuration", "Reported posts overview"]),
      svc("shopping", "Shopping", ShoppingBag, "Commerce", "Shopping discovery and marketplace storefront configuration.", ["Category and listing configuration", "Promotion placements", "Price comparison settings", "Marketplace policies"]),
      svc("smart-store", "Smart Store", Store, "Commerce", "Seller storefront platform for independent merchants.", ["Store records and seller links", "Storefront approval status", "Store plan configuration", "Store performance records"]),
      svc("pay", "Pay", Wallet, "Finance", "Payment service configuration and wallet administration (local records only).", ["Payment method configuration records", "Wallet policy settings", "Transaction limit rules", "Links to Pay Transactions"]),
      svc("maps", "Maps", Map, "Location", "Map data configuration and place information management.", ["Place category configuration", "Map layer settings", "Business listing links", "Place report review"]),
      svc("knowledge-in", "Knowledge iN — Q&A", HelpCircle, "Community", "Question-and-answer knowledge community administration.", ["Question and answer records", "Expert badge configuration", "Answer quality policies", "Topic categories"]),
      svc("webtoon", "Webtoon", BookImage, "Entertainment", "Digital comic publishing and series administration.", ["Title and episode records", "Creator assignments", "Publishing schedule", "Age rating configuration"]),
      svc("series", "Series", Clapperboard, "Entertainment", "Serialized novels and paid content administration.", ["Series and chapter records", "Pricing and access rules", "Author assignments", "Release schedule"]),
      svc("tv-videos", "TV / Videos", Tv, "Entertainment", "Video channel and on-demand content administration.", ["Channel and video records", "Playback policy settings", "Content rating", "Featured programming"]),
      svc("music", "Music — Vibe", Music, "Entertainment", "Music streaming catalog and playlist administration.", ["Track, album and artist records", "Curated playlist management", "Licensing status records", "Chart configuration"]),
      svc("translator", "Translator — Papago", Languages, "Utility", "Translation service configuration.", ["Supported language pairs", "Glossary records", "Usage limit configuration", "Quality feedback records"]),
      svc("dictionary", "Dictionary", BookA, "Utility", "Dictionary entries and reference content administration.", ["Dictionary and entry records", "Language configuration", "Editorial review status", "Word-of-the-day curation"]),
      svc("finance", "Finance", TrendingUp, "Information", "Financial information portal configuration (no live market data).", ["Market category configuration", "Watchlist settings", "Finance news sections", "Disclaimer configuration"]),
      svc("sports", "Sports", Trophy, "Information", "Sports news, leagues and schedule administration.", ["League and team records", "Match schedule records", "Sports news sections", "Featured events"]),
      svc("weather", "Weather", CloudSun, "Information", "Weather display configuration (no live weather feed).", ["Region and location records", "Alert display configuration", "Units and display settings", "Forecast panel layout"]),
      svc("my-account", "My Account — SSO", UserCircle, "Identity", "Single sign-on account settings across Sholok services (UI preview only).", ["Account policy configuration", "Linked service settings", "Sign-in method preferences", "Privacy settings"]),
    ],
  },
  {
    id: "access", title: "User & Access", phase: 4, defs: [
      ["users", "Users", Users, "Registered Sholok user accounts.", ["User directory with search and filters", "Account status changes", "Service usage per user", "Profile detail view"]],
      ["staff", "Administrators & Staff", ShieldCheck, "Administrative staff accounts and assignments.", ["Staff directory", "Role assignments", "Department and service scope", "Activation status"]],
      ["roles", "Roles & Permissions", KeyRound, "Role definitions and permission matrix (UI-level preview, not security enforcement).", ["Role records", "Permission matrix editor", "Role comparison", "Assignment counts"]],
      ["verification", "Account Verification", BadgeCheck, "Identity and account verification requests.", ["Verification queue", "Approve / reject with reasons", "Verification levels", "Request history"]],
      ["sessions", "Sessions & Devices", MonitorSmartphone, "Sign-in session and device records.", ["Session records by user", "Device type breakdown", "Mark session revoked (local record)", "Suspicious session flags"]],
      ["access-requests", "Access Requests", DoorOpen, "Requests for elevated administrative access.", ["Request queue", "Approve / deny workflow", "Requested scope details", "Expiry configuration"]],
    ],
  },
  {
    id: "content", title: "Content & Marketplace", phase: 4, defs: [
      ["moderation", "Content Moderation", Flag, "Cross-service moderation cases.", ["Moderation case queue", "Action and reason logging", "Severity filters", "Service source filter"]],
      ["publishers", "News Publisher Management", Building2, "News publisher partners linked to the News service.", ["Publisher records", "Contract status", "Article volume", "Publisher suspension"]],
      ["blogs", "Blog Management", NotebookPen, "Blog and post administration linked to the Blog service.", ["Blog records", "Post status management", "Featured posts", "Comment moderation links"]],
      ["community", "Community Moderation", MessagesSquare, "Cafe and Knowledge iN community moderation.", ["Reported communities", "Board-level actions", "Member sanctions", "Rule violation history"]],
      ["products", "Product Catalog", Package, "Products listed through Shopping and Smart Store.", ["Product records", "Category and price editing", "Listing approval", "Stock status"], { phase: 5 }],
      ["sellers", "Sellers & Vendors", Handshake, "Merchant and vendor accounts.", ["Seller directory", "Onboarding status", "Store links", "Settlement summary"], { phase: 5 }],
      ["orders", "Orders & Shipments", Truck, "Customer orders and shipment records.", ["Order list and detail", "Order status workflow", "Shipment tracking records", "Order filters"], { phase: 5 }],
      ["returns", "Returns & Refund Requests", Undo2, "Customer return and refund requests.", ["Return request queue", "Approve / reject flow", "Linked order view", "Reason analysis"], { phase: 5 }],
      ["listings", "Maps & Business Listings", MapPinned, "Business listings shown on Maps.", ["Listing records", "Verification status", "Category assignment", "Owner claims"]],
      ["creators", "Creator & Channel Management", Video, "Creators and channels across Webtoon, Series, TV and Music.", ["Creator records", "Channel status", "Content counts per service", "Partnership tiers"]],
    ],
  },
  {
    id: "finance", title: "Finance & Transactions", phase: 5, defs: [
      ["transactions", "Pay Transactions", ArrowLeftRight, "Local Pay transaction records (no real payments).", ["Transaction list and filters", "Transaction detail", "Status breakdown", "Export"]],
      ["refunds", "Refund Management", ReceiptText, "Refund processing records.", ["Refund queue", "Approval workflow", "Linked transaction", "Refund totals"]],
      ["settlements", "Vendor Settlements", Landmark, "Vendor payout settlement records.", ["Settlement batches", "Pending / settled status", "Per-vendor totals", "Settlement schedule"]],
      ["fees", "Fees & Commissions", Percent, "Fee and commission rule configuration.", ["Commission rules by category", "Fee tiers", "Effective dates", "Rule history"]],
      ["ledger", "Financial Ledger", BookOpen, "Local ledger entries for transactions, refunds and settlements.", ["Ledger entries", "Debit / credit balance", "Account filters", "Export"]],
      ["config", "Finance Configuration", SlidersHorizontal, "Currency, tax and payout configuration.", ["Currency settings", "Tax rules", "Payout thresholds", "Configuration history"]],
    ],
  },
  {
    id: "operations", title: "Security & Operations", phase: 6, defs: [
      ["security", "Security Center", Shield, "Security event records and policy configuration.", ["Security event list", "Severity breakdown", "Password and session policy settings", "Resolution tracking"]],
      ["audit", "Audit Logs", ScrollText, "Local record of administrative actions (not an authoritative audit trail).", ["Action log", "Actor and module filters", "Change detail", "Export"]],
      ["health", "System Health", Activity, "Configured service status records (no live server metrics).", ["Service status board", "Incident records", "Maintenance windows", "Status history"]],
      ["notifications", "Notifications", Bell, "Administrative notification records (no real delivery).", ["Notification inbox", "Read / unread state", "Notification rules", "Broadcast drafts"]],
      ["tickets", "Support Tickets", LifeBuoy, "User support tickets.", ["Ticket queue", "Assignment and priority", "Status workflow", "Reply history"]],
      ["approvals", "Approval Workflows", GitPullRequest, "Multi-step approval requests across modules.", ["Pending approvals", "Workflow definitions", "Approver steps", "Decision history"]],
      ["backup", "Backup & Recovery Configuration", DatabaseBackup, "Local data export, import and reset.", ["Validated JSON export", "Import with schema validation", "Confirmation-protected reset", "Backup policy records"]],
      ["integrations", "Integration Configuration", Plug, "Integration configuration records (no external connections).", ["Integration records", "Enabled / disabled state", "Configuration fields", "Change history"]],
    ],
  },
  {
    id: "admin", title: "Administration", phase: 6, defs: [
      ["general", "General Settings", Settings, "Platform-wide administrative settings.", ["Organization details", "Default time zone and formats", "Session preferences", "Save and reset"]],
      ["branding", "Branding & Appearance", Palette, "Sholok brand colors, logo and theme preferences.", ["Brand color preview", "Logo settings", "Theme preference", "Density settings"]],
      ["localization", "Localization & Languages", Globe, "Supported languages and regional formats.", ["Language list", "Default language", "Date and number formats", "Translation coverage"]],
      ["email-templates", "Email Template Configuration", MailOpen, "System email template records (no real sending).", ["Template list", "Template editor", "Variable reference", "Preview"]],
      ["maintenance", "Maintenance Configuration", Wrench, "Maintenance mode and scheduled windows.", ["Per-service maintenance flags", "Scheduled windows", "Maintenance message", "History"]],
      ["config-history", "Configuration History", History, "History of configuration changes.", ["Change timeline", "Before / after view", "Module filters", "Export"]],
      ["help", "Help & Documentation", CircleHelp, "Guides for using this dashboard and its local storage limits.", ["Module guides", "Local storage limitations", "Keyboard shortcuts", "FAQ"]],
    ],
  },
];

let n = 0;
export const navGroups: NavGroup[] = groups.map((g) => ({
  id: g.id,
  title: g.title,
  items: g.defs.map(([id, title, icon, description, capabilities, extra]) => {
    n += 1;
    return {
      num: n, id, title, icon, description, capabilities, phase: g.phase,
      path: g.id === "dashboard" && id === "overview" ? "/" : `/${g.id}/${id}`,
      ...extra,
    };
  }),
}));

export const navItems: NavItem[] = navGroups.flatMap((g) => g.items);

export function navLink(path: string) {
  if (path === "/") return { to: "/" as const };
  const [, group, page] = path.split("/");
  return { to: "/$group/$page" as const, params: { group, page } };
}

export function filterNav(query: string): NavGroup[] {
  const term = query.trim().toLowerCase();
  if (!term) return navGroups;
  return navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      `${group.title} ${item.title} ${item.serviceId ?? ""}`.toLowerCase().includes(term),
    ),
  })).filter((group) => group.items.length > 0);
}

export function findNav(group: string, page: string) {
  const g = navGroups.find((x) => x.id === group);
  const item = g?.items.find((i) => i.id === page);
  return g && item ? { group: g, item } : undefined;
}

export const serviceItems = navItems.filter((i) => i.serviceId);
