import type { ReactNode } from "react";
import "@/components/ats/admin.css";
export const metadata = {
  title: "Recruitment workspace",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
