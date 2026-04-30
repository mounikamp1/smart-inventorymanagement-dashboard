"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/src/app/(components)/Sidebar";
import Navbar from "@/src/app/(components)/Navbar";
import StoreProvider, { useAppSelector } from "./redux";
import { ThemeProvider } from "./ThemeProvider";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex w-full min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Sidebar />
      <main
        className={`flex flex-col w-full h-full py-7 px-9 transition-all duration-300 ${
          isSidebarCollapsed ? "md:pl-24" : "md:pl-72"
        }`}
      >
        <Navbar />
        {children}
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <ThemeProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </ThemeProvider>
    </StoreProvider>
  );
};

export default DashboardWrapper;