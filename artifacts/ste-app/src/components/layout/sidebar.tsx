import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Activity,
  Package,
  Users,
  ShieldAlert,
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pos", label: "POS", icon: Receipt },
    { href: "/contracts", label: "Contracts", icon: FileText },
    { href: "/transactions", label: "Transactions", icon: Activity },
    { href: "/products", label: "Inventory", icon: Package },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/security", label: "Security", icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground">
          S
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-none tracking-tight">STE</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Ops Hub</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
          
          return (
            <Link key={link.href} href={link.href} className="outline-none block">
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Admin User</span>
            <span className="text-xs text-muted-foreground">Cashier & Mgr</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
