"use client";

import React, { useState } from "react";
import Header from "@/src/app/(components)/Header";
import { Settings as SettingsIcon, Save } from "lucide-react";

type UserSetting = {
  label: string;
  value: string | boolean;
  type: "text" | "toggle";
};

const mockSettings: UserSetting[] = [
  { label: "Username", value: "john_doe", type: "text" },
  { label: "Email", value: "john.doe@example.com", type: "text" },
  { label: "Notifications Enabled", value: true, type: "toggle" },
  { label: "Marketing Emails", value: false, type: "toggle" },
  { label: "Language", value: "English", type: "text" },
  { label: "Theme", value: "Auto", type: "text" },
];

const Settings = () => {
  const [userSettings, setUserSettings] = useState<UserSetting[]>(mockSettings);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleToggleChange = (index: number) => {
    const settingsCopy = [...userSettings];
    settingsCopy[index].value = !settingsCopy[index].value as boolean;
    setUserSettings(settingsCopy);
  };

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="flex flex-col">
      <Header name="User Settings" />

      <div className="px-5 sm:px-7 pt-6 pb-8">
        {/* Settings container */}
        <div className="bg-white dark:bg-linear-to-br dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header section */}
          <div className="bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 px-6 sm:px-8 py-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Preferences
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Customize your application settings
                </p>
              </div>
            </div>
            {/* Save button */}
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>

          {/* Settings grid */}
          <div className="p-6 sm:p-8 space-y-6 bg-white dark:bg-gray-900/50">
            {userSettings.map((setting, index) => (
              <div
                key={setting.label}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 bg-gray-50 dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700/80 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 shadow-sm dark:shadow-md"
              >
                <div className="mb-4 sm:mb-0">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {setting.label}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    {setting.type === "toggle"
                      ? "Toggle this setting on or off"
                      : "Update this setting value"}
                  </p>
                </div>

                {setting.type === "toggle" ? (
                  /* Toggle switch */
                  <label className="inline-flex relative items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={setting.value as boolean}
                      onChange={() => handleToggleChange(index)}
                    />
                    <div
                      className="w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-400 dark:peer-focus:ring-blue-500 peer-focus:ring-offset-2 dark:peer-focus:ring-offset-gray-900
                      transition-all duration-300 peer-checked:after:translate-x-full peer-checked:after:border-white 
                      after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white 
                      after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:duration-300 after:shadow-md
                      peer-checked:bg-emerald-500 dark:peer-checked:bg-emerald-500 dark:peer-checked:shadow-lg dark:peer-checked:shadow-emerald-500/50 group-hover:shadow-md dark:group-hover:shadow-emerald-900/30"
                    ></div>
                  </label>
                ) : (
                  /* Text input */
                  <input
                    type="text"
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 w-full sm:w-48"
                    value={setting.value as string}
                    onChange={(e) => {
                      const settingsCopy = [...userSettings];
                      settingsCopy[index].value = e.target.value;
                      setUserSettings(settingsCopy);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Saved notification */}
        {savedNotification && (
          <div className="fixed bottom-6 right-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-emerald-500 dark:bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium flex items-center gap-2">
              <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-emerald-500 text-sm font-bold">
                ✓
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
