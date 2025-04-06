"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const Admin = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin") {
      router.replace("/admin/dashboard");
    }
  }, [pathname, router]);
};

export default Admin;
