"use client";
import { useAppDispatch, useAppSelector } from "@/src/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/src/state";
import { Bell, Menu, Moon, Settings, Sun, Search, LogOut, ShieldAlert } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  // Feature 22: Role badge + session expiry
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const [sessionWarning, setSessionWarning] = useState(false);

  // Feature 21: Session expiry warning if < 15 min remaining
  useEffect(() => {
    if (!session?.expires) return;
    const checkExpiry = () => {
      const expiresAt = new Date(session.expires).getTime();
      const minsLeft = (expiresAt - Date.now()) / 60000;
      setSessionWarning(minsLeft > 0 && minsLeft < 15);
    };
    checkExpiry();
    const interval = setInterval(checkExpiry, 60000);
    return () => clearInterval(interval);
  }, [session?.expires]);

  const toggleSidebar = () => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  const toggleDarkMode = () => dispatch(setIsDarkMode(!isDarkMode));

  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50 transition-all duration-300">
      {/* Feature 21: Session expiry banner */}
      {sessionWarning && (
        <div className="w-full bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700 px-6 py-2 flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          Your session is expiring soon. Please save your work.
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="ml-auto underline font-medium hover:no-underline">Sign in again</button>
        </div>
      )}
      <div className="flex justify-between items-center w-full px-6 py-4">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-6">
          <button
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="search"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>

            <button
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">3</span>
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

            {/* Feature 22: Role badge + username */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Image
                  src="https://s3-smart-inventory-dashboard.s3.us-east-2.amazonaws.com/profile.png"
                  alt="Profile"
                  width={50}
                  height={50}
                  className="rounded-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{session?.user?.name ?? "Mounika"}</span>
                {role && (
                  <span className={["px-2 py-0.5 rounded-full text-xs font-semibold self-start", isAdmin ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"].join(" ")}>
                    {role}
                  </span>
                )}
              </div>
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors duration-200"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>

          <Link href="/settings">
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;