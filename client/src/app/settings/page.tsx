"use client";

import React, { useState, useEffect } from "react";
import Header from "@/src/app/(components)/Header";
import { Settings as SettingsIcon, Save, AlertCircle } from "lucide-react";
import { useGetMeQuery, useUpdateMeMutation } from "@/src/state/api";

const Settings = () => {
  const { data: me, isLoading } = useGetMeQuery();
  const [updateMe, { isLoading: isSaving, isError: isSaveError }] = useUpdateMeMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Feature 20: Populate form from API on load
  useEffect(() => {
    if (me) {
      setName(me.name ?? "");
      setEmail(me.email ?? "");
    }
    // Load notification toggles from localStorage
    const n = localStorage.getItem("setting_notifications");
    const m = localStorage.getItem("setting_marketing");
    if (n !== null) setNotifications(n === "true");
    if (m !== null) setMarketingEmails(m === "true");
  }, [me]);

  const handleSave = async () => {
    setErrorMsg("");
    try {
      // Feature 20: Persist name/email via API
      await updateMe({ name, email }).unwrap();
      // Persist toggles in localStorage
      localStorage.setItem("setting_notifications", String(notifications));
      localStorage.setItem("setting_marketing", String(marketingEmails));
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 3000);
    } catch (err: any) {
      setErrorMsg(err?.data?.message ?? "Failed to save settings.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <Header name="User Settings" />
        <div className="flex items-center justify-center h-64">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  const settingRows = [
    { label: "Name", value: name, type: "text" as const, onChange: setName },
    { label: "Email", value: email, type: "text" as const, onChange: setEmail },
  ];
  const toggleRows = [
    { label: "Notifications Enabled", value: notifications, onChange: setNotifications },
    { label: "Marketing Emails", value: marketingEmails, onChange: setMarketingEmails },
  ];

  return (
    <div className="flex flex-col">
      <Header name="User Settings" />

      <div className="px-5 sm:px-7 pt-6 pb-8">
        <div className="bg-white dark:bg-linear-to-br dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 px-6 sm:px-8 py-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Preferences</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Customize your application settings</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6 bg-white dark:bg-gray-900/50">
            {(isSaveError || errorMsg) && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg || "Failed to save. Please try again."}
              </div>
            )}

            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profile</p>
            {settingRows.map((s) => (
              <div key={s.label} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 bg-gray-50 dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700/80 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 shadow-sm">
                <div className="mb-4 sm:mb-0">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">{s.label}</label>
                  <p className="text-xs text-gray-500 dark:text-gray-300">Update this setting value</p>
                </div>
                <input
                  type={s.label === "Email" ? "email" : "text"}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full sm:w-48"
                  value={s.value}
                  onChange={(e) => s.onChange(e.target.value)}
                />
              </div>
            ))}

            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pt-2">Notifications</p>
            {toggleRows.map((t) => (
              <div key={t.label} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 bg-gray-50 dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700/80 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 shadow-sm">
                <div className="mb-4 sm:mb-0">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">{t.label}</label>
                  <p className="text-xs text-gray-500 dark:text-gray-300">Toggle this setting on or off</p>
                </div>
                <label className="inline-flex relative items-center cursor-pointer group">
                  <input type="checkbox" className="sr-only peer" checked={t.value} onChange={(e) => t.onChange(e.target.checked)} />
                  <div className="w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-400 dark:peer-focus:ring-blue-500 peer-focus:ring-offset-2 dark:peer-focus:ring-offset-gray-900 transition-all duration-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:duration-300 after:shadow-md peer-checked:bg-emerald-500 dark:peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {savedNotification && (
          <div className="fixed bottom-6 right-6">
            <div className="bg-emerald-500 dark:bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium flex items-center gap-2">
              <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-emerald-500 text-sm font-bold">
                checkmark
              </span>
              Settings saved successfully!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;