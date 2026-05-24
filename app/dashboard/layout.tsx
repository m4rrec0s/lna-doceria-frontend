import React from "react";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardSidebar } from "./components/DashboardSidebar";
import "./dashboard.css";

export const metadata = {
  title: "Dashboard | LNA Doceria",
  description: "Gerencie sua loja de forma inteligente",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-container">
      <DashboardSidebar />
      <div className="dashboard-main">
        <DashboardHeader />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
