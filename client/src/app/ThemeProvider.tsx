"use client";
import React, { useEffect } from "react";
import { useAppSelector } from "./redux";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (isDarkMode) {
      root.classList.add("dark");
      body.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, [isDarkMode]);

  return <>{children}</>;
};
