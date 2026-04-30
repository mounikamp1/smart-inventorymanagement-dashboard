"use client";
import {
  Archive,
  CircleDollarSign,
  Clipboard,
  Layout,
  LucideIcon,
  Menu,
  ShieldCheck,
  SlidersHorizontal,
  User,
} from "lucide-react";
import React from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "../../redux";
import { setIsSidebarCollapsed } from "@/src/state";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({ href, icon: Icon, label, isCollapsed }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href}>
      <div className={`cursor-pointer flex items-center gap-3 transition-all duration-200 rounded-lg mx-2 ${isCollapsed ? "justify-center py-3 px-2" : "justify-start px-4 py-3"} ${isActive ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
        <Icon className="w-5 h-5 shrink-0" />
        <span className={`${isCollapsed ? "hidden" : "block"} font-medium text-sm`}>{label}</span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN";
  const toggleSidebar = () => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  const sidebarClassNames = `fixed flex flex-col ${isSidebarCollapsed ? "w-0 md:w-20" : "w-72 md:w-64"} bg-white dark:bg-gray-900 transition-all duration-300 overflow-hidden h-full shadow-xl z-40 border-r border-gray-200 dark:border-gray-800`;

  return (
    <div className={sidebarClassNames}>
      <div className={`flex gap-3 justify-between md:justify-center items-center pt-6 pb-6 ${isSidebarCollapsed ? "px-3" : "px-6"} border-b border-gray-200 dark:border-gray-800`}>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <Image src="https://s3-smart-inventory-dashboard.s3.us-east-2.amazonaws.com/logo.png" alt="StockWise" width={27} height={27} className="rounded" />
        </div>
        <h1 className={`${isSidebarCollapsed ? "hidden" : "block"} font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>StockWise</h1>
        <button className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={toggleSidebar}><Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" /></button>
      </div>
      <div className="grow mt-8 px-2 space-y-1">
        <p className={`${isSidebarCollapsed ? "hidden" : "block"} text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-4`}>Navigation</p>
        <SidebarLink href="/dashboard" icon={Layout} label="Dashboard" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/inventory" icon={Archive} label="Inventory" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/products" icon={Clipboard} label="Products" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/users" icon={User} label="Users" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/expenses" icon={CircleDollarSign} label="Expenses" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/settings" icon={SlidersHorizontal} label="Settings" isCollapsed={isSidebarCollapsed} />
        {isAdmin && <SidebarLink href="/audit" icon={ShieldCheck} label="Audit Log" isCollapsed={isSidebarCollapsed} />}
      </div>
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-8 pb-4 border-t border-gray-200 dark:border-gray-800 pt-4`}>
        {role && <div className="flex justify-center mb-3"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${isAdmin ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>{role}</span></div>}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">StockWise &copy; 2025</p>
      </div>
    </div>
  );
};

export default Sidebar;
