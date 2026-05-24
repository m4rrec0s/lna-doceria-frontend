"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Package, Settings2, Store, LogOut, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  const navItems = [
    {
      label: "Visão Geral",
      href: "/dashboard",
      icon: Home,
    },
    {
      label: "Produtos",
      href: "/dashboard/products",
      icon: Package,
    },
    {
      label: "Categorias e Sabores",
      href: "/dashboard/catalog",
      icon: Store,
    },
    {
      label: "Sessões",
      href: "/dashboard/showcase",
      icon: Settings2,
    },
  ];

  if (!isClient) return null;

  return (
    <aside className="dashboard-sidebar">
      <div className="mobile-sidebar-topbar">
        <div className="sidebar-brand">
          <div className="brand-icon">LNA</div>
          <span className="brand-text">Doceria</span>
        </div>
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label="Abrir menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">LNA</div>
          <span className="brand-text">Doceria</span>
        </div>
      </div>

      <nav className={`sidebar-nav ${isMobileMenuOpen ? "sidebar-nav-open" : ""}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
              <span
                className={`nav-item group ${
                  pathname.startsWith(item.href) ? "nav-item-active" : ""
                }`}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => {
            setIsMobileMenuOpen(false);
            handleLogout();
          }}
          className="nav-item mobile-logout"
        >
          <LogOut className="nav-icon" />
          <span className="nav-label">Sair</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="logout-btn"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </Button>
      </div>
    </aside>
  );
}
