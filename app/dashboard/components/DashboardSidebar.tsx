"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Package, Settings, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";

export function DashboardSidebar() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

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
      icon: BarChart3,
    },
    {
      label: "Produtos",
      href: "/dashboard/products",
      icon: Package,
    },
    {
      label: "Configurações",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  if (!isClient) return null;

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">LNA</div>
          <span className="brand-text">Doceria</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <span className="nav-item group">
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </span>
            </Link>
          );
        })}
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
