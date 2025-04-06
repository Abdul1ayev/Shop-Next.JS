"use client";
import SidebarAdmin from "../../components/SidebarAdmin"; // Sidebar komponentini import qilish
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <SidebarAdmin />
      <div className="flex-1 ">{children}</div>
    </div>
  );
}
