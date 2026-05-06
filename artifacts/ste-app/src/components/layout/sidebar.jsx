import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Activity,
  Package,
  Users,
  ShieldAlert,
  LogOut,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const adminLinks = [
    { href: "/", label: "Dasbor", icon: LayoutDashboard },
    { href: "/pos", label: "POS Kasir", icon: Receipt },
    { href: "/contracts", label: "Kontrak", icon: FileText },
    { href: "/transactions", label: "Transaksi", icon: Activity },
    { href: "/products", label: "Inventaris", icon: Package },
    { href: "/customers", label: "Pelanggan", icon: Users },
    { href: "/security", label: "Keamanan", icon: ShieldAlert },
  ];

  const pelangganLinks = [
    { href: "/service-request", label: "Ajukan Servis", icon: Wrench },
    { href: "/contracts", label: "Kontrak Saya", icon: FileText },
    { href: "/transactions", label: "Tagihan Saya", icon: Activity },
  ];

  const links = isAdmin ? adminLinks : pelangganLinks;
  const roleLabel = isAdmin ? "Administrator" : "Pelanggan";

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
          KM
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-none tracking-tight">Karya Mandiri</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Sistem Transaksi</span>
        </div>
      </div>

      {!isAdmin && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-md bg-primary/10 text-primary text-xs text-center font-medium">
          Selamat datang, {user?.name?.split(" ")[0]}!
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            location === link.href ||
            (link.href !== "/" && location.startsWith(link.href));
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
                {link.href === "/service-request" && (
                  <span className="ml-auto text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
                    Baru
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium truncate">{user?.name ?? "Pengguna"}</span>
            <span className="text-xs text-muted-foreground truncate">{roleLabel}</span>
          </div>
          <button
            onClick={logout}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
