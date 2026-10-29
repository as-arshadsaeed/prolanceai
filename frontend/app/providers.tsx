"use client";

import Footer from "@/components/layout/Footer";
import Topbar from "@/components/layout/Topbar";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Topbar />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}
