"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Package, Settings2, Store, LogOut, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/app/components/ui/sheet";

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
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
        <Link className="sidebar-brand" href="/">
          <Image src="/logo.png" alt="LNA Doceria" width={32} height={32} />
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="mobile-menu-toggle"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-6">
            <SheetHeader className="mb-6">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${
                        pathname === item.href ||
                        (item.href !== "/dashboard" &&
                          pathname.startsWith(`${item.href}/`))
                          ? "border-rose-200 bg-rose-50 text-rose-800"
                          : "border-zinc-200 bg-white text-zinc-800"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </SheetClose>
                );
              })}
              <SheetClose asChild>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={`nav-item group ${
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(`${item.href}/`))
                    ? "nav-item-active"
                    : ""
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
          onClick={handleLogout}
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
