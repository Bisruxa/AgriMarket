/* eslint-disable @next/next/no-img-element */
"use client";

import { ReactNode } from "react";
import AdminSidebar from "./sidebar";

interface NodeProp {
  children: ReactNode;
}

const AdminLayout = ({ children }: NodeProp) => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F4F7F4]">
      {/* Mobile: header + drawer */}
      <div className="md:hidden">
        <AdminSidebar />
      </div>

      {/* Desktop: sidebar + content share one row (no margin + width:100% overflow) */}
      <div className="flex w-full max-w-[100dvw] overflow-x-hidden">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-x-hidden overflow-y-auto border-r border-[#E2E8E2] bg-white md:block lg:w-72">
          <AdminSidebar />
        </aside>

        <main className="box-border flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden px-3 py-2 pt-16 md:pt-2">
          <div className="min-w-0 flex-1">{children}</div>

          <footer className="mt-4 flex shrink-0 items-center space-x-1 pb-2">
            <img className="h-5 w-5" src="/corn.avif" alt="cornImage" />
            <p className="text-xs text-black/70">
              Ready to farm smarter? Grow with AgriMarket.
              <br />
              &copy;2026 AgriMarket
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
