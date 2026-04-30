"use client";

import { useSession } from "next-auth/react";
import { useGetAuditLogsQuery } from "@/src/state/api";
import { useState } from "react";
import Header from "@/src/app/(components)/Header";
import { ShieldCheck, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  update: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  delete: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

const AuditLogPage = () => {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [page, setPage] = useState(1);
  const [modelFilter, setModelFilter] = useState("");

  const { data, isLoading, isError } = useGetAuditLogsQuery(
    { page, limit: 20, ...(modelFilter ? { model: modelFilter } : {}) },
    { skip: role !== "ADMIN" }
  );

  if (role !== "ADMIN") {
    return (
      <div className="flex flex-col h-screen">
        <Header name="Audit Log" />
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="text-center bg-white dark:bg-gray-900 rounded-2xl border-2 border-red-200 dark:border-red-900 p-8 shadow-xl">
            <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h3>
            <p className="text-gray-600 dark:text-gray-400">Audit logs are only visible to administrators.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Header name="Audit Log" />
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col h-screen">
        <Header name="Audit Log" />
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="text-center bg-white dark:bg-gray-900 rounded-2xl border-2 border-red-200 dark:border-red-900 p-8 shadow-xl">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold">Failed to load audit logs</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header name="Audit Log" />
      <div className="px-5 sm:px-7 pt-6 pb-8">
        {/* Header section */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-800/80 px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Audit Log</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {data?.total ?? 0} total events recorded
                </p>
              </div>
            </div>
            {/* Filter */}
            <select
              value={modelFilter}
              onChange={(e) => { setModelFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Models</option>
              <option value="Products">Products</option>
              <option value="Users">Users</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Timestamp</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">User</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Action</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Model</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Record ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500 dark:text-gray-400">No audit events found.</td>
                  </tr>
                )}
                {data?.data.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300 text-xs max-w-[120px] truncate">
                      {log.userId}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{log.model}</td>
                    <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400 text-xs max-w-[160px] truncate">
                      {log.recordId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {data.page} of {data.pages} &bull; {data.total} total
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                  disabled={!data.hasNextPage}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;