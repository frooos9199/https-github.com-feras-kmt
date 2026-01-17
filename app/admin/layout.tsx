import type { ReactNode } from "react";
import AdminPaymentWarningCard from "@/components/AdminPaymentWarningCard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminPaymentWarningCard />
      {children}
    </>
  );
}
